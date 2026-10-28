package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.Promotion;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.PromotionType;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.PromotionRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

/**
 * Sự kiện khuyến mãi: seller tạo (giảm % theo số lượng, mua X tặng Y), khách xem nhãn khuyến mãi đang chạy.
 * Checkout (CheckoutServiceImpl) tự trừ khuyến mãi tốt nhất vào từng dòng hàng.
 */
@RestController
@RequiredArgsConstructor
public class PromotionController {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");

    private final SecurityContextService security;
    private final PromotionRepository promotions;
    private final ProductRepository products;

    public record PromotionRequest(
            @NotBlank @Size(max = 150) String name,
            @NotNull PromotionType type,
            UUID productId,
            @Min(1) @Max(10_000) Integer minQuantity,
            @Min(1) @Max(90) Integer percentOff,
            @Min(1) @Max(1_000) Integer buyQuantity,
            @Min(1) @Max(1_000) Integer freeQuantity,
            @NotNull LocalDate startDate,
            @NotNull LocalDate endDate,
            Boolean active) {}

    public record PromotionResponse(UUID id, UUID providerId, String storeName, UUID productId, String productName,
            String name, PromotionType type, Integer minQuantity, Integer percentOff, Integer buyQuantity,
            Integer freeQuantity, LocalDate startDate, LocalDate endDate, boolean active, boolean running, String label) {}

    /** Công khai: khuyến mãi đang chạy hôm nay (lọc theo xưởng nếu có) */
    @GetMapping("/api/public/promotions")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<PromotionResponse>>> running(@RequestParam(required = false) UUID providerId) {
        LocalDate today = LocalDate.now(VIETNAM);
        List<Promotion> rows = providerId == null
                ? promotions.findByActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(today, today)
                : promotions.findByProviderIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(providerId, today, today);
        return ResponseEntity.ok(ApiResponseDTO.success(rows.stream().map(p -> toResponse(p, today)).toList()));
    }

    @GetMapping("/api/provider/promotions")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<PromotionResponse>>> mine() {
        LocalDate today = LocalDate.now(VIETNAM);
        return ResponseEntity.ok(ApiResponseDTO.success(promotions.findByProviderIdOrderByStartDateDesc(requireProvider().getId())
                .stream().map(p -> toResponse(p, today)).toList()));
    }

    @PostMapping("/api/provider/promotions")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<PromotionResponse>> create(@Valid @RequestBody PromotionRequest request) {
        User provider = requireProvider();
        Promotion promotion = Promotion.builder().provider(provider).build();
        apply(promotion, request, provider);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseDTO.success(
                toResponse(promotions.save(promotion), LocalDate.now(VIETNAM))));
    }

    @PutMapping("/api/provider/promotions/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<PromotionResponse>> update(@PathVariable UUID id, @Valid @RequestBody PromotionRequest request) {
        User provider = requireProvider();
        Promotion promotion = owned(id, provider);
        apply(promotion, request, provider);
        return ResponseEntity.ok(ApiResponseDTO.success(toResponse(promotion, LocalDate.now(VIETNAM))));
    }

    /** Đơn đã đặt giữ nguyên giá đã giảm; xoá chỉ ảnh hưởng đơn mới */
    @DeleteMapping("/api/provider/promotions/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<Void>> delete(@PathVariable UUID id) {
        promotions.delete(owned(id, requireProvider()));
        return ResponseEntity.ok(ApiResponseDTO.success(null));
    }

    private void apply(Promotion promotion, PromotionRequest request, User provider) {
        if (request.endDate().isBefore(request.startDate())) throw badRequest("Ngày kết thúc phải sau ngày bắt đầu");
        if (request.type() == PromotionType.PERCENT_OFF) {
            if (request.minQuantity() == null || request.percentOff() == null) {
                throw badRequest("Giảm theo % cần số lượng tối thiểu và phần trăm giảm");
            }
        } else if (request.buyQuantity() == null || request.freeQuantity() == null) {
            throw badRequest("Mua X tặng Y cần số lượng mua và số lượng tặng");
        }
        Product product = null;
        if (request.productId() != null) {
            product = products.findById(request.productId())
                    .filter(p -> p.getProvider().getId().equals(provider.getId()))
                    .orElseThrow(() -> badRequest("Sản phẩm không thuộc gian hàng của bạn"));
        }
        boolean percent = request.type() == PromotionType.PERCENT_OFF;
        promotion.setName(request.name().trim());
        promotion.setType(request.type());
        promotion.setProduct(product);
        promotion.setMinQuantity(percent ? request.minQuantity() : null);
        promotion.setPercentOff(percent ? request.percentOff() : null);
        promotion.setBuyQuantity(percent ? null : request.buyQuantity());
        promotion.setFreeQuantity(percent ? null : request.freeQuantity());
        promotion.setStartDate(request.startDate());
        promotion.setEndDate(request.endDate());
        promotion.setActive(request.active() == null || request.active());
    }

    private Promotion owned(UUID id, User provider) {
        return promotions.findById(id).filter(p -> p.getProvider().getId().equals(provider.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khuyến mãi"));
    }

    private static PromotionResponse toResponse(Promotion p, LocalDate today) {
        return new PromotionResponse(p.getId(), p.getProvider().getId(), p.getProvider().getStoreName(),
                p.getProduct() == null ? null : p.getProduct().getId(), p.getProduct() == null ? null : p.getProduct().getName(),
                p.getName(), p.getType(), p.getMinQuantity(), p.getPercentOff(), p.getBuyQuantity(), p.getFreeQuantity(),
                p.getStartDate(), p.getEndDate(), Boolean.TRUE.equals(p.getActive()), p.runsOn(today), p.label());
    }

    private User requireProvider() {
        User user = security.getCurrentUser();
        if (user.getRole() != UserRole.PROVIDER) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider account required");
        return user;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
