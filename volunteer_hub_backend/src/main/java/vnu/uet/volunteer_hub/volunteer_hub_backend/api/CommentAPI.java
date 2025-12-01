package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CommentResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ResponseDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.CommentService;

import java.util.UUID;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentAPI {

    private final CommentService commentService;

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable UUID commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        try {
            CommentResponse response = commentService.updateComment(commentId, request);
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
}
