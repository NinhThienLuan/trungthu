package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.common.security.CustomUserDetailService;
import fpt.sba.trungthu.dto.request.AddCartItemRequest;
import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.request.SaveSetCompositionRequest;
import fpt.sba.trungthu.dto.request.StockSetRequest;
import fpt.sba.trungthu.dto.request.UpdateCartItemRequest;
import fpt.sba.trungthu.dto.response.DummyOrderResponse;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.service.CartService;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.DummyPaymentService;
import fpt.sba.trungthu.service.impl.GiftSetService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.demo-seed", havingValue = "true", matchIfMissing = true)
@Order(100)
@RequiredArgsConstructor
public class DemoProductSeeder implements CommandLineRunner {

    private static final String SELLER = "seller@kinhdo.vn";
    private static final String BUYER = "buyer@gmail.com";

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final GiftSetService giftSetService;
    private final CartService cartService;
    private final DummyPaymentService dummyPaymentService;
    private final CustomUserDetailService userDetailsService;

    @Override
    public void run(String... args) {
        if (productRepository.findByProviderEmail(SELLER, PageRequest.of(0, 1)).hasContent()) {
            log.info("Skip demo catalog, {} already has products", SELLER);
            return;
        }
        seedLooseCake();
        seedGiftBox();
        seedDraft();
        seedArchived();
        seedSoldOut();
        seedGreetingCard();
        log.info("Seeded demo mooncakes and greeting cards for {}", SELLER);
        seedOtherShops();
    }

    private void seedOtherShops() {
        seedShop("seller@dongkhanh.vn",
                "Bánh nướng sen nhụy", "Nhân sen nhụy, vỏ nướng mỏng.", "DK-SEN-150-1T", 98000, 20,
                new String[] { "dk-sen.jpg", "dk-sen-2.jpg" },
                "Bánh nướng hạt dưa", "Nhân hạt dưa rang, vị ngọt vừa.", "DK-HATDUA-200-2T", 88000, 12,
                new String[] { "dk-hatdua.jpg", "dk-hatdua-2.jpg" },
                "Hộp Đồng Khánh", "Hộp 4 bánh, nắp gấm đỏ.", "DK-HOP-4", 380000,
                new String[] { "dk-hop.jpg", "dk-hop-mo.jpg" },
                "Set sen nhụy", "Một hộp 4 bánh sen nhụy. Giá bán thấp hơn giá gốc.", "690000", 3,
                new String[] { "dk-set.jpg", "dk-set-2.jpg" });
        seedShop("seller@givral.vn",
                "Bánh dẻo trứng muối", "Vỏ dẻo, nhân đậu xanh trứng muối.", "GV-DEO-180-1T", 105000, 16,
                new String[] { "gv-deo.jpg", "gv-deo-2.jpg" },
                "Bánh nướng thập cẩm Givral", "Nhân thập cẩm, lò Givral.", "GV-THAPCAM-150-2T", 92000, 18,
                new String[] { "gv-thapcam.jpg", "gv-thapcam-2.jpg" },
                "Hộp Givral", "Hộp 4 bánh, dùng để biếu.", "GV-HOP-4", 450000,
                new String[] { "gv-hop.jpg", "gv-hop-mo.jpg" },
                "Set dẻo trứng muối", "Một hộp 4 bánh dẻo trứng muối. Giá bán thấp hơn giá gốc.", "790000", 2,
                new String[] { "gv-set.jpg", "gv-set-2.jpg" });
        seedCakes("seller@anphu.vn",
                "Bánh nướng sen An Phú", "Nhân sen, vỏ nướng.", "AP-SEN-150", 86000,
                new String[] { "ap-sen.jpg", "ap-sen-2.jpg" },
                "Bánh dẻo đậu xanh An Phú", "Vỏ dẻo, nhân đậu xanh.", "AP-DEO-DX-150", 92000,
                new String[] { "ap-deo-dx.jpg", "ap-deo-dx-2.jpg" });
        seedCakes("seller@minhnguyet.vn",
                "Bánh nướng hạt dưa Minh Nguyệt", "Nhân hạt dưa rang.", "MN-HATDUA-150", 88000,
                new String[] { "mn-hatdua.jpg", "mn-hatdua-2.jpg" },
                "Bánh dẻo trứng muối Minh Nguyệt", "Vỏ dẻo, nhân trứng muối.", "MN-DEO-TM-150", 99000,
                new String[] { "mn-deo-tm.jpg", "mn-deo-tm-2.jpg" });
    }

