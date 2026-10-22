package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.exception.InventoryConflictException;
import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.AddSetComponentRequest;
import fpt.sba.trungthu.dto.request.SaveSetCompositionRequest;
import fpt.sba.trungthu.dto.request.StockSetRequest;
import fpt.sba.trungthu.dto.request.UpdateSetComponentRequest;
import fpt.sba.trungthu.dto.response.InventoryAuditResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.VariantStatsResponse;
import fpt.sba.trungthu.dto.ProductView;
import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.SetInventoryAudit;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.repository.SetInventoryAuditRepository;
import fpt.sba.trungthu.entity.InventoryAudit;
import fpt.sba.trungthu.service.event.StockChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GiftSetService {

    private static final Set<OrderStatus> BLOCKING = EnumSet.of(
            OrderStatus.CONFIRMED, OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED);

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final GiftSetComponentRepository componentRepository;
    private final InventoryAuditRepository auditRepository;
    private final SetInventoryAuditRepository setAuditRepository;
    private final OrderItemRepository orderItemRepository;
    private final PendingChannelRelease channelRelease;
    private final ProductSaleStatusService saleStatus;
    private final ApplicationEventPublisher events;

    @Transactional
    public ProductResponse saveComposition(String providerEmail, UUID productId, SaveSetCompositionRequest request) {
        Product set = ownedSet(providerEmail, productId);
        ProductVariant box = stockComponent(providerEmail, request.getBox().getVariantId());
        if (box.getProduct().getProductType() != ProductType.BOX_SHELL || box.getBoxCapacity() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hộp bánh không hợp lệ");
        }
        if (request.getBox().getQuantity() != 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mỗi set dùng đúng một hộp");
        }
        List<SaveSetCompositionRequest.Line> cakes = request.getCakes();
        Set<UUID> seen = new HashSet<>();
        int perSetCakes = 0;
        Map<UUID, ProductVariant> cakeVariants = new LinkedHashMap<>();
        for (SaveSetCompositionRequest.Line cake : cakes) {
            if (!seen.add(cake.getVariantId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mỗi loại bánh chỉ chọn một lần");
            }
            ProductVariant variant = stockComponent(providerEmail, cake.getVariantId());
            if (variant.getProduct().getProductType() != ProductType.LOOSE_CAKE) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phần bánh phải là bánh lẻ");
            }
            cakeVariants.put(cake.getVariantId(), variant);
            perSetCakes += cake.getQuantity();
        }
        if (perSetCakes != box.getBoxCapacity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Tổng số bánh trong một set phải bằng sức chứa hộp (" + box.getBoxCapacity() + ")");
        }
        List<GiftSetComponent> existing = componentRepository.findBySetProductId(set.getId());
        if (existing.stream().anyMatch(row -> row.getQuantity() > 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Hãy trả hàng về kho trước khi đổi công thức");
        }
        for (GiftSetComponent row : new ArrayList<>(existing)) {
            componentRepository.delete(row);
        }
        componentRepository.flush();
        saveRecipeLine(set, box, 1);
        for (SaveSetCompositionRequest.Line cake : cakes) {
            saveRecipeLine(set, cakeVariants.get(cake.getVariantId()), cake.getQuantity());
        }
        return reload(set);
    }

    @Transactional
    public ProductResponse stockSets(String providerEmail, UUID productId, StockSetRequest request) {
        Product set = ownedSet(providerEmail, productId);
        List<GiftSetComponent> rows = componentRepository.findBySetProductId(set.getId());
        GiftSetComponent box = rows.stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hãy lưu công thức trước khi nhập hàng"));
        Map<UUID, GiftSetComponent> cakes = new LinkedHashMap<>();
        for (GiftSetComponent row : rows) {
            if (row.getComponentVariant().getProduct().getProductType() == ProductType.LOOSE_CAKE) {
                cakes.put(row.getComponentVariant().getId(), row);
            }
        }
        if (cakes.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Công thức chưa có bánh");
        }
        int setCount = request.getSetCount();
        if (set.getStatus() == ProductStatus.DRAFT) {
            replaceOpeningSets(set, box, cakes.values(), setCount);
            return reload(set);
        }
        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lý do nhập là bắt buộc");
        }
        pack(set, box.getComponentVariant(), setCount, true);
        for (GiftSetComponent cake : cakes.values()) {
            pack(set, cake.getComponentVariant(), Math.multiplyExact(cake.getPerSetQuantity(), setCount), true);
        }
        recordSetMovement(set, InventoryAuditType.INBOUND_IMPORT, setCount, request.getReason().trim());
        assertSaleBelowList(set);
        return reload(set);
    }

    @Transactional
    public ProductResponse adjustSets(String providerEmail, UUID productId, AdjustStockRequest request) {
        if (request.getType() != InventoryAuditType.ADJUSTMENT_BROKEN
                && request.getType() != InventoryAuditType.ADJUSTMENT_EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Adjustment type must be ADJUSTMENT_BROKEN or ADJUSTMENT_EXPIRED");
        }
        Product set = ownedSet(providerEmail, productId);
        if (set.getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đang nháp, không trừ kho");
        }
        int sets = request.getQuantity();
        if (sets > assembledSets(set)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đủ set để trừ");
        }
        for (GiftSetComponent row : componentRepository.findBySetProductId(set.getId())) {
            int perSet = row.getPerSetQuantity() == null ? 0 : row.getPerSetQuantity();
            shrinkPacked(row, Math.multiplyExact(perSet, sets), request.getType());
        }
        recordSetMovement(set, request.getType(), -sets, request.getReason().trim());
        saleStatus.refresh(set.getId());
        return reload(set);
    }

    @Transactional
    public ProductResponse discontinue(String providerEmail, UUID productId) {
        Product set = ownedSet(providerEmail, productId);
        if (set.getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm chưa đăng bán");
        }
        List<OrderItem> touching = orderItemRepository.findForSet(set.getId());
        if (touching.stream().anyMatch(item -> BLOCKING.contains(item.getOrderBatch().getOrder().getOrderStatus()))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Không hủy bán khi còn đơn set đang xác nhận, đã cọc hoặc chờ nướng");
        }
        channelRelease.drop(touching.stream()
                .filter(item -> item.getOrderBatch().getOrder().getOrderStatus() == OrderStatus.PENDING_DEPOSIT)
                .toList());
        int before = assembledSets(set);
        for (GiftSetComponent row : componentRepository.findBySetProductId(set.getId())) {
            if (row.getQuantity() > 0) {
                writeOffPacked(row);
            }
        }
        if (before > 0) {
            recordSetMovement(set, InventoryAuditType.TERMINATE_CLEAR, -before, "Hủy bán set");
        }
        saleStatus.refresh(set.getId());
        return reload(set);
    }

    @Transactional(readOnly = true)
    public VariantStatsResponse stats(String providerEmail, UUID productId) {
        Product set = ownedSet(providerEmail, productId);
        long inbound = Math.max(0, setAuditRepository.sumDelta(set.getId(), InventoryAuditType.INBOUND_IMPORT));
        long broken = Math.abs(setAuditRepository.sumDelta(set.getId(), InventoryAuditType.ADJUSTMENT_BROKEN));
        long expired = Math.abs(setAuditRepository.sumDelta(set.getId(), InventoryAuditType.ADJUSTMENT_EXPIRED));
        long terminateClear = Math.abs(setAuditRepository.sumDelta(set.getId(), InventoryAuditType.TERMINATE_CLEAR));
        long awaitingPayment = orderItemRepository.sumSetQuantityByStatuses(set.getId(), EnumSet.of(
                OrderStatus.PENDING_DEPOSIT, OrderStatus.CONFIRMED));
        long soldQuantity = orderItemRepository.sumSetQuantityByStatuses(set.getId(), EnumSet.of(
                OrderStatus.DEPOSITED, OrderStatus.BAKING_QUEUED, OrderStatus.DELIVERING, OrderStatus.COMPLETED));
        long cancelled = orderItemRepository.sumSetQuantityByStatuses(set.getId(), EnumSet.of(OrderStatus.CANCELLED));
        long onHand = assembledSets(set);
        long discrepancy = inbound - broken - expired - terminateClear - soldQuantity - awaitingPayment - onHand;
        return VariantStatsResponse.builder()
                .inbound(inbound)
                .looseOnHand(onHand)
                .inSet(0)
                .onHand(onHand)
                .broken(broken)
                .expired(expired)
                .terminateClear(terminateClear)
                .sold(soldQuantity)
                .awaitingPayment(awaitingPayment)
                .cancelled(cancelled)
                .discrepancy(discrepancy)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<InventoryAuditResponse> audits(String providerEmail, UUID productId, Pageable pageable) {
        Product set = ownedSet(providerEmail, productId);
        return PageResponse.from(setAuditRepository.findBySetProductId(set.getId(), pageable),
                audit -> InventoryAuditResponse.builder()
                        .id(audit.getId())
                        .type(audit.getAuditType())
                        .quantityDelta(audit.getQuantityDelta())
                        .stockAfter(audit.getStockAfter())
                        .reason(audit.getReason())
                        .createdAt(audit.getCreatedAt())
                        .createdBy(audit.getCreatedBy())
                        .build());
    }

    @Transactional
    public ProductResponse releaseComposition(String providerEmail, UUID productId) {
        Product set = ownedSet(providerEmail, productId);
        List<GiftSetComponent> rows = new ArrayList<>(componentRepository.findBySetProductId(set.getId()));
        if (rows.stream().noneMatch(row -> row.getQuantity() > 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Set chưa có hàng để trả");
        }
        int released = assembledSets(set);
        for (GiftSetComponent row : rows) {
            if (row.getQuantity() > 0) {
                clearPacked(row);
            }
        }
        recordSetMovement(set, InventoryAuditType.INBOUND_IMPORT, -released, "Hoàn tác nhập kho");
        return reload(set);
    }

    @Transactional
    public ProductResponse clearComposition(String providerEmail, UUID productId) {
        Product set = ownedSet(providerEmail, productId);
        if (set.getStatus() != ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ hoàn tác công thức khi sản phẩm còn là bản nháp");
        }
        List<GiftSetComponent> rows = new ArrayList<>(componentRepository.findBySetProductId(set.getId()));
        if (rows.stream().anyMatch(row -> row.getQuantity() > 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hãy hoàn tác nhập kho trước khi hoàn tác công thức");
        }
        for (GiftSetComponent row : rows) {
            componentRepository.delete(row);
        }
        return reload(set);
    }

    @Transactional
    public ProductResponse addComponent(String providerEmail, UUID productId, AddSetComponentRequest request) {
        Product set = ownedSet(providerEmail, productId);
        ProductVariant component = stockComponent(providerEmail, request.getVariantId());
        boolean direct = "DIRECT".equals(request.getSource());
        pack(set, component, request.getQuantity(), direct);
        assertSaleBelowList(set);
        return reload(set);
    }

    @Transactional
    public ProductResponse updateComponent(String providerEmail, UUID productId, UUID componentId,
            UpdateSetComponentRequest request) {
        Product set = ownedSet(providerEmail, productId);
        GiftSetComponent component = componentRepository.findById(componentId)
                .filter(row -> row.getSetProduct().getId().equals(set.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Set component not found"));
        int target = request.getQuantity();
        int current = component.getQuantity();
        if (target > current) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Add quantity with STOCK or DIRECT");
        }
        if (target < current) {
            remove(component, current - target);
        }
        assertSaleBelowList(set);
        saleStatus.refresh(set.getId());
        return reload(set);
    }

    @Transactional
    public void releasePacked(ProductVariant variant) {
        for (GiftSetComponent row : componentRepository.findByComponentVariantId(variant.getId())) {
            remove(row, row.getQuantity());
            assertSaleBelowList(row.getSetProduct());
            saleStatus.refresh(row.getSetProduct().getId());
        }
    }

    public int assembledSets(Product set) {
        return componentRepository.findBySetProductId(set.getId()).stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .mapToInt(GiftSetComponent::getQuantity)
                .sum();
    }

    public BigDecimal listPrice(Product set) {
        List<GiftSetComponent> rows = componentRepository.findBySetProductId(set.getId());
        if (rows.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = BigDecimal.ZERO;
        for (GiftSetComponent row : rows) {
            int perSet = row.getPerSetQuantity() == null ? 0 : row.getPerSetQuantity();
            if (perSet <= 0) {
                return BigDecimal.ZERO;
            }
            total = total.add(row.getComponentVariant().getPrice().multiply(BigDecimal.valueOf(perSet)));
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal salePrice(Product set) {
        BigDecimal list = listPrice(set);
        if (set.getSalePrice() == null || list.signum() <= 0 || set.getSalePrice().compareTo(list) >= 0) {
            return list;
        }
        return set.getSalePrice().setScale(2, RoundingMode.HALF_UP);
    }

    private void assertSaleBelowList(Product set) {
        if (set.getSalePrice() == null) {
            return;
        }
        BigDecimal list = listPrice(set);
        if (list.signum() <= 0 || set.getSalePrice().compareTo(list) >= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Giá chiết khấu phải nhỏ hơn giá gốc. Hãy sửa giá bán trước khi đổi thành phần");
        }
    }

    private void replaceOpeningSets(Product set, GiftSetComponent box, Collection<GiftSetComponent> cakes,
            int setCount) {
        for (GiftSetComponent row : componentRepository.findBySetProductId(set.getId())) {
            if (row.getQuantity() > 0) {
                clearPacked(row);
            }
        }
        setAuditRepository.deleteBySetProductId(set.getId());
        setAuditRepository.flush();
        pack(set, box.getComponentVariant(), setCount, true);
        for (GiftSetComponent cake : cakes) {
            pack(set, cake.getComponentVariant(), Math.multiplyExact(cake.getPerSetQuantity(), setCount), true);
        }
        recordSetMovement(set, InventoryAuditType.INBOUND_IMPORT, setCount, "Opening balance");
        assertSaleBelowList(set);
    }

    private void saveRecipeLine(Product set, ProductVariant component, int perSet) {
        componentRepository.save(GiftSetComponent.builder()
                .setProduct(set)
                .componentVariant(component)
                .perSetQuantity(perSet)
                .quantity(0)
                .directQuantity(0)
                .build());
    }

    private void clearPacked(GiftSetComponent row) {
        ProductVariant variant = row.getComponentVariant();
        int direct = row.getDirectQuantity() == null ? 0 : row.getDirectQuantity();
        int loose = row.getQuantity() - direct;
        row.setQuantity(0);
        row.setDirectQuantity(0);
        componentRepository.flush();
        if (direct > 0) {
            auditInbound(variant, -direct, "Removed direct set stock");
        }
        if (loose > 0) {
            giveLoose(variant, loose);
        }
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
        saleStatus.refresh(row.getSetProduct().getId());
    }

    private void pack(Product set, ProductVariant component, int quantity, boolean direct) {
        ProductType type = component.getProduct().getProductType();
        List<GiftSetComponent> rows = componentRepository.findBySetProductId(set.getId());
        boolean otherBox = rows.stream().anyMatch(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL
                && !row.getComponentVariant().getId().equals(component.getId()));
        if (type == ProductType.BOX_SHELL && otherBox) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A set keeps a single box");
        }
        if (!direct) {
            takeLoose(component, quantity);
        }
        GiftSetComponent row = componentRepository
                .findBySetProductIdAndComponentVariantId(set.getId(), component.getId())
                .orElseGet(() -> GiftSetComponent.builder().setProduct(set).componentVariant(component)
                        .perSetQuantity(quantity).quantity(0).directQuantity(0).build());
        row.setQuantity(row.getQuantity() + quantity);
        if (direct) {
            row.setDirectQuantity(row.getDirectQuantity() + quantity);
        }
        componentRepository.saveAndFlush(row);
        if (direct) {
            auditInbound(component, quantity, "Imported straight into the set");
        }
        events.publishEvent(new StockChangedEvent(component.getId()));
        saleStatus.refresh(component.getProduct().getId());
        saleStatus.refresh(set.getId());
    }

    private void remove(GiftSetComponent row, int quantity) {
        ProductVariant variant = row.getComponentVariant();
        int direct = Math.min(quantity, row.getDirectQuantity());
        int loose = quantity - direct;
        int left = row.getQuantity() - quantity;
        if (left == 0) {
            componentRepository.delete(row);
        } else {
            row.setQuantity(left);
            row.setDirectQuantity(row.getDirectQuantity() - direct);
        }
        componentRepository.flush();
        if (direct > 0) {
            auditInbound(variant, -direct, "Removed direct set stock");
        }
        if (loose > 0) {
            giveLoose(variant, loose);
        }
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
        saleStatus.refresh(row.getSetProduct().getId());
    }

    private void auditInbound(ProductVariant variant, int delta, String reason) {
        int loose = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        int inSet = (int) componentRepository.sumQuantityByComponentVariantId(variant.getId());
        auditRepository.save(InventoryAudit.builder()
                .variant(variant)
                .provider(variant.getProduct().getProvider())
                .auditType(InventoryAuditType.INBOUND_IMPORT)
                .quantityDelta(delta)
                .stockAfter(loose + inSet)
                .reason(reason)
                .build());
    }

    private ProductVariant stockComponent(String providerEmail, UUID variantId) {
        ProductVariant variant = variantRepository.findById(variantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
        if (!variant.getProduct().getProvider().getEmail().equals(providerEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found");
        }
        ProductType type = variant.getProduct().getProductType();
        if (type != ProductType.LOOSE_CAKE && type != ProductType.BOX_SHELL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only loose cakes and boxes can go into a set");
        }
        ProductStatus componentStatus = variant.getProduct().getStatus();
        if (componentStatus == ProductStatus.ARCHIVED || componentStatus == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Chỉ đưa sản phẩm đang bán hoặc hết hàng vào set");
        }
        return variant;
    }

    private void takeLoose(ProductVariant variant, int quantity) {
        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        if (quantity > stock) {
            throw new InventoryConflictException("INSUFFICIENT_STOCK", variant.getProduct().getProvider().getId(),
                    variant.getId(), null);
        }
        int after = stock - quantity;
        variant.setStockQuantity(after);
        if (after == 0 && variant.getStatus() == VariantStatus.IN_STOCK) {
            variant.setStatus(VariantStatus.OUT_OF_STOCK);
        }
    }

    private void giveLoose(ProductVariant variant, int quantity) {
        int after = (variant.getStockQuantity() == null ? 0 : variant.getStockQuantity()) + quantity;
        variant.setStockQuantity(after);
        if (after > 0) {
            variant.setStatus(VariantStatus.IN_STOCK);
        }
    }

    private void writeOffPacked(GiftSetComponent row) {
        int pieces = row.getQuantity();
        if (pieces <= 0) {
            return;
        }
        ProductVariant variant = row.getComponentVariant();
        row.setQuantity(0);
        row.setDirectQuantity(0);
        componentRepository.flush();
        recordVariantMovement(variant, InventoryAuditType.TERMINATE_CLEAR, pieces, "Hủy bán set");
        int loose = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        if (loose == 0 && variant.getStatus() == VariantStatus.IN_STOCK) {
            variant.setStatus(VariantStatus.OUT_OF_STOCK);
        }
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
    }

    private void shrinkPacked(GiftSetComponent row, int pieces, InventoryAuditType type) {
        if (pieces <= 0) {
            return;
        }
        if (pieces > row.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không đủ thành phần trong set");
        }
        ProductVariant variant = row.getComponentVariant();
        int direct = Math.min(pieces, row.getDirectQuantity() == null ? 0 : row.getDirectQuantity());
        row.setQuantity(row.getQuantity() - pieces);
        row.setDirectQuantity((row.getDirectQuantity() == null ? 0 : row.getDirectQuantity()) - direct);
        componentRepository.flush();
        recordVariantMovement(variant, type, pieces, "Hao hụt set");
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
    }

    private void recordVariantMovement(ProductVariant variant, InventoryAuditType type, int pieces, String reason) {
        int loose = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        int inSet = (int) componentRepository.sumQuantityByComponentVariantId(variant.getId());
        auditRepository.save(InventoryAudit.builder()
                .variant(variant)
                .provider(variant.getProduct().getProvider())
                .auditType(type)
                .quantityDelta(-pieces)
                .stockAfter(loose + inSet)
                .reason(reason)
                .build());
    }

    private void recordSetMovement(Product set, InventoryAuditType type, int delta, String reason) {
        setAuditRepository.save(SetInventoryAudit.builder()
                .setProduct(set)
                .provider(set.getProvider())
                .auditType(type)
                .quantityDelta(delta)
                .stockAfter(assembledSets(set))
                .reason(reason)
                .build());
    }

    private int boxQuantity(List<GiftSetComponent> rows) {
        return rows.stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .mapToInt(GiftSetComponent::getQuantity)
                .sum();
    }

    private Product ownedSet(String providerEmail, UUID productId) {
        Product product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (product.getProductType() != ProductType.GIFT_SET) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Components belong on a gift set");
        }
        if (product.getStatus() == ProductStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ, không sửa set");
        }
        return product;
    }

    private ProductResponse reload(Product set) {
        return ProductResponse.fromEntity(productRepository.findById(set.getId()).orElseThrow(), ProductView.PROVIDER);
    }
}
