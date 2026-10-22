package fpt.sba.trungthu.common.data;

import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import fpt.sba.trungthu.dto.request.SaveSetCompositionRequest;
import fpt.sba.trungthu.dto.request.StockSetRequest;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.GiftSetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@Order(100)
@RequiredArgsConstructor
public class DemoProductSeeder implements CommandLineRunner {

    private static final String SELLER = "seller@kinhdo.vn";

    private final ProductRepository productRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;
    private final GiftSetService giftSetService;

    @Override
    public void run(String... args) {
        List<Product> existing = productRepository.findByProviderEmailOrderByCreatedAtDesc(SELLER);
        if (existing.isEmpty()) {
            seedLooseCake();
            seedGiftBox();
            seedDraft();
            seedArchived();
            seedSoldOut();
            seedGreetingCard();
            log.info("Seeded demo mooncakes and greeting cards for {}", SELLER);
            seedOtherShops();
            return;
        }
        if (existing.stream().noneMatch(product -> "Bánh nướng đậu xanh".equals(product.getName()))) {
            seedSoldOut();
            log.info("Seeded sold-out mooncake for {}", SELLER);
        }
        if (existing.stream().noneMatch(product -> "Thiệp trung thu".equals(product.getName()))) {
            seedGreetingCard();
            log.info("Seeded greeting card for {}", SELLER);
        }
        refreshAlbums(existing);
        seedOtherShops();
    }

    private void seedOtherShops() {
        seedShop("seller@dongkhanh.vn",
                "Bánh nướng sen nhụy", "Nhân sen nhụy, vỏ nướng mỏng.", "DK-SEN-150", 98000, 20,
                new String[] { "dk-sen.jpg", "dk-sen-2.jpg" },
                "Bánh nướng hạt dưa", "Nhân hạt dưa rang, vị ngọt vừa.", "DK-HATDUA-200", 88000, 12,
                new String[] { "dk-hatdua.jpg", "dk-hatdua-2.jpg" },
                "Hộp Đồng Khánh", "Hộp 4 bánh, nắp gấm đỏ.", "DK-HOP-4", 380000,
                new String[] { "dk-hop.jpg", "dk-hop-mo.jpg" },
                "Set sen nhụy", "Một hộp 4 bánh sen nhụy. Giá bán thấp hơn giá gốc.", "690000", 3,
                new String[] { "dk-set.jpg", "dk-set-2.jpg", "dk-hop-mo.jpg" });
        seedShop("seller@givral.vn",
                "Bánh dẻo trứng muối", "Vỏ dẻo, nhân đậu xanh trứng muối.", "GV-DEO-180", 105000, 16,
                new String[] { "gv-deo.jpg", "gv-deo-2.jpg" },
                "Bánh nướng thập cẩm Givral", "Nhân thập cẩm, lò Givral.", "GV-THAPCAM-150", 92000, 18,
                new String[] { "gv-thapcam.jpg", "gv-thapcam-2.jpg" },
                "Hộp Givral", "Hộp 4 bánh, dùng để biếu.", "GV-HOP-4", 450000,
                new String[] { "gv-hop.jpg", "gv-hop-mo.jpg" },
                "Set dẻo trứng muối", "Một hộp 4 bánh dẻo trứng muối. Giá bán thấp hơn giá gốc.", "790000", 2,
                new String[] { "gv-set.jpg", "gv-set-2.jpg", "gv-hop-mo.jpg" });
    }

    private void seedShop(String email,
            String cakeName, String cakeDescription, String cakeSku, int cakePrice, int cakeStock, String[] cakeImages,
            String extraName, String extraDescription, String extraSku, int extraPrice, int extraStock, String[] extraImages,
            String boxName, String boxDescription, String boxSku, int boxPrice, String[] boxImages,
            String setName, String setDescription, String salePrice, int setCount, String[] setImages) {
        List<Product> existing = productRepository.findByProviderEmailOrderByCreatedAtDesc(email);
        if (!existing.isEmpty()) {
            replace(existing, email, cakeName, cakeImages);
            replace(existing, email, extraName, extraImages);
            replace(existing, email, boxName, boxImages);
            replace(existing, email, setName, setImages);
            return;
        }
        var cake = productService.createProduct(email, ProductRequest.builder()
                .name(cakeName)
                .description(cakeDescription)
                .productType(ProductType.LOOSE_CAKE)
                .build());
        var cakeVariant = productService.addVariant(email, cake.getId(),
                variant("150 g", cakeSku, cakePrice, cakeStock, 150, null));
        productService.replaceImages(email, cake.getId(), DemoAlbum.of(cakeImages));
        publish(email, cake.getId(), cakeName, cakeDescription, ProductType.LOOSE_CAKE, null);

        var extra = productService.createProduct(email, ProductRequest.builder()
                .name(extraName)
                .description(extraDescription)
                .productType(ProductType.LOOSE_CAKE)
                .build());
        productService.addVariant(email, extra.getId(),
                variant("200 g", extraSku, extraPrice, extraStock, 200, null));
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
        productService.addVariant(SELLER, product.getId(), variant("150 g", "DEMO-THAPCAM-150", 85000, 24, 150, null));
        productService.addVariant(SELLER, product.getId(), variant("200 g", "DEMO-THAPCAM-200", 110000, 8, 200, null));
        productService.addVariant(SELLER, product.getId(), variant("Đậu xanh 1 trứng", "DEMO-DAUXANH-180", 95000, 1, 180, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("thap-cam.jpg", "dau-xanh.jpg"));
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
        productService.addVariant(SELLER, product.getId(), variant("150 g", "DEMO-DEO-SEN-150", 90000, 10, 150, null));
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
        productService.addVariant(SELLER, product.getId(), variant("150 g", "DEMO-GAQUAY-150", 120000, 4, 150, null));
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
        var small = productService.addVariant(SELLER, product.getId(), variant("150 g", "DEMO-DAUXANH-SOLD-150", 90000, 1, 150, null));
        var large = productService.addVariant(SELLER, product.getId(), variant("200 g", "DEMO-DAUXANH-SOLD-200", 115000, 1, 200, null));
        productService.replaceImages(SELLER, product.getId(), DemoAlbum.of("dau-xanh.jpg"));
        publish(product.getId(), "Bánh nướng đậu xanh", "Cả hai cỡ đều hết, cửa hàng hiện hết hàng.", ProductType.LOOSE_CAKE);
        sellOut(product.getId(), small.getId());
        sellOut(product.getId(), large.getId());
    }

    private void refreshAlbums(List<Product> products) {
        replace(products, SELLER, "Bánh nướng thập cẩm", "thap-cam.jpg", "dau-xanh.jpg");
        replace(products, SELLER, "Hộp đoàn viên", "hop.jpg");
        replace(products, SELLER, "Bánh dẻo hạt sen", "deo-sen.jpg");
        replace(products, SELLER, "Bánh nướng gà quay", "ga-quay.jpg");
        replace(products, SELLER, "Bánh nướng đậu xanh", "dau-xanh.jpg");
        replace(products, SELLER, "Set đoàn viên", "set.jpg", "hop.jpg");
        replace(products, SELLER, "Thiệp trung thu", "thiep-do.jpg", "thiep-vang.jpg");
    }

    private void replace(List<Product> products, String email, String name, String... files) {
        products.stream()
                .filter(product -> name.equals(product.getName()))
                .findFirst()
                .ifPresent(product -> productService.replaceImages(email, product.getId(), DemoAlbum.of(files)));
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