    private void seedCakes(String email,
            String firstName, String firstDescription, String firstSku, int firstPrice, String[] firstImages,
            String secondName, String secondDescription, String secondSku, int secondPrice, String[] secondImages) {
        UUID firstVariant = seedCake(email, firstName, firstDescription, firstSku, firstPrice, firstImages);
        UUID secondVariant = seedCake(email, secondName, secondDescription, secondSku, secondPrice, secondImages);
        seedCakeOrders(email, firstVariant);
        seedCakeOrders(email, secondVariant);
        log.info("Seeded shop catalog for {}", email);
    }

    private UUID seedCake(String email, String name, String description, String sku, int price, String[] images) {
        var product = productService.createProduct(email, ProductRequest.builder()
                .name(name)
                .description(description)
                .productType(ProductType.LOOSE_CAKE)
                .build());
        var created = productService.addVariant(email, product.getId(), variant("1 trứng", sku, price, 30, 150, null));
        productService.replaceImages(email, product.getId(), DemoAlbum.of(images));
        publish(email, product.getId(), name, description, ProductType.LOOSE_CAKE, null);
        return created.getId();
    }

    /** Tồn còn lại sau khi đóng set vẫn đủ: mỗi bánh giữ 7 đơn, hủy 1 đơn. */
    private void seedCakeOrders(String seller, UUID variantId) {
        place(seller, variantId, false, 2, 3);
        place(seller, variantId, false, 1, 2);
        place(seller, variantId, false, 1, 1);
        place(seller, variantId, false, 1, 0);
        repeat(2, () -> checkout(variantId, false));
        repeat(1, () -> {
            UUID orderId = checkout(variantId, false);
            as(BUYER, () -> dummyPaymentService.cancel(orderId));
        });
    }

    private void seedSetOrders(String seller, UUID setId, int setCount) {
        place(seller, setId, true, 1, 3);
        if (setCount >= 3) {
            place(seller, setId, true, 1, 2);
        }
        int pending = setCount - 1 - (setCount >= 3 ? 1 : 0);
        repeat(pending, () -> checkout(setId, true));
    }

    private void place(String seller, UUID targetId, boolean set, int count, int advances) {
        repeat(count, () -> {
            UUID orderId = checkout(targetId, set);
            as(BUYER, () -> dummyPaymentService.pay(orderId));
            if (advances > 0) {
                as(seller, () -> {
                    for (int step = 0; step < advances; step++) {
                        dummyPaymentService.advance(orderId);
                    }
                });
            }
        });
    }

    private void repeat(int count, Runnable action) {
        for (int index = 0; index < count; index++) {
            action.run();
        }
    }

