package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.dto.response.VariantStatsResponse;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.EnumSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VariantStatsService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryAuditRepository auditRepository;
    private final GiftSetComponentRepository componentRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public VariantStatsResponse stats(String providerEmail, UUID productId, UUID variantId) {
        var product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        ProductVariant variant = variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        long inbound = Math.max(0, auditRepository.sumDelta(variantId, InventoryAuditType.INBOUND_IMPORT));
        long broken = Math.abs(auditRepository.sumDelta(variantId, InventoryAuditType.ADJUSTMENT_BROKEN));
        long expired = Math.abs(auditRepository.sumDelta(variantId, InventoryAuditType.ADJUSTMENT_EXPIRED));
        long terminateClear = Math.abs(auditRepository.sumDelta(variantId, InventoryAuditType.TERMINATE_CLEAR));
        long sold = Math.abs(auditRepository.sumDelta(variantId, InventoryAuditType.ORDER_SALE));
        long awaitingPayment = orderItemRepository.sumQuantityByStatuses(variantId,
                EnumSet.of(OrderStatus.PENDING_DEPOSIT, OrderStatus.CONFIRMED));
        long cancelled = orderItemRepository.sumQuantityByStatuses(variantId, EnumSet.of(OrderStatus.CANCELLED));
        boolean giftSet = variant.getProduct().getProductType() == ProductType.GIFT_SET;
        long looseOnHand = giftSet ? 0 : Math.max(0, variant.getStockQuantity() == null ? 0 : variant.getStockQuantity());
        long inSet = giftSet ? 0 : componentRepository.sumQuantityByComponentVariantId(variantId);
        long onHand = looseOnHand + inSet;
        long discrepancy = inbound - broken - expired - terminateClear - sold - awaitingPayment - onHand;
        return VariantStatsResponse.builder()
                .inbound(inbound)
                .looseOnHand(looseOnHand)
                .inSet(inSet)
                .onHand(onHand)
                .broken(broken)
                .expired(expired)
                .terminateClear(terminateClear)
                .sold(sold)
                .awaitingPayment(awaitingPayment)
                .cancelled(cancelled)
                .discrepancy(discrepancy)
                .build();
    }
}
