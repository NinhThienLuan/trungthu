package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductImageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ProductService {
    // Product CRUD
    ProductResponse createProduct(String providerEmail, ProductRequest request);
    Page<ProductResponse> getProviderProducts(String providerEmail, int page, int size);
    ProductResponse getProductById(String providerEmail, UUID productId);
    ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request);
    void deleteProduct(String providerEmail, UUID productId);

    // Variant CRUD
    ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request);
    ProductVariantResponse updateVariant(String providerEmail, UUID variantId, ProductVariantRequest request);
    void deleteVariant(String providerEmail, UUID variantId);

    // Image management (Cloudinary upload)
    ProductImageResponse uploadImage(String providerEmail, UUID variantId, MultipartFile file, Boolean isPrimary, Integer displayOrder);
    void deleteImage(String providerEmail, UUID imageId);
}
