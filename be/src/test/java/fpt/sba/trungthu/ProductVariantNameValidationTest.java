package fpt.sba.trungthu;

import fpt.sba.trungthu.dto.request.ProductVariantRequest;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductVariantNameValidationTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private ProductVariantRequest request(String name) {
        return ProductVariantRequest.builder().variantName(name).sku("MOONCAKE_200")
                .price(new BigDecimal("1000")).stockQuantity(10).weightGram(112).build();
    }

    @Test
    void rejectsNameContainingOnlyDigits() {
        assertFalse(validator.validate(request("200")).isEmpty());
        assertFalse(validator.validate(request(" 200 ")).isEmpty());
    }

    @Test
    void acceptsVietnameseNameWithMeasurements() {
        assertTrue(validator.validate(request("Bánh nướng 200g")).isEmpty());
    }

    @Test
    void rejectsPriceBelowOneThousand() {
        ProductVariantRequest input = request("Bánh nướng 200g");
        input.setPrice(new BigDecimal("999.99"));
        assertFalse(validator.validate(input).isEmpty());
    }

    @Test
    void acceptsPriceAtOneThousand() {
        assertTrue(validator.validate(request("Bánh nướng 200g")).isEmpty());
    }
}
