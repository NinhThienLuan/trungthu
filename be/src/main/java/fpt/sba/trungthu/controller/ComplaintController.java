package fpt.sba.trungthu.controller;

import fpt.sba.trungthu.common.security.SecurityContextService;
import fpt.sba.trungthu.dto.response.ApiResponseDTO;
import fpt.sba.trungthu.entity.Complaint;
import fpt.sba.trungthu.entity.Order;
import fpt.sba.trungthu.entity.User;
import fpt.sba.trungthu.entity.enumeration.ComplaintStatus;
import fpt.sba.trungthu.entity.enumeration.ComplaintType;
import fpt.sba.trungthu.entity.enumeration.OrderStatus;
import fpt.sba.trungthu.repository.ComplaintRepository;
import fpt.sba.trungthu.repository.OrderRepository;
import fpt.sba.trungthu.service.StorageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;

/**
 * Khiếu nại / đổi trả: khách mở cho đơn đang giao hoặc đã hoàn tất; xưởng xử lý; admin sàn xem tất cả và phân xử.
 * Vòng đời: OPEN -> IN_PROGRESS -> RESOLVED | REJECTED (OPEN cũng có thể REJECTED); giải quyết/từ chối cần ghi lý do.
 */
@RestController
@RequiredArgsConstructor
public class ComplaintController {
    private static final EnumSet<OrderStatus> COMPLAINABLE = EnumSet.of(OrderStatus.DELIVERING, OrderStatus.COMPLETED);
    private static final EnumSet<ComplaintStatus> ACTIVE = EnumSet.of(ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS);
    private static final String IMAGE_MARKER = "\n[COMPLAINT_IMAGE]";

    private final SecurityContextService security;
    private final ComplaintRepository complaints;
    private final OrderRepository orders;
    private final StorageService storageService;

    public record CreateComplaintRequest(@NotNull UUID orderId, @NotNull ComplaintType type,
            @NotBlank @Size(max = 255) String subject, @Size(max = 5000) String description,
            List<String> imageUrls, String imageUrl) {
        public CreateComplaintRequest(UUID orderId, ComplaintType type, String subject, String description) {
            this(orderId, type, subject, description, null, null);
        }
        public CreateComplaintRequest(UUID orderId, ComplaintType type, String subject, String description, List<String> imageUrls) {
            this(orderId, type, subject, description, imageUrls, null);
        }
    }

    public record UpdateComplaintRequest(@NotNull ComplaintStatus status, @Size(max = 2000) String resolution) {}

    public record ComplaintResponse(UUID id, UUID orderId, String orderCode, String storeName, String customerName,
            String customerPhone, ComplaintType type, String subject, String description, ComplaintStatus status,
            String resolution, LocalDateTime createdAt, LocalDateTime resolvedAt, String imageUrl, List<String> imageUrls) {}

