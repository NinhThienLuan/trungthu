package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.exception.CartNotBuyableException;
import fpt.sba.trungthu.dto.request.AddCartItemRequest;
import fpt.sba.trungthu.dto.request.UpdateCartItemRequest;
import fpt.sba.trungthu.dto.response.CartLineResponse;
import fpt.sba.trungthu.entity.CartItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.UserStatus;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.CartItemRepository;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.UserRepository;
import fpt.sba.trungthu.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final GiftSetComponentRepository componentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CartLineResponse> list(String customerEmail) {
        User customer = customer(customerEmail);
        return cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CartLineResponse add(String customerEmail, AddCartItemRequest request) {
        User customer = customer(customerEmail);
        if (request.getSetProductId() != null) {
            return addSet(customer, request);
        }
        if (request.getVariantId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a variant or a gift set");
        }
        ProductVariant variant = variantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (!canBuy(variant, request.getQuantity())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hết hàng, hãy đổi phân loại");
        }
        CartItem item = cartItemRepository.findByCustomerIdAndVariantId(customer.getId(), variant.getId())
                .orElseGet(() -> CartItem.builder().customer(customer).variant(variant).quantity(0).selected(false).build());
        int nextQuantity = item.getQuantity() + request.getQuantity();
        if (!canBuy(variant, nextQuantity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng vượt tồn kho");
        }
        item.setQuantity(nextQuantity);
        return toResponse(cartItemRepository.save(item));
    }

    @Override
    @Transactional(noRollbackFor = CartNotBuyableException.class)
    public CartLineResponse update(String customerEmail, UUID variantId, UpdateCartItemRequest request) {
        User customer = customer(customerEmail);
        CartItem item = cartItemRepository.findByCustomerIdAndVariantId(customer.getId(), variantId)
                .or(() -> cartItemRepository.findByCustomerIdAndSetProductId(customer.getId(), variantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        if (request.getQuantity() != null) {
            int stock = item.getSetProduct() != null ? assembled(item.getSetProduct())
                    : (item.getVariant().getStockQuantity() == null ? 0 : item.getVariant().getStockQuantity());
            if (request.getQuantity() > item.getQuantity() && request.getQuantity() > stock) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng vượt tồn kho");
            }
            item.setQuantity(request.getQuantity());
        }
        boolean buyable = item.getSetProduct() != null
                ? canBuySet(item.getSetProduct(), item.getQuantity())
                : canBuy(item.getVariant(), item.getQuantity());
        if (Boolean.TRUE.equals(request.getSelected()) && !buyable) {
            item.setSelected(false);
            cartItemRepository.saveAndFlush(item);
            throw new CartNotBuyableException();
        }
        if (request.getSelected() != null) {
            item.setSelected(request.getSelected());
        }
        if (Boolean.TRUE.equals(item.getSelected()) && !buyable) {
            item.setSelected(false);
        }
        return toResponse(cartItemRepository.save(item));
    }

    @Override
    @Transactional
    public void remove(String customerEmail, UUID variantId) {
        User customer = customer(customerEmail);
        CartItem item = cartItemRepository.findByCustomerIdAndVariantId(customer.getId(), variantId)
                .or(() -> cartItemRepository.findByCustomerIdAndSetProductId(customer.getId(), variantId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public CartLineResponse swapVariant(String customerEmail, UUID fromVariantId, UUID toVariantId) {
        User customer = customer(customerEmail);
        CartItem current = cartItemRepository.findByCustomerIdAndVariantId(customer.getId(), fromVariantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
        ProductVariant target = variantRepository.findById(toVariantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (!target.getProduct().getId().equals(current.getVariant().getProduct().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ đổi sang phân loại cùng sản phẩm");
        }
        if (fromVariantId.equals(toVariantId)) {
            return toResponse(current);
        }
        CartItem existing = cartItemRepository.findByCustomerIdAndVariantId(customer.getId(), toVariantId).orElse(null);
        int wanted = current.getQuantity() + (existing == null ? 0 : existing.getQuantity());
        int stock = target.getStockQuantity() == null ? 0 : target.getStockQuantity();
        int quantity = Math.max(1, Math.min(wanted, stock));
        if (!canBuy(target, quantity)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phân loại này cũng đang hết hàng");
        }
        cartItemRepository.delete(current);
        cartItemRepository.flush();
        CartItem next = existing != null ? existing
                : CartItem.builder().customer(customer).variant(target).build();
        next.setQuantity(quantity);
        next.setSelected(true);
        return toResponse(cartItemRepository.save(next));
    }

    private CartLineResponse addSet(User customer, AddCartItemRequest request) {
        Product set = productRepository.findById(request.getSetProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Gift set not found"));
        if (set.getProductType() != ProductType.GIFT_SET) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "That product is not a gift set");
        }
        if (!canBuySet(set, request.getQuantity())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hết set, hãy chọn số lượng nhỏ hơn");
        }
        CartItem item = cartItemRepository.findByCustomerIdAndSetProductId(customer.getId(), set.getId())
                .orElseGet(() -> CartItem.builder().customer(customer).setProduct(set).quantity(0).selected(false).build());
        int next = item.getQuantity() + request.getQuantity();
        if (!canBuySet(set, next)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Số lượng vượt số set đang có");
        }
        item.setQuantity(next);
        return toResponse(cartItemRepository.save(item));
    }

    private boolean canBuySet(Product set, int quantity) {
        return set.getStatus() == ProductStatus.ACTIVE && assembled(set) >= quantity && portionFits(set);
    }

    private boolean portionFits(Product set) {
        int boxes = assembled(set);
        if (boxes <= 0) {
            return false;
        }
        return componentRepository.findBySetProductId(set.getId()).stream()
                .allMatch(row -> row.getQuantity() % boxes == 0);
    }

    private int assembled(Product set) {
        return componentRepository.findBySetProductId(set.getId()).stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .mapToInt(row -> row.getQuantity())
                .sum();
    }

    private BigDecimal salePrice(Product set) {
        BigDecimal list = BigDecimal.ZERO;
        for (var row : componentRepository.findBySetProductId(set.getId())) {
            int perSet = row.getPerSetQuantity() == null ? 0 : row.getPerSetQuantity();
            if (perSet <= 0) {
                return BigDecimal.ZERO;
            }
            list = list.add(row.getComponentVariant().getPrice().multiply(BigDecimal.valueOf(perSet)));
        }
        BigDecimal percent = set.getSalePrice() == null || list.signum() <= 0 || set.getSalePrice().compareTo(list) >= 0
                ? BigDecimal.ZERO
                : list.subtract(set.getSalePrice());
        return set.getSalePrice() == null || percent.signum() == 0
                ? list.setScale(2, RoundingMode.HALF_UP)
                : set.getSalePrice().setScale(2, RoundingMode.HALF_UP);
    }

    private boolean canBuy(ProductVariant variant, int quantity) {
        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        return variant.getProduct().getStatus() == ProductStatus.ACTIVE
                && variant.getStatus() == VariantStatus.IN_STOCK
                && stock >= quantity;
    }

    private CartLineResponse toResponse(CartItem item) {
        if (item.getSetProduct() != null) {
            Product set = item.getSetProduct();
            boolean buyable = canBuySet(set, item.getQuantity());
            return CartLineResponse.builder()
                    .setProductId(set.getId())
                    .productId(set.getId())
                    .productName(set.getName())
                    .variantName("Set")
                    .price(salePrice(set))
                    .quantity(item.getQuantity())
                    .stockQuantity(assembled(set))
                    .status(assembled(set) > 0 ? VariantStatus.IN_STOCK : VariantStatus.OUT_OF_STOCK)
                    .selected(Boolean.TRUE.equals(item.getSelected()) && buyable)
                    .buyable(buyable)
                    .build();
        }
        ProductVariant variant = item.getVariant();
        boolean buyable = canBuy(variant, item.getQuantity());
        return CartLineResponse.builder()
                .variantId(variant.getId())
                .productId(variant.getProduct().getId())
                .productName(variant.getProduct().getName())
                .variantName(variant.getVariantName())
                .price(variant.getPrice())
                .quantity(item.getQuantity())
                .stockQuantity(variant.getStockQuantity())
                .status(variant.getStatus())
                .selected(Boolean.TRUE.equals(item.getSelected()) && buyable)
                .buyable(buyable)
                .build();
    }

    private User customer(String email) {
        User user = userRepository.findByEmailAndStatus(email, UserStatus.ACTIVE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        if (user.getRole() != fpt.sba.trungthu.entity.enumeration.UserRole.CUSTOMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only customers have a cart");
        }
        return user;
    }
}
