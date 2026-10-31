package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/** Seller chỉ chọn gói; giá và số sản phẩm tối đa lấy từ SubscriptionPlan (không tin giá từ client) */
@Getter
@Setter
public class CreateSubscriptionRequest {

    @NotNull(message = "Vui lòng chọn gói")
    private SubscriptionPlan plan;

    @Size(max = 500, message = "Ghi chú chuyển khoản tối đa 500 ký tự")
    private String paymentProof; // tuỳ chọn: mã giao dịch / ghi chú chuyển khoản
}
