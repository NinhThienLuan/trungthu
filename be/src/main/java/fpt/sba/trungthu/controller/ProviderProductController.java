package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.request.*;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.dto.response.InventoryAuditResponse;
import fpt.sba.trungthu.dto.response.PageResponse;
import fpt.sba.trungthu.dto.response.ProductResponse;
import fpt.sba.trungthu.dto.response.ProductVariantResponse;
import fpt.sba.trungthu.dto.response.VariantStatsResponse;
import fpt.sba.trungthu.service.InventoryService;
import fpt.sba.trungthu.service.ProductService;
import fpt.sba.trungthu.service.impl.GiftSetService;
import fpt.sba.trungthu.service.impl.OrderStatsService;
import fpt.sba.trungthu.service.impl.VariantStatsService;
import fpt.sba.trungthu.service.impl.VariantTerminationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/provider/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PROVIDER')")
@Tag(name = "Provider Products", description = "Provider manages own products & variants (SKU, price, stock)")
public class ProviderProductController {

    private final ProductService productService;
    private final InventoryService inventoryService;
    private final VariantTerminationService variantTerminationService;
    private final VariantStatsService variantStatsService;
    private final GiftSetService giftSetService;
    private final OrderStatsService orderStatsService;
    private final SecurityContextService securityContextService;

    @GetMapping
    @Operation(summary = "List my products with all variants, supporting pagination and total count")
    public ResponseEntity<ApiResponseDTO<?>> getMyProducts(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        
        // Nếu client truyền page/size thì trả về PageResponse chuẩn, ngược lại trả về List tương thích
        if (page != null && size != null) {
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            PageResponse<ProductResponse> pagedResult = productService.getMyProducts(providerEmail, pageable);
            return ResponseEntity.ok(ApiResponseDTO.success(pagedResult));
        }

        List<ProductResponse> listResult = productService.getMyProducts(providerEmail);
        return ResponseEntity.ok(ApiResponseDTO.success(listResult));
    }