    private UUID checkout(UUID targetId, boolean set) {
        return as(BUYER, () -> {
            AddCartItemRequest add = new AddCartItemRequest();
            add.setQuantity(1);
            if (set) {
                add.setSetProductId(targetId);
            } else {
                add.setVariantId(targetId);
            }
            cartService.add(BUYER, add);
            UpdateCartItemRequest selected = new UpdateCartItemRequest();
            selected.setSelected(true);
            cartService.update(BUYER, targetId, selected);
            List<DummyOrderResponse> created = dummyPaymentService.checkout();
            if (created.size() != 1) {
                throw new IllegalStateException("Demo checkout expected one order");
            }
            return created.get(0).id();
        });
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

    private void seedShop(String email,
            String cakeName, String cakeDescription, String cakeSku, int cakePrice, int cakeStock, String[] cakeImages,
            String extraName, String extraDescription, String extraSku, int extraPrice, int extraStock, String[] extraImages,
            String boxName, String boxDescription, String boxSku, int boxPrice, String[] boxImages,
            String setName, String setDescription, String salePrice, int setCount, String[] setImages) {
        var cake = productService.createProduct(email, ProductRequest.builder()
                .name(cakeName)
                .description(cakeDescription)
                .productType(ProductType.LOOSE_CAKE)
                .build());
        var cakeVariant = productService.addVariant(email, cake.getId(),
                variant("1 trứng", cakeSku, cakePrice, cakeStock, 150, null));
        productService.replaceImages(email, cake.getId(), DemoAlbum.of(cakeImages));
        publish(email, cake.getId(), cakeName, cakeDescription, ProductType.LOOSE_CAKE, null);

        var extra = productService.createProduct(email, ProductRequest.builder()
                .name(extraName)
                .description(extraDescription)
                .productType(ProductType.LOOSE_CAKE)
                .build());
        var extraVariant = productService.addVariant(email, extra.getId(),
                variant("2 trứng", extraSku, extraPrice, extraStock, 200, null));
        productService.replaceImages(email, extra.getId(), DemoAlbum.of(extraImages));
        publish(email, extra.getId(), extraName, extraDescription, ProductType.LOOSE_CAKE, null);

        var box = productService.createProduct(email, ProductRequest.builder()
                .name(boxName)
                .description(boxDescription)
                .productType(ProductType.BOX_SHELL)
                .build());
        var boxVariant = productService.addVariant(email, box.getId(),
                variant("Hộp 4 bánh", boxSku, boxPrice, 8, null, 4));
        productService.replaceImages(email, box.getId(), DemoAlbum.of(boxImages));
        publish(email, box.getId(), boxName, boxDescription, ProductType.BOX_SHELL, null);

        var set = productService.createProduct(email, ProductRequest.builder()
                .name(setName)
                .description(setDescription)
                .productType(ProductType.GIFT_SET)
                .build());
        SaveSetCompositionRequest composition = new SaveSetCompositionRequest();
        composition.setBox(recipeLine(boxVariant.getId(), 1));
        composition.setCakes(List.of(recipeLine(cakeVariant.getId(), 4)));
        giftSetService.saveComposition(email, set.getId(), composition);
        StockSetRequest stock = new StockSetRequest();
        stock.setSetCount(setCount);
        giftSetService.stockSets(email, set.getId(), stock);
        productService.replaceImages(email, set.getId(), DemoAlbum.of(setImages));
        publish(email, set.getId(), setName, setDescription, ProductType.GIFT_SET, new BigDecimal(salePrice));
        seedCakeOrders(email, cakeVariant.getId());
        seedCakeOrders(email, extraVariant.getId());
        seedSetOrders(email, set.getId(), setCount);
        log.info("Seeded shop catalog for {}", email);
    }

    private SaveSetCompositionRequest.Line recipeLine(UUID variantId, int quantity) {
        SaveSetCompositionRequest.Line line = new SaveSetCompositionRequest.Line();
        line.setVariantId(variantId);
        line.setQuantity(quantity);
        return line;
    }

    private void seedLooseCake() {
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Bánh nướng thập cẩm")
                .description("Nhân thập cẩm, trứng muối, vỏ nướng vàng.")
                .productType(ProductType.LOOSE_CAKE)
                .build());
        productService.addVariant(SELLER, product.getId(), variant("1 trứng", "DEMO-THAPCAM-150-1T", 85000, 24, 150, null));
        productService.addVariant(SELLER, product.getId(), variant("2 trứng", "DEMO-THAPCAM-200-2T", 110000, 8, 200, null));
        productService.addVariant(SELLER, product.getId(), variant("Đậu xanh 1 trứng", "DEMO-DAUXANH-180", 95000, 1, 180, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("thap-cam.jpg"));
        publish(product.getId(), "Bánh nướng thập cẩm", "Nhân thập cẩm, trứng muối, vỏ nướng vàng.",
                ProductType.LOOSE_CAKE);
    }

    private void seedGiftBox() {
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Hộp đoàn viên")
                .description("Hộp 4 bánh nướng, dùng để biếu.")
                .productType(ProductType.BOX_SHELL)
                .build());
        productService.addVariant(SELLER, product.getId(), variant("Hộp 4 bánh", "DEMO-HOP-4", 420000, 12, null, 4));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("hop.jpg"));
        publish(product.getId(), "Hộp đoàn viên", "Hộp 4 bánh nướng, dùng để biếu.",
                ProductType.BOX_SHELL);
    }

    private void seedDraft() {
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Bánh dẻo hạt sen")
                .description("Bản nháp, chưa hiện trên cửa hàng.")
                .productType(ProductType.LOOSE_CAKE)
                .build());
        productService.addVariant(SELLER, product.getId(), variant("1 trứng", "DEMO-DEO-SEN-150-1T", 90000, 10, 150, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("deo-sen.jpg"));
    }

    private void seedGreetingCard() {
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Thiệp trung thu")
                .description("Thiệp chúc mừng, gửi kèm hộp bánh.")
                .productType(ProductType.GREETING_CARD)
                .build());
        productService.addVariant(SELLER, product.getId(), variant("Thiệp đỏ", "DEMO-THIEP-DO", 15000, 40, null, null));
        productService.addVariant(SELLER, product.getId(), variant("Thiệp kem", "DEMO-THIEP-KEM", 18000, 30, null, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("thiep-do.jpg", "thiep-vang.jpg"));
        publish(product.getId(), "Thiệp trung thu", "Thiệp chúc mừng, gửi kèm hộp bánh.", ProductType.GREETING_CARD);
    }

    private void seedArchived() {
        var type = ProductType.LOOSE_CAKE;
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Bánh nướng gà quay")
                .description("Đã ngừng cả dòng, không bán lại.")
                .productType(type)
                .build());
        productService.addVariant(SELLER, product.getId(), variant("1 trứng", "DEMO-GAQUAY-150-1T", 120000, 4, 150, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("ga-quay.jpg"));
        publish(product.getId(), "Bánh nướng gà quay", "Đã ngừng cả dòng, không bán lại.", type);
        productService.updateProduct(SELLER, product.getId(), ProductRequest.builder()
                .name("Bánh nướng gà quay")
                .description("Đã ngừng cả dòng, không bán lại.")
                .productType(type)
                .status("ARCHIVED")
                .build());
    }

    private void seedSoldOut() {
        var product = productService.createProduct(SELLER, ProductRequest.builder()
                .name("Bánh nướng đậu xanh")
                .description("Cả hai cỡ đều hết, cửa hàng hiện hết hàng.")
                .productType(ProductType.LOOSE_CAKE)
                .build());
        var small = productService.addVariant(SELLER, product.getId(), variant("1 trứng", "DEMO-DAUXANH-SOLD-150-1T", 90000, 1, 150, null));
        var large = productService.addVariant(SELLER, product.getId(), variant("2 trứng", "DEMO-DAUXANH-SOLD-200-2T", 115000, 1, 200, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("dau-xanh.jpg"));
        publish(product.getId(), "Bánh nướng đậu xanh", "Cả hai cỡ đều hết, cửa hàng hiện hết hàng.", ProductType.LOOSE_CAKE);
        sellOut(product.getId(), small.getId());
        sellOut(product.getId(), large.getId());
    }

    private void publish(java.util.UUID id, String name, String description, ProductType type) {
        publish(SELLER, id, name, description, type, null);
    }

    private void publish(String email, UUID id, String name, String description, ProductType type, BigDecimal salePrice) {
        productService.updateProduct(email, id, ProductRequest.builder()
                .name(name)
                .description(description)
                .productType(type)
                .salePrice(salePrice)
                .status("ACTIVE")
                .build());
    }

    private void sellOut(java.util.UUID productId, java.util.UUID variantId) {
        inventoryService.adjust(SELLER, productId, variantId, new AdjustStockRequest(
                InventoryAuditType.ADJUSTMENT_EXPIRED, 1, "Hết hàng demo"));
    }

    private ProductVariantRequest variant(String name, String sku, int price, int stock, Integer weight, Integer box) {
        return ProductVariantRequest.builder()
                .variantName(name)
                .sku(sku)
                .price(new BigDecimal(price))
                .stockQuantity(stock)
                .weightGram(weight)
                .boxCapacity(box)
                .build();
    }
}