    @PostMapping("/api/complaints/images")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponseDTO<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            storageService.validateFile(file, new String[]{"image/png", "image/jpeg", "image/webp"}, 5);
        } catch (IllegalArgumentException ex) {
            throw badRequest("Chỉ nhận ảnh PNG/JPEG/WEBP tối đa 5 MB");
        }
        return ResponseEntity.ok(ApiResponseDTO.success(storageService.uploadFile(file, "complaints")));
    }

    @PostMapping(value = "/api/complaints", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ComplaintResponse>> create(@Valid @RequestBody CreateComplaintRequest request) {
        return createComplaint(request, null);
    }

    @PostMapping(value = "/api/complaints", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ComplaintResponse>> createWithImage(
            @Valid @RequestPart("request") CreateComplaintRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return createComplaint(request, image);
    }

    private ResponseEntity<ApiResponseDTO<ComplaintResponse>> createComplaint(CreateComplaintRequest request, MultipartFile image) {
        User customer = security.getCurrentUser();
        Order order = orders.findById(request.orderId())
                .filter(o -> o.getCustomer().getId().equals(customer.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng"));
        if (!COMPLAINABLE.contains(order.getOrderStatus())) {
            throw badRequest("Chỉ khiếu nại được đơn đang giao hoặc đã hoàn tất");
        }
        if (complaints.existsByOrderIdAndStatusIn(order.getId(), ACTIVE)) {
            throw badRequest("Đơn này đã có khiếu nại đang được xử lý");
        }

        List<String> images = new ArrayList<>(request.imageUrls() == null ? List.of() : request.imageUrls());
        if (request.imageUrl() != null && !request.imageUrl().isBlank() && !images.contains(request.imageUrl())) {
            images.add(request.imageUrl());
        }

        if (image != null && !image.isEmpty()) {
            storageService.validateFile(image, new String[]{"image/jpeg", "image/png", "image/webp"}, 5);
            String uploadedUrl = storageService.uploadFile(image, "complaints");
            images.add(uploadedUrl);
        }

        if (images.size() > 3 || images.stream().anyMatch(url -> url == null ||
                !url.matches("/uploads/complaints/[a-zA-Z0-9._-]+"))) {
            throw badRequest("Ảnh minh chứng không hợp lệ (tối đa 3 ảnh)");
        }

        String description = request.description() == null ? "" : request.description().trim();
        if (description.contains(IMAGE_MARKER)) throw badRequest("Mô tả chứa ký tự không hợp lệ");
        String storedDescription = description + images.stream().map(url -> IMAGE_MARKER + url)
                .reduce("", String::concat);
        String primaryImageUrl = images.isEmpty() ? null : images.get(0);

        Complaint complaint = complaints.save(Complaint.builder().customer(customer).order(order)
                .provider(order.getProvider()).complaintType(request.type()).subject(request.subject().trim())
                .description(storedDescription.isBlank() ? null : storedDescription)
                .imageUrl(primaryImageUrl)
                .status(ComplaintStatus.OPEN).build());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponseDTO.success(toResponse(complaint)));
    }

    @GetMapping("/api/complaints/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<ComplaintResponse>>> mine() {
        return ResponseEntity.ok(ApiResponseDTO.success(complaints
                .findByCustomerIdOrderByCreatedAtDesc(security.getCurrentUser().getId()).stream().map(this::toResponse).toList()));
    }

    @GetMapping("/api/provider/complaints")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<ComplaintResponse>>> forProvider() {
        return ResponseEntity.ok(ApiResponseDTO.success(complaints
                .findByProviderIdOrderByCreatedAtDesc(security.getCurrentUser().getId()).stream().map(this::toResponse).toList()));
    }

    @PutMapping("/api/provider/complaints/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ComplaintResponse>> providerUpdate(@PathVariable UUID id,
            @Valid @RequestBody UpdateComplaintRequest request) {
        User provider = security.getCurrentUser();
        Complaint complaint = complaints.findById(id).filter(c -> c.getProvider().getId().equals(provider.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khiếu nại"));
        return ResponseEntity.ok(ApiResponseDTO.success(toResponse(apply(complaint, request))));
    }

    @GetMapping("/api/admin/complaints")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponseDTO<List<ComplaintResponse>>> all() {
        return ResponseEntity.ok(ApiResponseDTO.success(complaints.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse).toList()));
    }

    /** Admin sàn phân xử khi khách và xưởng không thống nhất */
    @PutMapping("/api/admin/complaints/{id}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    @Transactional
    public ResponseEntity<ApiResponseDTO<ComplaintResponse>> adminUpdate(@PathVariable UUID id,
            @Valid @RequestBody UpdateComplaintRequest request) {
        Complaint complaint = complaints.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khiếu nại"));
        return ResponseEntity.ok(ApiResponseDTO.success(toResponse(apply(complaint, request))));
    }

    private Complaint apply(Complaint complaint, UpdateComplaintRequest request) {
        boolean closing = request.status() == ComplaintStatus.RESOLVED || request.status() == ComplaintStatus.REJECTED;
        if (closing && (request.resolution() == null || request.resolution().isBlank())) {
            throw badRequest("Ghi rõ cách xử lý hoặc lý do từ chối");
        }
        complaint.transitionStatus(request.status());
        if (request.resolution() != null && !request.resolution().isBlank()) {
            complaint.setResolution(request.resolution().trim());
        }
        return complaints.save(complaint);
    }

    private ComplaintResponse toResponse(Complaint c) {
        String stored = c.getDescription() == null ? "" : c.getDescription();
        String[] parts = stored.split("\\n\\[COMPLAINT_IMAGE\\]");
        List<String> images = new ArrayList<>(java.util.Arrays.stream(parts).skip(1).toList());
        if (c.getImageUrl() != null && !c.getImageUrl().isBlank() && !images.contains(c.getImageUrl())) {
            images.add(0, c.getImageUrl());
        }
        String primaryImageUrl = images.isEmpty() ? c.getImageUrl() : images.get(0);
        String phone = c.getCustomer().getPhone() != null ? c.getCustomer().getPhone() : c.getOrder().getReceiverPhone();
        return new ComplaintResponse(c.getId(), c.getOrder().getId(), c.getOrder().getOrderCode(),
                c.getProvider().getStoreName(), c.getCustomer().getFullName(), phone,
                c.getComplaintType(), c.getSubject(), parts[0].isBlank() ? null : parts[0], c.getStatus(), c.getResolution(),
                c.getCreatedAt(), c.getResolvedAt(), primaryImageUrl, images);
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
