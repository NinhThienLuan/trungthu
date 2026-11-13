package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.BulkDeliveryRequest;
import fpt.sba.trungthu.dto.response.BulkOrderResponse;
import fpt.sba.trungthu.entity.*;
import fpt.sba.trungthu.entity.enumeration.BulkOrderStatus;
import fpt.sba.trungthu.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BulkOrderService {
    private static final ZoneId VIETNAM = ZoneId.of("Asia/Ho_Chi_Minh");
    private final BulkOrderRepository orders;
    private final BulkOrderDayRepository days;
    private final DailyCapacityRepository capacities;
    private final SecurityContextService security;

    /**
     * Đơn sỉ con cho một xưởng trong RFQ; {@code boxes} là số hộp khách chốt với xưởng này (≤ số xưởng báo).
     * Called inside the RFQ row lock and its transaction. All days are locked in date order.
     */
    @Transactional
    public BulkOrder createForAcceptedQuote(ProviderQuotation quote, int boxes) {
        if (orders.findByQuoteId(quote.getId()).isPresent()) throw conflict("Đơn sỉ đã được tạo");
        LocalDate today = LocalDate.now(VIETNAM);
        LocalDate delivery = quote.getEstimatedDeliveryDate();
        if (delivery == null || !delivery.isAfter(today)) throw conflict("Ngày giao phải sau ngày chốt đơn");
        int remaining;
        try {
            remaining = Math.multiplyExact(boxes, quote.getCakesPerBox());
        } catch (ArithmeticException e) {
            throw conflict("Số bánh vượt giới hạn");
        }
        List<DailyCapacity> available = capacities.findByProviderIdAndCapacityDateBetweenOrderByCapacityDateAsc(
                quote.getProvider().getId(), today.plusDays(1), delivery.minusDays(1));
        List<DailyCapacity> selected = new ArrayList<>();
        // Prefer the freshest possible production dates. A configured closed day has no free capacity.
        for (int i = available.size() - 1; i >= 0 && remaining > 0; i--) {
            DailyCapacity candidate = available.get(i);
            int free = candidate.getMaxQuantity() - candidate.getReservedQuantity();
            if (free > 0) {
                selected.add(candidate);
                remaining -= Math.min(remaining, free);
            }
        }
        if (remaining > 0) throw conflict(quote.getProvider().getStoreName()
                + " không còn đủ suất nướng trước ngày giao; cần báo giá lại");

        LocalDateTime now = LocalDateTime.now(VIETNAM);
        LocalDateTime firstBake = selected.stream().map(DailyCapacity::getCapacityDate)
                .min(LocalDate::compareTo).orElseThrow().atTime(8, 0);
        LocalDateTime depositDeadline = now.plusHours(48);
        if (!depositDeadline.isBefore(firstBake)) depositDeadline = firstBake;
        if (!depositDeadline.isAfter(now)) throw conflict("Không đủ thời gian xác nhận cọc trước ngày nướng đầu tiên");

        BigDecimal gross = quote.getQuotedPrice().multiply(BigDecimal.valueOf(boxes));
        BigDecimal discount = gross.multiply(new BigDecimal("0.30")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = gross.subtract(discount);
        BulkOrder order = orders.saveAndFlush(BulkOrder.builder().quote(quote)
                .quantity(boxes).cakesPerBox(quote.getCakesPerBox())
                .unitPrice(quote.getQuotedPrice()).grossAmount(gross).discountAmount(discount)
                .totalAmount(total).depositAmount(CheckoutServiceImpl.minDeposit(total))
                .deliveryDate(delivery).depositDeadline(depositDeadline)
                .status(BulkOrderStatus.WAITING_DEPOSIT).build());
        int toReserve = Math.multiplyExact(order.getQuantity(), order.getCakesPerBox());
        selected.sort(java.util.Comparator.comparing(DailyCapacity::getCapacityDate));
        for (DailyCapacity candidate : selected) {
            DailyCapacity capacity = capacities.lockByProviderAndDate(quote.getProvider().getId(), candidate.getCapacityDate())
                    .orElseThrow(() -> conflict("Lịch nướng đã thay đổi"));
            int free = capacity.getMaxQuantity() - capacity.getReservedQuantity();
            int amount = Math.min(toReserve, free);
            if (amount <= 0) throw conflict("Suất nướng đã được đặt; cần báo giá lại");
            capacity.setReservedQuantity(capacity.getReservedQuantity() + amount);
            days.save(BulkOrderDay.builder().order(order).capacity(capacity)
                    .productionDate(capacity.getCapacityDate()).plannedCakes(amount).completed(false).build());
            toReserve -= amount;
        }
        if (toReserve != 0) throw conflict("Suất nướng đã thay đổi; cần báo giá lại");
        return order;
    }

    @Transactional(readOnly = true)
    public List<BulkOrderResponse> mine() {
        return orders.findTop100ByQuoteRequestCustomerIdOrderByCreatedAtDesc(security.getCurrentUserId())
                .stream().map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public List<BulkOrderResponse> providerOrders() {
        return orders.findTop100ByQuoteProviderIdOrderByCreatedAtDesc(security.getCurrentUserId())
                .stream().map(this::response).toList();
    }

    @Transactional
    public BulkOrderResponse setDelivery(UUID id, BulkDeliveryRequest input) {
        BulkOrder order = ownLocked(id, false);
        if (order.getStatus() != BulkOrderStatus.WAITING_DEPOSIT && order.getStatus() != BulkOrderStatus.PRODUCTION)
            throw conflict("Không thể sửa địa chỉ giao ở trạng thái này");
        order.setRecipientName(input.recipientName().trim());
        order.setRecipientPhone(input.recipientPhone().trim());
        order.setDeliveryAddress(input.deliveryAddress().trim());
        return response(order);
    }

    @Transactional
    public BulkOrderResponse confirmDeposit(UUID id) {
        BulkOrder order = ownLocked(id, true);
        requireStatus(order, BulkOrderStatus.WAITING_DEPOSIT);
        if (order.getDepositDeadline().isBefore(LocalDateTime.now(VIETNAM))) throw conflict("Đã quá hạn cọc");
        order.setStatus(BulkOrderStatus.PRODUCTION);
        return response(order);
    }

    @Transactional
    public BulkOrderResponse completeDay(UUID id, UUID dayId) {
        BulkOrder order = ownLocked(id, true);
        requireStatus(order, BulkOrderStatus.PRODUCTION);
        BulkOrderDay day = days.findByOrderIdOrderByProductionDateAsc(id).stream()
                .filter(item -> item.getId().equals(dayId)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy ngày nướng"));
        if (day.getProductionDate().isAfter(LocalDate.now(VIETNAM))) throw conflict("Chưa đến ngày sản xuất");
        day.setCompleted(true);
        if (days.findByOrderIdOrderByProductionDateAsc(id).stream().allMatch(BulkOrderDay::isCompleted))
            order.setStatus(BulkOrderStatus.READY_TO_SHIP);
        return response(order);
    }

    @Transactional
    public BulkOrderResponse dispatch(UUID id) {
        BulkOrder order = ownLocked(id, true);
        requireStatus(order, BulkOrderStatus.READY_TO_SHIP);
        if (order.getDeliveryAddress() == null) throw conflict("Khách chưa cung cấp địa chỉ giao hàng");
        order.setStatus(BulkOrderStatus.DELIVERING);
        return response(order);
    }

    @Transactional
    public BulkOrderResponse delivered(UUID id) {
        BulkOrder order = ownLocked(id, true);
        requireStatus(order, BulkOrderStatus.DELIVERING);
        order.setStatus(BulkOrderStatus.WAITING_BALANCE);
        return response(order);
    }

    @Transactional
    public BulkOrderResponse confirmBalance(UUID id) {
        BulkOrder order = ownLocked(id, true);
        requireStatus(order, BulkOrderStatus.WAITING_BALANCE);
        order.setStatus(BulkOrderStatus.COMPLETED);
        return response(order);
    }

    @Transactional
    public BulkOrderResponse cancel(UUID id) {
        BulkOrder order = ownLocked(id, false);
        requireStatus(order, BulkOrderStatus.WAITING_DEPOSIT);
        release(order);
        order.setStatus(BulkOrderStatus.CANCELLED);
        return response(order);
    }

    @Transactional
    public void expire(UUID id) {
        BulkOrder order = orders.findForUpdateById(id).orElseThrow();
        if (order.getStatus() == BulkOrderStatus.WAITING_DEPOSIT
                && order.getDepositDeadline().isBefore(LocalDateTime.now(VIETNAM))) {
            release(order);
            order.setStatus(BulkOrderStatus.CANCELLED);
        }
    }

    private void release(BulkOrder order) {
        for (BulkOrderDay day : days.findByOrderIdOrderByProductionDateAsc(order.getId())) {
            DailyCapacity capacity = capacities.lockByProviderAndDate(order.getQuote().getProvider().getId(), day.getProductionDate())
                    .orElseThrow(() -> conflict("Không tìm thấy lịch nướng"));
            capacity.setReservedQuantity(capacity.getReservedQuantity() - day.getPlannedCakes());
        }
    }

    private BulkOrder ownLocked(UUID id, boolean provider) {
        return orders.findForUpdateById(id).filter(order ->
                (provider ? order.getQuote().getProvider() : order.getQuote().getRequest().getCustomer())
                        .getId().equals(security.getCurrentUserId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn sỉ"));
    }

    private void requireStatus(BulkOrder order, BulkOrderStatus expected) {
        if (order.getStatus() != expected) throw conflict("Trạng thái đơn sỉ không hợp lệ");
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    private BulkOrderResponse response(BulkOrder order) {
        ProviderQuotation quote = order.getQuote();
        return new BulkOrderResponse(order.getId(), quote.getRequest().getId(), quote.getId(),
                quote.getRequest().getRequestCode(), quote.getRequest().getRequestedQuantity(),
                quote.getProvider().getStoreName(),
                order.getQuantity(), order.getCakesPerBox(), order.getUnitPrice(),
                order.getGrossAmount(), order.getDiscountAmount(), order.getTotalAmount(),
                order.getDepositAmount(), order.getDeliveryDate(), order.getDepositDeadline(),
                order.getRecipientName(), order.getRecipientPhone(), order.getDeliveryAddress(),
                order.getStatus(), days.findByOrderIdOrderByProductionDateAsc(order.getId()).stream()
                        .map(day -> new BulkOrderResponse.Day(day.getId(), day.getProductionDate(),
                                day.getPlannedCakes(), day.isCompleted())).toList());
    }
}
