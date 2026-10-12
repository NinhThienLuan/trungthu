package fpt.sba.trungthu.common.util;

import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

class OrderStatusTransitionValidatorTest {

    @Test
    void testValidTransitions() {
        // PENDING -> CONFIRMED / CANCELLED
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("PENDING", "CONFIRMED"));
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("PENDING", "CANCELLED"));

        // CONFIRMED -> PROCESSING / CANCELLED
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("CONFIRMED", "PROCESSING"));
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("CONFIRMED", "CANCELLED"));

        // PROCESSING -> SHIPPING
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("PROCESSING", "SHIPPING"));

        // SHIPPING -> DELIVERED / FAILED_DELIVERY
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("SHIPPING", "DELIVERED"));
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("SHIPPING", "FAILED_DELIVERY"));

        // FAILED_DELIVERY -> SHIPPING / CANCELLED
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("FAILED_DELIVERY", "SHIPPING"));
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("FAILED_DELIVERY", "CANCELLED"));

        // Same status is no-op
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("PENDING", "PENDING"));
        assertDoesNotThrow(() -> OrderStatusTransitionValidator.validateTransition("DELIVERED", "DELIVERED"));
    }

    @Test
    void testInvalidTransitionsThrowException() {
        // CANCELLED is terminal
        assertThrows(ResponseStatusException.class,
                () -> OrderStatusTransitionValidator.validateTransition("CANCELLED", "CONFIRMED"));
        assertThrows(ResponseStatusException.class,
                () -> OrderStatusTransitionValidator.validateTransition("CANCELLED", "DELIVERED"));

        // DELIVERED is terminal
        assertThrows(ResponseStatusException.class,
                () -> OrderStatusTransitionValidator.validateTransition("DELIVERED", "PROCESSING"));

        // Invalid jump: PENDING -> DELIVERED directly
        assertThrows(ResponseStatusException.class,
                () -> OrderStatusTransitionValidator.validateTransition("PENDING", "DELIVERED"));

        // Null status throws bad request
        assertThrows(ResponseStatusException.class,
                () -> OrderStatusTransitionValidator.validateTransition(null, "CONFIRMED"));
    }
}
