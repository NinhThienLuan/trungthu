package fpt.sba.trungthu.common.util;

import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

public final class OrderStatusTransitionValidator {

    private OrderStatusTransitionValidator() {}

    public static void validateTransition(OrderStatus current, OrderStatus target) {
        if (current == null || target == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status cannot be null");
        }
        current.validateTransition(target);
    }

    public static void validateTransition(String current, String target) {
        validateTransition(parseStatus(current), parseStatus(target));
    }

    private static OrderStatus parseStatus(String status) {
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order status cannot be null");
        }
        try {
            return OrderStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown order status: " + status);
        }
    }
}
