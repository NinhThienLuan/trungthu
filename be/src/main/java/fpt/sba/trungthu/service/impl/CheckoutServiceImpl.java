package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.policy.CheckoutLeadTime;
import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.request.CreateOrdersCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;
import fpt.sba.trungthu.dto.response.ReservedLineResponse;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.*;
import fpt.sba.trungthu.repository.*;
import fpt.sba.trungthu.service.CheckoutService;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.OrderService;
import fpt.sba.trungthu.entity.Promotion;
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
    private static final BigDecimal THOUSAND = new BigDecimal("1000");

    private final SecurityContextService security;
    private final ProductVariantRepository variants;
    private final ProductRepository products;
    private final GiftSetComponentRepository setComponents;
    private final DailyCapacityRepository capacities;
    private final SubscriptionRepository subscriptions;
    private final OrderService orderService;
    private final InventoryService inventory;
    private final PromotionRepository promotions;

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
                if (line.set() != null) {
                    // BE2 tách set thành các dòng thành phần (sourceSetId) khi giữ hàng
                    reserveLines.add(new ReserveStockCommand.ReserveLine(null, line.quantity(), plan.deliveryDate(),
                            line.set().getId()));
                    continue;
                }
                boolean futureBake = line.variant().getProduct().getProductType() == ProductType.LOOSE_CAKE
                        && CheckoutLeadTime.canBakeToOrder(plan.deliveryDate(), LocalDate.now(VIETNAM));
                reserveLines.add(new ReserveStockCommand.ReserveLine(line.variant().getId(), line.quantity(),
                        plan.deliveryDate(), null, futureBake));
                snaps.add(new Snap(plan.provider().getId(), line.variant().getId(),
                        line.variant().getProduct().getName(), line.variantName(), line.quantity(),
                        line.unitPrice(), line.personalizationText(), line.personalizationFee()));
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
            List<CreateOrdersCommand.ItemSnapshot> items = new ArrayList<>(snaps.stream()
                    .filter(snap -> plan.provider().getId().equals(snap.providerId()))
                    .map(snap -> {
                        ReservedLineResponse held = reserved.stream()
                                .filter(line -> line.sourceSetId() == null && snap.variantId().equals(line.variantId())
                                        && snap.providerId().equals(line.providerId()))
                                .findFirst()
                                .orElseThrow(() -> conflict("Không thể giữ hàng cho sản phẩm đã chọn. Vui lòng thử lại."));
                        return new CreateOrdersCommand.ItemSnapshot(snap.variantId(), snap.productName(),
                                snap.variantName(), snap.quantity(), snap.unitPrice(), held.bakeQuantity(),
                                null, 0, snap.personalizationText(), snap.personalizationFee(),
                                held.stockReservedQuantity());
                    }).toList());
            reserved.stream()
                    .filter(line -> line.sourceSetId() != null && plan.provider().getId().equals(line.providerId()))
                    .map(line -> new CreateOrdersCommand.ItemSnapshot(line.variantId(), line.productName(),
                            line.variantName(), line.quantity(), line.unitPrice(), line.bakeQuantity(),
                            line.sourceSetId(), line.directUnits()))
                    .forEach(items::add);
            BigDecimal list = plan.lines().stream().map(Line::listAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            groups.add(new CreateOrdersCommand.ProviderOrder(plan.provider().getId(), plan.deliveryDate(),
                    capacityId, plan.shippingFee(), plan.deposit(), plan.paymentMethod(),
                    plan.paymentMethod() == PaymentMethod.VIETQR ? orderedAt.plusSeconds(5 * 60 * 60) : null,
                    list, list.subtract(plan.merchandise()).max(BigDecimal.ZERO), items));
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
                ? "" : group.items().stream().map(item -> item == null || item.key() == null ? "" : item.key().toString())
                        .min(String::compareTo).orElse("")));
        for (CheckoutRequest.Group group : sorted) {
            if (group == null || group.items() == null || group.items().isEmpty() || group.items().size() > MAX_ITEMS) {
                throw badRequest("Each provider group must contain 1 to " + MAX_ITEMS + " items");
            }
            if (group.boxes() != null && !group.boxes().isEmpty()) {
                throw badRequest("Custom box combinations are not supported in MVP");
            }
            if (group.deliveryDate() == null) throw badRequest("Vui lòng chọn ngày nhận hàng");
            List<CheckoutRequest.Item> sortedItems = new ArrayList<>(group.items());
            if (sortedItems.stream().anyMatch(item -> item == null
                    || (item.variantId() == null) == (item.setProductId() == null)
                    || item.quantity() <= 0 || item.quantity() > 10_000)) {
                throw badRequest("Invalid cart item");
            }
            long totalQuantity = sortedItems.stream().mapToLong(CheckoutRequest.Item::quantity).sum();
            int minLeadDays = CheckoutLeadTime.requiredDays(totalQuantity);
            if (group.deliveryDate().isBefore(today.plusDays(minLeadDays))) {
                throw badRequest("Đơn từ " + CheckoutLeadTime.BULK_QUANTITY + " sản phẩm cần đặt trước ít nhất "
                        + CheckoutLeadTime.EXTENDED_DAYS + " ngày; đơn ít hơn cần ít nhất "
                        + CheckoutLeadTime.STANDARD_DAYS + " ngày");
            }
            sortedItems.sort(Comparator.comparing(item -> item.key().toString()));
            Set<UUID> seenVariants = new HashSet<>();
            List<Line> lines = new ArrayList<>();
            User provider = null;
            int personalizedBoxes = 0;
            int bakeQuantity = 0;
            for (CheckoutRequest.Item item : sortedItems) {
                if (!seenVariants.add(item.key())) throw badRequest("Duplicate variant in provider group");
                if (item.setProductId() != null) {
                    Product set = products.findById(item.setProductId())
                            .filter(p -> p.getProductType() == ProductType.GIFT_SET && p.getStatus() == ProductStatus.ACTIVE)
                            .orElseThrow(() -> conflict("SET_UNAVAILABLE set=" + item.setProductId()));
                    User owner = set.getProvider();
                    if (provider != null && !provider.getId().equals(owner.getId())) {
                        throw badRequest("A group must contain variants from only one provider");
                    }
                    provider = owner;
                    if (normalizePersonalization(item.personalizationText()) != null) {
                        throw badRequest("Personalization is only available for gift boxes");
                    }
                    Line line = priceSet(set, item.quantity());
                    if (line.bakeQuantity() > Integer.MAX_VALUE - (long) bakeQuantity) {
                        throw badRequest("Baking quantity is too large");
                    }
                    bakeQuantity += line.bakeQuantity();
                    lines.add(line);
                    continue;
                }
                ProductVariant variant = (lock ? variants.findForUpdateById(item.variantId()) : variants.findById(item.variantId()))
                        .orElseThrow(() -> conflict("VARIANT_UNAVAILABLE variant=" + item.variantId()));
                User owner = variant.getProduct().getProvider();
                if (provider != null && !provider.getId().equals(owner.getId())) {
                    throw badRequest("A group must contain variants from only one provider");
                }
                provider = owner;
                boolean stockReady = variant.getStatus() == VariantStatus.IN_STOCK
                        && variant.getProduct().getStatus() == ProductStatus.ACTIVE
                        && variant.getStockQuantity() >= item.quantity();
                boolean futureBake = variant.getProduct().getProductType() == ProductType.LOOSE_CAKE
                        && CheckoutLeadTime.canBakeToOrder(group.deliveryDate(), today)
                        && (variant.getProduct().getStatus() == ProductStatus.ACTIVE
                            || variant.getProduct().getStatus() == ProductStatus.SOLD_OUT)
                        && (variant.getStatus() == VariantStatus.IN_STOCK
                            || variant.getStatus() == VariantStatus.OUT_OF_STOCK);
                if (!stockReady && !futureBake) {
                    if (variant.getProduct().getProductType() == ProductType.LOOSE_CAKE
                            && variant.getStockQuantity() < item.quantity()) {
                        throw conflict("Xưởng " + owner.getStoreName() + " chưa đủ " + variant.getVariantName()
                                + ". Chọn ngày nhận cách ít nhất " + CheckoutLeadTime.EXTENDED_DAYS
                                + " ngày để xưởng nướng theo đơn, hoặc giảm số lượng.");
                    }
                    throw conflict("Sản phẩm " + variant.getProduct().getName()
                            + " không đủ số lượng hoặc không còn nhận đặt. Vui lòng giảm số lượng hoặc chọn sản phẩm khác.");
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
                String contents = boxContents(variant, item.boxContents());
                long bake = bakeFor(variant, item.quantity());
                if (bake > Integer.MAX_VALUE - (long) bakeQuantity) throw badRequest("Baking quantity is too large");
                bakeQuantity += (int) bake;
                BigDecimal amount = variant.getPrice().multiply(BigDecimal.valueOf(item.quantity()));
                lines.add(new Line(variant, null, item.quantity(), (int) bake, personal, BigDecimal.ZERO, amount, amount, null, contents));
            }
            if (provider == null || !seenProviders.add(provider.getId())) {
                throw badRequest("Only one delivery group per provider is supported");
            }
            if (group.providerId() != null && !provider.getId().equals(group.providerId())) {
                throw badRequest("Provider does not own all variants in the group");
            }
            validateProvider(provider, today);
            if (group.paymentMethod() != PaymentMethod.COD && group.paymentMethod() != PaymentMethod.VIETQR) {
                throw badRequest("Only COD and VIETQR are supported");
            }
            if (group.paymentMethod() == PaymentMethod.COD && Boolean.TRUE.equals(group.payInFull())) {
                throw badRequest("payInFull only applies to online payment");
            }
            if (lock && group.paymentMethod() == PaymentMethod.VIETQR && !hasBankDetails(provider)) {
                throw conflict("BANK_ACCOUNT_MISSING provider=" + provider.getId());
            }
            UUID providerId = provider.getId();
            List<Promotion> running = promotions
                    .findByProviderIdAndActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqual(providerId, today, today);
            BigDecimal merchandise = BigDecimal.ZERO;
            BigDecimal personalization = BigDecimal.ZERO;
            List<Line> pricedLines = new ArrayList<>();
            for (Line line : lines) {
                BigDecimal fee = line.personalizationText() != null && personalizedBoxes < 5
                        ? PRINT_FEE.multiply(BigDecimal.valueOf(line.quantity())) : BigDecimal.ZERO;
                Line priced = line.set() != null ? line : promote(line, running);
                merchandise = merchandise.add(priced.amount());
                personalization = personalization.add(fee);
                pricedLines.add(new Line(priced.variant(), priced.set(), priced.quantity(), priced.bakeQuantity(),
                        priced.personalizationText(), fee, priced.amount(), priced.listAmount(), priced.promotion(),
                        priced.contents()));
            }
            // Sàn không thu phí giao hàng
            BigDecimal shipping = BigDecimal.ZERO;
            BigDecimal total = merchandise.add(personalization);
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
            boolean payInFull = Boolean.TRUE.equals(group.payInFull()) || "FULL".equals(group.depositOption());
            BigDecimal deposit = group.paymentMethod() == PaymentMethod.COD ? BigDecimal.ZERO
                    : payInFull ? total : minDeposit(total);
            if (group.paymentMethod() != PaymentMethod.COD && deposit.signum() <= 0) {
                throw badRequest("Online payment requires a positive amount");
            }
            DailyCapacity capacity = null;
            if (bakeQuantity > 0) {
                LocalDate bakeDate = group.deliveryDate().minusDays(1);
                capacity = (lock ? capacities.findForUpdateByProviderIdAndCapacityDate(providerId, bakeDate)
                        : capacities.findByProviderIdAndCapacityDate(providerId, bakeDate))
                        .orElseThrow(() -> conflict("Xưởng chưa mở lịch nướng cho ngày nhận " + group.deliveryDate()));
                if (capacity.getReservedQuantity() > capacity.getMaxQuantity() - bakeQuantity) {
                    throw conflict("Xưởng không đủ suất nướng cho số lượng đã chọn vào ngày nhận "
                            + group.deliveryDate() + ". Vui lòng giảm số lượng hoặc chọn ngày khác.");
                }
            }
            result.add(new Plan(provider, group.deliveryDate(), group.paymentMethod(), pricedLines,
                    merchandise, personalization, shipping, total, deposit, bakeQuantity, capacity));
        }
        return result;
    }

    private static long bakeFor(ProductVariant variant, int quantity) {
        return switch (variant.getProduct().getProductType()) {
            case LOOSE_CAKE -> quantity;
            case BOX_SHELL -> (long) quantity * (variant.getBoxCapacity() == null ? 0 : variant.getBoxCapacity());
            case GREETING_CARD, ADDON_SERVICE, GIFT_SET -> 0;
        };
    }

    /**
     * Giá + số bánh nướng của `quantity` set, tính y như InventoryServiceImpl.expandSet (cùng hệ số chiết khấu,
     * cùng làm tròn từng thành phần) để tổng preview khớp đúng các dòng đơn sau khi giữ hàng.
     */
    private Line priceSet(Product set, int quantity) {
        List<GiftSetComponent> rows = setComponents.findBySetProductId(set.getId());
        GiftSetComponent box = rows.stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .findFirst().orElseThrow(() -> conflict("SET_UNAVAILABLE set=" + set.getId()));
        int setsBefore = box.getQuantity();
        if (setsBefore < quantity) {
            throw conflict("Set quà không đủ số lượng. Vui lòng giảm số lượng hoặc chọn sản phẩm khác.");
        }
        Map<GiftSetComponent, Integer> perSet = new LinkedHashMap<>();
        BigDecimal unitList = BigDecimal.ZERO;
        for (GiftSetComponent row : rows) {
            boolean isBox = row == box;
            if (row.getPerSetQuantity() == null && !isBox && row.getQuantity() % setsBefore != 0) {
                throw conflict("SET_UNAVAILABLE set=" + set.getId());
            }
            int per = row.getPerSetQuantity() != null && row.getPerSetQuantity() > 0 ? row.getPerSetQuantity()
                    : (isBox ? 1 : row.getQuantity() / setsBefore);
            perSet.put(row, per);
            unitList = unitList.add(row.getComponentVariant().getPrice().multiply(BigDecimal.valueOf(per)));
        }
        BigDecimal sale = set.getSalePrice() == null ? null : set.getSalePrice().setScale(0, RoundingMode.DOWN);
        BigDecimal factor = sale == null || unitList.signum() == 0 ? BigDecimal.ONE
                : sale.divide(unitList, 8, RoundingMode.HALF_UP);
        BigDecimal others = BigDecimal.ZERO;
        BigDecimal boxUnit = BigDecimal.ZERO;
        int boxTake = 0;
        BigDecimal list = BigDecimal.ZERO;
        long bake = 0;
        for (Map.Entry<GiftSetComponent, Integer> entry : perSet.entrySet()) {
            int take = entry.getValue() * quantity;
            if (take <= 0) continue;
            ProductVariant component = entry.getKey().getComponentVariant();
            BigDecimal charged = component.getPrice().multiply(factor).setScale(0, RoundingMode.DOWN);
            if (entry.getKey() == box) {
                boxUnit = charged;
                boxTake = take;
            }
            else others = others.add(charged.multiply(BigDecimal.valueOf(take)));
            list = list.add(component.getPrice().setScale(0, RoundingMode.DOWN)
                    .multiply(BigDecimal.valueOf(take)));
            bake += bakeFor(component, take);
        }
        // Như expandSet: phần lệch do làm tròn dồn vào vỏ hộp để tổng = salePrice × số set
        if (sale != null) {
            boxUnit = sale.multiply(BigDecimal.valueOf(quantity)).subtract(others);
            if (quantity > 1) boxUnit = boxUnit.divide(BigDecimal.valueOf(quantity), 0, RoundingMode.HALF_UP);
        }
        BigDecimal amount = others.add(boxUnit.multiply(BigDecimal.valueOf(boxTake)));
        if (bake > Integer.MAX_VALUE) throw badRequest("Baking quantity is too large");
        return new Line(null, set, quantity, (int) bake, null, BigDecimal.ZERO, amount, list, null, null);
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

    /**
     * Khuyến mãi giảm nhiều nhất cho dòng lẻ. Đơn giá sau giảm làm tròn xuống đồng chẵn (có lợi cho khách)
     * để tổng đơn = đơn giá × số lượng, không ra số lẻ.
     */
    private static Line promote(Line line, List<Promotion> running) {
        BigDecimal list = line.variant().getPrice().multiply(BigDecimal.valueOf(line.quantity()));
        Promotion best = null;
        BigDecimal bestDiscount = BigDecimal.ZERO;
        for (Promotion promotion : running) {
            if (!promotion.covers(line.variant().getProduct())) continue;
            BigDecimal discount = promotion.discountFor(line.variant().getPrice(), line.quantity());
            if (discount.compareTo(bestDiscount) > 0) {
                best = promotion;
                bestDiscount = discount;
            }
        }
        if (best == null) return line;
        BigDecimal unit = list.subtract(bestDiscount).divide(BigDecimal.valueOf(line.quantity()), 0, RoundingMode.FLOOR);
        return new Line(line.variant(), null, line.quantity(), line.bakeQuantity(), line.personalizationText(),
                line.personalizationFee(), unit.multiply(BigDecimal.valueOf(line.quantity())), list, best, line.contents());
    }

    /**
     * Hộp tự phối: mỗi ô một vị bánh lẻ đang bán của cùng xưởng, đủ đúng số ô của hộp.
     * Giá và số bánh nướng vẫn theo hộp (BOX_SHELL = hộp đã gồm bánh), nên vị không đổi giá.
     * Trả nhãn "Thập cẩm 150 g ×2, Đậu xanh 150 g ×2" hoặc null nếu không phải hộp tự phối.
     */
    private String boxContents(ProductVariant box, List<UUID> slots) {
        if (slots == null || slots.isEmpty()) return null;
        if (box.getProduct().getProductType() != ProductType.BOX_SHELL || box.getBoxCapacity() == null
                || slots.size() != box.getBoxCapacity()) {
            throw badRequest("Hộp tự phối cần chọn đủ " + box.getBoxCapacity() + " vị bánh");
        }
        Map<UUID, ProductVariant> cakes = new HashMap<>();
        variants.findAllById(new HashSet<>(slots)).forEach(v -> cakes.put(v.getId(), v));
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (UUID id : slots) {
            ProductVariant cake = cakes.get(id);
            if (cake == null || cake.getProduct().getProductType() != ProductType.LOOSE_CAKE
                    || cake.getProduct().getStatus() != ProductStatus.ACTIVE
                    || !cake.getProduct().getProvider().getId().equals(box.getProduct().getProvider().getId())) {
                throw badRequest("Vị bánh trong hộp phải là bánh lẻ đang bán của cùng xưởng");
            }
            counts.merge(cake.getProduct().getName() + " " + cake.getVariantName(), 1, Integer::sum);
        }
        return counts.entrySet().stream().map(e -> e.getKey() + " ×" + e.getValue())
                .collect(java.util.stream.Collectors.joining(", "));
    }

    /** Cọc tối thiểu 50%, làm tròn lên nghìn đồng cho dễ chuyển khoản (không vượt tổng) */
    static BigDecimal minDeposit(BigDecimal total) {
        BigDecimal half = total.divide(BigDecimal.valueOf(2), 0, RoundingMode.CEILING);
        return half.divide(THOUSAND, 0, RoundingMode.CEILING).multiply(THOUSAND).min(total);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private record Snap(UUID providerId, UUID variantId, String productName, String variantName, int quantity,
            BigDecimal unitPrice, String personalizationText, BigDecimal personalizationFee) {}

    /** variant = dòng lẻ; set = dòng set quà (variant null). amount = tiền hàng, listAmount = theo giá gốc */
    private record Line(ProductVariant variant, Product set, int quantity, int bakeQuantity,
            String personalizationText, BigDecimal personalizationFee, BigDecimal amount, BigDecimal listAmount,
            Promotion promotion, String contents) {
        BigDecimal unitPrice() {
            return amount.divide(BigDecimal.valueOf(quantity), 2, RoundingMode.HALF_UP);
        }

        UUID id() {
            return set != null ? set.getId() : variant.getId();
        }

        String productName() {
            return set != null ? set.getName() : variant.getProduct().getName();
        }

        String variantName() {
            if (set != null) return "Set quà";
            // Hộp tự phối: lưu vị từng ô ngay trong tên phân loại của dòng đơn để xưởng biết đóng hộp
            String name = contents == null ? variant.getVariantName() : variant.getVariantName() + " · " + contents;
            return name.length() > 255 ? name.substring(0, 254) + "…" : name;
        }
    }

    private record Plan(User provider, LocalDate deliveryDate, PaymentMethod paymentMethod, List<Line> lines,
            BigDecimal merchandise, BigDecimal personalization, BigDecimal shippingFee, BigDecimal total,
            BigDecimal deposit, int bakeQuantity, DailyCapacity capacity) {
        CheckoutPreviewResponse.ProviderPrice preview() {
            return new CheckoutPreviewResponse.ProviderPrice(provider.getId(), provider.getStoreName(), deliveryDate,
                    paymentMethod, lines.stream().map(line -> new CheckoutPreviewResponse.Line(
                            line.id(), line.productName(), line.variantName(), line.quantity(),
                            line.unitPrice(), line.personalizationFee(), line.amount().add(line.personalizationFee()),
                            line.listAmount(), line.promotion() == null ? null : line.promotion().label())).toList(),
                    merchandise, personalization, shippingFee, total, deposit,
                    merchandise.add(personalization), minDeposit(total),
                    total.compareTo(COD_LIMIT) < 0 && personalization.signum() == 0,
                    lines.stream().map(Line::listAmount).reduce(BigDecimal.ZERO, BigDecimal::add).subtract(merchandise));
        }
    }
}
