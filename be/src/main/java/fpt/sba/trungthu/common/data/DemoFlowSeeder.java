package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.common.security.CustomUserDetailService;
import fpt.sba.trungthu.dto.request.AddCartItemRequest;
import fpt.sba.trungthu.dto.request.SaveSetCompositionRequest;
import fpt.sba.trungthu.dto.request.StockSetRequest;
import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.ImportStockRequest;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.UpdateCartItemRequest;
import fpt.sba.trungthu.dto.response.DummyOrderResponse;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.service.CartService;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.DummyPaymentService;
import fpt.sba.trungthu.service.impl.GiftSetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Snapshot of the BE2 path after {@link DemoProductSeeder}: stock ledger, cart, and dummy VietQR orders.
 * Goes through the same services as the API, so the waterfall stays balanced.
 */
@Slf4j
@Component
@Order(110)
@RequiredArgsConstructor
public class DemoFlowSeeder implements CommandLineRunner {

    private static final String SELLER = "seller@kinhdo.vn";
    private static final String BUYER = "buyer@gmail.com";

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final ProductService productService;
    private final GiftSetService giftSetService;
    private final CartService cartService;
    private final DummyPaymentService dummyPaymentService;
    private final CustomUserDetailService userDetailsService;

    @Value("${app.demo-flow-seed:}")
    private String seedFlow;

    @Value("${spring.datasource.url:}")
    private String datasourceUrl;

    @Override
    public void run(String... args) {
        boolean enabled = seedFlow.isBlank() ? !datasourceUrl.contains(":h2:") : Boolean.parseBoolean(seedFlow);
        if (!enabled) {
            return;
        }
        publishDemoSetIfDraft();
        if (orderRepository.count() > 0) {
            return;
        }
        SkuRef cake150 = sku("DEMO-THAPCAM-150");
        SkuRef cake200 = sku("DEMO-THAPCAM-200");
        SkuRef greenBean = sku("DEMO-DAUXANH-180");
        SkuRef giftBox = sku("DEMO-HOP-4");
        if (cake150 == null || cake200 == null || greenBean == null || giftBox == null) {
            log.warn("Demo products are missing, skip flow seed");
            return;
        }

        as(SELLER, () -> {
            adjust(cake150, InventoryAuditType.ADJUSTMENT_BROKEN, 2, "Vỡ khi chuyển khay");
            adjust(cake150, InventoryAuditType.ADJUSTMENT_EXPIRED, 1, "Quá mốc nướng");
        });

        UUID waitingPayment = as(BUYER, () -> checkout(cake150.variantId(), 4));
        UUID paid = as(BUYER, () -> checkout(cake150.variantId(), 3));
        UUID cancelled = as(BUYER, () -> checkout(cake150.variantId(), 2));
        as(BUYER, () -> {
            dummyPaymentService.pay(paid);
            dummyPaymentService.cancel(cancelled);
        });

        as(BUYER, () -> addSelected(cake200.variantId(), 1));
        as(SELLER, () -> {
            adjust(cake200, InventoryAuditType.ADJUSTMENT_BROKEN, 2, "Nứt vỏ");
            adjust(cake200, InventoryAuditType.ADJUSTMENT_EXPIRED, 6, "Quá mốc, bỏ cả mẻ");
        });

        as(SELLER, () -> inventoryService.importStock(SELLER, greenBean.productId(), greenBean.variantId(),
                new ImportStockRequest(6, "Nhập lại đậu xanh demo")));

        as(SELLER, () -> {
            inventoryService.importStock(SELLER, cake150.productId(), cake150.variantId(),
                    new ImportStockRequest(120, "Nhập thêm cho đơn demo"));
            inventoryService.importStock(SELLER, giftBox.productId(), giftBox.variantId(),
                    new ImportStockRequest(30, "Nhập thêm hộp demo"));
            inventoryService.importStock(SELLER, greenBean.productId(), greenBean.variantId(),
                    new ImportStockRequest(23, "Nhập thêm đậu xanh demo"));
        });
        seedOrders(cake150, 20, 6, 6, 6, 8, 8);
        seedOrders(giftBox, 8, 4, 4, 4, 3, 4);
        seedOrders(greenBean, 10, 0, 0, 0, 2, 4);
        seedGiftSet(cake150, giftBox);
        as(BUYER, () -> {
            addSelected(cake150.variantId(), 2);
            addSelected(giftBox.variantId(), 1);
        });

        log.info("""
                Demo flow ready for {} / {}.
                Catalog: thập cẩm, hộp, set và thiệp trung thu đang bán. Dẻo sen là bản nháp, gà quay đã ngừng dòng.
                150 g: nhập 144 − hỏng 2 − hết dùng 1 − đã bán 45 − chờ thanh toán 16 = tồn 80 (bán lẻ 72 + trong set 8). Hủy 14 đứng riêng.
                Set đoàn viên bán 700.000 đ, thấp hơn giá gốc 760.000 đ. Một set đã thanh toán, một set chờ thanh toán, một set đã hủy.
                Đơn mẫu {}: chờ thanh toán. Đơn {}: đã thanh toán. Đơn {}: đã hủy. Tổng {} đơn, gồm cả đang nướng, đang giao và hoàn tất.
                Giỏ: 150 g x2 và hộp x1 đang chọn. 200 g hết hàng, không chọn.
                """,
                SELLER, BUYER, waitingPayment, paid, cancelled, orderRepository.count());
    }

