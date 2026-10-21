package fpt.sba.trungthu.entity.enumeration;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum TransactionStatus {
    PENDING,
    SUCCESS,
    CANCELLED;

    public boolean canTransitionTo(TransactionStatus target) {
        return this == PENDING && (target == SUCCESS || target == CANCELLED);
    }

    public void validateTransition(TransactionStatus target) {
        if (!canTransitionTo(target)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("Invalid transaction transition: %s -> %s", this, target));
        }
    }
}
