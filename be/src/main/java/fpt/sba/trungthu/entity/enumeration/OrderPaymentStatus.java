package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum OrderPaymentStatus {
    UNPAID,
    DEPOSITED,
    PAID_FULL;

    public boolean canTransitionTo(OrderPaymentStatus target) {
        if (target == null) {
            return false;
        }
        return switch (this) {
            case UNPAID -> target == DEPOSITED || target == PAID_FULL;
            case DEPOSITED -> target == PAID_FULL;
            case PAID_FULL -> false;
        };
    }

    public void validateTransition(OrderPaymentStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("Invalid order payment transition: %s -> %s", this, target));
        }
    }
}
