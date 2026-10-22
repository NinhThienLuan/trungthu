package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.ImportStockRequest;
import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.dto.response.InventoryAuditResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.dto.response.ReservedLineResponse;
import fpt.sba.trungthu.entity.ProductVariant;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface InventoryService {

    void recordOpeningStock(ProductVariant variant, int quantity);

    void replaceOpeningStock(ProductVariant variant, int quantity);

    ProductVariantResponse importStock(String providerEmail, UUID productId, UUID variantId, ImportStockRequest request);

    ProductVariantResponse adjust(String providerEmail, UUID productId, UUID variantId, AdjustStockRequest request);

    PageResponse<InventoryAuditResponse> audits(String providerEmail, UUID productId, UUID variantId, Pageable pageable);

    List<ReservedLineResponse> reserve(ReserveStockCommand command);

    void release(ReleaseStockCommand command);

    void recordSale(UUID orderId);
}
