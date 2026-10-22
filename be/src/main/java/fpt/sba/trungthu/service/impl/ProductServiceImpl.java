package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.mapper.ProductMapper;
import fpt.sba.trungthu.dto.ProductView;
import fpt.sba.trungthu.dto.request.ProductImageRequest;
import fpt.sba.trungthu.dto.request.ProductImagesRequest;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductImage;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.ProviderPolicyService;
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
    private final InventoryService inventoryService;
    private final ProductSaleStatusService saleStatus;
    private final fpt.sba.trungthu.repository.OrderItemRepository orderItemRepository;
    private final fpt.sba.trungthu.repository.CartItemRepository cartItemRepository;
    private final fpt.sba.trungthu.repository.InventoryAuditRepository inventoryAuditRepository;
    private final GiftSetService giftSetService;
    private final ProviderPolicyService providerPolicyService;

    private List<ProductResponse> markOrderedVariants(List<ProductResponse> products) {
        List<UUID> ids = products.stream()
                .flatMap(product -> product.getVariants().stream())
                .map(ProductVariantResponse::getId)
                .toList();
        if (ids.isEmpty()) {
            return products;
        }
        java.util.Set<UUID> ordered = new java.util.HashSet<>(orderItemRepository.findVariantIdsWithOrders(ids));
        products.forEach(product -> product.getVariants()
                .forEach(variant -> variant.setHasOrders(ordered.contains(variant.getId()))));
        return products;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getMyProducts(String providerEmail, Pageable pageable) {
        log.info("Fetching paginated products for provider: {} [page: {}, size: {}]",
                providerEmail, pageable.getPageNumber(), pageable.getPageSize());
        try {
            Page<Product> productPage = productRepository.findByProviderEmail(providerEmail,
                    pageable);
            PageResponse<ProductResponse> response = PageResponse.from(productPage,
                    p -> productMapper.toResponse(p, ProductView.PROVIDER));
            markOrderedVariants(response.getContent());
            return response;
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
            return markOrderedVariants(productRepository.findByProviderEmailOrderByCreatedAtDesc(providerEmail).stream()
                    .map(p -> productMapper.toResponse(p, ProductView.PROVIDER))
                    .toList());
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
            if (!providerPolicyService.canAddMoreProducts(providerEmail)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Provider cannot add more products");
            }
            if (request.getStatus() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New products start as DRAFT");
            }

            Product product = productMapper.toEntity(request, provider);
            Product saved = productRepository.save(product);

            log.info("Provider {} successfully created product ID: {}", providerEmail, saved.getId());
            return productMapper.toResponse(saved, ProductView.PROVIDER);
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

            // Quy tắc: Đổi loại sản phẩm sẽ làm sai thuộc tính của các biến thể đã có
            // (weightGram / boxCapacity)
            if (product.getProductType() != request.getProductType() && product.getVariants() != null
                    && !product.getVariants().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Cannot change product type after variants exist");
            }

            // Cập nhật thuộc tính qua ProductMapper
            productMapper.updateEntity(product, request);
            if (product.getProductType() == ProductType.GIFT_SET && request.getSalePrice() != null) {
                java.math.BigDecimal list = giftSetService.listPrice(product);
                if (list.signum() <= 0 || request.getSalePrice().compareTo(list) >= 0) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Giá chiết khấu phải nhỏ hơn giá gốc");
                }
            }
            if (request.getStatus() != null) {
                ProductStatus target = productMapper.parseStatus(request.getStatus());
                if (target == ProductStatus.SOLD_OUT) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Hết hàng được gắn khi mọi phân loại hết tồn");
                }
                if (target == ProductStatus.ACTIVE && product.getStatus() == ProductStatus.SOLD_OUT) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Nhập kho để bán lại");
                }
                if (target == ProductStatus.ARCHIVED) {
                    assertOrdersClosed(product);
                }
                if (target == ProductStatus.ACTIVE) {
                    var policy = providerPolicyService.canPublishProducts(providerEmail);
                    if (!Boolean.TRUE.equals(policy.getCanPublishProducts())) {
                        throw new ResponseStatusException(HttpStatus.CONFLICT,
                                policy.getReason() == null ? "Provider cannot publish products" : policy.getReason());
                    }
                }
                product.getStatus().validateTransition(target);
                if (target == ProductStatus.ACTIVE
                        && (product.getImages() == null || product.getImages().isEmpty())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cần có ảnh trước khi đăng bán");
                }
                if (target == ProductStatus.ACTIVE && product.getProductType() == ProductType.GIFT_SET) {
                    boolean hasBox = product.getSetComponents() != null && product.getSetComponents().stream()
                            .anyMatch(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL
                                    && row.getQuantity() > 0);
                    if (!hasBox) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Cần nhập ít nhất một set trước khi đăng bán");
                    }
                } else if (target == ProductStatus.ACTIVE
                        && (product.getVariants() == null || product.getVariants().isEmpty())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "A product needs at least one variant before it can be active");
                }
                product.setStatus(target);
                if (target == ProductStatus.ACTIVE) {
                    saleStatus.refresh(product.getId());
                }
            }

            log.info("Product {} updated successfully by provider: {}", productId, providerEmail);
            return productMapper.toResponse(product, ProductView.PROVIDER);
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
    public ProductResponse archive(String providerEmail, UUID productId) {
        Product product = findOwnedProduct(providerEmail, productId);
        assertOrdersClosed(product);
        product.getStatus().validateTransition(ProductStatus.ARCHIVED);
        product.setStatus(ProductStatus.ARCHIVED);
        return productMapper.toResponse(product, ProductView.PROVIDER);
    }

    private void assertOrdersClosed(Product product) {
        if (product.getStatus() == ProductStatus.DRAFT) {
            return;
        }
        long open = product.getProductType() == ProductType.GIFT_SET
                ? orderItemRepository.countOpenSetOrders(product.getId(),
                        java.util.EnumSet.of(fpt.sba.trungthu.entity.enumeration.OrderStatus.CANCELLED,
                                fpt.sba.trungthu.entity.enumeration.OrderStatus.COMPLETED))
                : orderItemRepository.countOpenOrders(product.getId(),
                        java.util.EnumSet.of(fpt.sba.trungthu.entity.enumeration.OrderStatus.CANCELLED,
                                fpt.sba.trungthu.entity.enumeration.OrderStatus.COMPLETED));
        if (open > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chỉ xóa mềm khi mọi đơn đã hủy hoặc hoàn tất");
        }
    }

    @Override
    @Transactional
    public ProductVariantResponse addVariant(String providerEmail, UUID productId, ProductVariantRequest request) {
        log.info("Adding variant to product {} for provider: {}, sku: {}", productId, providerEmail, request.getSku());
        try {
            Product product = findOwnedProduct(providerEmail, productId);
            if (product.getProductType() == ProductType.GIFT_SET) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A gift set has no variants");
            }
            if (product.getStatus() == ProductStatus.ARCHIVED) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ, không thêm phân loại");
            }
            validateVariantForType(product.getProductType(), request);
            String sku = normalizeSku(request.getSku());

            if (variantRepository.existsBySku(sku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
            }

            if (request.getStockQuantity() == null || request.getStockQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tồn mở đầu phải lớn hơn 0");
            }
            if (request.getStatus() != null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Variant status is set from opening stock, not from the request");
            }
            ProductVariant variant = ProductVariant.builder().product(product).stockQuantity(0)
                    .status(VariantStatus.OUT_OF_STOCK).build();
            productMapper.updateVariantEntity(variant, request, sku);
            ProductVariant saved = variantRepository.saveAndFlush(variant);
            inventoryService.recordOpeningStock(saved, request.getStockQuantity());
            log.info("Variant created successfully with ID: {}, SKU: {}", saved.getId(), sku);
            return productMapper.toVariantResponse(saved, true);
        } catch (ResponseStatusException rse) {
            log.warn("Validation failure adding variant to product {} for {}: {}", productId, providerEmail,
                    rse.getReason());
            throw rse;
        } catch (Exception ex) {
            log.error("Unexpected error adding variant to product {} for {}: {}", productId, providerEmail,
                    ex.getMessage(), ex);
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

            if (request.getStatus() != null || (request.getStockQuantity() != null
                    && product.getStatus() != ProductStatus.DRAFT)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Stock and status change only through import or adjustment");
            }
            validateVariantForType(product.getProductType(), request);
            String sku = normalizeSku(request.getSku());

            boolean lockedFieldsChanged = !sku.equals(variant.getSku())
                    || !java.util.Objects.equals(request.getWeightGram(), variant.getWeightGram())
                    || !java.util.Objects.equals(request.getBoxCapacity(), variant.getBoxCapacity());
            if (lockedFieldsChanged && orderItemRepository.existsByVariantId(variant.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Phân loại đã có đơn hàng nên không đổi SKU, khối lượng hoặc số bánh trong hộp");
            }

            if (!sku.equals(variant.getSku()) && variantRepository.existsBySku(sku)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "SKU already exists: " + sku);
            }

            productMapper.updateVariantEntity(variant, request, sku);
            if (product.getStatus() == ProductStatus.DRAFT && request.getStockQuantity() != null) {
                inventoryService.replaceOpeningStock(variant, request.getStockQuantity());
            }
            log.info("Variant {} updated successfully for provider: {}", variantId, providerEmail);
            ProductVariantResponse response = productMapper.toVariantResponse(variant, true);
            response.setHasOrders(orderItemRepository.existsByVariantId(variant.getId()));
            return response;
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
            return PageResponse.from(productPage, p -> productMapper.toResponse(p, ProductView.PUBLIC_LIST));
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
                    .map(p -> productMapper.toResponse(p, ProductView.PUBLIC_LIST))
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
                    .map(p -> productMapper.toResponse(p, ProductView.PUBLIC_DETAIL))
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

    @Override
    @Transactional
    public void deleteVariant(String providerEmail, UUID productId, UUID variantId) {
        Product product = findOwnedProduct(providerEmail, productId);
        ProductVariant variant = variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (orderItemRepository.existsByVariantId(variant.getId())
                || orderItemRepository.existsBySourceSetId(variant.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phân loại đã có đơn hàng nên không xóa được, hãy nghỉ bán");
        }
        giftSetService.releasePacked(variant);
        cartItemRepository.deleteByVariantId(variant.getId());
        inventoryAuditRepository.deleteByVariantId(variant.getId());
        product.getVariants().remove(variant);
        variantRepository.delete(variant);
        variantRepository.flush();
        saleStatus.refresh(product.getId());
    }

    @Override
    @Transactional
    public ProductResponse replaceImages(String providerEmail, UUID productId, ProductImagesRequest request) {
        Product product = findOwnedProduct(providerEmail, productId);
        List<ProductImageRequest> images = request.getImages();
        long primaryCount = images.stream().filter(image -> Boolean.TRUE.equals(image.getIsPrimary())).count();
        if (!images.isEmpty() && primaryCount != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A product album must contain exactly one primary image");
        }
        product.getImages().clear();
        for (ProductImageRequest image : images) {
            product.getImages().add(ProductImage.builder()
                    .product(product)
                    .imageUrl(image.getImageUrl().trim())
                    .isPrimary(image.getIsPrimary())
                    .displayOrder(image.getDisplayOrder())
                    .build());
        }
        return productMapper.toResponse(product, ProductView.PROVIDER);
    }

    // Trả 404 cả khi sản phẩm thuộc shop khác để không lộ IDOR của shop khác
    private Product findOwnedProduct(String providerEmail, UUID productId) {
        return productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
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

        // // Động hóa dung tích hộp: Không hardcode Set {2, 4, 6}, chấp nhận mọi dung
        // tích số nguyên dương (boxCapacity > 0)
        if (isBox && request.getBoxCapacity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Box capacity must be greater than 0");
        }
    }

    private String normalizeSku(String sku) {
        return sku.trim().toUpperCase();
    }
}
