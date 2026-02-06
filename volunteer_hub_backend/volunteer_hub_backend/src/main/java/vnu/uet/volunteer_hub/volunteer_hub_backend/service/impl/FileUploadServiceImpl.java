package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.FileUploadService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileUploadServiceImpl implements FileUploadService {

    @Value("${app.upload.base-dir:uploads}")
    private String uploadBaseDir;

    private static final String AVATAR_DIR = "avatars";
    private static final String THUMBNAIL_DIR = "thumbnails";
    private static final String POST_IMAGE_DIR = "posts";

    @Override
    public String uploadAvatar(MultipartFile file) throws IOException {
        return saveFile(file, AVATAR_DIR);
    }

    @Override
    public String uploadEventThumbnail(MultipartFile file) throws IOException {
        return saveFile(file, THUMBNAIL_DIR);
    }

    @Override
    public String uploadPostImage(MultipartFile file) throws IOException {
        return saveFile(file, POST_IMAGE_DIR);
    }

    @Override
    public void deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isEmpty()) {
            return;
        }

        // Normalize incoming path and ensure it references a file under the configured
        // upload base dir
        // Accept inputs like "/uploads/posts/uuid.jpg" or "uploads/posts/uuid.jpg"
        String cleanPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;

        Path base = Paths.get(uploadBaseDir).toAbsolutePath().normalize();
        Path target = Paths.get(cleanPath).toAbsolutePath().normalize();

        // Prevent path traversal / accidental deletion outside upload dir
        if (!target.startsWith(base)) {
            // Try resolving relative to base (in case only relative path like
            // uploads/posts/.. was provided)
            Path resolved = base.resolve(cleanPath).toAbsolutePath().normalize();
            if (!resolved.startsWith(base)) {
                throw new IOException("Invalid file path: outside upload directory");
            }
            target = resolved;
        }

        if (Files.exists(target)) {
            Files.delete(target);
            log.info("Deleted uploaded file: {}", target);
            // Optionally: cleanup parent directory if empty - left intentionally out
        } else {
            log.warn("File to delete not found: {}", target);
        }
    }

    private String saveFile(MultipartFile file, String subDir) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được để trống");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh");
        }

        // Create directory if not exists
        Path uploadPath = Paths.get(uploadBaseDir, subDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String newFilename = UUID.randomUUID() + extension;

        // Save file
        Path filePath = uploadPath.resolve(newFilename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("Saved file: {}", filePath);

        // Return relative path with leading slash
        return "/" + uploadBaseDir + "/" + subDir + "/" + newFilename;
    }
}
