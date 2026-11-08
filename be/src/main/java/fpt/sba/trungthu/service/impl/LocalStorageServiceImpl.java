package fpt.sba.trungthu.service.impl;

import fpt.sba.trungthu.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

@Service
@Slf4j
public class LocalStorageServiceImpl implements StorageService {
    
    /** Extensions allowed on disk, keyed by validated MIME type (KYC/ATTP docs: PDF + PNG + JPG only per BR-06) */
    private static final java.util.Map<String, String> SAFE_EXTENSIONS = java.util.Map.of(
            "application/pdf", ".pdf",
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg");

    /** 
     * Magic bytes (file signatures) để verify file thật sự khớp với Content-Type 
     * Tham khảo: https://en.wikipedia.org/wiki/List_of_file_signatures
     */
    private static final java.util.Map<String, byte[]> MAGIC_BYTES = java.util.Map.of(
            "application/pdf", new byte[]{0x25, 0x50, 0x44, 0x46}, // %PDF
            "image/png", new byte[]{(byte)0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}, // .PNG....
            "image/jpeg", new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF}, // JPEG magic (bắt đầu bởi FFD8FF)
            "image/jpg", new byte[]{(byte)0xFF, (byte)0xD8, (byte)0xFF}
    );

    @Value("${app.storage.base-path:uploads}")
    private String basePath;
    
    @Value("${app.storage.base-url:/uploads}")
    private String baseUrl;
    
    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            // Create directory if not exists
            Path uploadPath = Paths.get(basePath, folder);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename. Extension comes from the validated content type, never from the
            // client-supplied filename (e.g. "virus.exe" sent as application/pdf must not be stored as .exe)
            String extension = SAFE_EXTENSIONS.getOrDefault(file.getContentType(), "");
            String filename = UUID.randomUUID() + extension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return URL
            String fileUrl = baseUrl + "/" + folder + "/" + filename;
            log.info("File uploaded successfully: {}", fileUrl);
            return fileUrl;
            
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }
    
    @Override
    public void deleteFile(String fileUrl) {
        try {
            // Extract relative path from URL
            String relativePath = fileUrl.replace(baseUrl + "/", "");
            Path filePath = Paths.get(basePath, relativePath);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted successfully: {}", fileUrl);
            } else {
                log.warn("File not found for deletion: {}", fileUrl);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }
    
    @Override
    public void validateFile(MultipartFile file, String[] allowedTypes, int maxSizeInMB) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        
        // Validate file type (Content-Type header)
        String contentType = file.getContentType();
        if (contentType == null || Arrays.stream(allowedTypes).noneMatch(contentType::equals)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + String.join(", ", allowedTypes));
        }
        
        // Validate file size
        long maxSizeInBytes = maxSizeInMB * 1024L * 1024L;
        if (file.getSize() > maxSizeInBytes) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxSizeInMB + "MB");
        }

        // CRITICAL FIX: Validate magic bytes (file signature) để chặn file giả mạo
        // Attacker có thể gửi virus.exe với Content-Type: application/pdf
        // Magic bytes đọc thật nội dung file để verify khớp với declared type
        try {
            if (!validateMagicBytes(file, contentType)) {
                throw new IllegalArgumentException("File content does not match declared type. Possible file type spoofing detected.");
            }
        } catch (IOException e) {
            log.error("Failed to read file signature for validation", e);
            throw new RuntimeException("Failed to validate file signature: " + e.getMessage());
        }
    }

    /**
     * Đọc magic bytes (file signature) từ đầu file và so sánh với expected bytes
     * @return true nếu file signature khớp với Content-Type
     */
    private boolean validateMagicBytes(MultipartFile file, String contentType) throws IOException {
        byte[] expectedSignature = MAGIC_BYTES.get(contentType);
        if (expectedSignature == null) {
            // Content-Type không có trong whitelist magic bytes (vd: webp)
            // Conservative approach: cho phép pass (đã check Content-Type header ở trên)
            log.warn("No magic bytes defined for content type: {}. Skipping signature validation.", contentType);
            return true;
        }

        byte[] fileHeader = new byte[expectedSignature.length];
        try (var inputStream = file.getInputStream()) {
            int bytesRead = inputStream.read(fileHeader);
            if (bytesRead < expectedSignature.length) {
                log.warn("File too small to contain signature. Expected {} bytes, got {}", expectedSignature.length, bytesRead);
                return false;
            }
            boolean matches = Arrays.equals(fileHeader, expectedSignature);
            if (!matches) {
                log.warn("Magic bytes mismatch for {}. Expected {}, got {}", 
                         contentType, 
                         Arrays.toString(expectedSignature), 
                         Arrays.toString(fileHeader));
            }
            return matches;
        }
    }
}
