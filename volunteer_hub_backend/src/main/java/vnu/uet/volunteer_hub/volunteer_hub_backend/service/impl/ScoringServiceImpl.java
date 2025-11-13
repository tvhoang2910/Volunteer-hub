package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;
import vnu.uet.volunteer_hub.volunteer_hub_backend.model.enums.ReactionType;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostReactionRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.RegistrationRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.ScoringService;

@Service
public class ScoringServiceImpl implements ScoringService {
    private final PostReactionRepository postReactionRepository;
    private final RegistrationRepository registrationRepository;

    public ScoringServiceImpl(PostReactionRepository postReactionRepository,
            RegistrationRepository registrationRepository) {
        this.postReactionRepository = postReactionRepository;
        this.registrationRepository = registrationRepository;
    }

    /**
     * Compute affinity score based on post interactions within 30 days.
     * - Comments: interactions × 5
     * - Likes/Reactions: interactions × 2
     * - Visits (estimated from reactions): reactions × 3
     */
    public double computeAffinityScore(Post post) {
        if (post == null || post.getReactions() == null) {
            return 0.0;
        }

        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentInteractions = post.getReactions().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();

        long commentCount = post.getReactions().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(thirtyDaysAgo)
                        && r.getComment() != null && !r.getComment().isBlank())
                .count();

        long likeCount = post.getReactions().stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(thirtyDaysAgo)
                        && (r.getReactionType() == ReactionType.LIKE || r.getReactionType() == ReactionType.LOVE))
                .count();

        return (commentCount * 5.0) + (likeCount * 2.0) + (recentInteractions * 3.0);
    }

    /**
     * Compute recency factor based on post creation time.
     * - 15 minutes: 1.0 (no decay)
     * - 3 hours: 0.7 (30% decay)
     * - 1 day: 0.2 (80% decay)
     * - Older: 0.0
     */
    public double computeRecencyFactor(Post post) {
        if (post == null || post.getCreatedAt() == null) {
            return 0.0;
        }

        LocalDateTime now = LocalDateTime.now();
        long minutesOld = ChronoUnit.MINUTES.between(post.getCreatedAt(), now);

        if (minutesOld <= 15) {
            return 1.0;
        } else if (minutesOld <= 180) { // 3 hours = 180 minutes
            // Linear decay from 1.0 at 15 min to 0.7 at 180 min
            return 1.0 - ((minutesOld - 15.0) / (180.0 - 15.0)) * 0.3;
        } else if (minutesOld <= 1440) { // 1 day = 1440 minutes
            // Linear decay from 0.7 at 3 hours to 0.2 at 1 day
            return 0.7 - ((minutesOld - 180.0) / (1440.0 - 180.0)) * 0.5;
        } else {
            return 0.0;
        }
    }

    /**
     * Compute total score based on affinity + (edge weight × recency).
     * Edge weight represents interaction type priority:
     * - Comment: 10
     * - Share: 8
     * - Like/React: 5
     * For simplicity, use average weight of post reactions.
     */
    public double computeTotalScore(Post post) {
        double affinityScore = computeAffinityScore(post);
        double recencyFactor = computeRecencyFactor(post);

        double edgeWeight = computeAverageEdgeWeight(post);

        // Total score = Affinity + (EdgeWeight × Recency)
        return affinityScore + (edgeWeight * recencyFactor);
    }

    /**
     * Compute a personalized score for a viewing user. This starts with the global
     * total score and applies boosts for the viewer's interactions and
     * relationship to the post/event.
     */
    public double computePersonalizedScore(Post post, Optional<User> viewer) {
        return viewer.map(user -> computePersonalizedScore(post, user.getId()))
                .orElseGet(() -> computeTotalScore(post));
    }

    public double computePersonalizedScore(Post post, UUID viewerId) {
        double base = computeTotalScore(post);
        if (viewerId == null || post == null) {
            return base;
        }
        try {
            long recentReactions = postReactionRepository.countRecentReactionsByPostAndUser(post.getId(), viewerId,
                    LocalDateTime.now().minusDays(30));
            long comments = postReactionRepository.countCommentsByPostAndUser(post.getId(), viewerId);

            double boost = (recentReactions * 10.0) + (comments * 20.0);
            if (post.getEvent() != null
                    && registrationRepository.existsByEventIdAndVolunteerId(post.getEvent().getId(), viewerId)) {
                boost += 50.0; // registered for the event
            }
            if (post.getAuthor() != null && post.getAuthor().getId() != null
                    && post.getAuthor().getId().equals(viewerId)) {
                boost += 200.0; // own post priority
            }
            return base + boost;
        } catch (Exception e) {
            return base; // on failure, return base
        }
    }

    private double computeAverageEdgeWeight(Post post) {
        if (post == null || post.getReactions() == null || post.getReactions().isEmpty()) {
            return 5.0; // Default: like/react weight
        }

        double totalWeight = 0.0;
        for (PostReaction reaction : post.getReactions()) {
            if (reaction.getComment() != null && !reaction.getComment().isBlank()) {
                totalWeight += 10.0; // Comment weight
            } else if (reaction.getReactionType() == ReactionType.LIKE
                    || reaction.getReactionType() == ReactionType.LOVE) {
                totalWeight += 5.0; // Like/React weight
            } else {
                totalWeight += 8.0; // Share/other default to 8
            }
        }
        return totalWeight / post.getReactions().size();
    }
}
