package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * Service xử lý upload file (avatar, thumbnail, post images)
 */
public interface FileUploadService {

    /**
     * Upload avatar cho user
     * 
     * @param file MultipartFile từ request
     * @return Đường dẫn tương đối của file (ví dụ: /uploads/avatars/uuid.jpg)
     */
    String uploadAvatar(MultipartFile file) throws IOException;

    /**
     * Upload thumbnail cho event
     * 
     * @param file MultipartFile từ request
     * @return Đường dẫn tương đối của file
     */
    String uploadEventThumbnail(MultipartFile file) throws IOException;

    /**
     * Upload ảnh cho post
     * 
     * @param file MultipartFile từ request
     * @return Đường dẫn tương đối của file
     */
    String uploadPostImage(MultipartFile file) throws IOException;

    /**
     * Xóa file theo đường dẫn
     * 
     * @param filePath Đường dẫn tương đối
     */
    void deleteFile(String filePath) throws IOException;
}
