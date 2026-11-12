package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.StoreReview;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.StoreReviewRepository;
import fpt.sba.trungthu.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class StoreReviewController {
    private final SecurityContextService security;
    private final OrderRepository orders;
    private final UserRepository users;
    private final StoreReviewRepository reviews;

    public record ReviewRequest(@NotNull UUID orderId, @Min(1) @Max(5) int rating,
            @Size(max = 2000) String comment) {}

    public record ReviewResponse(UUID id, UUID orderId, UUID providerId, String customerName,
            int rating, String comment, LocalDateTime createdAt) {}

    public record StoreSummary(UUID id, String name) {}

    @GetMapping("/api/public/stores/{providerId}")
    public ResponseEntity<ApiResponseDTO<StoreSummary>> store(@PathVariable UUID providerId) {
        return ResponseEntity.ok(ApiResponseDTO.success(users.findById(providerId)
                .filter(user -> user.getRole() == UserRole.PROVIDER)
                .map(user -> new StoreSummary(user.getId(), user.getStoreName()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy gian hàng"))));
    }

    @GetMapping("/api/public/stores/{providerId}/reviews")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<ReviewResponse>>> byStore(@PathVariable UUID providerId) {
        return ResponseEntity.ok(ApiResponseDTO.success(reviews.findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream().map(this::toResponse).toList()));
    }

    public ResponseEntity<ApiResponseDTO<List<ReviewResponse>>> list(UUID providerId) {
        return byStore(providerId);
    }

    @PostMapping("/api/stores/{providerId}/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ReviewResponse>> create(@PathVariable UUID providerId,
            @Valid @RequestBody ReviewRequest request) {
        return handleCreate(providerId, request);
    }

    @PostMapping("/api/store-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ReviewResponse>> create(@Valid @RequestBody ReviewRequest request) {
        return handleCreate(null, request);
    }

    private ResponseEntity<ApiResponseDTO<ReviewResponse>> handleCreate(UUID providerId, ReviewRequest request) {
        User customer = security.getCurrentUser();
        Order order = orders.findById(request.orderId())
                .filter(o -> o.getCustomer().getId().equals(customer.getId())
                        && (providerId == null || o.getProvider().getId().equals(providerId)))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        if (order.getOrderStatus() != OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ đánh giá sau khi đơn hoàn tất");
        }
        if (reviews.existsByOrderId(order.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Đơn này đã được đánh giá");
        }
        StoreReview review = reviews.save(StoreReview.builder()
                .order(order)
                .provider(order.getProvider())
                .customer(customer)
                .rating(request.rating())
                .comment(request.comment() == null ? "" : request.comment().trim())
                .build());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseDTO.success(toResponse(review)));
    }

    private ReviewResponse toResponse(StoreReview review) {
        return new ReviewResponse(review.getId(), review.getOrder().getId(), review.getProvider().getId(),
                review.getCustomer().getFullName(), review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