    private void publishDemoSetIfDraft() {
        productRepository.findByProviderEmailOrderByCreatedAtDesc(SELLER).stream()
                .filter(product -> "Set đoàn viên".equals(product.getName()) && product.getStatus() == ProductStatus.DRAFT)
                .findFirst()
                .ifPresent(set -> as(SELLER, () -> {
                    productService.replaceImages(SELLER, set.getId(), DemoAlbum.of("set.jpg", "hop.jpg"));
                    productService.updateProduct(SELLER, set.getId(), ProductRequest.builder()
                            .name("Set đoàn viên")
                            .description("Một hộp 4 bánh thập cẩm 150 g. Giá bán 700.000 đ, thấp hơn giá gốc.")
                            .productType(ProductType.GIFT_SET)
                            .salePrice(new BigDecimal("700000"))
                            .status("ACTIVE")
                            .build());
                }));
    }

    private void seedGiftSet(SkuRef cake150, SkuRef giftBox) {
        var created = as(SELLER, () -> productService.createProduct(SELLER, ProductRequest.builder()
                .name("Set đoàn viên")
                .description("Một hộp 4 bánh thập cẩm 150 g. Giá bán 700.000 đ, thấp hơn giá gốc.")
                .productType(ProductType.GIFT_SET)
                .build()));
        as(SELLER, () -> {
            giftSetService.saveComposition(SELLER, created.getId(), composition(giftBox.variantId(), cake150.variantId()));
            giftSetService.stockSets(SELLER, created.getId(), stock(4));
            productService.replaceImages(SELLER, created.getId(), DemoAlbum.of("set.jpg", "hop.jpg"));
            productService.updateProduct(SELLER, created.getId(), ProductRequest.builder()
                    .name("Set đoàn viên")
                    .description("Một hộp 4 bánh thập cẩm 150 g. Giá bán 700.000 đ, thấp hơn giá gốc.")
                    .productType(ProductType.GIFT_SET)
                    .salePrice(new BigDecimal("700000"))
                    .status("ACTIVE")
                    .build());
        });
        UUID paid = as(BUYER, () -> checkoutSet(created.getId(), 1));
        as(BUYER, () -> dummyPaymentService.pay(paid));
        as(BUYER, () -> checkoutSet(created.getId(), 1));
        UUID cancelled = as(BUYER, () -> checkoutSet(created.getId(), 1));
        as(BUYER, () -> dummyPaymentService.cancel(cancelled));
    }

    private SaveSetCompositionRequest composition(UUID boxId, UUID cakeId) {
        SaveSetCompositionRequest request = new SaveSetCompositionRequest();
        request.setBox(line(boxId, 1));
        request.setCakes(List.of(line(cakeId, 4)));
        return request;
    }

