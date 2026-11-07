package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.SubscriptionPlan;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Seller chỉ chọn gói; giá và số sản phẩm tối đa lấy từ SubscriptionPlan (không tin giá từ client) */
@Getter
@Setter
public class CreateSubscriptionRequest {

    @NotNull(message = "Vui lòng chọn gói")
    private SubscriptionPlan plan;

}
