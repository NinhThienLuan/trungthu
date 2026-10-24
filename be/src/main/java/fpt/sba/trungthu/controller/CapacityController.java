package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * BE2 Capacity: năng lực nướng theo ngày của từng Provider (DAILY_CAPACITY).
 * Bánh nướng ngày D-1 cho đơn nhận ngày D, nên ngày nhận D khả dụng khi dòng capacity ngày D-1 còn chỗ.
 * Checkout (BE3) giữ chỗ trên chính các dòng này.
 */
@RestController
@RequiredArgsConstructor
public class CapacityController {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    /** Trùng quy tắc checkout: ngày nhận >= hôm nay + 3 */
    private static final int MIN_LEAD_DAYS = 3;
    private static final int MAX_RANGE_DAYS = 120;

    private final SecurityContextService security;
    private final DailyCapacityRepository capacities;

    public record DayAvailability(LocalDate date, boolean available) {}

    public record CapacityDay(LocalDate date, int maxQuantity, int reservedQuantity) {}

    public record SetCapacityRequest(@NotNull LocalDate from, @NotNull LocalDate to,
            @NotNull @Min(0) @Max(1_000_000) Integer maxQuantity) {}

    /** Công khai: lịch chọn ngày nhận của buyer */
    @GetMapping("/api/providers/{providerId}/available-dates")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<DayAvailability>>> availableDates(@PathVariable UUID providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        checkRange(from, to);
        Map<LocalDate, DailyCapacity> byBakeDate = byDate(providerId, from.minusDays(1), to.minusDays(1));
        LocalDate earliest = LocalDate.now(VIETNAM).plusDays(MIN_LEAD_DAYS);
        List<DayAvailability> days = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            DailyCapacity bake = byBakeDate.get(d.minusDays(1));
            days.add(new DayAvailability(d, !d.isBefore(earliest) && bake != null
                    && bake.getReservedQuantity() < bake.getMaxQuantity()));
        }
        return ResponseEntity.ok(ApiResponseDTO.success(days));
    }

    /** Seller xem năng lực nướng theo ngày nướng */
    @GetMapping("/api/provider/capacities")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<CapacityDay>>> myCapacities(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        checkRange(from, to);
        User provider = requireProvider();
        return ResponseEntity.ok(ApiResponseDTO.success(capacities
                .findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(provider.getId(), from, to).stream()
                .map(c -> new CapacityDay(c.getCapacityDate(), c.getMaxQuantity(), c.getReservedQuantity()))
                .toList()));
    }

    /** Seller đặt cùng một mức năng lực nướng cho mọi ngày nướng trong [from, to] */
    @PutMapping("/api/provider/capacities")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<List<CapacityDay>>> setCapacities(@Valid @RequestBody SetCapacityRequest request) {
        checkRange(request.from(), request.to());
        if (request.from().isBefore(LocalDate.now(VIETNAM))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change capacity of past days");
        }
        User provider = requireProvider();
        Map<LocalDate, DailyCapacity> existing = byDate(provider.getId(), request.from(), request.to());
        List<DailyCapacity> rows = new ArrayList<>();
        for (LocalDate d = request.from(); !d.isAfter(request.to()); d = d.plusDays(1)) {
            DailyCapacity row = existing.get(d);
            if (row == null) {
                row = DailyCapacity.builder().provider(provider).capacityDate(d).reservedQuantity(0).build();
            } else if (row.getReservedQuantity() > request.maxQuantity()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "CAPACITY_BELOW_RESERVED date=" + d + " reserved=" + row.getReservedQuantity());
            }
            row.setMaxQuantity(request.maxQuantity());
            rows.add(row);
        }
        return ResponseEntity.ok(ApiResponseDTO.success(capacities.saveAll(rows).stream()
                .map(c -> new CapacityDay(c.getCapacityDate(), c.getMaxQuantity(), c.getReservedQuantity()))
                .toList()));
    }

    private Map<LocalDate, DailyCapacity> byDate(UUID providerId, LocalDate from, LocalDate to) {
        return capacities.findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(providerId, from, to).stream()
                .collect(Collectors.toMap(DailyCapacity::getCapacityDate, Function.identity()));
    }

    private void checkRange(LocalDate from, LocalDate to) {
        if (to.isBefore(from) || from.plusDays(MAX_RANGE_DAYS).isBefore(to)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Date range must be 0 to " + MAX_RANGE_DAYS + " days");
        }
    }

    private User requireProvider() {
        User user = security.getCurrentUser();
        if (user.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        }
        return user;
    }
}
