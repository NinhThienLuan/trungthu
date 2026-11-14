package fpt.sba.trungthu.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivateSubscriptionRequest {
    
    private LocalDate startDate; // Optional: null = today
    
    @NotNull(message = "Ngày kết thúc là bắt buộc")
    private LocalDate endDate;
}
