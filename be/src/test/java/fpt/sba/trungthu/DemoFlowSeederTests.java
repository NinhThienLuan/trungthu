package fpt.sba.trungthu;

import fpt.sba.trungthu.common.data.DataInitializer;
import fpt.sba.trungthu.common.data.DemoCheckoutSeeder;
import fpt.sba.trungthu.common.data.DemoComplianceSeeder;
import fpt.sba.trungthu.common.data.DemoFlowSeeder;
import fpt.sba.trungthu.common.data.DemoProductSeeder;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.PaymentTransaction;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.StoreComplianceDoc;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocStatus;
import fpt.sba.trungthu.entity.enumeration.ComplianceDocType;
import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.TransactionStatus;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.PaymentTransactionRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.StoreComplianceDocRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.CartService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.VariantStatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:${random.uuid};DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false",
        "app.demo-flow-seed=true"
})
class DemoFlowSeederTests {

    @Autowired private ProductRepository products;
    @Autowired private OrderRepository orders;
    @Autowired private PaymentTransactionRepository payments;
    @Autowired private StoreComplianceDocRepository complianceDocs;
    @Autowired private UserRepository users;
    @Autowired private InventoryAuditRepository audits;
    @Autowired private ProductService productService;
    @Autowired private CartService cartService;
    @Autowired private VariantStatsService stats;
    @Autowired private DataInitializer dataInitializer;
    @Autowired private DemoComplianceSeeder complianceSeeder;
    @Autowired private DemoProductSeeder productSeeder;
    @Autowired private DemoCheckoutSeeder checkoutSeeder;
    @Autowired private DemoFlowSeeder flowSeeder;
    @MockitoBean private JavaMailSender mailSender;

    @Value("${app.storage.base-path:uploads}")
    private String storagePath;

    @Value("${app.storage.base-url:/uploads}")
    private String storageUrl;

