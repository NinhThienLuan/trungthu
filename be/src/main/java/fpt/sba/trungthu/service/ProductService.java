package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.enumeration.ProductType;

import java.util.List;
import java.util.UUID;

public interface ProductService {

    // Provider quản lý sản phẩm của shop mình
    List<ProductResponse> getMyProducts(String providerEmail);

    ProductResponse createProduct(String providerEmail, ProductRequest request);

    ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request);

    ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request);

    ProductVariantResponse updateVariant(String providerEmail, UUID productId, UUID variantId, ProductVariantRequest request);

    // Khách xem sản phẩm đang bán
    List<ProductResponse> getPublicProducts(ProductType type);

    ProductResponse getPublicProduct(UUID productId);
}
