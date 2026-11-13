package fpt.sba.trungthu.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

/** Khách chốt một RFQ với một hoặc nhiều xưởng; mỗi xưởng làm {@code quantity} hộp (≤ số hộp xưởng báo). */
public record AcceptQuotesRequest(@NotEmpty @Size(max = 20) List<@Valid @NotNull Item> items) {
    public record Item(@NotNull UUID quoteId, @NotNull @Min(1) Integer quantity) {}
}
