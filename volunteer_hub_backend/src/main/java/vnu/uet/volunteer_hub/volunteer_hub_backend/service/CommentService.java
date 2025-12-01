package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CommentResponse;

import java.util.UUID;

public interface CommentService {
    CommentResponse createComment(UUID postId, CreateCommentRequest request);

    Page<CommentResponse> getCommentsByPostId(UUID postId, Pageable pageable);

    CommentResponse updateComment(UUID commentId, UpdateCommentRequest request);
}
