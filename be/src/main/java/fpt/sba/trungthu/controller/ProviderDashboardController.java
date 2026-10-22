package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.ProviderDashboardResponse;
import fpt.sba.trungthu.service.impl.OrderStatsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/provider/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider dashboard", description = "Compare variants and customers across the shop's orders")
public class ProviderDashboardController {

    private final OrderStatsService orderStatsService;

    @GetMapping
    @Operation(summary = "Order totals, variant ranking, and top buying or cancelling customers")
    public ResponseEntity<ApiResponseDTO<ProviderDashboardResponse>> dashboard() {
        return ResponseEntity.ok(ApiResponseDTO.success(orderStatsService.dashboard()));
    }
}