    @Test
    void seedsCatalogStockCartAndOrders() {
        var sellerProducts = products.findByProviderEmailOrderByCreatedAtDesc("seller@kinhdo.vn");
        assertThat(sellerProducts).extracting(Product::getName)
                .contains("Bánh nướng thập cẩm", "Hộp đoàn viên", "Set đoàn viên", "Thiệp trung thu", "Bánh nướng đậu xanh", "Bánh dẻo hạt sen", "Bánh nướng gà quay");
        assertThat(statusOf(sellerProducts, "Bánh dẻo hạt sen")).isEqualTo(ProductStatus.DRAFT);
        assertThat(statusOf(sellerProducts, "Bánh nướng gà quay")).isEqualTo(ProductStatus.ARCHIVED);
        assertThat(statusOf(sellerProducts, "Bánh nướng đậu xanh")).isEqualTo(ProductStatus.SOLD_OUT);
        assertThat(productService.getPublicProducts(null)).extracting(product -> product.getName())
                .contains("Bánh nướng thập cẩm", "Set đoàn viên", "Thiệp trung thu", "Bánh nướng đậu xanh")
                // vỏ hộp chỉ bán kèm bánh (Tự phối / set quà) nên không có trong danh mục chung
                .doesNotContain("Hộp đoàn viên", "Bánh dẻo hạt sen", "Bánh nướng gà quay");

        var cake = variant(sellerProducts, "DEMO-THAPCAM-150-1T");
        var balance = stats.stats("seller@kinhdo.vn", cake.productId(), cake.variant().getId());
        assertThat(balance.getInbound()).isEqualTo(160);
        assertThat(balance.getBroken()).isEqualTo(2);
        assertThat(balance.getExpired()).isEqualTo(1);
        assertThat(balance.getSold()).isEqualTo(45);
        assertThat(balance.getAwaitingPayment()).isEqualTo(16);
        assertThat(balance.getCancelled()).isEqualTo(14);
        assertThat(balance.getLooseOnHand()).isEqualTo(88);
        assertThat(balance.getInSet()).isEqualTo(8);
        assertThat(balance.getOnHand()).isEqualTo(96);
        assertThat(balance.getDiscrepancy()).isZero();
        var cakeAudits = audits.findByVariantId(cake.variant().getId(),
                PageRequest.of(0, 2, Sort.by("createdAt").descending())).getContent();
        assertThat(cakeAudits.get(0).getAuditType().name()).isEqualTo("ORDER_RETURN");
        assertThat(cakeAudits.get(0).getQuantityDelta()).isEqualTo(4);
        assertThat(cakeAudits.get(0).getStockAfter()).isEqualTo(96);
        assertThat(cakeAudits.get(1).getAuditType().name()).isEqualTo("ORDER_HOLD");
        assertThat(cakeAudits.get(1).getQuantityDelta()).isEqualTo(-4);
        assertThat(cakeAudits.get(1).getStockAfter()).isEqualTo(92);
        User kinhdo = users.findByEmail("seller@kinhdo.vn").orElseThrow();
        assertThat(orders.findProviderOrders(kinhdo.getId(), null, null, null, PageRequest.of(0, 200)).getContent())
                .filteredOn(order -> order.getDiscountAmount().signum() > 0)
                .isNotEmpty()
                .allSatisfy(order -> {
                    assertThat(order.getListAmount()).isEqualByComparingTo("760000.00");
                    assertThat(order.getDiscountAmount()).isEqualByComparingTo("60000.00");
                    assertThat(order.getSubtotalAmount()).isEqualByComparingTo("700000.00");
                });

        var soldOut = variant(sellerProducts, "DEMO-THAPCAM-200-2T").variant();
        assertThat(soldOut.getStockQuantity()).isZero();
        assertThat(soldOut.getStatus()).isEqualTo(VariantStatus.OUT_OF_STOCK);
        var restocked = variant(sellerProducts, "DEMO-DAUXANH-180").variant();
        assertThat(restocked.getStockQuantity()).isEqualTo(18);
        assertThat(restocked.getStatus()).isEqualTo(VariantStatus.IN_STOCK);

        var lines = cartService.list("buyer@gmail.com");
        assertThat(lines).hasSize(3);
        assertThat(lines).anyMatch(line -> line.getVariantId().equals(cake.variant().getId())
                && line.getQuantity() == 2 && line.isSelected() && line.isBuyable());
        assertThat(lines).anyMatch(line -> line.getVariantId().equals(soldOut.getId())
                && line.getQuantity() == 1 && !line.isSelected() && !line.isBuyable());

        assertThat(orders.findProviderOrders(kinhdo.getId(), null, null, null, PageRequest.of(0, 200)).getContent())
                .hasSize(103);
        assertThat(orders.findAll()).extracting(Order::getOrderStatus)
                .contains(OrderStatus.PENDING_DEPOSIT, OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED,
                        OrderStatus.DELIVERING, OrderStatus.COMPLETED, OrderStatus.CANCELLED);
        assertThat(orders.findAll()).filteredOn(order -> order.getOrderStatus() == OrderStatus.DEPOSITED)
                .extracting(Order::getPaymentStatus)
                .containsOnly(OrderPaymentStatus.PAID_FULL);

        assertShop("seller@dongkhanh.vn", "Bánh nướng sen nhụy", "Bánh nướng hạt dưa", 19);
        assertShop("seller@givral.vn", "Bánh dẻo trứng muối", "Bánh nướng thập cẩm Givral", 18);
        assertShop("seller@anphu.vn", "Bánh nướng sen An Phú", "Bánh dẻo đậu xanh An Phú", 16);
        assertShop("seller@minhnguyet.vn", "Bánh nướng hạt dưa Minh Nguyệt", "Bánh dẻo trứng muối Minh Nguyệt", 16);
        for (String email : List.of("seller@kinhdo.vn", "seller@dongkhanh.vn", "seller@givral.vn",
                "seller@anphu.vn", "seller@minhnguyet.vn")) {
            assertApprovedCompliance(email);
        }

        long userCount = users.count();
        long productCount = products.count();
        long orderCount = orders.count();
        long docCount = complianceDocs.count();
        dataInitializer.run();
        complianceSeeder.run();
        productSeeder.run();
        checkoutSeeder.run();
        flowSeeder.run();
        assertThat(users.count()).isEqualTo(userCount);
        assertThat(products.count()).isEqualTo(productCount);
        assertThat(orders.count()).isEqualTo(orderCount);
        assertThat(complianceDocs.count()).isEqualTo(docCount);
        assertThat(cartService.list("buyer@gmail.com")).hasSize(3);
    }

