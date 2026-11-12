package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class StoreReviewController {
    private final SecurityContextService security;
    private final OrderRepository orders;
    private final UserRepository users;
    private final ObjectMapper mapper;

    @Value("${app.storage.base-path:uploads}")
    private String storagePath;

    public record ReviewRequest(@NotNull UUID orderId, @Min(1) @Max(5) int rating,
            @Size(max = 1000) String comment) {}

    public record ReviewResponse(UUID orderId, UUID providerId, String customerName,
            int rating, String comment, Instant createdAt) {}

    public record StoreSummary(UUID id, String name) {}

    @GetMapping("/api/public/stores/{providerId}")
    public ResponseEntity<ApiResponseDTO<StoreSummary>> store(@PathVariable UUID providerId) {
        return ResponseEntity.ok(ApiResponseDTO.success(users.findById(providerId)
                .filter(user -> user.getRole() == UserRole.PROVIDER)
                .map(user -> new StoreSummary(user.getId(), user.getStoreName()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gian hàng"))));
    }

    @GetMapping("/api/public/stores/{providerId}/reviews")
    public ResponseEntity<ApiResponseDTO<List<ReviewResponse>>> list(@PathVariable UUID providerId) {
        Path dir = Path.of(storagePath, "reviews", providerId.toString());
        if (!Files.isDirectory(dir)) return ResponseEntity.ok(ApiResponseDTO.success(List.of()));
        try (var files = Files.list(dir)) {
            List<ReviewResponse> reviews = files.filter(path -> path.getFileName().toString().endsWith(".json"))
                    .map(path -> {
                        try { return mapper.readValue(path.toFile(), ReviewResponse.class); }
                        catch (RuntimeException ex) { throw new IllegalStateException("Không đọc được đánh giá", ex); }
                    }).sorted(Comparator.comparing(ReviewResponse::createdAt).reversed()).toList();
            return ResponseEntity.ok(ApiResponseDTO.success(reviews));
        } catch (IOException ex) {
            throw new IllegalStateException("Không đọc được đánh giá", ex);
        }
    }

    @PostMapping("/api/stores/{providerId}/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<ReviewResponse>> create(@PathVariable UUID providerId,
            @Valid @RequestBody ReviewRequest request) {
        Order order = orders.findById(request.orderId())
                .filter(o -> o.getCustomer().getId().equals(security.getCurrentUserId())
                        && o.getProvider().getId().equals(providerId)
                        && o.getOrderStatus() == OrderStatus.COMPLETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Chỉ đánh giá được gian hàng sau khi đơn đã hoàn tất"));
        ReviewResponse review = new ReviewResponse(order.getId(), providerId,
                order.getCustomer().getFullName(), request.rating(),
                request.comment() == null ? "" : request.comment().trim(), Instant.now());
        Path dir = Path.of(storagePath, "reviews", providerId.toString());
        try {
            Files.createDirectories(dir);
            Path file = dir.resolve(order.getId() + ".json");
            Files.write(file, mapper.writeValueAsBytes(review), StandardOpenOption.CREATE_NEW);
        } catch (java.nio.file.FileAlreadyExistsException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn này đã được đánh giá");
        } catch (IOException ex) {
            throw new IllegalStateException("Không lưu được đánh giá", ex);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseDTO.success(review));
    }
}
