package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface CheckoutService {
    CheckoutPreviewResponse preview(CheckoutRequest request);
    List<OrderDetailResponse> checkout(CheckoutRequest request);

    /**
     * Ngày nhận sớm nhất cho một nhóm hàng của một xưởng (variantId -> số lượng, bánh trong hộp đã tách sẵn).
     * Không trả số tồn: chỉ cho biết món nào phải nướng theo đơn hoặc không bán được.
     */
    LeadTime leadTime(Map<UUID, Integer> lines);

    record LeadTime(LocalDate earliestDelivery, List<String> bakeToOrder, List<String> unavailable) {}
}
