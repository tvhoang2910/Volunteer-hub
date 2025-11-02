package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import org.springframework.data.redis.core.ZSetOperations.TypedTuple;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.AuthorSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.EventApprovalStatus;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.ScoringService;

@Service
public class PostServiceImpl implements PostService {

    private final PostRepository postRepository;
    private final PostRankingService postRankingService;
    private final ScoringService scoringService;
    private final RegistrationRepository registrationRepository;
    private final int candidateMultiplier;

    public PostServiceImpl(PostRepository postRepository, PostRankingService postRankingService,
            ScoringService scoringService, RegistrationRepository registrationRepository,
            @Value("${posts.feed.candidate-multiplier:5}") int candidateMultiplier) {
        this.postRepository = postRepository;
        this.postRankingService = postRankingService;
        this.scoringService = scoringService;
        this.registrationRepository = registrationRepository;
        this.candidateMultiplier = candidateMultiplier;
    }

    /**
     * Return a paginated feed of posts visible to the user. For authenticated
     * viewers we use the Redis ranking ZSET as a candidate source, compute
     * personalization and sort by personalized score. For anonymous users we
     * return slices directly from the ZSET (global ranking).
     */
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
            var byId = posts.stream().collect(Collectors.toMap(p -> p.getId().toString(), p -> p));
            List<ScoredPostDTO> dtos = new ArrayList<>();
            Map<String, Double> scoreMap = tuples.stream()
                    .collect(Collectors.toMap(TypedTuple::getValue, TypedTuple::getScore));
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

            // filter by visibility
            List<Post> visible = posts.stream().filter(p -> isVisibleToUser(p, viewerId)).toList();

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
        var ev = p.getEvent();
        if (ev.getAdminApprovalStatus() != null
                && ev.getAdminApprovalStatus().name().equalsIgnoreCase("APPROVED"))
            return true;
        if (p.getAuthor() != null && p.getAuthor().getId() != null && p.getAuthor().getId().equals(viewerId))
            return true;
        return registrationRepository.existsByEventIdAndVolunteerId(p.getEvent().getId(), viewerId);
    }

    private ScoredPostDTO mapToDTO(Post p, Double totalScoreOverride, Optional<User> viewer) {
        double total = totalScoreOverride == null ? scoringService.computeTotalScore(p) : totalScoreOverride;
        Double personalized = viewer.isEmpty() ? null
                : scoringService.computePersonalizedScore(p, viewer);
        int commentCount = p.getReactions() == null ? 0
                : (int) p.getReactions().stream().filter(r -> r.getComment() != null && !r.getComment().isBlank())
                        .count();
        int reactionCount = p.getReactions() == null ? 0 : p.getReactions().size();

        var dto = ScoredPostDTO.builder().postId(p.getId()).eventId(p.getEvent() == null ? null : p.getEvent().getId())
                .eventTitle(p.getEvent() == null ? "" : p.getEvent().getTitle())
                .authorName(p.getAuthor() == null ? "" : p.getAuthor().getName()).content(p.getContent())
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

}