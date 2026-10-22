package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.exception.InventoryConflictException;
import fpt.sba.trungthu.common.mapper.ProductMapper;
import fpt.sba.trungthu.dto.request.AdjustStockRequest;
import fpt.sba.trungthu.dto.request.ImportStockRequest;
import fpt.sba.trungthu.dto.request.ReleaseStockCommand;
import fpt.sba.trungthu.dto.request.ReserveStockCommand;
import fpt.sba.trungthu.dto.response.InventoryAuditResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.dto.response.ReservedLineResponse;
import fpt.sba.trungthu.entity.DailyCapacity;
import fpt.sba.trungthu.entity.GiftSetComponent;
import fpt.sba.trungthu.entity.InventoryAudit;
import fpt.sba.trungthu.entity.OrderItem;
import fpt.sba.trungthu.entity.Product;
import fpt.sba.trungthu.entity.ProductVariant;
import fpt.sba.trungthu.entity.enumeration.InventoryAuditType;
import fpt.sba.trungthu.entity.enumeration.ProductStatus;
import fpt.sba.trungthu.entity.enumeration.ProductType;
import fpt.sba.trungthu.entity.enumeration.VariantStatus;
import fpt.sba.trungthu.repository.DailyCapacityRepository;
import fpt.sba.trungthu.repository.GiftSetComponentRepository;
import fpt.sba.trungthu.repository.InventoryAuditRepository;
import fpt.sba.trungthu.repository.OrderItemRepository;
import fpt.sba.trungthu.repository.ProductRepository;
import fpt.sba.trungthu.repository.ProductVariantRepository;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.event.StockChangedEvent;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.IllegalTransactionStateException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryAuditRepository auditRepository;
    private final OrderItemRepository orderItemRepository;
    private final DailyCapacityRepository capacityRepository;
    private final GiftSetComponentRepository componentRepository;
    private final ProductMapper productMapper;
    private final EntityManager entityManager;
    private final ApplicationEventPublisher events;
    private final ProductSaleStatusService saleStatus;

    @Override
    @Transactional
    public void recordOpeningStock(ProductVariant variant, int quantity) {
        if (quantity <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tồn mở đầu phải lớn hơn 0");
        }
        variant.setStockQuantity(quantity);
        variant.setStatus(VariantStatus.IN_STOCK);
        audit(variant, InventoryAuditType.INBOUND_IMPORT, quantity, quantity, "Opening balance");
        if (variant.getId() != null) {
            events.publishEvent(new StockChangedEvent(variant.getId()));
            saleStatus.refresh(variant.getProduct().getId());
        }
    }

    @Override
    @Transactional
    public void replaceOpeningStock(ProductVariant variant, int quantity) {
        if (variant.getProduct().getStatus() != ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Chỉ sửa số lượng khởi điểm khi sản phẩm còn là bản nháp");
        }
        if (componentRepository.sumQuantityByComponentVariantId(variant.getId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phân loại đang nằm trong set");
        }
        auditRepository.deleteByVariantId(variant.getId());
        auditRepository.flush();
        recordOpeningStock(variant, quantity);
    }

    @Override
    @Transactional
    public ProductVariantResponse importStock(String providerEmail, UUID productId, UUID variantId,
            ImportStockRequest request) {
        ProductVariant variant = ownedVariant(providerEmail, productId, variantId);
        if (variant.getProduct().getProductType() == ProductType.GIFT_SET) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Gift set stock comes from the box packed into it");
        }
        if (variant.getProduct().getStatus() == ProductStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ, không nhập kho");
        }
        if (variant.getProduct().getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Sản phẩm đang nháp, hãy sửa số lượng bán lẻ khởi điểm");
        }
        int quantity = request.getQuantity();
        int after = variant.getStockQuantity() + quantity;
        variant.setStockQuantity(after);
        variant.setStatus(VariantStatus.IN_STOCK);
        audit(variant, InventoryAuditType.INBOUND_IMPORT, quantity, after, request.getReason().trim());
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
        return productMapper.toVariantResponse(variant, true);
    }

    @Override
    @Transactional
    public ProductVariantResponse adjust(String providerEmail, UUID productId, UUID variantId,
            AdjustStockRequest request) {
        if (request.getType() != InventoryAuditType.ADJUSTMENT_BROKEN
                && request.getType() != InventoryAuditType.ADJUSTMENT_EXPIRED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Adjustment type must be ADJUSTMENT_BROKEN or ADJUSTMENT_EXPIRED");
        }
        ProductVariant variant = ownedVariant(providerEmail, productId, variantId);
        if (variant.getProduct().getProductType() == ProductType.GIFT_SET) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Gift set stock comes from the box packed into it");
        }
        if (variant.getProduct().getStatus() == ProductStatus.ARCHIVED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đã lưu trữ, không điều chỉnh kho");
        }
        if (variant.getProduct().getStatus() == ProductStatus.DRAFT) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Sản phẩm đang nháp, không trừ kho");
        }
        int stock = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        if (request.getQuantity() > stock) {
            throw new InventoryConflictException("INSUFFICIENT_STOCK", variant.getProduct().getProvider().getId(),
                    variant.getId(), null);
        }
        int after = stock - request.getQuantity();
        variant.setStockQuantity(after);
        if (after == 0 && variant.getStatus() == VariantStatus.IN_STOCK) {
            variant.setStatus(VariantStatus.OUT_OF_STOCK);
        }
        audit(variant, request.getType(), -request.getQuantity(), after, request.getReason().trim());
        events.publishEvent(new StockChangedEvent(variant.getId()));
        saleStatus.refresh(variant.getProduct().getId());
        return productMapper.toVariantResponse(variant, true);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InventoryAuditResponse> audits(String providerEmail, UUID productId, UUID variantId,
            Pageable pageable) {
        ownedVariant(providerEmail, productId, variantId);
        return PageResponse.from(auditRepository.findByVariantId(variantId, pageable),
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

    @Override
    @Transactional(propagation = Propagation.MANDATORY, rollbackFor = Exception.class)
    public List<ReservedLineResponse> reserve(ReserveStockCommand command) {
        requireWritableTransaction();
        List<ReserveStockCommand.ReserveLine> lines = normalizeReserve(command);
        Map<UUID, ProductVariant> preview = loadVariants(
                lines.stream().map(ReserveStockCommand.ReserveLine::variantId).filter(java.util.Objects::nonNull)
                        .distinct().toList());
        Map<UUID, Integer> stockDemand = new LinkedHashMap<>();
        Map<CapacityKey, Integer> bakeDemand = new LinkedHashMap<>();
        List<ReservedLineResponse> reserved = new ArrayList<>();
        Map<UUID, Product> lockedSets = lockSets(lines);
        for (ReserveStockCommand.ReserveLine line : lines) {
            if (line.setProductId() != null) {
                expandSet(lockedSets.get(line.setProductId()), line, reserved, bakeDemand);
                continue;
            }
            ProductVariant variant = preview.get(line.variantId());
            Product product = variant.getProduct();
            int bake = bakeQuantity(product.getProductType(), variant, line.quantity());
            stockDemand.merge(variant.getId(), line.quantity(), Integer::sum);
            LocalDate bakeDate = line.deliveryDate().minusDays(1);
            if (bake > 0) {
                CapacityKey key = new CapacityKey(product.getProvider().getId(), bakeDate);
                bakeDemand.merge(key, bake, Integer::sum);
            }
            reserved.add(new ReservedLineResponse(variant.getId(), product.getProvider().getId(), product.getName(),
                    variant.getVariantName(), variant.getPrice(), line.quantity(), bake, null, bakeDate));
        }
        entityManager.flush();
        entityManager.clear();
        List<CapacityKey> capacityOrder = bakeDemand.keySet().stream()
                .sorted(Comparator.comparing(CapacityKey::providerId).thenComparing(CapacityKey::bakeDate))
                .toList();
        Map<CapacityKey, UUID> capacityIds = new LinkedHashMap<>();
        for (CapacityKey key : capacityOrder) {
            int updated = entityManager.createQuery("""
                    UPDATE DailyCapacity c
                    SET c.reservedQuantity = c.reservedQuantity + :bake
                    WHERE c.provider.id = :providerId AND c.capacityDate = :bakeDate
                      AND c.reservedQuantity + :bake <= c.maxQuantity
                    """)
                    .setParameter("bake", bakeDemand.get(key))
                    .setParameter("providerId", key.providerId())
                    .setParameter("bakeDate", key.bakeDate())
                    .executeUpdate();
            if (updated == 0) {
                throw new InventoryConflictException("INSUFFICIENT_CAPACITY", key.providerId(), null, key.bakeDate());
            }
            capacityIds.put(key, capacityRepository.lockByProviderAndDate(key.providerId(), key.bakeDate())
                    .orElseThrow(() -> new InventoryConflictException("INSUFFICIENT_CAPACITY", key.providerId(), null,
                            key.bakeDate()))
                    .getId());
        }
        List<UUID> variantOrder = stockDemand.keySet().stream().sorted().toList();
        if (!variantOrder.isEmpty()) {
            for (UUID variantId : variantOrder) {
                int updated = entityManager.createQuery("""
                        UPDATE ProductVariant v
                        SET v.stockQuantity = v.stockQuantity - :quantity
                        WHERE v.id = :id AND v.stockQuantity >= :quantity
                          AND v.status = :inStock AND v.product.status = :active
                        """)
                        .setParameter("quantity", stockDemand.get(variantId))
                        .setParameter("id", variantId)
                        .setParameter("inStock", VariantStatus.IN_STOCK)
                        .setParameter("active", ProductStatus.ACTIVE)
                        .executeUpdate();
                if (updated == 0) {
                    ProductVariant variant = preview.get(variantId);
                    throw new InventoryConflictException("INSUFFICIENT_STOCK",
                            variant.getProduct().getProvider().getId(), variantId, null);
                }
            }
            entityManager.createQuery("""
                    UPDATE ProductVariant v
                    SET v.status = :outOfStock
                    WHERE v.id IN :ids AND v.stockQuantity = 0 AND v.status = :inStock
                    """)
                    .setParameter("outOfStock", VariantStatus.OUT_OF_STOCK)
                    .setParameter("ids", variantOrder)
                    .setParameter("inStock", VariantStatus.IN_STOCK)
                    .executeUpdate();
        }
        List<ReservedLineResponse> withCapacity = new ArrayList<>();
        for (ReservedLineResponse line : reserved) {
            UUID capacityId = line.bakeQuantity() > 0
                    ? capacityIds.get(new CapacityKey(line.providerId(), line.bakeDate()))
                    : null;
            withCapacity.add(new ReservedLineResponse(line.variantId(), line.providerId(), line.productName(),
                    line.variantName(), line.unitPrice(), line.quantity(), line.bakeQuantity(), capacityId,
                    line.bakeDate(), line.sourceSetId(), line.listUnitPrice(), line.directUnits()));
        }
        stockDemand.keySet().forEach(id -> events.publishEvent(new StockChangedEvent(id)));
        saleStatus.refreshByVariants(variantOrder);
        auditReservations(withCapacity);
        return withCapacity;
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY, rollbackFor = Exception.class)
    public void release(ReleaseStockCommand command) {
        requireWritableTransaction();
        if (command == null || command.lines() == null || command.lines().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Release lines are required");
        }
        List<ReleaseStockCommand.ReleaseLine> lines = command.lines();
        for (ReleaseStockCommand.ReleaseLine line : lines) {
            if (line.variantId() == null || line.quantity() <= 0 || line.bakeQuantity() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Release line is invalid");
            }
            if (line.bakeQuantity() > 0 && line.capacityId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Baking release requires a capacity");
            }
        }
        Map<UUID, DailyCapacity> unlocked = new LinkedHashMap<>();
        for (ReleaseStockCommand.ReleaseLine line : lines) {
            if (line.capacityId() != null) {
                unlocked.computeIfAbsent(line.capacityId(), id -> capacityRepository.findById(id)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity not found")));
            }
        }
        List<UUID> capacityOrder = unlocked.values().stream()
                .sorted(Comparator.comparing((DailyCapacity capacity) -> capacity.getProvider().getId())
                        .thenComparing(DailyCapacity::getCapacityDate))
                .map(DailyCapacity::getId)
                .toList();
        Map<UUID, DailyCapacity> capacities = new LinkedHashMap<>();
        for (UUID capacityId : capacityOrder) {
            DailyCapacity capacity = entityManager.find(DailyCapacity.class, capacityId, LockModeType.PESSIMISTIC_WRITE);
            if (capacity == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacity not found");
            }
            capacities.put(capacityId, capacity);
        }
        Map<UUID, ProductVariant> variants = lockVariants(lines.stream().map(ReleaseStockCommand.ReleaseLine::variantId).distinct().sorted().toList());
        for (ReleaseStockCommand.ReleaseLine line : lines) {
            if (line.bakeQuantity() > 0) {
                DailyCapacity capacity = capacities.get(line.capacityId());
                if (capacity.getReservedQuantity() < line.bakeQuantity()) {
                    throw new InventoryConflictException("INSUFFICIENT_CAPACITY", capacity.getProvider().getId(),
                            line.variantId(), capacity.getCapacityDate());
                }
                capacity.setReservedQuantity(capacity.getReservedQuantity() - line.bakeQuantity());
            }
            ProductVariant variant = variants.get(line.variantId());
            if (line.sourceSetId() != null) {
                restoreSetLine(line, variant);
                componentRepository.flush();
                audit(variant, InventoryAuditType.ORDER_RETURN, line.quantity(), physicalStock(variant),
                        "Order cancelled");
                continue;
            }
            variant.setStockQuantity(variant.getStockQuantity() + line.quantity());
            if (variant.getStockQuantity() > 0 && variant.getStatus() == VariantStatus.OUT_OF_STOCK) {
                variant.setStatus(VariantStatus.IN_STOCK);
            }
            audit(variant, InventoryAuditType.ORDER_RETURN, line.quantity(), physicalStock(variant), "Order cancelled");
            events.publishEvent(new StockChangedEvent(variant.getId()));
        }
        saleStatus.refreshByVariants(lines.stream().map(ReleaseStockCommand.ReleaseLine::variantId).distinct().toList());
    }

    private Map<UUID, Product> lockSets(List<ReserveStockCommand.ReserveLine> lines) {
        Map<UUID, Product> locked = new LinkedHashMap<>();
        List<UUID> setIds = lines.stream()
                .map(ReserveStockCommand.ReserveLine::setProductId)
                .filter(java.util.Objects::nonNull)
                .distinct()
                .sorted()
                .toList();
        for (UUID setId : setIds) {
            Product set = entityManager.find(Product.class, setId, LockModeType.PESSIMISTIC_WRITE);
            if (set == null || set.getProductType() != ProductType.GIFT_SET) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gift set not found");
            }
            locked.put(setId, set);
        }
        return locked;
    }

    private void expandSet(Product set, ReserveStockCommand.ReserveLine line, List<ReservedLineResponse> reserved,
            Map<CapacityKey, Integer> bakeDemand) {
        if (set.getStatus() != ProductStatus.ACTIVE) {
            throw new InventoryConflictException("INSUFFICIENT_STOCK", set.getProvider().getId(), null, null);
        }
        List<GiftSetComponent> rows = new ArrayList<>(componentRepository.lockBySetProductId(set.getId()));
        GiftSetComponent box = rows.stream()
                .filter(row -> row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL)
                .findFirst()
                .orElseThrow(() -> new InventoryConflictException("INSUFFICIENT_STOCK", set.getProvider().getId(),
                        null, null));
        int selling = line.quantity();
        int setsBefore = box.getQuantity();
        if (setsBefore < selling) {
            throw new InventoryConflictException("INSUFFICIENT_STOCK", set.getProvider().getId(), null, null);
        }
        java.math.BigDecimal list = java.math.BigDecimal.ZERO;
        for (GiftSetComponent row : rows) {
            boolean isBox = row.getComponentVariant().getProduct().getProductType() == ProductType.BOX_SHELL;
            int perSet = row.getPerSetQuantity() == null || row.getPerSetQuantity() <= 0
                    ? (isBox ? 1 : row.getQuantity() / setsBefore)
                    : row.getPerSetQuantity();
            if (!isBox && perSet * setsBefore != row.getQuantity() && row.getPerSetQuantity() == null) {
                perSet = 0;
            }
            list = list.add(row.getComponentVariant().getPrice().multiply(java.math.BigDecimal.valueOf(Math.max(perSet, 0))));
        }
        java.math.BigDecimal sale = set.getSalePrice();
        if (sale != null && (list.signum() <= 0 || sale.compareTo(list) >= 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá chiết khấu phải nhỏ hơn giá gốc");
        }
        java.math.BigDecimal factor = sale == null || list.signum() == 0
                ? java.math.BigDecimal.ONE
                : sale.divide(list, 8, java.math.RoundingMode.HALF_UP);
        LocalDate bakeDate = line.deliveryDate().minusDays(1);
        for (GiftSetComponent row : rows) {
            boolean isBox = row.getId().equals(box.getId());
            int perSet = row.getPerSetQuantity() != null && row.getPerSetQuantity() > 0
                    ? row.getPerSetQuantity()
                    : (isBox ? 1 : row.getQuantity() / setsBefore);
            if (row.getPerSetQuantity() == null && !isBox && row.getQuantity() % setsBefore != 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Set portions must divide evenly across the packed boxes");
            }
            int take = perSet * selling;
            if (row.getQuantity() < take) {
                throw new InventoryConflictException("INSUFFICIENT_STOCK", set.getProvider().getId(),
                        row.getComponentVariant().getId(), null);
            }
            if (take <= 0) {
                continue;
            }
            int directTake = row.getQuantity() == 0 ? 0 : row.getDirectQuantity() * take / row.getQuantity();
            int left = row.getQuantity() - take;
            row.setQuantity(left);
            row.setDirectQuantity(Math.max(0, row.getDirectQuantity() - directTake));
            ProductVariant component = row.getComponentVariant();
            Product product = component.getProduct();
            int bake = bakeQuantity(product.getProductType(), component, take);
            if (bake > 0) {
                bakeDemand.merge(new CapacityKey(product.getProvider().getId(), bakeDate), bake, Integer::sum);
            }
            java.math.BigDecimal charged = component.getPrice().multiply(factor)
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            reserved.add(new ReservedLineResponse(component.getId(), product.getProvider().getId(), product.getName(),
                    component.getVariantName(), charged, take, bake, null, bakeDate, set.getId(),
                    component.getPrice(), directTake));
            events.publishEvent(new StockChangedEvent(component.getId()));
        }
        if (sale != null) {
            java.math.BigDecimal target = sale.multiply(java.math.BigDecimal.valueOf(selling));
            java.math.BigDecimal others = java.math.BigDecimal.ZERO;
            int boxIndex = -1;
            for (int index = 0; index < reserved.size(); index++) {
                ReservedLineResponse current = reserved.get(index);
                if (!set.getId().equals(current.sourceSetId())) {
                    continue;
                }
                if (current.variantId().equals(box.getComponentVariant().getId())) {
                    boxIndex = index;
                } else {
                    others = others.add(current.unitPrice().multiply(java.math.BigDecimal.valueOf(current.quantity())));
                }
            }
            if (boxIndex >= 0) {
                ReservedLineResponse current = reserved.get(boxIndex);
                java.math.BigDecimal boxUnit = target.subtract(others);
                if (selling > 1) {
                    boxUnit = boxUnit.divide(java.math.BigDecimal.valueOf(selling), 2, java.math.RoundingMode.HALF_UP);
                }
                reserved.set(boxIndex, new ReservedLineResponse(current.variantId(), current.providerId(),
                        current.productName(), current.variantName(), boxUnit, current.quantity(),
                        current.bakeQuantity(), current.capacityId(), current.bakeDate(), current.sourceSetId(),
                        current.listUnitPrice(), current.directUnits()));
            }
        }
        saleStatus.refresh(set.getId());
    }

    private void restoreSetLine(ReleaseStockCommand.ReleaseLine line, ProductVariant component) {
        Product set = entityManager.find(Product.class, line.sourceSetId(), LockModeType.PESSIMISTIC_WRITE);
        if (set == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gift set not found");
        }
        GiftSetComponent row = componentRepository
                .findBySetProductIdAndComponentVariantId(set.getId(), component.getId())
                .orElse(null);
        if (row == null) {
            componentRepository.save(GiftSetComponent.builder()
                    .setProduct(set).componentVariant(component).perSetQuantity(Math.max(1, line.quantity()))
                    .quantity(line.quantity())
                    .directQuantity(line.directUnits()).build());
        } else {
            row.setQuantity(row.getQuantity() + line.quantity());
            row.setDirectQuantity(row.getDirectQuantity() + line.directUnits());
        }
        saleStatus.refresh(set.getId());
        events.publishEvent(new StockChangedEvent(component.getId()));
    }

    private int bakeQuantity(ProductType type, ProductVariant variant, int quantity) {
        return switch (type) {
            case LOOSE_CAKE -> quantity;
            case BOX_SHELL -> Math.multiplyExact(quantity, variant.getBoxCapacity());
            case GREETING_CARD, ADDON_SERVICE, GIFT_SET -> 0;
        };
    }

    private List<ReserveStockCommand.ReserveLine> normalizeReserve(ReserveStockCommand command) {
        if (command == null || command.lines() == null || command.lines().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reserve lines are required");
        }
        Map<String, ReserveStockCommand.ReserveLine> merged = new LinkedHashMap<>();
        for (ReserveStockCommand.ReserveLine line : command.lines()) {
            if (line.deliveryDate() == null || line.quantity() <= 0
                    || (line.variantId() == null && line.setProductId() == null)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reserve line is invalid");
            }
            String key = (line.setProductId() == null ? line.variantId().toString() : "set:" + line.setProductId())
                    + "|" + line.deliveryDate();
            merged.merge(key, line, (left, right) -> new ReserveStockCommand.ReserveLine(left.variantId(),
                    left.quantity() + right.quantity(), left.deliveryDate(), left.setProductId()));
        }
        return List.copyOf(merged.values());
    }

    private Map<UUID, ProductVariant> loadVariants(List<UUID> ids) {
        Map<UUID, ProductVariant> variants = new LinkedHashMap<>();
        for (UUID id : ids) {
            variants.put(id, variantRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant not found")));
        }
        return variants;
    }

    private Map<UUID, ProductVariant> lockVariants(List<UUID> sortedIds) {
        Map<UUID, ProductVariant> locked = new LinkedHashMap<>();
        for (UUID id : sortedIds) {
            ProductVariant variant = entityManager.find(ProductVariant.class, id, LockModeType.PESSIMISTIC_WRITE);
            if (variant == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant not found");
            }
            locked.put(id, variant);
        }
        return locked;
    }

    private ProductVariant ownedVariant(String providerEmail, UUID productId, UUID variantId) {
        Product product = productRepository.findByIdAndProviderEmail(productId, providerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return variantRepository.findByIdAndProductId(variantId, product.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found"));
    }

    private void auditReservations(List<ReservedLineResponse> lines) {
        Map<UUID, Integer> cursor = new LinkedHashMap<>();
        Map<UUID, ProductVariant> variants = new LinkedHashMap<>();
        for (UUID id : lines.stream().map(ReservedLineResponse::variantId).distinct().toList()) {
            ProductVariant variant = variantRepository.findById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Variant not found"));
            variants.put(id, variant);
            cursor.put(id, physicalStock(variant));
        }
        for (int index = lines.size() - 1; index >= 0; index--) {
            ReservedLineResponse line = lines.get(index);
            int after = cursor.get(line.variantId());
            audit(variants.get(line.variantId()), InventoryAuditType.ORDER_HOLD, -line.quantity(), after, "Order reserved");
            cursor.put(line.variantId(), after + line.quantity());
        }
    }

    private int physicalStock(ProductVariant variant) {
        int loose = variant.getStockQuantity() == null ? 0 : variant.getStockQuantity();
        if (variant.getProduct().getProductType() == ProductType.GIFT_SET) {
            return loose;
        }
        return loose + (int) componentRepository.sumQuantityByComponentVariantId(variant.getId());
    }

    private void audit(ProductVariant variant, InventoryAuditType type, int delta, int stockAfter, String reason) {
        auditRepository.save(InventoryAudit.builder()
                .variant(variant)
                .provider(variant.getProduct().getProvider())
                .auditType(type)
                .quantityDelta(delta)
                .stockAfter(stockAfter)
                .reason(reason)
                .build());
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY, rollbackFor = Exception.class)
    public void recordSale(UUID orderId) {
        requireWritableTransaction();
        if (auditRepository.existsByOrderIdAndAuditType(orderId, InventoryAuditType.ORDER_SALE)) {
            return;
        }
        for (OrderItem item : orderItemRepository.findByOrderBatchOrderId(orderId)) {
            ProductVariant variant = item.getVariant();
            auditRepository.save(InventoryAudit.builder()
                    .variant(variant)
                    .provider(variant.getProduct().getProvider())
                    .order(item.getOrderBatch().getOrder())
                    .auditType(InventoryAuditType.ORDER_SALE)
                    .quantityDelta(-item.getQuantity())
                    .stockAfter(physicalStock(variant))
                    .reason("Order paid")
                    .build());
            events.publishEvent(new StockChangedEvent(variant.getId()));
        }
    }

    private void requireWritableTransaction() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()
                || TransactionSynchronizationManager.isCurrentTransactionReadOnly()) {
            throw new IllegalTransactionStateException("Inventory changes require a writable transaction");
        }
    }

    private record CapacityKey(UUID providerId, LocalDate bakeDate) {
    }
}