    @PostMapping
    @Operation(summary = "Create a product")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        ProductResponse response = productService.createProduct(providerEmail, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Product created successfully")
                        .data(response)
                        .build());
    }

    @PutMapping("/{productId}/images")
    @Operation(summary = "Replace the product album. Empty clears it. Otherwise exactly one image is primary")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> replaceImages(
            @PathVariable UUID productId, @Valid @RequestBody ProductImagesRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Product images updated",
                productService.replaceImages(providerEmail, productId, request)));
    }

    @PutMapping("/{productId}")
    @Operation(summary = "Update product info. Status DRAFT, ACTIVE, or ARCHIVED")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> updateProduct(
            @PathVariable UUID productId, @Valid @RequestBody ProductRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Product updated successfully",
                productService.updateProduct(providerEmail, productId, request)));
    }

    @PostMapping("/{productId}/discontinue")
    @Operation(summary = "Stop retail sale, or stop a gift set. The other channel's stock and orders stay")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> discontinue(@PathVariable UUID productId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Product withdrawn from sale",
                variantTerminationService.discontinue(providerEmail, productId)));
    }

    @PostMapping("/{productId}/archive")
    @Operation(summary = "Soft-delete retail or a gift set. Open orders are counted only on that channel")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> archive(@PathVariable UUID productId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Product archived",
                productService.archive(providerEmail, productId)));
    }

    @PostMapping("/{productId}/variants")
    @Operation(summary = "Add a variant (LOOSE_CAKE needs weightGram, BOX_SHELL needs boxCapacity > 0)")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> addVariant(
            @PathVariable UUID productId, @Valid @RequestBody ProductVariantRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        ProductVariantResponse response = productService.addVariant(providerEmail, productId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductVariantResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Variant created successfully")
                        .data(response)
                        .build());
    }

    @PostMapping("/{productId}/variants/{variantId}/imports")
    @Operation(summary = "Import stock and return the variant to IN_STOCK")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> importStock(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody ImportStockRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Stock imported",
                inventoryService.importStock(providerEmail, productId, variantId, request)));
    }

    @PostMapping("/{productId}/variants/{variantId}/terminate")
    @Operation(summary = "Mark a variant out of stock. A note is required")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> terminate(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody DiscontinueVariantRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Variant marked out of stock",
                variantTerminationService.terminate(providerEmail, productId, variantId, request.getReason())));
    }

    @GetMapping("/{productId}/set-stats")
    @Operation(summary = "Stock waterfall for a gift set, counted in sets")
    public ResponseEntity<ApiResponseDTO<VariantStatsResponse>> setStats(@PathVariable UUID productId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(giftSetService.stats(providerEmail, productId)));
    }

    @GetMapping("/{productId}/set-audits")
    @Operation(summary = "Inventory audits for a gift set")
    public ResponseEntity<ApiResponseDTO<PageResponse<InventoryAuditResponse>>> setAudits(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(giftSetService.audits(providerEmail, productId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{productId}/set-order-stats")
    @Operation(summary = "Order mix for a gift set")
    public ResponseEntity<ApiResponseDTO<fpt.sba.trungthu.dto.response.VariantOrderStatsResponse>> setOrderStats(
            @PathVariable UUID productId,
            @RequestParam(defaultValue = "DAY") OrderStatsService.Granularity granularity) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(
                orderStatsService.setStats(providerEmail, productId, granularity)));
    }

    @PostMapping("/{productId}/set-adjustments")
    @Operation(summary = "Write off packed sets as broken or expired")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> adjustSets(
            @PathVariable UUID productId, @Valid @RequestBody AdjustStockRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Sets adjusted",
                giftSetService.adjustSets(providerEmail, productId, request)));
    }

    @PostMapping("/{productId}/composition/stock")
    @Operation(summary = "Pack more sets from the saved recipe by importing new boxes and cakes")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> stockSets(
            @PathVariable UUID productId, @Valid @RequestBody StockSetRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Sets stocked",
                giftSetService.stockSets(providerEmail, productId, request)));
    }

    @PostMapping("/{productId}/composition/release")
    @Operation(summary = "Return every packed set line to stock")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> releaseComposition(@PathVariable UUID productId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Composition returned",
                giftSetService.releaseComposition(providerEmail, productId)));
    }

    @DeleteMapping("/{productId}/composition")
    @Operation(summary = "Remove a draft set recipe after stock has been undone")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> clearComposition(@PathVariable UUID productId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Composition cleared",
                giftSetService.clearComposition(providerEmail, productId)));
    }

    @PostMapping("/{productId}/composition")
    @Operation(summary = "Add several sets after checking one box and that the cakes fill that box")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> saveComposition(
            @PathVariable UUID productId, @Valid @RequestBody SaveSetCompositionRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Packed into set")
                        .data(giftSetService.saveComposition(providerEmail, productId, request))
                        .build());
    }

    @PostMapping("/{productId}/components")
    @Operation(summary = "Move loose stock into a set, or import quantity straight into the set")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> addComponent(
            @PathVariable UUID productId, @Valid @RequestBody AddSetComponentRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDTO.<ProductResponse>builder()
                        .status(HttpStatus.CREATED.value())
                        .message("Packed into set")
                        .data(giftSetService.addComponent(providerEmail, productId, request))
                        .build());
    }

    @PatchMapping("/{productId}/components/{componentId}")
    @Operation(summary = "Remove units from a set. Loose units return to retail stock; direct units reverse the import")
    public ResponseEntity<ApiResponseDTO<ProductResponse>> updateComponent(
            @PathVariable UUID productId, @PathVariable UUID componentId,
            @Valid @RequestBody UpdateSetComponentRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Set line updated",
                giftSetService.updateComponent(providerEmail, productId, componentId, request)));
    }

    @GetMapping("/{productId}/variants/{variantId}/stats")
    @Operation(summary = "On-hand, ordered, and returned quantities for a variant")
    public ResponseEntity<ApiResponseDTO<VariantStatsResponse>> stats(
            @PathVariable UUID productId, @PathVariable UUID variantId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(
                variantStatsService.stats(providerEmail, productId, variantId)));
    }

    @GetMapping("/{productId}/variants/{variantId}/order-stats")
    @Operation(summary = "Today's order mix and order counts per day, month, or year for a variant")
    public ResponseEntity<ApiResponseDTO<fpt.sba.trungthu.dto.response.VariantOrderStatsResponse>> orderStats(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @RequestParam(defaultValue = "DAY") OrderStatsService.Granularity granularity) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success(
                orderStatsService.variantStats(providerEmail, productId, variantId, granularity)));
    }

    @PostMapping("/{productId}/variants/{variantId}/adjustments")
    @Operation(summary = "Reduce stock for broken or expired goods")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> adjust(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody AdjustStockRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Stock adjusted",
                inventoryService.adjust(providerEmail, productId, variantId, request)));
    }

    @GetMapping("/{productId}/variants/{variantId}/audits")
    @Operation(summary = "List inventory audits for a variant")
    public ResponseEntity<ApiResponseDTO<PageResponse<InventoryAuditResponse>>> audits(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(ApiResponseDTO.success(
                inventoryService.audits(providerEmail, productId, variantId, pageable)));
    }

    @PutMapping("/{productId}/variants/{variantId}")
    @Operation(summary = "Update variant name, SKU, and price. Stock and status use inventory APIs")
    public ResponseEntity<ApiResponseDTO<ProductVariantResponse>> updateVariant(
            @PathVariable UUID productId, @PathVariable UUID variantId,
            @Valid @RequestBody ProductVariantRequest request) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        return ResponseEntity.ok(ApiResponseDTO.success("Variant updated successfully",
                productService.updateVariant(providerEmail, productId, variantId, request)));
    }

    @DeleteMapping("/{productId}/variants/{variantId}")
    @Operation(summary = "Hard-delete a variant that has never been ordered")
    public ResponseEntity<ApiResponseDTO<Void>> deleteVariant(
            @PathVariable UUID productId, @PathVariable UUID variantId) {
        String providerEmail = securityContextService.getCurrentUserEmail();
        productService.deleteVariant(providerEmail, productId, variantId);
        return ResponseEntity.ok(ApiResponseDTO.success("Variant deleted", null));
    }
}
