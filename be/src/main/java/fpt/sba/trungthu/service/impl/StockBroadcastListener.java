package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.websocket.StockWebSocketHandler;
import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.CartItemRepository;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.service.event.StockChangedEvent;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class StockBroadcastListener {

    private final ProductVariantRepository variantRepository;
    private final GiftSetComponentRepository componentRepository;
    private final CartItemRepository cartItemRepository;
    private final StockWebSocketHandler stockWebSocketHandler;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void broadcast(StockChangedEvent event) {
        ProductVariant variant = variantRepository.findById(event.variantId()).orElse(null);
        if (variant == null) {
            return;
        }
        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        boolean inStock = variant.getStatus() == VariantStatus.IN_STOCK;
        cartItemRepository.unselectUnavailable(variant.getId(), stock, inStock);
        stockWebSocketHandler.broadcast("{\"variantId\":\"" + variant.getId()
                + "\",\"stockQuantity\":" + stock
                + ",\"status\":\"" + variant.getStatus().name() + "\"}");
        broadcastSets(variant.getId());
    }

    private void broadcastSets(UUID variantId) {
        Set<UUID> setIds = new LinkedHashSet<>();
        for (GiftSetComponent row : componentRepository.findByComponentVariantId(variantId)) {
            setIds.add(row.getSetProduct().getId());
        }
        for (UUID setId : setIds) {
            int assembled = componentRepository.findBySetProductId(setId).stream()
                    .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                    .mapToInt(GiftSetComponent::getQuantity)
                    .sum();
            cartItemRepository.unselectUnavailableSets(setId, assembled);
            String status = assembled > 0 ? VariantStatus.IN_STOCK.name() : VariantStatus.OUT_OF_STOCK.name();
            stockWebSocketHandler.broadcast("{\"setProductId\":\"" + setId
                    + "\",\"assembledQuantity\":" + assembled
                    + ",\"status\":\"" + status + "\"}");
        }
    }
}
