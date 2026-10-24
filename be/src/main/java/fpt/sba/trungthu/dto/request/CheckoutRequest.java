package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Client input only. Prices, provider ownership and capacity are resolved on the server. */
public record CheckoutRequest(
        @Size(max = 255) String receiverName,
        @Size(max = 20) String receiverPhone,
        String shippingAddress,
        @Valid CreateOrdersCommand.VatInfo vat,
        @NotEmpty List<@NotNull @Valid Group> groups) {

    public record Group(
            UUID providerId,
            @NotNull LocalDate deliveryDate,
            String province,
            String district,
            @NotNull PaymentMethod paymentMethod,
            Boolean payInFull, // FE gửi depositOption, có thể bỏ trống trường này (null = false)
            String depositOption,
            @NotEmpty List<@NotNull @Valid Item> items,
            List<?> boxes) {
        public Group(LocalDate deliveryDate, String province, String district, PaymentMethod paymentMethod,
                boolean payInFull, List<Item> items) {
            this(null, deliveryDate, province, district, paymentMethod, payInFull, null, items, null);
        }
    }

    /** Một dòng là một variant HOẶC một set quà (GIFT_SET, không có variant) */
    public record Item(
            UUID variantId,
            UUID setProductId,
            @Positive int quantity,
            @Size(max = 50) String personalizationText) {
        // Không thêm constructor phụ: Jackson 3 khi đó không còn đọc được record từ JSON
        public UUID key() {
            return variantId != null ? variantId : setProductId;
        }
    }
}
