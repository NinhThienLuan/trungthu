package fpt.sba.trungthu.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public class CartNotBuyableException extends ResponseStatusException {

    public CartNotBuyableException() {
        super(HttpStatus.CONFLICT, "Hết hàng, hãy đổi phân loại");
    }
}
