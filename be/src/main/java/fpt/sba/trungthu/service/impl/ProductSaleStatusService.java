package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.UUID;

/**
 * Keeps a selling product on ACTIVE while any variant still has stock, and on SOLD_OUT when every variant is empty.
 */
@Service
@RequiredArgsConstructor
public class ProductSaleStatusService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final GiftSetComponentRepository componentRepository;
    private final EntityManager entityManager;

    @Transactional
    public void refresh(UUID productId) {
        entityManager.flush();
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return;
        }
        ProductStatus status = product.getStatus();
        if (status != ProductStatus.ACTIVE && status != ProductStatus.SOLD_OUT) {
            return;
        }
        if (product.getProductType() == ProductType.GIFT_SET) {
            boolean anySets = componentRepository.findBySetProductId(productId).stream()
                    .anyMatch(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL
                            && row.getQuantity() > 0);
            if (anySets && status == ProductStatus.SOLD_OUT) {
                product.setStatus(ProductStatus.ACTIVE);
            } else if (!anySets && status == ProductStatus.ACTIVE) {
                product.setStatus(ProductStatus.SOLD_OUT);
            }
            return;
        }
        boolean anyStock = variantRepository.countPositiveStock(productId) > 0;
        if (anyStock && status == ProductStatus.SOLD_OUT) {
            product.setStatus(ProductStatus.ACTIVE);
        } else if (!anyStock && status == ProductStatus.ACTIVE
                && variantRepository.countByProductId(productId) > 0) {
            product.setStatus(ProductStatus.SOLD_OUT);
        }
    }

    @Transactional
    public void refreshByVariants(Collection<UUID> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) {
            return;
        }
        variantRepository.findProductIdsByIdIn(variantIds).forEach(this::refresh);
    }
}
