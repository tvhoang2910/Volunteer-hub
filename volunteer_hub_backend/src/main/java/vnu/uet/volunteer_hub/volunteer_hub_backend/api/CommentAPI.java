package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CommentResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.CommentService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentAPI {

    private final CommentService commentService;
    private final UserService userService;

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            CommentResponse response = commentService.updateComment(commentId, request, userId);
            return ResponseEntity.ok(ResponseDTO.builder()
                    .message("Comment updated successfully")
                    .data(response)
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message(e.getMessage())
                            .build());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable UUID commentId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UUID userId = userService.getViewerIdFromAuthentication(auth);
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.ok(ResponseDTO.<Void>builder()
                    .message("Comment deleted successfully")
                    .build());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ResponseDTO.builder()
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ResponseDTO.builder()
                            .message("Failed to delete comment")
                            .detail(e.getMessage())
                            .build());
        }
    }
}
