package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.mapper.ProductMapper;
import fpt.sba.trungthu.dto.ProductView;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.InventoryAudit;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.service.event.StockChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VariantTerminationService {

    private static final Set<OrderStatus> BLOCKING = EnumSet.of(
            OrderStatus.CONFIRMED, OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED);

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final OrderItemRepository orderItemRepository;
    private final InventoryAuditRepository auditRepository;
    private final PendingChannelRelease channelRelease;
    private final ApplicationEventPublisher events;
    private final ProductSaleStatusService saleStatus;
    private final ProductMapper productMapper;
    private final GiftSetService giftSetService;

    @Transactional
    public ProductVariantResponse terminate(String providerEmail, UUID productId, UUID variantId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần ghi chú khi báo hết hàng");
        }
        var product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        ProductVariant variant = variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ, không nghỉ bán thêm");
        }
        if (product.getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đang nháp, không báo hết hàng");
        }
        List<OrderItem> retail = orderItemRepository.findForTerminate(variantId).stream()
                .filter(item -> item.getSourceSet() == null)
                .toList();
        if (retail.stream().anyMatch(item -> BLOCKING.contains(item.getOrderBatch().getOrder().getOrderStatus()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không báo hết hàng khi còn đơn bán lẻ đang xác nhận, đã cọc hoặc chờ nướng");
        }
        channelRelease.cancelOrders(retail.stream()
                .filter(item -> item.getOrderBatch().getOrder().getOrderStatus() == OrderStatus.PENDING_DEPOSIT)
                .toList());
        int cleared = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        variant.setStockQuantity(0);
        variant.setStatus(fpt.sba.trungthu.entity.enumeration.VariantStatus.OUT_OF_STOCK);
        auditRepository.save(InventoryAudit.builder()
                .variant(variant)
                .provider(product.getProvider())
                .auditType(InventoryAuditType.TERMINATE_CLEAR)
                .quantityDelta(-cleared)
                .stockAfter(0)
                .reason(reason.trim())
                .build());
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(product.getId());
        return ProductVariantResponse.fromEntity(variant, true);
    }

    @Transactional
    public ProductResponse discontinue(String providerEmail, UUID productId) {
        var product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ");
        }
        if (product.getProductType() == ProductType.GIFT_SET) {
            return giftSetService.discontinue(providerEmail, product.getId());
        }
        if (product.getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm chưa đăng bán");
        }
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        if (variants.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm chưa có phân loại");
        }
        for (ProductVariant variant : List.copyOf(variants)) {
            terminate(providerEmail, productId, variant.getId(), "Ngừng kinh doanh sản phẩm");
        }
        saleStatus.refresh(product.getId());
        return productMapper.toResponse(product, ProductView.PROVIDER);
    }
}
