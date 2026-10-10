package fpt.sba.trungthu.service.serviceImpl;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Set<Integer> ALLOWED_BOX_CAPACITIES = Set.of(2, 4, 6);

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(String providerEmail) {
        return productRepository.findByProviderEmailOrderByCreatedAtDesc(providerEmail).stream()
                .map(p -> ProductResponse.fromEntity(p, false))
                .toList();
    }

    @Override
    @Transactional
    public ProductResponse createProduct(String providerEmail, ProductRequest request) {
        User provider = userRepository.findByEmailAndStatus(providerEmail, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
        validateShelfLife(request);

        Product product = Product.builder()
                .provider(provider)
                .name(request.getName().trim())
                .description(request.getDescription())
                .productType(request.getProductType())
                .shelfLifeDays(request.getShelfLifeDays())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        Product saved = productRepository.save(product);
        log.info("Provider {} created product {}", providerEmail, saved.getId());
        return ProductResponse.fromEntity(saved, false);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request) {
        Product product = findOwnedProduct(providerEmail, productId);
        // Đổi loại sẽ làm sai thuộc tính của các biến thể đã có (weightGram / boxCapacity)
        if (product.getProductType() != request.getProductType() && !product.getVariants().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change product type after variants exist");
        }
        validateShelfLife(request);

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());
        product.setProductType(request.getProductType());
        product.setShelfLifeDays(request.getShelfLifeDays());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        return ProductResponse.fromEntity(product, false);
    }

    @Override
    @Transactional
    public ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request) {
        Product product = findOwnedProduct(providerEmail, productId);
        validateVariantForType(product.getProductType(), request);
        String sku = normalizeSku(request.getSku());
        if (variantRepository.existsBySku(sku)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
        }

        ProductVariant variant = ProductVariant.builder().product(product).build();
        applyVariant(variant, request, sku);
        variant.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        return ProductVariantResponse.fromEntity(variantRepository.save(variant));
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(String providerEmail, UUID productId, UUID variantId, ProductVariantRequest request) {
        Product product = findOwnedProduct(providerEmail, productId);
        ProductVariant variant = variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        validateVariantForType(product.getProductType(), request);
        String sku = normalizeSku(request.getSku());
        if (!sku.equals(variant.getSku()) && variantRepository.existsBySku(sku)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
        }

        applyVariant(variant, request, sku);
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }
        return ProductVariantResponse.fromEntity(variant);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getPublicProducts(ProductType type) {
        return productRepository.findPublic(type).stream()
                .map(p -> ProductResponse.fromEntity(p, true))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getPublicProduct(UUID productId) {
        return productRepository.findPublicById(productId)
                .map(p -> ProductResponse.fromEntity(p, true))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    // Trả 404 cả khi sản phẩm thuộc shop khác, để không lộ sản phẩm của shop khác
    private Product findOwnedProduct(String providerEmail, UUID productId) {
        return productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void validateShelfLife(ProductRequest request) {
        boolean isCake = request.getProductType() == ProductType.LOOSE_CAKE;
        if (isCake && request.getShelfLifeDays() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shelf life days is required for LOOSE_CAKE");
        }
        if (!isCake && request.getShelfLifeDays() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shelf life days only applies to LOOSE_CAKE");
        }
    }

    private void validateVariantForType(ProductType type, ProductVariantRequest request) {
        boolean isCake = type == ProductType.LOOSE_CAKE;
        boolean isBox = type == ProductType.BOX_SHELL;
        if (isCake != (request.getWeightGram() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    isCake ? "Weight (gram) is required for LOOSE_CAKE variant" : "Weight (gram) only applies to LOOSE_CAKE variant");
        }
        if (isBox != (request.getBoxCapacity() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    isBox ? "Box capacity is required for BOX_SHELL variant" : "Box capacity only applies to BOX_SHELL variant");
        }
        if (isBox && !ALLOWED_BOX_CAPACITIES.contains(request.getBoxCapacity())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Box capacity must be 2, 4 or 6");
        }
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase();
    }

    private void applyVariant(ProductVariant variant, ProductVariantRequest request, String sku) {
        variant.setVariantName(request.getVariantName().trim());
        variant.setSku(sku);
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        variant.setWeightGram(request.getWeightGram());
        variant.setBoxCapacity(request.getBoxCapacity());
    }
}
