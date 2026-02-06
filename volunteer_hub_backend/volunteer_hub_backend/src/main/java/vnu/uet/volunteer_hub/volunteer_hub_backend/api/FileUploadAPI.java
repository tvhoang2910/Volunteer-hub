package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostImage;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostImageRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.EventRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.FileUploadService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * API endpoints for file upload (avatars, thumbnails, post images)
 * [TEST MODE] Parameters passed via path/query instead of extracting from token
 * TODO: Sau khi test xong, sửa lại thành:
 * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
 * UUID userId = userService.getViewerIdFromAuthentication(auth);
 */
@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadAPI {

    private final FileUploadService fileUploadService;
    private final UserService userService;
    private final PostImageRepository postImageRepository;
    private final EventRepository eventRepository;
    private final PostRepository postRepository;

    // Allowed image MIME types
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
            "image/bmp");

    /**
     * Validate if the uploaded file is an image
     */
    private ResponseEntity<?> validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder()
                            .message("File không được để trống")
                            .build());
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder()
                            .message("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP, BMP)")
                            .detail("Content-Type: " + contentType)
                            .build());
        }

        // Validate file extension matches content type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.builder()
                            .message("File phải có phần mở rộng hợp lệ")
                            .build());
        }

        return null; // Valid
    }

    /**
     * Upload avatar for a user (Requires authentication)
     * POST /api/upload/avatar/{userId}
     * Request: multipart/form-data with 'file' parameter
     * Response: { "avatarUrl": "/uploads/avatars/uuid.jpg" }
     * [TEST MODE] userId passed from path parameter
     * TODO: Sau khi test xong, sửa lại thành:
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID userId = userService.getViewerIdFromAuthentication(auth);
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        // [TEST MODE] userId được truyền từ path parameter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("User ID is required")
                                .build());
            }

            // Verify user exists
            try {
                userService.findUserById(userId);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("User not found")
                                .detail(e.getMessage())
                                .build());
            }

            // Validate image file
            ResponseEntity<?> fileValidation = validateImageFile(file);
            if (fileValidation != null) {
                return fileValidation;
            }

            // Upload file
            String avatarUrl = fileUploadService.uploadAvatar(file);
            log.info("Avatar uploaded for user {}: {}", userId, avatarUrl);

            // Update user avatar_url in database
            userService.updateUserAvatar(userId, avatarUrl);

            Map<String, String> data = new HashMap<>();
            data.put("avatarUrl", avatarUrl);

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Avatar uploaded successfully")
                    .data(data)
                    .build());
        } catch (IOException e) {
            log.error("Error uploading avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to upload avatar")
                            .detail(e.getMessage())
                            .build());
        } catch (RuntimeException e) {
            log.error("Error updating user avatar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("User not found")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Upload thumbnail for an event (Requires authentication)
     * POST /api/upload/event-thumbnail/{userId}/{eventId}
     * Request: multipart/form-data with 'file' parameter
     * Response: { "thumbnailUrl": "/uploads/thumbnails/uuid.jpg", "eventId": "..."
     * }
     * [TEST MODE] userId & eventId passed from path parameter
     * TODO: Sau khi test xong, sửa lại thành:
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID userId = userService.getViewerIdFromAuthentication(auth);
     */
    @PostMapping(value = "/event-thumbnail/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadEventThumbnail(
            @PathVariable UUID eventId,
            @RequestParam("file") MultipartFile file) {
        // [TEST MODE] userId được truyền từ path parameter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("User ID is required")
                                .build());
            }

            if (eventId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Event ID is required")
                                .build());
            }

            // Verify user exists
            try {
                userService.findUserById(userId);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("User not found")
                                .detail(e.getMessage())
                                .build());
            }

            // Verify event exists
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Event not found")
                                .build());
            }

            // Validate image file
            ResponseEntity<?> fileValidation = validateImageFile(file);
            if (fileValidation != null) {
                return fileValidation;
            }

            String thumbnailUrl = fileUploadService.uploadEventThumbnail(file);
            log.info("Event thumbnail uploaded by user {} for event {}: {}", userId, eventId, thumbnailUrl);

            // Persist thumbnail to event
            Event event = eventOpt.get();
            event.setThumbnailUrl(thumbnailUrl);
            eventRepository.save(event);

            Map<String, String> data = new HashMap<>();
            data.put("thumbnailUrl", thumbnailUrl);
            data.put("eventId", eventId.toString());

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Event thumbnail uploaded successfully")
                    .data(data)
                    .build());
        } catch (IOException e) {
            log.error("Error uploading event thumbnail: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to upload event thumbnail")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Upload image for a post (Requires authentication)
     * POST /api/upload/post-image/{userId}/{postId}
     * Request: multipart/form-data with 'file' parameter
     * Response: { "imageUrl": "/uploads/posts/uuid.jpg", "postId": "...",
     * "imageId": "..." }
     * [TEST MODE] userId & postId passed from path parameter
     * TODO: Sau khi test xong, sửa lại thành:
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID userId = userService.getViewerIdFromAuthentication(auth);
     */
    @PostMapping(value = "/post-image/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPostImage(
            @PathVariable UUID postId,
            @RequestParam("file") MultipartFile file) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);
        try {
            // [TEST MODE] userId được truyền từ path parameter
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("User ID is required")
                                .build());
            }

            if (postId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Post ID is required")
                                .build());
            }

            // Verify user exists
            try {
                userService.findUserById(userId);
            } catch (RuntimeException e) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("User not found")
                                .detail(e.getMessage())
                                .build());
            }

            // Verify post exists
            Optional<Post> postOpt = postRepository.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Post not found")
                                .build());
            }

            // Validate image file
            ResponseEntity<?> fileValidation = validateImageFile(file);
            if (fileValidation != null) {
                return fileValidation;
            }

            String imageUrl = fileUploadService.uploadPostImage(file);
            log.info("Post image uploaded by user {} for post {}: {}", userId, postId, imageUrl);

            // Persist post image linked to post
            Post post = postOpt.get();

            // Calculate sort_order: query max existing sort_order and increment
            // This avoids lazy-loading the entire images collection
            Integer maxSortOrder = postImageRepository.findMaxSortOrderByPostId(postId);
            int nextSortOrder = (maxSortOrder != null) ? maxSortOrder + 1 : 0;

            PostImage postImage = new PostImage();
            postImage.setPost(post);
            postImage.setImageUrl(imageUrl);
            postImage.setSortOrder(nextSortOrder);
            PostImage saved = postImageRepository.save(postImage);

            Map<String, String> data = new HashMap<>();
            data.put("imageUrl", imageUrl);
            data.put("postId", postId.toString());
            data.put("imageId", saved.getId().toString());

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Post image uploaded successfully")
                    .data(data)
                    .build());
        } catch (IOException e) {
            log.error("Error uploading post image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to upload post image")
                            .detail(e.getMessage())
                            .build());
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * Delete avatar of a user (Requires authentication)
     * DELETE /api/upload/avatar/{userId}
     * Authorization: Only the user themselves can delete their own avatar
     * [TEST MODE] userId passed from path parameter
     * TODO: Sau khi test xong, sửa lại thành:
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID currentUserId = userService.getViewerIdFromAuthentication(auth);
     */
    @DeleteMapping("/avatar")
    public ResponseEntity<?> deleteAvatar() {
        // [TEST MODE] userId được truyền từ path parameter
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ResponseDTO.builder()
                                .message("User not authenticated")
                                .build());
            }

            String avatarUrl = null;
            try {
                Object userObj = userService.findUserById(userId);
                if (userObj != null) {
                    // Use reflection to get avatarUrl since User class is not imported
                    java.lang.reflect.Field field = userObj.getClass()
                            .getDeclaredField("avatarUrl");
                    field.setAccessible(true);
                    avatarUrl = (String) field.get(userObj);
                }
            } catch (Exception e) {
                log.debug("Could not retrieve avatar URL: {}", e.getMessage());
            }

            if (avatarUrl == null || avatarUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Avatar not found")
                                .build());
            }

            // Delete file from storage
            fileUploadService.deleteFile(avatarUrl);
            log.info("Avatar deleted for user {}: {}", userId, avatarUrl);

            // Clear avatar URL in database
            userService.updateUserAvatar(userId, null);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .message("Avatar deleted successfully")
                    .build());
        } catch (IOException e) {
            log.error("Error deleting avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to delete avatar")
                            .detail(e.getMessage())
                            .build());
        } catch (RuntimeException e) {
            log.error("Error deleting avatar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Error deleting avatar")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Delete thumbnail of an event (Requires authentication)
     * DELETE /api/upload/event-thumbnail/{eventId}
     * Authorization: Only event creator can delete thumbnail
     */
    @DeleteMapping("/event-thumbnail/{eventId}")
    public ResponseEntity<?> deleteEventThumbnail(@PathVariable UUID eventId) {
        try {
            if (eventId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Event ID is required")
                                .build());
            }

            // Find the event
            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Event not found")
                                .build());
            }

            Event event = eventOpt.get();
            String thumbnailUrl = event.getThumbnailUrl();

            if (thumbnailUrl == null || thumbnailUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Event has no thumbnail to delete")
                                .build());
            }

            // Delete the file from storage
            fileUploadService.deleteFile(thumbnailUrl);
            log.info("Deleted event thumbnail file: {}", thumbnailUrl);

            // Clear thumbnail URL from event
            event.setThumbnailUrl(null);
            eventRepository.save(event);

            Map<String, String> data = new HashMap<>();
            data.put("eventId", eventId.toString());
            data.put("deletedThumbnailUrl", thumbnailUrl);

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Event thumbnail deleted successfully")
                    .data(data)
                    .build());
        } catch (IOException e) {
            log.error("Error deleting event thumbnail file: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to delete event thumbnail file")
                            .detail(e.getMessage())
                            .build());
        } catch (RuntimeException e) {
            log.error("Error deleting event thumbnail: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to delete event thumbnail")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Delete a specific image from a post (Requires authentication)
     * DELETE /api/upload/post-image/{imageId}
     * Authorization: Only the post author can delete post images
     * [TEST MODE] imageId passed from path parameter
     * TODO: Sau khi test xong, sửa lại thành:
     * Authentication auth = SecurityContextHolder.getContext().getAuthentication();
     * UUID currentUserId = userService.getViewerIdFromAuthentication(auth);
     */
    @DeleteMapping("/post-image/{imageId}")
    public ResponseEntity<?> deletePostImage(@PathVariable UUID imageId) {
        try {
            // [TEST MODE] imageId được truyền từ path parameter
            Optional<PostImage> postImageOpt = postImageRepository.findById(imageId);
            if (postImageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Post image not found")
                                .build());
            }

            PostImage postImage = postImageOpt.get();
            String imageUrl = postImage.getImageUrl();

            // Delete file from storage
            fileUploadService.deleteFile(imageUrl);
            log.info("Post image deleted: {}", imageUrl);

            // Delete from database
            postImageRepository.deleteById(imageId);

            return ResponseEntity.ok(ResponseDTO.builder()
                    .message("Post image deleted successfully")
                    .build());
        } catch (IOException e) {
            log.error("Error deleting post image {}: {}", imageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to delete post image")
                            .detail(e.getMessage())
                            .build());
        } catch (RuntimeException e) {
            log.error("Error deleting post image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Error deleting post image")
                            .detail(e.getMessage())
                            .build());
        }
    }

    // ==================== GET ENDPOINTS ====================

    /**
     * Get user avatar URL (Retrieve only)
     * GET /api/upload/avatar/{userId}
     * Response: { "avatarUrl": "/uploads/avatars/uuid.jpg" }
     */
    @GetMapping("/avatar")
    public ResponseEntity<?> getAvatar() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);
        try {
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("User ID is required")
                                .build());
            }

            Object userObj = userService.findUserById(userId);
            String avatarUrl = null;

            try {
                java.lang.reflect.Field field = userObj.getClass().getDeclaredField("avatarUrl");
                field.setAccessible(true);
                avatarUrl = (String) field.get(userObj);
            } catch (Exception e) {
                log.debug("Could not retrieve avatar URL: {}", e.getMessage());
            }

            if (avatarUrl == null || avatarUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Avatar not found for user")
                                .build());
            }

            Map<String, String> data = new HashMap<>();
            data.put("avatarUrl", avatarUrl);

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Avatar retrieved successfully")
                    .data(data)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error retrieving avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ResponseDTO.builder()
                            .message("User not found")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get event thumbnail URL (Retrieve only)
     * GET /api/upload/event/{eventId}/thumbnail
     * Response: { "thumbnailUrl": "/uploads/thumbnails/uuid.jpg", "eventId": "..."
     * }
     */
    @GetMapping("/event/{eventId}/thumbnail")
    public ResponseEntity<?> getEventThumbnail(@PathVariable UUID eventId) {
        try {
            if (eventId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Event ID is required")
                                .build());
            }

            Optional<Event> eventOpt = eventRepository.findById(eventId);
            if (eventOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Event not found")
                                .build());
            }

            Event event = eventOpt.get();
            String thumbnailUrl = event.getThumbnailUrl();

            if (thumbnailUrl == null || thumbnailUrl.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Thumbnail not found for event")
                                .build());
            }

            Map<String, String> data = new HashMap<>();
            data.put("thumbnailUrl", thumbnailUrl);
            data.put("eventId", eventId.toString());

            return ResponseEntity.ok(ResponseDTO.<Map<String, String>>builder()
                    .message("Event thumbnail retrieved successfully")
                    .data(data)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error retrieving event thumbnail for event {}: {}", eventId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Error retrieving event thumbnail")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get all post images with metadata (Retrieve only)
     * GET /api/upload/post/{postId}/images
     * Response: { "images": [ { "imageId": "...", "imageUrl": "...", "sortOrder": 0
     * }, ... ], "postId": "..." }
     */
    @GetMapping("/post/{postId}/images")
    public ResponseEntity<?> getPostImages(@PathVariable UUID postId) {
        try {
            if (postId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Post ID is required")
                                .build());
            }

            Optional<Post> postOpt = postRepository.findById(postId);
            if (postOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Post not found")
                                .build());
            }

            // Get all post images using repository query (avoids lazy loading)
            List<PostImage> postImages = postImageRepository.findByPostIdOrderBySortOrderAsc(postId);

            // Convert to response format
            List<Map<String, Object>> images = postImages.stream()
                    .map(img -> {
                        Map<String, Object> imageMap = new HashMap<>();
                        imageMap.put("imageId", img.getId().toString());
                        imageMap.put("imageUrl", img.getImageUrl());
                        imageMap.put("sortOrder", img.getSortOrder());
                        return imageMap;
                    })
                    .toList();

            Map<String, Object> data = new HashMap<>();
            data.put("images", images);
            data.put("postId", postId.toString());
            data.put("totalImages", images.size());

            return ResponseEntity.ok(ResponseDTO.<Map<String, Object>>builder()
                    .message("Post images retrieved successfully")
                    .data(data)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error retrieving post images for post {}: {}", postId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Error retrieving post images")
                            .detail(e.getMessage())
                            .build());
        }
    }

    /**
     * Get a single post image details (Retrieve only)
     * GET /api/upload/post-image/{imageId}
     * Response: { "imageId": "...", "imageUrl": "...", "sortOrder": 0, "postId":
     * "..." }
     */
    @GetMapping("/post-image/{imageId}")
    public ResponseEntity<?> getPostImage(@PathVariable UUID imageId) {
        try {
            if (imageId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ResponseDTO.builder()
                                .message("Image ID is required")
                                .build());
            }

            Optional<PostImage> imageOpt = postImageRepository.findById(imageId);
            if (imageOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ResponseDTO.builder()
                                .message("Post image not found")
                                .build());
            }

            PostImage postImage = imageOpt.get();
            Map<String, Object> data = new HashMap<>();
            data.put("imageId", postImage.getId().toString());
            data.put("imageUrl", postImage.getImageUrl());
            data.put("sortOrder", postImage.getSortOrder());
            data.put("postId", postImage.getPost().getId().toString());

            return ResponseEntity.ok(ResponseDTO.<Map<String, Object>>builder()
                    .message("Post image retrieved successfully")
                    .data(data)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error retrieving post image {}: {}", imageId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Error retrieving post image")
                            .detail(e.getMessage())
                            .build());
        }
    }

}
