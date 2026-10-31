package fpt.sba.trungthu.dto.response;

import fpt.sba.trungthu.dto.ProductView;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductImage;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private UUID id;
    private UUID providerId;
    private String storeName;
    private String name;
    private String description;
    private String story;
    private String ingredients;
    private ProductType productType;
    private fpt.sba.trungthu.entity.enumeration.ProductStatus status;
    private LocalDateTime createdAt;
    private String primaryImageUrl;
    private List<ProductImageResponse> images;
    private List<ProductVariantResponse> variants;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private Boolean discountAccepted;
    private Integer assembledQuantity;
    private BigDecimal listPrice;
    private BigDecimal salePrice;
    private List<GiftSetComponentResponse> components;

    public static ProductResponse fromEntity(Product product, ProductView view) {
        boolean includeStock = view == ProductView.PROVIDER;
        List<ProductVariantResponse> variantResponses = product.getVariants() == null ? List.of()
                : product.getVariants().stream()
                        .filter(variant -> includeVariant(view, variant.getStatus()))
                        .map(variant -> ProductVariantResponse.fromEntity(variant, includeStock))
                        .toList();
        List<ProductImageResponse> imageResponses = sortedImages(product);
        String primary = imageResponses.stream()
                .filter(image -> Boolean.TRUE.equals(image.getIsPrimary()))
                .map(ProductImageResponse::getImageUrl)
                .findFirst()
                .orElse(null);
        return ProductResponse.builder()
                .id(product.getId())
                .providerId(product.getProvider().getId())
                .storeName(product.getProvider().getStoreName())
                .name(product.getName())
                .description(product.getDescription())
                .story(product.getStory())
                .ingredients(product.getIngredients())
                .productType(product.getProductType())
                .status(product.getStatus())
                .createdAt(product.getCreatedAt())
                .primaryImageUrl(primary)
                .images(imageResponses)
                .variants(variantResponses)
                .discountPercent(discountPercent(product))
                .discountAmount(listPrice(product).subtract(salePrice(product)))
                .discountAccepted(product.getSalePrice() != null)
                .assembledQuantity(assembled(product))
                .listPrice(listPrice(product))
                .salePrice(salePrice(product))
                .components(product.getSetComponents() == null ? List.of()
                        : product.getSetComponents().stream().map(GiftSetComponentResponse::fromEntity).toList())
                .build();
    }

    private static int assembled(Product product) {
        if (product.getSetComponents() == null) {
            return 0;
        }
        return product.getSetComponents().stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .mapToInt(row -> row.getQuantity())
                .sum();
    }

    private static BigDecimal listPrice(Product product) {
        if (product.getSetComponents() == null || product.getSetComponents().isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (var row : product.getSetComponents()) {
            int perSet = row.getPerSetQuantity() == null ? 0 : row.getPerSetQuantity();
            if (perSet <= 0) {
                return BigDecimal.ZERO;
            }
            total = total.add(row.getComponentVariant().getPrice().multiply(BigDecimal.valueOf(perSet)));
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal salePrice(Product product) {
        BigDecimal list = listPrice(product);
        if (product.getSalePrice() == null || list.signum() <= 0 || product.getSalePrice().compareTo(list) >= 0) {
            return list;
        }
        return product.getSalePrice().setScale(2, RoundingMode.HALF_UP);
    }

    private static BigDecimal discountPercent(Product product) {
        BigDecimal list = listPrice(product);
        if (list.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        return list.subtract(salePrice(product)).multiply(BigDecimal.valueOf(100))
                .divide(list, 2, RoundingMode.HALF_UP);
    }

    private static boolean includeVariant(ProductView view, VariantStatus status) {
        if (view != ProductView.PUBLIC_LIST) {
            return true;
        }
        return status == VariantStatus.IN_STOCK || status == VariantStatus.OUT_OF_STOCK;
    }

    /** Đường dẫn ảnh lưu dạng data URL (base64) trong DB; ProductController phục vụ file ở đây */
    public static final String IMAGE_PATH = "/api/products/images/";

    // Ảnh base64 ~500KB/ảnh: trả nguyên data URL làm 1 trang danh mục nặng ~9MB -> trả link ngắn, trình duyệt tự cache
    private static String publicImageUrl(ProductImage image) {
        String url = image.getImageUrl();
        return url != null && url.startsWith("data:") && image.getId() != null ? IMAGE_PATH + image.getId() : url;
    }

    private static List<ProductImageResponse> sortedImages(Product product) {
        if (product.getImages() == null) {
            return List.of();
        }
        return product.getImages().stream()
                .sorted(Comparator
                        .comparing((ProductImage image) -> !Boolean.TRUE.equals(image.getIsPrimary()))
                        .thenComparing(image -> image.getDisplayOrder() == null ? 0 : image.getDisplayOrder()))
                .map(image -> ProductImageResponse.builder()
                        .id(image.getId())
                        .imageUrl(publicImageUrl(image))
                        .isPrimary(image.getIsPrimary())
                        .displayOrder(image.getDisplayOrder())
                        .build())
                .toList();
    }
}
