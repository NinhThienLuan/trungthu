package fpt.sba.trungthu.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    /**
     * Upload a file to Cloudinary.
     *
     * @param file   the multipart file to upload
     * @param folder the sub-folder path inside the configured root folder
     * @return a Map containing at minimum "secure_url" and "public_id"
     */
    Map<String, Object> upload(MultipartFile file, String folder);

    /**
     * Delete a resource from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public_id of the resource
     */
    void delete(String publicId);
}
