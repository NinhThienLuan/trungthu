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
    
    /** Extensions allowed on disk, keyed by validated MIME type (KYC/ATTP docs: images + PDF only) */
    private static final java.util.Map<String, String> SAFE_EXTENSIONS = java.util.Map.of(
            "application/pdf", ".pdf",
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/jpg", ".jpg",
            "image/webp", ".webp");

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
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || Arrays.stream(allowedTypes).noneMatch(contentType::equals)) {
            throw new IllegalArgumentException("Invalid file type. Allowed types: " + String.join(", ", allowedTypes));
        }
        
        // Validate file size
        long maxSizeInBytes = maxSizeInMB * 1024L * 1024L;
        if (file.getSize() > maxSizeInBytes) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxSizeInMB + "MB");
        }
    }
}