    private SaveSetCompositionRequest.Line line(UUID variantId, int quantity) {
        SaveSetCompositionRequest.Line line = new SaveSetCompositionRequest.Line();
        line.setVariantId(variantId);
        line.setQuantity(quantity);
        return line;
    }

    private StockSetRequest stock(int setCount) {
        StockSetRequest request = new StockSetRequest();
        request.setSetCount(setCount);
        request.setReason("Nhập set demo");
        return request;
    }

    private UUID checkoutSet(UUID setProductId, int quantity) {
        AddCartItemRequest add = new AddCartItemRequest();
        add.setSetProductId(setProductId);
        add.setQuantity(quantity);
        cartService.add(BUYER, add);
        UpdateCartItemRequest selected = new UpdateCartItemRequest();
        selected.setSelected(true);
        cartService.update(BUYER, setProductId, selected);
        List<DummyOrderResponse> created = dummyPaymentService.checkout();
        if (created.size() != 1) {
            throw new IllegalStateException("Demo checkout expected one order");
        }
        return created.get(0).id();
    }

    private void seedOrders(SkuRef variant, int completed, int delivering, int baking, int deposited, int pending,
            int cancelled) {
        place(variant, completed, 3);
        place(variant, delivering, 2);
        place(variant, baking, 1);
        place(variant, deposited, 0);
        for (int index = 0; index < pending; index++) {
            as(BUYER, () -> checkout(variant.variantId(), 1));
        }
        for (int index = 0; index < cancelled; index++) {
            UUID orderId = as(BUYER, () -> checkout(variant.variantId(), 1));
            as(BUYER, () -> dummyPaymentService.cancel(orderId));
        }
    }

    private void place(SkuRef variant, int count, int advances) {
        for (int index = 0; index < count; index++) {
            UUID orderId = as(BUYER, () -> checkout(variant.variantId(), 1));
            as(BUYER, () -> dummyPaymentService.pay(orderId));
            if (advances > 0) {
                as(SELLER, () -> {
                    for (int step = 0; step < advances; step++) {
                        dummyPaymentService.advance(orderId);
                    }
                });
            }
        }
    }

    private SkuRef sku(String code) {
        for (Product product : productRepository.findByProviderEmailOrderByCreatedAtDesc(SELLER)) {
            for (ProductVariant variant : product.getVariants()) {
                if (code.equals(variant.getSku())) {
                    return new SkuRef(product.getId(), variant.getId());
                }
            }
        }
        return null;
    }

    private void adjust(SkuRef variant, InventoryAuditType type, int quantity, String reason) {
        inventoryService.adjust(SELLER, variant.productId(), variant.variantId(),
                new AdjustStockRequest(type, quantity, reason));
    }

    private record SkuRef(UUID productId, UUID variantId) {
    }

    private UUID checkout(UUID variantId, int quantity) {
        addSelected(variantId, quantity);
        List<DummyOrderResponse> created = dummyPaymentService.checkout();
        if (created.size() != 1) {
            throw new IllegalStateException("Demo checkout expected one order");
        }
        return created.get(0).id();
    }

    private void addSelected(UUID variantId, int quantity) {
        AddCartItemRequest add = new AddCartItemRequest();
        add.setVariantId(variantId);
        add.setQuantity(quantity);
        cartService.add(BUYER, add);
        UpdateCartItemRequest selected = new UpdateCartItemRequest();
        selected.setSelected(true);
        cartService.update(BUYER, variantId, selected);
    }

    private <T> T as(String email, java.util.function.Supplier<T> action) {
        UserDetails user = userDetailsService.loadUserByUsername(email);
        var previous = SecurityContextHolder.getContext().getAuthentication();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));
        try {
            return action.get();
        } finally {
            if (previous == null) {
                SecurityContextHolder.clearContext();
            } else {
                SecurityContextHolder.getContext().setAuthentication(previous);
            }
        }
    }

    private void as(String email, Runnable action) {
        as(email, () -> {
            action.run();
            return null;
        });
    }
}
