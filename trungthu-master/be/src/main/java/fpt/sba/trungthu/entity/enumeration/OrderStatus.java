package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum OrderStatus {
    PENDING_DEPOSIT,
    CONFIRMED,
    DEPOSITED,
    BAKING_QUEUED,
    DELIVERING,
    COMPLETED,
    CANCELLED;

    public boolean canTransitionTo(OrderStatus target) {
        if (target == null) {
            return false;
        }
        return switch (this) {
            case PENDING_DEPOSIT -> target == DEPOSITED || target == CANCELLED;
            case CONFIRMED -> target == BAKING_QUEUED || target == CANCELLED;
            case DEPOSITED -> target == BAKING_QUEUED;
            case BAKING_QUEUED -> target == DELIVERING;
            case DELIVERING -> target == COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }

    public void validateTransition(OrderStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("Invalid order transition: %s -> %s", this, target));
        }
    }
}
