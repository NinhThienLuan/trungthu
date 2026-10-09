package fpt.sba.trungthu.service.serviceImpl;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.ProductImageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductImage;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.UserRole;
import fpt.sba.trungthu.repository.ProductImageRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.CloudinaryService;
import fpt.sba.trungthu.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository imageRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    // ─── Helpers ─────────────────────────────────────────────────────────

    private User getProviderUser(String email) {
        User user = userRepository.findByEmailAndStatus(email, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getRole() != UserRole.PROVIDER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Access denied: Only PROVIDER can perform product management");
        }
        return user;
    }

    /**
     * Delete all Cloudinary images for a given variant, then remove DB records.
     */
    private void deleteVariantImagesFromCloudinaryAndDb(UUID variantId) {
        List<ProductImage> images = imageRepository.findByVariantId(variantId);
        for (ProductImage img : images) {
            cloudinaryService.delete(img.getCloudinaryPublicId());
        }
        imageRepository.deleteByVariantId(variantId);
    }

    // ─── Product CRUD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductResponse createProduct(String providerEmail, ProductRequest request) {
        User provider = getProviderUser(providerEmail);

        if (productRepository.existsByNameAndProviderId(request.getName(), provider.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Product with this name already exists for your store");
        }

        Product product = Product.builder()
                .provider(provider)
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();
        Product savedProduct = productRepository.save(product);

        List<ProductVariantResponse> variantResponses = new ArrayList<>();

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            for (ProductVariantRequest vReq : request.getVariants()) {
                if (variantRepository.existsBySku(vReq.getSku())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "SKU already exists: " + vReq.getSku());
                }

                ProductVariant variant = ProductVariant.builder()
                        .product(savedProduct)
                        .variantName(vReq.getVariantName())
                        .sku(vReq.getSku())
                        .price(vReq.getPrice())
                        .stockQuantity(vReq.getStockQuantity() != null ? vReq.getStockQuantity() : 0)
                        .status(vReq.getStatus() != null ? vReq.getStatus() : "ACTIVE")
                        .build();
                ProductVariant savedVariant = variantRepository.save(variant);

                // Images are uploaded separately via the upload endpoint
                variantResponses.add(mapVariantToResponse(savedVariant, List.of()));
            }
        }

        log.info("Product created: id={}, name={}, provider={}", savedProduct.getId(), savedProduct.getName(), provider.getEmail());
        return mapProductToResponse(savedProduct, variantResponses);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponse> getProviderProducts(String providerEmail, int page, int size) {
        User provider = getProviderUser(providerEmail);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        return productRepository.findByProviderId(provider.getId(), pageable)
                .map(this::buildFullProductResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(String providerEmail, UUID productId) {
        User provider = getProviderUser(providerEmail);
        Product product = productRepository.findByIdAndProviderId(productId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found or access denied"));

        return buildFullProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request) {
        User provider = getProviderUser(providerEmail);
        Product product = productRepository.findByIdAndProviderId(productId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found or access denied"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated: id={}", updatedProduct.getId());
        return buildFullProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(String providerEmail, UUID productId) {
        User provider = getProviderUser(providerEmail);
        Product product = productRepository.findByIdAndProviderId(productId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found or access denied"));

        // Clean up all variant images from Cloudinary, then delete from DB
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        for (ProductVariant v : variants) {
            deleteVariantImagesFromCloudinaryAndDb(v.getId());
        }
        variantRepository.deleteAll(variants);
        productRepository.delete(product);

        log.info("Product deleted: id={}", productId);
    }

    // ─── Variant CRUD ────────────────────────────────────────────────────

    @Override
    @Transactional
    public ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request) {
        User provider = getProviderUser(providerEmail);
        Product product = productRepository.findByIdAndProviderId(productId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found or access denied"));

        if (variantRepository.existsBySku(request.getSku())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "SKU already exists: " + request.getSku());
        }

        ProductVariant variant = ProductVariant.builder()
                .product(product)
                .variantName(request.getVariantName())
                .sku(request.getSku())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        ProductVariant savedVariant = variantRepository.save(variant);
        log.info("Variant added: id={}, sku={}, productId={}", savedVariant.getId(), savedVariant.getSku(), productId);
        return mapVariantToResponse(savedVariant, List.of());
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(String providerEmail, UUID variantId, ProductVariantRequest request) {
        User provider = getProviderUser(providerEmail);
        ProductVariant variant = variantRepository.findByIdAndProductProviderId(variantId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Variant not found or access denied"));

        if (variantRepository.existsBySkuAndIdNot(request.getSku(), variantId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "SKU already exists: " + request.getSku());
        }

        variant.setVariantName(request.getVariantName());
        variant.setSku(request.getSku());
        variant.setPrice(request.getPrice());
        variant.setStockQuantity(request.getStockQuantity());
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }

        ProductVariant updatedVariant = variantRepository.save(variant);
        List<ProductImage> images = imageRepository.findByVariantIdOrderByDisplayOrderAsc(updatedVariant.getId());
        List<ProductImageResponse> imgResponses = images.stream()
                .map(this::mapImageToResponse)
                .collect(Collectors.toList());

        log.info("Variant updated: id={}, sku={}", updatedVariant.getId(), updatedVariant.getSku());
        return mapVariantToResponse(updatedVariant, imgResponses);
    }

    @Override
    @Transactional
    public void deleteVariant(String providerEmail, UUID variantId) {
        User provider = getProviderUser(providerEmail);
        ProductVariant variant = variantRepository.findByIdAndProductProviderId(variantId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Variant not found or access denied"));

        deleteVariantImagesFromCloudinaryAndDb(variant.getId());
        variantRepository.delete(variant);
        log.info("Variant deleted: id={}", variantId);
    }

    // ─── Image Management (Cloudinary) ───────────────────────────────────

    @Override
    @Transactional
    public ProductImageResponse uploadImage(String providerEmail, UUID variantId,
                                            MultipartFile file, Boolean isPrimary, Integer displayOrder) {
        User provider = getProviderUser(providerEmail);
        ProductVariant variant = variantRepository.findByIdAndProductProviderId(variantId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Variant not found or access denied"));

        // Upload to Cloudinary under folder: trungthu/products/{providerId}/{productId}
        String folder = provider.getId() + "/" + variant.getProduct().getId();
        Map<String, Object> uploadResult = cloudinaryService.upload(file, folder);

        String secureUrl = (String) uploadResult.get("secure_url");
        String publicId = (String) uploadResult.get("public_id");

        ProductImage image = ProductImage.builder()
                .variant(variant)
                .imageUrl(secureUrl)
                .cloudinaryPublicId(publicId)
                .isPrimary(isPrimary != null ? isPrimary : false)
                .displayOrder(displayOrder != null ? displayOrder : 0)
                .build();

        ProductImage savedImage = imageRepository.save(image);
        log.info("Image uploaded: id={}, variantId={}, cloudinaryPublicId={}", savedImage.getId(), variantId, publicId);
        return mapImageToResponse(savedImage);
    }

    @Override
    @Transactional
    public void deleteImage(String providerEmail, UUID imageId) {
        User provider = getProviderUser(providerEmail);
        ProductImage image = imageRepository.findByIdAndVariantProductProviderId(imageId, provider.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Image not found or access denied"));

        // Delete from Cloudinary first
        cloudinaryService.delete(image.getCloudinaryPublicId());
        imageRepository.delete(image);
        log.info("Image deleted: id={}, cloudinaryPublicId={}", imageId, image.getCloudinaryPublicId());
    }

    // ─── Response Mappers ────────────────────────────────────────────────

    private ProductResponse buildFullProductResponse(Product product) {
        List<ProductVariant> variants = variantRepository.findByProductId(product.getId());
        List<ProductVariantResponse> variantResponses = variants.stream().map(v -> {
            List<ProductImage> images = imageRepository.findByVariantIdOrderByDisplayOrderAsc(v.getId());
            List<ProductImageResponse> imgResponses = images.stream()
                    .map(this::mapImageToResponse)
                    .collect(Collectors.toList());
            return mapVariantToResponse(v, imgResponses);
        }).collect(Collectors.toList());

        return mapProductToResponse(product, variantResponses);
    }

    private ProductResponse mapProductToResponse(Product product, List<ProductVariantResponse> variants) {
        return ProductResponse.builder()
                .id(product.getId())
                .providerId(product.getProvider().getId())
                .providerStoreName(product.getProvider().getStoreName())
                .name(product.getName())
                .description(product.getDescription())
                .status(product.getStatus())
                .variants(variants)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductVariantResponse mapVariantToResponse(ProductVariant variant, List<ProductImageResponse> images) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .productId(variant.getProduct().getId())
                .variantName(variant.getVariantName())
                .sku(variant.getSku())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .status(variant.getStatus())
                .images(images)
                .createdAt(variant.getCreatedAt())
                .updatedAt(variant.getUpdatedAt())
                .build();
    }

    private ProductImageResponse mapImageToResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .variantId(image.getVariant().getId())
                .imageUrl(image.getImageUrl())
                .cloudinaryPublicId(image.getCloudinaryPublicId())
                .isPrimary(image.getIsPrimary())
                .displayOrder(image.getDisplayOrder())
                .createdAt(image.getCreatedAt())
                .build();
    }
}
