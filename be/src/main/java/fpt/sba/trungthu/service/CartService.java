package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.AddCartItemRequest;
import fpt.sba.trungthu.dto.request.UpdateCartItemRequest;
import fpt.sba.trungthu.dto.response.CartLineResponse;

import java.util.List;
import java.util.UUID;

public interface CartService {

    List<CartLineResponse> list(String customerEmail);

    CartLineResponse add(String customerEmail, AddCartItemRequest request);

    CartLineResponse update(String customerEmail, UUID variantId, UpdateCartItemRequest request);

    void remove(String customerEmail, UUID variantId);

    CartLineResponse swapVariant(String customerEmail, UUID fromVariantId, UUID toVariantId);
}