    private void assertShop(String email, String firstName, String secondName, int orderCount) {
        var sellerProducts = products.findByProviderEmailOrderByCreatedAtDesc(email);
        assertThat(statusOf(sellerProducts, firstName)).isEqualTo(ProductStatus.ACTIVE);
        assertThat(statusOf(sellerProducts, secondName)).isEqualTo(ProductStatus.ACTIVE);
        User seller = users.findByEmail(email).orElseThrow();
        var shopOrders = orders.findProviderOrders(seller.getId(), null, null, null, PageRequest.of(0, 50)).getContent();
        assertThat(shopOrders).hasSize(orderCount);
        assertThat(shopOrders).extracting(Order::getOrderStatus).contains(
                OrderStatus.PENDING_DEPOSIT, OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED,
                OrderStatus.DELIVERING, OrderStatus.COMPLETED, OrderStatus.CANCELLED);
        assertThat(shopOrders).filteredOn(order -> order.getOrderStatus() == OrderStatus.DEPOSITED
                        || order.getOrderStatus() == OrderStatus.BAKING_QUEUED
                        || order.getOrderStatus() == OrderStatus.DELIVERING
                        || order.getOrderStatus() == OrderStatus.COMPLETED)
                .extracting(Order::getPaymentStatus)
                .containsOnly(OrderPaymentStatus.PAID_FULL);
        for (Order order : shopOrders) {
            TransactionStatus expected = switch (order.getOrderStatus()) {
                case PENDING_DEPOSIT -> TransactionStatus.PENDING;
                case CANCELLED -> TransactionStatus.CANCELLED;
                case DEPOSITED, BAKING_QUEUED, DELIVERING, COMPLETED -> TransactionStatus.SUCCESS;
                default -> throw new IllegalStateException(order.getOrderStatus().name());
            };
            assertThat(payments.findByOrderIdOrderByCreatedAtAsc(order.getId()))
                    .extracting(PaymentTransaction::getPaymentStatus)
                    .contains(expected);
        }
    }

    private void assertApprovedCompliance(String email) {
        User seller = users.findByEmail(email).orElseThrow();
        var approved = complianceDocs.findByProviderIdOrderBySubmittedAtDesc(seller.getId()).stream()
                .filter(doc -> doc.getVerificationStatus() == ComplianceDocStatus.APPROVED)
                .toList();
        for (ComplianceDocType type : ComplianceDocType.values()) {
            var ofType = approved.stream().filter(doc -> doc.getDocumentType() == type).toList();
            assertThat(ofType).hasSize(1);
            assertThat(fileOf(ofType.get(0))).exists();
        }
    }

    private Path fileOf(StoreComplianceDoc doc) {
        String prefix = storageUrl.endsWith("/") ? storageUrl : storageUrl + "/";
        return Paths.get(storagePath).resolve(doc.getDocumentUrl().substring(prefix.length()));
    }

    private Found variant(List<Product> products, String sku) {
        for (Product product : products) {
            for (ProductVariant variant : product.getVariants()) {
                if (sku.equals(variant.getSku())) {
                    return new Found(product.getId(), variant);
                }
            }
        }
        throw new IllegalStateException(sku);
    }

    private record Found(java.util.UUID productId, ProductVariant variant) {
    }

    private ProductStatus statusOf(List<Product> products, String name) {
        return products.stream().filter(product -> product.getName().equals(name)).findFirst().orElseThrow().getStatus();
    }
}
