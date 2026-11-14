package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.ProductRequest;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductPriceValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private ProductRequest request(String price) {
        return ProductRequest.builder().name("Set quà Trung Thu").productType(ProductType.GIFT_SET)
                .salePrice(new BigDecimal(price)).build();
    }

    @Test
    void rejectsSetPriceBelowOneThousand() {
        assertFalse(validator.validate(request("999.99")).isEmpty());
    }

    @Test
    void acceptsSetPriceAtOneThousand() {
        assertTrue(validator.validate(request("1000")).isEmpty());
    }
}
