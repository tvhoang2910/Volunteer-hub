package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdateCommentRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.CommentResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Comment;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.CommentRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.UserRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.CommentService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.UserService;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    @Transactional
    public CommentResponse createComment(UUID postId, CreateCommentRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userService.getViewerIdFromAuthentication(auth);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setContent(request.getContent());
        comment.setPost(post);
        comment.setUser(user);

        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            comment.setParent(parent);
        }

        Comment savedComment = commentRepository.save(comment);
        return mapToResponse(savedComment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CommentResponse> getCommentsByPostId(UUID postId, Pageable pageable) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }
        return commentRepository.findByPostIdAndParentIsNull(postId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public CommentResponse updateComment(UUID commentId, UpdateCommentRequest request) {
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // UUID userId = userService.getViewerIdFromAuthentication(auth);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // if (!comment.getUser().getId().equals(userId)) {
        // throw new RuntimeException("You are not authorized to update this comment");
        // }

        comment.setContent(request.getContent());
        Comment updatedComment = commentRepository.save(comment);
        return mapToResponse(updatedComment);
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getName())
                .postId(comment.getPost().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(comment.getReplies().stream().map(this::mapToResponse).toList())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}
