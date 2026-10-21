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
    @Min(value = 0, message = "Page must be at least 0")
    private int page = 0;

    @Min(value = 1, message = "Size must be at least 1")
    @Max(value = 100, message = "Size cannot exceed 100")
    private int size = 10;

    private OrderStatus status;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate from;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate to;

    @AssertTrue(message = "From date must not be after to date")
    public boolean isDateRangeValid() {
        return from == null || to == null || !from.isAfter(to);
    }
}
