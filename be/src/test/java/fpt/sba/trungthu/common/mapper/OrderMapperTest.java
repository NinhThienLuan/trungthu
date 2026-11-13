package fpt.sba.trungthu.common.mapper;

import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class OrderMapperTest {

    @Test
    void legacyBuyXPayYLabelIsNotMistakenForBoxContents() {
        Product product = Product.builder().id(UUID.randomUUID()).build();
        ProductVariant variant = ProductVariant.builder().id(UUID.randomUUID()).product(product).build();
        User provider = User.builder().id(UUID.randomUUID()).storeName("Bakery").build();
        Order order = Order.builder().id(UUID.randomUUID()).provider(provider)
                .totalAmount(new BigDecimal("100000")).build();
        OrderItem item = OrderItem.builder().variant(variant).productName("Bánh")
                .variantName("150g · Lấy 3 trả tiền 1 · tặng 2 bánh")
                .quantity(3).unitPrice(new BigDecimal("100000"))
                .subtotal(new BigDecimal("100000")).build();

        var line = new OrderMapper().toDetail(order, LocalDate.now(), BigDecimal.ZERO, List.of(item))
                .getLines().getFirst();

        assertThat(line.getVariantName()).isEqualTo("150g");
        assertThat(line.getPromotionLabel()).isEqualTo("Lấy 3 trả tiền 1 · tặng 2 bánh");
        assertThat(line.getBoxContents()).isNull();
    }
}
