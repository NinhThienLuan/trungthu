package fpt.sba.trungthu;

import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.OrderPaymentStatus;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.service.CartService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.VariantStatsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

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
    @Autowired private InventoryAuditRepository audits;
    @Autowired private ProductService productService;
    @Autowired private CartService cartService;
    @Autowired private VariantStatsService stats;
    @MockitoBean private JavaMailSender mailSender;

    @Test
    void seedsCatalogStockCartAndOrders() {
        var sellerProducts = products.findByProviderEmailOrderByCreatedAtDesc("seller@kinhdo.vn");
        assertThat(sellerProducts).extracting(Product::getName)
                .contains("Bánh nướng thập cẩm", "Hộp đoàn viên", "Set đoàn viên", "Thiệp trung thu", "Bánh nướng đậu xanh", "Bánh dẻo hạt sen", "Bánh nướng gà quay");
        assertThat(statusOf(sellerProducts, "Bánh dẻo hạt sen")).isEqualTo(ProductStatus.DRAFT);
        assertThat(statusOf(sellerProducts, "Bánh nướng gà quay")).isEqualTo(ProductStatus.ARCHIVED);
        assertThat(statusOf(sellerProducts, "Bánh nướng đậu xanh")).isEqualTo(ProductStatus.SOLD_OUT);
        assertThat(productService.getPublicProducts(null)).extracting(product -> product.getName())
                .contains("Bánh nướng thập cẩm", "Hộp đoàn viên", "Set đoàn viên", "Thiệp trung thu", "Bánh nướng đậu xanh")
                .doesNotContain("Bánh dẻo hạt sen", "Bánh nướng gà quay");

        var cake = variant(sellerProducts, "DEMO-THAPCAM-150");
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
        assertThat(orders.findAll()).filteredOn(order -> order.getDiscountAmount().signum() > 0)
                .isNotEmpty()
                .allSatisfy(order -> {
                    assertThat(order.getListAmount()).isEqualByComparingTo("760000.00");
                    assertThat(order.getDiscountAmount()).isEqualByComparingTo("60000.00");
                    assertThat(order.getSubtotalAmount()).isEqualByComparingTo("700000.00");
                });

        var soldOut = variant(sellerProducts, "DEMO-THAPCAM-200").variant();
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

        assertThat(orders.findAll()).hasSize(103);
        assertThat(orders.findAll()).extracting(Order::getOrderStatus)
                .contains(OrderStatus.PENDING_DEPOSIT, OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED,
                        OrderStatus.DELIVERING, OrderStatus.COMPLETED, OrderStatus.CANCELLED);
        assertThat(orders.findAll()).filteredOn(order -> order.getOrderStatus() == OrderStatus.DEPOSITED)
                .extracting(Order::getPaymentStatus)
                .containsOnly(OrderPaymentStatus.PAID_FULL);
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
