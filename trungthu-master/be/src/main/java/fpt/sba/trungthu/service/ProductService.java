package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Interface quản lý nghiệp vụ sản phẩm (Product) và các biến thể SKU (ProductVariant).
 */
public interface ProductService {

    // === Tác vụ của Provider (Quản lý sản phẩm shop mình) ===

    /**
     * Lấy danh sách sản phẩm của Provider có phân trang
     */
    PageResponse<ProductResponse> getMyProducts(String providerEmail, Pageable pageable);

    /**
     * Lấy danh sách sản phẩm của Provider (dạng List cho tương thích)
     */
    List<ProductResponse> getMyProducts(String providerEmail);

    ProductResponse createProduct(String providerEmail, ProductRequest request);

    ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request);

    ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request);

    ProductVariantResponse updateVariant(String providerEmail, UUID productId, UUID variantId, ProductVariantRequest request);

    // === Tác vụ tra cứu danh mục sản phẩm (Catalog) ===

    /**
     * Lấy danh mục sản phẩm đang mở bán có phân trang (khách xem)
     */
    PageResponse<ProductResponse> getProducts(ProductType type, Pageable pageable);

    /**
     * Lấy danh mục sản phẩm đang mở bán dạng List (tương thích)
     */
    List<ProductResponse> getPublicProducts(ProductType type);

    /**
     * Lấy thông tin chi tiết một sản phẩm đang bán kèm các biến thể active
     */
    ProductResponse getProductDetail(UUID productId);

    /**
     * Alias tương thích cho getProductDetail
     */
    ProductResponse getPublicProduct(UUID productId);
}
