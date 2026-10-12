package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.mapper.ProductMapper;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getMyProducts(String providerEmail, Pageable pageable) {
        log.info("Fetching paginated products for provider: {} [page: {}, size: {}]", 
                providerEmail, pageable.getPageNumber(), pageable.getPageSize());
        try {
            Page<Product> productPage = productRepository.findByProviderEmailOrderByCreatedAtDesc(providerEmail, pageable);
            return PageResponse.from(productPage, p -> productMapper.toResponse(p, false));
        } catch (Exception ex) {
            log.error("Error fetching paginated products for provider {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve products");
        } finally {
            log.debug("Completed getMyProducts (paginated) for: {}", providerEmail);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(String providerEmail) {
        log.info("Fetching all products for provider: {}", providerEmail);
        try {
            return productRepository.findByProviderEmailOrderByCreatedAtDesc(providerEmail).stream()
                    .map(p -> productMapper.toResponse(p, false))
                    .toList();
        } catch (Exception ex) {
            log.error("Error fetching products list for provider {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot retrieve products list");
        } finally {
            log.debug("Completed getMyProducts (list) for: {}", providerEmail);
        }
    }

    @Override
    @Transactional
    public ProductResponse createProduct(String providerEmail, ProductRequest request) {
        log.info("Creating new product for provider: {}, productName: {}", providerEmail, request.getName());
        try {
            User provider = userRepository.findByEmailAndStatus(providerEmail, UserStatus.ACTIVE)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Provider not found"));
            
            // Kiểm tra quy tắc hạn sử dụng theo từng loại sản phẩm
            validateShelfLife(request);

            // Chuyển đổi DTO sang Entity qua ProductMapper
            Product product = productMapper.toEntity(request, provider);
            Product saved = productRepository.save(product);

            log.info("Provider {} successfully created product ID: {}", providerEmail, saved.getId());
            return productMapper.toResponse(saved, false);
        } catch (ResponseStatusException rse) {
            log.warn("Validation failed when creating product for {}: {}", providerEmail, rse.getReason());
            throw rse;
        } catch (Exception ex) {
            log.error("Unexpected error creating product for {}: {}", providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot create product");
        } finally {
            log.debug("Finished createProduct process for: {}", providerEmail);
        }
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(String providerEmail, UUID productId, ProductRequest request) {
        log.info("Updating product {} for provider: {}", productId, providerEmail);
        try {
            Product product = findOwnedProduct(providerEmail, productId);

            // Quy tắc: Đổi loại sản phẩm sẽ làm sai thuộc tính của các biến thể đã có (weightGram / boxCapacity)
            if (product.getProductType() != request.getProductType() && product.getVariants() != null && !product.getVariants().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot change product type after variants exist");
            }
            validateShelfLife(request);

            // Cập nhật thuộc tính qua ProductMapper
            productMapper.updateEntity(product, request);

            log.info("Product {} updated successfully by provider: {}", productId, providerEmail);
            return productMapper.toResponse(product, false);
        } catch (ResponseStatusException rse) {
            log.warn("Validation error updating product {} for {}: {}", productId, providerEmail, rse.getReason());
            throw rse;
        } catch (Exception ex) {
            log.error("Unexpected error updating product {} for {}: {}", productId, providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot update product");
        } finally {
            log.debug("Finished updateProduct for: {}", productId);
        }
    }

    @Override
    @Transactional
    public ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request) {
        log.info("Adding variant to product {} for provider: {}, sku: {}", productId, providerEmail, request.getSku());
        try {
            Product product = findOwnedProduct(providerEmail, productId);
            validateVariantForType(product.getProductType(), request);
            String sku = normalizeSku(request.getSku());

            if (variantRepository.existsBySku(sku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
            }

            ProductVariant variant = ProductVariant.builder().product(product).build();
            productMapper.updateVariantEntity(variant, request, sku);
            if (variant.getStatus() == null) {
                variant.setStatus(fpt.sba.trungthu.entity.enumeration.ProductStatus.ACTIVE);
            }

            ProductVariant saved = variantRepository.save(variant);
            log.info("Variant created successfully with ID: {}, SKU: {}", saved.getId(), sku);
            return productMapper.toVariantResponse(saved);
        } catch (ResponseStatusException rse) {
            log.warn("Validation failure adding variant to product {} for {}: {}", productId, providerEmail, rse.getReason());
            throw rse;
        } catch (Exception ex) {
            log.error("Unexpected error adding variant to product {} for {}: {}", productId, providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot add variant");
        } finally {
            log.debug("Finished addVariant for product: {}", productId);
        }
    }

    @Override
    @Transactional
    public ProductVariantResponse updateVariant(String providerEmail, UUID productId, UUID variantId,
                                                ProductVariantRequest request) {
        log.info("Updating variant {} of product {} for provider: {}", variantId, productId, providerEmail);
        try {
            Product product = findOwnedProduct(providerEmail, productId);
            ProductVariant variant = variantRepository.findByIdAndProductId(variantId, product.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));

            validateVariantForType(product.getProductType(), request);
            String sku = normalizeSku(request.getSku());

            if (!sku.equals(variant.getSku()) && variantRepository.existsBySku(sku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
            }

            productMapper.updateVariantEntity(variant, request, sku);
            log.info("Variant {} updated successfully for provider: {}", variantId, providerEmail);
            return productMapper.toVariantResponse(variant);
        } catch (ResponseStatusException rse) {
            log.warn("Validation error updating variant {} for {}: {}", variantId, providerEmail, rse.getReason());
            throw rse;
        } catch (Exception ex) {
            log.error("Unexpected error updating variant {} for {}: {}", variantId, providerEmail, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot update variant");
        } finally {
            log.debug("Finished updateVariant for: {}", variantId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(ProductType type, Pageable pageable) {
        log.info("Fetching public catalog products [type: {}, page: {}, size: {}]", 
                type, pageable.getPageNumber(), pageable.getPageSize());
        try {
            Page<Product> productPage = productRepository.findPublic(type, pageable);
            return PageResponse.from(productPage, p -> productMapper.toResponse(p, true));
        } catch (Exception ex) {
            log.error("Error fetching public catalog: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot fetch product catalog");
        } finally {
            log.debug("Finished getProducts (paginated)");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getPublicProducts(ProductType type) {
        log.info("Fetching public catalog list [type: {}]", type);
        try {
            return productRepository.findPublic(type).stream()
                    .map(p -> productMapper.toResponse(p, true))
                    .toList();
        } catch (Exception ex) {
            log.error("Error fetching public catalog list: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot fetch product catalog list");
        } finally {
            log.debug("Finished getPublicProducts (list)");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductDetail(UUID productId) {
        log.info("Fetching product detail for public viewing: {}", productId);
        try {
            return productRepository.findPublicById(productId)
                    .map(p -> productMapper.toResponse(p, true))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.error("Error fetching product detail {}: {}", productId, ex.getMessage(), ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot fetch product detail");
        } finally {
            log.debug("Finished getProductDetail: {}", productId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getPublicProduct(UUID productId) {
        return getProductDetail(productId);
    }

    // Trả 404 cả khi sản phẩm thuộc shop khác để không lộ IDOR của shop khác
    private Product findOwnedProduct(String providerEmail, UUID productId) {
        return productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void validateShelfLife(ProductRequest request) {
        // // LOOSE_CAKE: Bánh lẻ tươi - bắt buộc phải khai báo hạn sử dụng (7 - 15 ngày)
        boolean isCake = request.getProductType() == ProductType.LOOSE_CAKE;
        if (isCake && request.getShelfLifeDays() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shelf life days is required for LOOSE_CAKE");
        }
        // // BOX_SHELL / GREETING_CARD / ADDON_SERVICE: Không áp dụng hạn sử dụng bánh tươi
        if (!isCake && request.getShelfLifeDays() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Shelf life days only applies to LOOSE_CAKE");
        }
    }

    private void validateVariantForType(ProductType type, ProductVariantRequest request) {
        // // LOOSE_CAKE: Bánh lẻ - yêu cầu bắt buộc có trọng lượng gram (weightGram)
        boolean isCake = type == ProductType.LOOSE_CAKE;
        if (isCake != (request.getWeightGram() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    isCake ? "Weight (gram) is required for LOOSE_CAKE variant"
                            : "Weight (gram) only applies to LOOSE_CAKE variant");
        }

        // // BOX_SHELL: Vỏ hộp đựng quà - yêu cầu dung tích hộp (boxCapacity)
        boolean isBox = type == ProductType.BOX_SHELL;
        if (isBox != (request.getBoxCapacity() != null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    isBox ? "Box capacity is required for BOX_SHELL variant"
                            : "Box capacity only applies to BOX_SHELL variant");
        }

        // // Động hóa dung tích hộp: Không hardcode Set {2, 4, 6}, chấp nhận mọi dung tích số nguyên dương (boxCapacity > 0)
        if (isBox && request.getBoxCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Box capacity must be greater than 0");
        }
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase();
    }
}
