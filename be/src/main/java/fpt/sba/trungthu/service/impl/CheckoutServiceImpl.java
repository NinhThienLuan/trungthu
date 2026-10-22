package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.ReservedLineResponse;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import fpt.sba.trungthu.service.CheckoutService;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final BigDecimal COD_LIMIT = new BigDecimal("2000000");
    private static final BigDecimal PRINT_FEE = new BigDecimal("20000");
    private static final int MAX_GROUPS = 20;
    private static final int MAX_ITEMS = 100;

    private final SecurityContextService security;
    private final ProductVariantRepository variants;
    private final DailyCapacityRepository capacities;
    private final ProviderShippingRateRepository shippingRates;
    private final SubscriptionRepository subscriptions;
    private final ProviderPayosAccountService payosAccounts;
    private final OrderService orderService;
    private final InventoryService inventory;

    @Override
    @Transactional(readOnly = true)
    public CheckoutPreviewResponse preview(CheckoutRequest request) {
        requireCustomer();
        List<Plan> plans = plan(request, false);
        return new CheckoutPreviewResponse(plans.stream().map(Plan::preview).toList(),
                plans.stream().map(Plan::total).reduce(BigDecimal.ZERO, BigDecimal::add));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<OrderDetailResponse> checkout(CheckoutRequest request) {
        User customer = requireCustomer();
        if (request == null || request.receiverName() == null || request.receiverName().isBlank()
                || request.receiverPhone() == null || request.receiverPhone().isBlank()
                || request.shippingAddress() == null || request.shippingAddress().isBlank()) {
            throw badRequest("Receiver name, phone and shipping address are required");
        }
        Instant orderedAt = Instant.now();
        List<Plan> plans = plan(request, true);
        List<ReserveStockCommand.ReserveLine> reserveLines = new ArrayList<>();
        List<Snap> snaps = new ArrayList<>();
        for (Plan plan : plans) {
            for (Line line : plan.lines()) {
                reserveLines.add(new ReserveStockCommand.ReserveLine(line.variant().getId(), line.quantity(),
                        plan.deliveryDate()));
                snaps.add(new Snap(plan.provider().getId(), line.variant().getId(),
                        line.variant().getProduct().getName(), line.variant().getVariantName(), line.quantity(),
                        line.variant().getPrice(), line.personalizationText(), line.personalizationFee()));
            }
        }
        List<ReservedLineResponse> reserved = inventory.reserve(new ReserveStockCommand(reserveLines));
        List<CreateOrdersCommand.ProviderOrder> groups = new ArrayList<>();
        for (Plan plan : plans) {
            UUID capacityId = reserved.stream()
                    .filter(line -> plan.provider().getId().equals(line.providerId()) && line.capacityId() != null)
                    .map(ReservedLineResponse::capacityId).findFirst().orElse(null);
            if (plan.bakeQuantity() > 0 && capacityId == null) {
                throw conflict("CAPACITY_MISSING provider=" + plan.provider().getId());
            }
            List<CreateOrdersCommand.ItemSnapshot> items = snaps.stream()
                    .filter(snap -> plan.provider().getId().equals(snap.providerId()))
                    .map(snap -> {
                        ReservedLineResponse held = reserved.stream()
                                .filter(line -> snap.variantId().equals(line.variantId())
                                        && snap.providerId().equals(line.providerId()))
                                .findFirst()
                                .orElseThrow(() -> conflict("STOCK_UNAVAILABLE provider=" + snap.providerId()
                                        + " variant=" + snap.variantId()));
                        return new CreateOrdersCommand.ItemSnapshot(snap.variantId(), snap.productName(),
                                snap.variantName(), snap.quantity(), snap.unitPrice(), held.bakeQuantity(),
                                snap.personalizationText(), snap.personalizationFee());
                    }).toList();
            groups.add(new CreateOrdersCommand.ProviderOrder(plan.provider().getId(), plan.deliveryDate(),
                    capacityId, plan.shippingFee(), plan.deposit(), plan.paymentMethod(),
                    plan.paymentMethod() == PaymentMethod.PAYOS ? orderedAt.plusSeconds(5 * 60 * 60)
                            : plan.paymentMethod() == PaymentMethod.VIETQR ? orderedAt.plusSeconds(15 * 60) : null,
                    items));
        }
        var command = new CreateOrdersCommand(UUID.randomUUID(), customer.getId(), orderedAt,
                request.receiverName().trim(), request.receiverPhone().trim(), request.shippingAddress().trim(),
                request.vat(), groups);
        return orderService.createOrders(command).stream()
                .map(order -> orderService.getOrderDetail(order.getId())).toList();
    }

    private List<Plan> plan(CheckoutRequest request, boolean lock) {
        if (request == null || request.groups() == null || request.groups().isEmpty()
                || request.groups().size() > MAX_GROUPS) {
            throw badRequest("Cart must contain 1 to " + MAX_GROUPS + " provider groups");
        }
        LocalDate today = LocalDate.now(VIETNAM);
        List<Plan> result = new ArrayList<>();
        Set<UUID> seenProviders = new HashSet<>();
        // Resolve provider IDs before taking locks; then lock every group in stable order.
        List<CheckoutRequest.Group> sorted = new ArrayList<>(request.groups());
        sorted.sort(Comparator.comparing(group -> group == null || group.items() == null || group.items().isEmpty()
                ? "" : group.items().stream().map(item -> item.variantId() == null ? "" : item.variantId().toString())
                        .min(String::compareTo).orElse("")));
        for (CheckoutRequest.Group group : sorted) {
            if (group == null || group.items() == null || group.items().isEmpty() || group.items().size() > MAX_ITEMS) {
                throw badRequest("Each provider group must contain 1 to " + MAX_ITEMS + " items");
            }
            if (group.boxes() != null && !group.boxes().isEmpty()) {
                throw badRequest("Custom box combinations are not supported in MVP");
            }
            if (group.deliveryDate() == null || group.deliveryDate().isBefore(today.plusDays(3))) {
                throw badRequest("Delivery date must be at least 3 days from today in Vietnam");
            }
            List<CheckoutRequest.Item> sortedItems = new ArrayList<>(group.items());
            if (sortedItems.stream().anyMatch(item -> item == null || item.variantId() == null
                    || item.quantity() <= 0 || item.quantity() > 10_000)) {
                throw badRequest("Invalid cart item");
            }
            sortedItems.sort(Comparator.comparing(item -> item.variantId().toString()));
            Set<UUID> seenVariants = new HashSet<>();
            List<Line> lines = new ArrayList<>();
            User provider = null;
            int personalizedBoxes = 0;
            int bakeQuantity = 0;
            for (CheckoutRequest.Item item : sortedItems) {
                if (!seenVariants.add(item.variantId())) throw badRequest("Duplicate variant in provider group");
                ProductVariant variant = (lock ? variants.findForUpdateById(item.variantId()) : variants.findById(item.variantId()))
                        .orElseThrow(() -> conflict("VARIANT_UNAVAILABLE variant=" + item.variantId()));
                User owner = variant.getProduct().getProvider();
                if (provider != null && !provider.getId().equals(owner.getId())) {
                    throw badRequest("A group must contain variants from only one provider");
                }
                provider = owner;
                if (variant.getStatus() != VariantStatus.IN_STOCK || variant.getProduct().getStatus() != ProductStatus.ACTIVE
                        || variant.getStockQuantity() < item.quantity()) {
                    throw conflict("STOCK_UNAVAILABLE provider=" + owner.getId() + " variant=" + variant.getId());
                }
                if (variant.getPrice() == null || variant.getPrice().signum() < 0
                        || variant.getPrice().stripTrailingZeros().scale() > 0) {
                    throw conflict("INVALID_PRICE variant=" + variant.getId());
                }
                String personal = normalizePersonalization(item.personalizationText());
                ProductType type = variant.getProduct().getProductType();
                if (personal != null && type != ProductType.BOX_SHELL) {
                    throw badRequest("Personalization is only available for gift boxes");
                }
                if (personal != null) personalizedBoxes += item.quantity();
                long bake = switch (type) {
                    case LOOSE_CAKE -> item.quantity();
                    case BOX_SHELL -> (long) item.quantity() * (variant.getBoxCapacity() == null ? 0 : variant.getBoxCapacity());
                    case GREETING_CARD, ADDON_SERVICE, GIFT_SET -> 0;
                };
                if (bake > Integer.MAX_VALUE - (long) bakeQuantity) throw badRequest("Baking quantity is too large");
                bakeQuantity += (int) bake;
                lines.add(new Line(variant, item.quantity(), (int) bake, personal, BigDecimal.ZERO));
            }
            if (provider == null || !seenProviders.add(provider.getId())) {
                throw badRequest("Only one delivery group per provider is supported");
            }
            if (group.providerId() != null && !provider.getId().equals(group.providerId())) {
                throw badRequest("Provider does not own all variants in the group");
            }
            validateProvider(provider, today);
            if (group.paymentMethod() != PaymentMethod.COD && group.paymentMethod() != PaymentMethod.VIETQR
                    && group.paymentMethod() != PaymentMethod.PAYOS) {
                throw badRequest("Only COD, VIETQR and PAYOS are supported");
            }
            if (group.paymentMethod() == PaymentMethod.COD && group.payInFull()) {
                throw badRequest("payInFull only applies to online payment");
            }
            if (lock && group.paymentMethod() == PaymentMethod.VIETQR && !hasBankDetails(provider)) {
                throw conflict("BANK_ACCOUNT_MISSING provider=" + provider.getId());
            }
            if (group.paymentMethod() == PaymentMethod.PAYOS) {
                payosAccounts.requireReady(provider.getId());
            }
            BigDecimal merchandise = BigDecimal.ZERO;
            BigDecimal personalization = BigDecimal.ZERO;
            List<Line> pricedLines = new ArrayList<>();
            for (Line line : lines) {
                BigDecimal itemPrice = line.variant().getPrice().multiply(BigDecimal.valueOf(line.quantity()));
                BigDecimal fee = line.personalizationText() != null && personalizedBoxes < 5
                        ? PRINT_FEE.multiply(BigDecimal.valueOf(line.quantity())) : BigDecimal.ZERO;
                merchandise = merchandise.add(itemPrice);
                personalization = personalization.add(fee);
                pricedLines.add(new Line(line.variant(), line.quantity(), line.bakeQuantity(), line.personalizationText(), fee));
            }
            String province = normalizeZone(group.province());
            String district = normalizeZone(group.district());
            UUID providerId = provider.getId();
            BigDecimal shipping = shippingRates.findByProviderIdAndProvinceAndDistrict(providerId, province, district)
                    .orElseThrow(() -> conflict("SHIPPING_RATE_MISSING provider=" + providerId
                            + " province=" + province + " district=" + district)).getFee();
            if (shipping.signum() < 0 || shipping.stripTrailingZeros().scale() > 0) {
                throw conflict("INVALID_SHIPPING_RATE provider=" + providerId);
            }
            BigDecimal total = merchandise.add(personalization).add(shipping);
            if (lock && group.paymentMethod() == PaymentMethod.COD && personalizedBoxes > 0) {
                throw badRequest("Personalized orders require online payment");
            }
            if (lock && group.paymentMethod() == PaymentMethod.COD && total.compareTo(COD_LIMIT) >= 0) {
                throw badRequest("Orders of 2,000,000 VND or more require online payment");
            }
            if (group.depositOption() != null && !group.depositOption().equals("FULL")
                    && !group.depositOption().equals("MIN_DEPOSIT")) {
                throw badRequest("Invalid deposit option");
            }
            boolean payInFull = group.payInFull() || "FULL".equals(group.depositOption());
            BigDecimal deposit = group.paymentMethod() == PaymentMethod.COD ? BigDecimal.ZERO
                    : payInFull ? total : total.divide(BigDecimal.valueOf(2), 0, RoundingMode.CEILING);
            if (group.paymentMethod() != PaymentMethod.COD && deposit.signum() <= 0) {
                throw badRequest("Online payment requires a positive amount");
            }
            DailyCapacity capacity = null;
            if (bakeQuantity > 0) {
                LocalDate bakeDate = group.deliveryDate().minusDays(1);
                capacity = (lock ? capacities.findForUpdateByProviderIdAndCapacityDate(providerId, bakeDate)
                        : capacities.findByProviderIdAndCapacityDate(providerId, bakeDate))
                        .orElseThrow(() -> conflict("CAPACITY_MISSING provider=" + providerId + " date=" + bakeDate));
                if (capacity.getReservedQuantity() > capacity.getMaxQuantity() - bakeQuantity) {
                    throw conflict("CAPACITY_FULL provider=" + providerId + " date=" + bakeDate);
                }
            }
            result.add(new Plan(provider, group.deliveryDate(), group.paymentMethod(), pricedLines,
                    merchandise, personalization, shipping, total, deposit, bakeQuantity, capacity));
        }
        return result;
    }

    private User requireCustomer() {
        User user = security.getCurrentUser();
        if (user.getRole() != UserRole.CUSTOMER || user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Active customer account required");
        }
        return user;
    }

    private void validateProvider(User provider, LocalDate today) {
        if (provider.getRole() != UserRole.PROVIDER || provider.getStatus() != UserStatus.ACTIVE
                || !Boolean.TRUE.equals(provider.getIsComplianceApproved())
                || !Boolean.TRUE.equals(provider.getIsSeasonActive())
                || !subscriptions.existsByProviderIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        provider.getId(), SubscriptionStatus.ACTIVE, today, today)) {
            throw conflict("PROVIDER_UNAVAILABLE provider=" + provider.getId());
        }
    }

    private boolean hasBankDetails(User provider) {
        return provider.getBankCode() != null && !provider.getBankCode().isBlank()
                && provider.getBankAccountNumber() != null && !provider.getBankAccountNumber().isBlank()
                && provider.getBankAccountName() != null && !provider.getBankAccountName().isBlank();
    }

    private String normalizePersonalization(String text) {
        if (text == null || text.isBlank()) return null;
        String value = text.trim();
        if (value.length() > 50 || !value.matches("[\\p{L}\\p{N} .,!?'-]+")) {
            throw badRequest("Personalization text may contain letters, numbers and basic punctuation, up to 50 characters");
        }
        return value;
    }

    private String normalizeZone(String zone) {
        if (zone == null || zone.isBlank() || zone.trim().length() > 100) throw badRequest("Invalid shipping zone");
        return zone.trim().toLowerCase(Locale.ROOT);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private record Snap(UUID providerId, UUID variantId, String productName, String variantName, int quantity,
            BigDecimal unitPrice, String personalizationText, BigDecimal personalizationFee) {}

    private record Line(ProductVariant variant, int quantity, int bakeQuantity, String personalizationText,
            BigDecimal personalizationFee) {}

    private record Plan(User provider, LocalDate deliveryDate, PaymentMethod paymentMethod, List<Line> lines,
            BigDecimal merchandise, BigDecimal personalization, BigDecimal shippingFee, BigDecimal total,
            BigDecimal deposit, int bakeQuantity, DailyCapacity capacity) {
        CheckoutPreviewResponse.ProviderPrice preview() {
            return new CheckoutPreviewResponse.ProviderPrice(provider.getId(), provider.getStoreName(), deliveryDate,
                    paymentMethod, lines.stream().map(line -> new CheckoutPreviewResponse.Line(
                            line.variant().getId(), line.variant().getProduct().getName(),
                            line.variant().getVariantName(), line.quantity(), line.variant().getPrice(),
                            line.personalizationFee(), line.variant().getPrice()
                                    .multiply(BigDecimal.valueOf(line.quantity())).add(line.personalizationFee()))).toList(),
                    merchandise, personalization, shippingFee, total, deposit,
                    merchandise.add(personalization), total.divide(BigDecimal.valueOf(2), 0, RoundingMode.CEILING),
                    total.compareTo(COD_LIMIT) < 0 && personalization.signum() == 0);
        }
    }
}
