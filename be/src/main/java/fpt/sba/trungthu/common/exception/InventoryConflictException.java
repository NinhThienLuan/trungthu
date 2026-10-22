package fpt.sba.trungthu.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.UUID;

public class InventoryConflictException extends ResponseStatusException {

    public InventoryConflictException(String code, UUID providerId, UUID variantId, LocalDate bakeDate) {
        super(HttpStatus.CONFLICT, code
                + " providerId=" + providerId
                + " variantId=" + variantId
                + " bakeDate=" + bakeDate);
    }
}
