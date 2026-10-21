package fpt.sba.trungthu.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    
    /**
     * Upload a file to storage
     * @param file the file to upload
     * @param folder the subfolder path (e.g., "compliance", "products")
     * @return the URL to access the uploaded file
     */
    String uploadFile(MultipartFile file, String folder);
    
    /**
     * Delete a file from storage
     * @param fileUrl the URL of the file to delete
     */
    void deleteFile(String fileUrl);
    
    /**
     * Validate file type and size
     * @param file the file to validate
     * @param allowedTypes allowed MIME types
     * @param maxSizeInMB maximum file size in MB
     */
    void validateFile(MultipartFile file, String[] allowedTypes, int maxSizeInMB);
}
