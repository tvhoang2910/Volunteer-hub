package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.CreatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.request.UpdatePostRequest;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.AuthorSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.PostDetailResponse;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Event;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostImage;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.RegistrationStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.*;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostReactionService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.ScoringService;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
// @RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostRankingService postRankingService;
    private final ScoringService scoringService;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final PostReactionRepository postReactionRepository;
    private final PostReactionService postReactionService;
    private final CommentRepository commentRepository;
    private final PostImageRepository postImageRepository;
    private final int candidateMultiplier;

    public PostServiceImpl(PostRepository postRepository, PostRankingService postRankingService,
            ScoringService scoringService, RegistrationRepository registrationRepository,
            UserRepository userRepository, EventRepository eventRepository,
            PostReactionRepository postReactionRepository,
            PostReactionService postReactionService,
            CommentRepository commentRepository,
            PostImageRepository postImageRepository,
            @Value("${posts.feed.candidate-multiplier:5}") int candidateMultiplier) {
        this.postRepository = postRepository;
        this.postRankingService = postRankingService;
        this.scoringService = scoringService;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.postReactionRepository = postReactionRepository;
        this.postReactionService = postReactionService;
        this.commentRepository = commentRepository;
        this.postImageRepository = postImageRepository;
        this.candidateMultiplier = candidateMultiplier;
    }

    /**
     * Return a paginated feed of posts visible to the user. For authenticated
     * viewers we use the Redis ranking ZSET as a candidate source, compute
     * personalization and sort by personalized score. For anonymous users we
     * return slices directly from the ZSET (global ranking).
     */
    @Transactional(readOnly = true)
    public Page<ScoredPostDTO> getVisiblePosts(UUID viewerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        if (viewerId == null) {
            // anonymous: return direct slice from ZSET
            int start = page * size;
            int end = start + size - 1;
            List<TypedTuple<String>> tuples = postRankingService.getRangeWithScores(start, end);
            List<String> ids = tuples.stream().map(TypedTuple::getValue).toList();
            if (ids.isEmpty()) {
                // Fallback to DB-based paginated query if ZSET is empty
                Page<Post> pagePosts = postRepository
                        .findVisiblePostsForAnonymous(
                                EventApprovalStatus.APPROVED,
                                PageRequest.of(page, size));
                List<ScoredPostDTO> dtosFallback = pagePosts.getContent().stream()
                        .map(p -> mapToDTO(p, null, Optional.empty()))
                        .collect(Collectors.toList());
                return new PageImpl<>(dtosFallback, pageable, pagePosts.getTotalElements());
            }
            List<UUID> uuids = ids.stream().map(UUID::fromString).collect(Collectors.toList());
            List<Post> posts = postRepository.findAllWithAuthorAndEventByIdIn(uuids);
            // preserve order
            Map<String, Post> byId = posts.stream()
                    .collect(Collectors.toMap(p -> p.getId().toString(), p -> p));
            List<ScoredPostDTO> dtos = new ArrayList<>();
            Map<String, Double> scoreMap = tuples.stream()
                    .collect(Collectors.toMap(TypedTuple::getValue, t -> {
                        Double score = t.getScore();
                        return score == null ? 0.0 : score;
                    }));
            for (String id : ids) {
                Post p = byId.get(id);
                if (p != null) {
                    Double score = scoreMap.get(id);
                    dtos.add(mapToDTO(p, score, Optional.empty()));
                }
            }
            return new PageImpl<>(dtos, pageable, dtos.size());
        } else {
            // authenticated: get a larger candidate pool then personalize + sort
            int need = (page + 1) * size * candidateMultiplier;
            List<String> candidateIds = postRankingService.getTopIds(need);
            if (candidateIds.isEmpty()) {
                // Fallback to DB-based page query
                Page<Post> pagePosts = postRepository
                        .findVisiblePostsForUser(viewerId,
                                EventApprovalStatus.APPROVED,
                                pageable);
                List<ScoredPostDTO> dtos = pagePosts.getContent().stream().map(p -> {
                    ScoredPostDTO dto = mapToDTO(p, null, Optional.empty());
                    dto.setPersonalizedScore(scoringService.computePersonalizedScore(p, viewerId));
                    return dto;
                }).collect(Collectors.toList());
                return new PageImpl<>(dtos, pageable, pagePosts.getTotalElements());
            }
            List<UUID> uuids = candidateIds.stream().map(UUID::fromString)
                    .collect(Collectors.toList());
            List<Post> posts = postRepository.findAllWithAuthorAndEventByIdIn(uuids);

            // Batch fetch registrations to fix N+1 problem
            // Collect all event IDs from posts that have events
            List<UUID> eventIds = posts.stream()
                    .filter(p -> p.getEvent() != null)
                    .map(p -> p.getEvent().getId())
                    .distinct()
                    .collect(Collectors.toList());

            // Fetch all registrations for these events in ONE query
            Map<UUID, Set<RegistrationStatus>> userRegistrationsByEventId = registrationRepository
                    .findByEventIdInAndVolunteerId(eventIds, viewerId)
                    .stream()
                    .collect(Collectors.groupingBy(
                            reg -> reg.getEvent().getId(),
                            Collectors.mapping(
                                    reg -> reg.getRegistrationStatus(),
                                    Collectors.toSet())));

            // filter by visibility using batch-fetched registrations
            List<Post> visible = posts.stream()
                    .filter(p -> isVisibleToUserWithCache(p, viewerId, userRegistrationsByEventId))
                    .toList();

            // compute personalized score for each
            List<ScoredPostDTO> personalized = visible.stream().map(p -> {
                ScoredPostDTO dto = mapToDTO(p, null, Optional.empty());
                dto.setPersonalizedScore(scoringService.computePersonalizedScore(p, viewerId));
                return dto;
            }).sorted(Comparator
                    .comparing((ScoredPostDTO d) -> d.getPersonalizedScore() == null ? d.getTotalScore()
                            : d.getPersonalizedScore())
                    .reversed()).collect(Collectors.toList());

            // sort by personalizedScore desc

            // page the results
            int fromIndex = Math.min(page * size, personalized.size());
            int toIndex = Math.min(fromIndex + size, personalized.size());
            List<ScoredPostDTO> pageItems = personalized.subList(fromIndex, toIndex);
            return new PageImpl<>(pageItems, pageable, personalized.size());
        }
    }

    private boolean isVisibleToUser(Post p, UUID viewerId) {
        if (p.getEvent() == null)
            return true;
        Event ev = p.getEvent();
        if (ev.getAdminApprovalStatus() != null
                && ev.getAdminApprovalStatus().name().equalsIgnoreCase("APPROVED"))
            return true;
        if (p.getAuthor() != null && p.getAuthor().getId() != null && p.getAuthor().getId().equals(viewerId))
            return true;
        return registrationRepository.findByEventIdAndVolunteerId(p.getEvent().getId(), viewerId)
                .filter(reg -> reg.getRegistrationStatus().equals(RegistrationStatus.APPROVED)
                        || reg.getRegistrationStatus().equals(RegistrationStatus.CHECKED_IN)
                        || reg.getRegistrationStatus().equals(RegistrationStatus.COMPLETED))
                .isPresent();
    }

    /**
     * Optimized visibility check using pre-fetched registrations map.
     * Fixes N+1 problem by avoiding individual DB queries per post.
     * 
     * @param p                      Post to check
     * @param viewerId               Viewer's user ID
     * @param registrationsByEventId Pre-fetched map of eventId -> Set of
     *                               RegistrationStatus
     * @return true if post is visible to user
     */
    private boolean isVisibleToUserWithCache(Post p, UUID viewerId,
            Map<UUID, Set<RegistrationStatus>> registrationsByEventId) {
        if (p.getEvent() == null)
            return true;
        Event ev = p.getEvent();
        if (ev.getAdminApprovalStatus() != null
                && ev.getAdminApprovalStatus().name().equalsIgnoreCase("APPROVED"))
            return true;
        if (p.getAuthor() != null && p.getAuthor().getId() != null && p.getAuthor().getId().equals(viewerId))
            return true;

        // Use pre-fetched registrations instead of querying DB
        Set<RegistrationStatus> statuses = registrationsByEventId.get(p.getEvent().getId());
        if (statuses == null) {
            return false;
        }
        return statuses.contains(RegistrationStatus.APPROVED)
                || statuses.contains(RegistrationStatus.CHECKED_IN)
                || statuses.contains(RegistrationStatus.COMPLETED);
    }

    private ScoredPostDTO mapToDTO(Post p, Double totalScoreOverride, Optional<User> viewer) {
        double total = totalScoreOverride == null ? scoringService.computeTotalScore(p) : totalScoreOverride;
        Double personalized = viewer.isEmpty() ? null
                : scoringService.computePersonalizedScore(p, viewer);
        int commentCount = p.getCommentCount();
        int reactionCount = p.getReactionCount();

        List<String> imageUrls = p.getImages() == null ? List.of()
                : p.getImages().stream()
                        .sorted(Comparator.comparing(img -> img.getSortOrder() == null ? 0 : img.getSortOrder()))
                        .map(img -> img.getImageUrl())
                        .collect(Collectors.toList());

        ScoredPostDTO dto = ScoredPostDTO.builder().postId(p.getId())
                .eventId(p.getEvent() == null ? null : p.getEvent().getId())
                .eventTitle(p.getEvent() == null ? "" : p.getEvent().getTitle())
                .authorName(p.getAuthor() == null ? "" : p.getAuthor().getName()).content(p.getContent())
                .imageUrls(imageUrls)
                .createdAt(p.getCreatedAt()).commentCount(commentCount).reactionCount(reactionCount)
                .affinityScore(scoringService.computeAffinityScore(p))
                .recencyFactor(scoringService.computeRecencyFactor(p))
                .totalScore(total).personalizedScore(personalized).build();

        try {
            if (p.getAuthor() != null) {
                dto.setAuthor(new AuthorSummaryDTO(
                        p.getAuthor().getId(), p.getAuthor().getName(), null));
            }
            if (p.getEvent() != null) {
                dto.setEvent(new EventSummaryDTO(
                        p.getEvent().getId(), p.getEvent().getTitle(), p.getEvent().getLocation(),
                        p.getEvent().getStartTime()));
            }
        } catch (Throwable t) {
            // ignore
        }
        return dto;
    }

    @Override
    public ScoredPostDTO createPost(CreatePostRequest request, UUID authorId) {
        // Get event
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Get author
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create post
        Post post = new Post();
        post.setEvent(event);
        post.setAuthor(author);
        post.setContent(request.getContent());

        // Save to database
        Post savedPost = postRepository.save(post);

        // Handle images if provided
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            int order = 0;
            for (String imageUrl : request.getImageUrls()) {
                PostImage postImage = new PostImage();
                postImage.setPost(savedPost);
                postImage.setImageUrl(imageUrl);
                postImage.setSortOrder(order++);
                postImageRepository.save(postImage);
            }
            // Refresh to load images
            savedPost = postRepository.findById(savedPost.getId()).orElse(savedPost);
        }

        // Add to ranking
        postRankingService.addOrUpdatePostRanking(savedPost.getId().toString(),
                scoringService.computeTotalScore(savedPost));

        // Return DTO
        return mapToDTO(savedPost, null, Optional.of(author));
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetail(UUID postId, UUID viewerId) {
        // Get post with author and event
        Post post = postRepository.findByIdWithAuthorAndEvent(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }

        // Check visibility
        if (viewerId != null && !isVisibleToUser(post, viewerId)) {
            throw new RuntimeException("Post not visible to user");
        }

        // Count reactions
        int reactionCount = postReactionRepository.countByPostId(postId);

        // Check if liked by viewer and get reaction type
        boolean isLikedByViewer = false;
        ReactionType viewerReactionType = null;
        if (viewerId != null) {
            Optional<PostReaction> existingOpt = postReactionRepository.findByPostIdAndUserId(postId,
                    viewerId);
            isLikedByViewer = existingOpt.isPresent();
            viewerReactionType = existingOpt.map(PostReaction::getReactionType).orElse(null);
        }

        // Count comments
        int commentCount = (int) commentRepository.countByPostId(postId);

        // Build response
        PostDetailResponse response = PostDetailResponse.builder()
                .postId(post.getId())
                .eventId(post.getEvent() == null ? null : post.getEvent().getId())
                .eventTitle(post.getEvent() == null ? "" : post.getEvent().getTitle())
                .content(post.getContent())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(commentCount)
                .reactionCount(reactionCount)
                .isLikedByViewer(isLikedByViewer)
                .viewerReactionType(viewerReactionType)
                .build();

        // Add author info
        if (post.getAuthor() != null) {
            response.setAuthor(new AuthorSummaryDTO(
                    post.getAuthor().getId(),
                    post.getAuthor().getName(),
                    null));
        }

        // Add event info
        if (post.getEvent() != null) {
            response.setEvent(new EventSummaryDTO(
                    post.getEvent().getId(),
                    post.getEvent().getTitle(),
                    post.getEvent().getLocation(),
                    post.getEvent().getStartTime()));
        }

        return response;
    }

    @Override
    @Transactional
    public PostDetailResponse likePost(UUID postId, UUID viewerId, ReactionType reactionType) {
        // validate post
        Post post = postRepository.findByIdWithAuthorAndEvent(postId);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }

        // Check visibility: viewer must be able to see the post
        if (viewerId != null && !isVisibleToUser(post, viewerId)) {
            throw new RuntimeException("Post not visible to user");
        }

        // validate viewer
        if (viewerId == null) {
            throw new RuntimeException("User not found");
        }
        User viewer = userRepository.findById(viewerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<PostReaction> existingOpt = postReactionRepository.findByPostIdAndUserId(postId, viewerId);
        if (existingOpt.isPresent()) {
            PostReaction existing = existingOpt.get();
            if (existing.getReactionType() == reactionType) {
                // Toggle: Remove reaction if same type (ấn lại để unlike)
                postReactionService.removeReaction(existing.getId());
            } else {
                // Update reaction type if different
                existing.setReactionType(reactionType);
                postReactionService.addReaction(existing);
            }
        } else {
            // Add new reaction if not present
            PostReaction reaction = new PostReaction();
            reaction.setPost(post);
            reaction.setUser(viewer);
            reaction.setReactionType(reactionType);
            postReactionService.addReaction(reaction);
        }

        return getPostDetail(postId, viewerId);
    }

    /**
     * Update a post by ID.
     * <p>
     * TODO (Future):
     * - Add authorization check: verify requester is the author or admin
     * - Add audit logging for tracking changes
     * - Consider adding optimistic locking with @Version
     */
    @Override
    @Transactional
    public ScoredPostDTO updatePost(UUID postId, UpdatePostRequest request, UUID authorId) {
        // Find the post
        Post post = postRepository.findByIdWithAuthorAndEvent(postId);
        if (post == null) {
            throw new RuntimeException("Post not found with id: " + postId);
        }

        // TODO (Future): Check authorization
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Not authorized to update this post");
        }

        // Update content
        post.setContent(request.getContent());

        // Handle images update if provided
        if (request.getImageUrls() != null) {
            // Delete existing images
            post.getImages().clear();
            postRepository.save(post);

            // Add new images
            int order = 0;
            for (String imageUrl : request.getImageUrls()) {
                vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostImage postImage = new vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostImage();
                postImage.setPost(post);
                postImage.setImageUrl(imageUrl);
                postImage.setSortOrder(order++);
                postImageRepository.save(postImage);
            }
            // Refresh to load updated images
            post = postRepository.findById(postId).orElse(post);
        }

        // Save to database
        Post updatedPost = postRepository.save(post);

        // Update ranking score (content might affect score calculation)
        postRankingService.addOrUpdatePostRanking(updatedPost.getId().toString(),
                scoringService.computeTotalScore(updatedPost));

        // Return DTO
        return mapToDTO(updatedPost, null, Optional.empty());
    }

    /**
     * Delete a post by ID.
     * <p>
     * TODO (Future):
     * - Add authorization check: verify requester is the author or admin
     * - Consider soft delete (add deletedAt field) instead of hard delete
     * - Clean up reactions, comments in cascade or manually
     * - Add audit logging
     */
    @Override
    @Transactional
    public void deletePost(UUID postId, UUID authorId) {
        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found with id: " + postId));

        // TODO (Future): Check authorization
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Not authorized to delete this post");
        }

        // Remove from ranking (Redis ZSET)
        try {
            postRankingService.removePostRanking(postId.toString());
        } catch (Exception e) {
            // Log but don't fail if Redis cleanup fails
            // TODO: Add proper logging
        }

        // Delete from database (reactions will be cascade deleted due to orphanRemoval)
        postRepository.delete(post);
    }

    /**
     * Get posts by a specific user.
     * <p>
     * TODO (Future):
     * - Add visibility filtering: only return posts that viewer can see
     * - Add sorting options (by date, by score)
     * - Consider caching for frequently accessed user profiles
     */
    @Override
    @Transactional(readOnly = true)
    public Page<ScoredPostDTO> getPostsByUserId(UUID userId, int page, int size) {
        // Check if user exists
        boolean userExists = userRepository.existsById(userId);
        if (!userExists) {
            throw new RuntimeException("User not found with id: " + userId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Post> postsPage = postRepository.findByAuthorId(userId, pageable);

        // Map to DTOs
        List<ScoredPostDTO> dtos = postsPage.getContent().stream()
                .map(p -> mapToDTO(p, null, Optional.empty()))
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, pageable, postsPage.getTotalElements());
    }

}