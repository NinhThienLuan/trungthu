package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductReview;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductReviewRepository;
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
public class ProductReviewController {

    private final SecurityContextService security;
    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public record CreateProductReviewRequest(
            @NotNull UUID orderId,
            @Min(1) @Max(5) int rating,
            @Size(max = 2000) String comment) {}

    public record ProductReviewResponse(
            UUID id,
            UUID productId,
            UUID orderId,
            String customerName,
            int rating,
            String comment,
            LocalDateTime createdAt) {}

    public record ProductReviewSummaryResponse(
            double averageRating,
            int totalReviews,
            List<ProductReviewResponse> reviews) {}

    @GetMapping("/api/public/products/{productId}/reviews")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<ProductReviewSummaryResponse>> listReviews(@PathVariable UUID productId) {
        List<ProductReview> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        double avg = reviews.isEmpty() ? 0.0 : reviews.stream().mapToInt(ProductReview::getRating).average().orElse(0.0);
        // Round to 1 decimal place
        avg = Math.round(avg * 10.0) / 10.0;
        List<ProductReviewResponse> items = reviews.stream().map(r -> new ProductReviewResponse(
                r.getId(),
                r.getProduct().getId(),
                r.getOrder().getId(),
                r.getCustomer().getFullName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt())).toList();
        return ResponseEntity.ok(ApiResponseDTO.success(new ProductReviewSummaryResponse(avg, items.size(), items)));
    }

    @PostMapping("/api/products/{productId}/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ProductReviewResponse>> createReview(
            @PathVariable UUID productId,
            @Valid @RequestBody CreateProductReviewRequest request) {
        UUID customerId = security.getCurrentUserId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm"));

        Order order = orderRepository.findById(request.orderId())
                .filter(o -> o.getCustomer().getId().equals(customerId) && o.getOrderStatus() == OrderStatus.COMPLETED)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Chỉ đánh giá được sản phẩm thuộc đơn hàng đã hoàn tất của bạn"));

        // Verify product was actually part of this order
        List<OrderItem> items = orderItemRepository.findByOrderBatchOrderId(order.getId());
        boolean hasProduct = items.stream().anyMatch(item ->
                (item.getVariant() != null && item.getVariant().getProduct() != null && item.getVariant().getProduct().getId().equals(productId))
                || (item.getSourceSet() != null && item.getSourceSet().getId().equals(productId)));

        if (!hasProduct) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sản phẩm không có trong đơn hàng này");
        }

        if (reviewRepository.existsByOrderIdAndProductId(order.getId(), productId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi");
        }

        ProductReview review = reviewRepository.save(ProductReview.builder()
                .product(product)
                .customer(order.getCustomer())
                .order(order)
                .rating(request.rating())
                .comment(request.comment() == null ? "" : request.comment().trim())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseDTO.success(new ProductReviewResponse(
                review.getId(),
                productId,
                order.getId(),
                order.getCustomer().getFullName(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt())));
    }

    @GetMapping("/api/orders/{orderId}/product-reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<UUID>>> getReviewedProductIds(@PathVariable UUID orderId) {
        UUID customerId = security.getCurrentUserId();
        Order order = orderRepository.findById(orderId)
                .filter(o -> o.getCustomer().getId().equals(customerId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));

        List<ProductReview> reviews = reviewRepository.findByOrderId(order.getId());
        List<UUID> productIds = reviews.stream().map(r -> r.getProduct().getId()).toList();
        return ResponseEntity.ok(ApiResponseDTO.success(productIds));
    }
}
