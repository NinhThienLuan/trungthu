package fpt.sba.trungthu.dto.request;

import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@Setter
public class OrderQueryRequest {
    @Min(value = 0, message = "Trang phải từ 0 trở lên")
    private int page = 0;

    @Min(value = 1, message = "Số dòng mỗi trang phải từ 1 trở lên")
    @Max(value = 100, message = "Số dòng mỗi trang tối đa 100")
    private int size = 10;

    private OrderStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    @AssertTrue(message = "Ngày bắt đầu không được sau ngày kết thúc")
    public boolean isDateRangeValid() {
        return from == null || to == null || !from.isAfter(to);
    }
}
