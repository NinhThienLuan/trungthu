package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.dto.response.AdminDashboardResponse;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.service.AdminDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Dashboard", description = "Admin platform operations dashboard")
@PreAuthorize("hasRole('PLATFORM_ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    @Operation(summary = "Get platform admin dashboard metrics")
    public ResponseEntity<ApiResponseDTO<AdminDashboardResponse>> getDashboard() {
        log.info("Admin fetching platform dashboard metrics");
        return ResponseEntity.ok(ApiResponseDTO.success("Dashboard metrics retrieved successfully", adminDashboardService.getDashboard()));
    }
}
