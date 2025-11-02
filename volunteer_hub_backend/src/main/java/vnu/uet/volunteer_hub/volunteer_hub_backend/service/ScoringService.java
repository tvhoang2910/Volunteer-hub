package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.Optional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.User;

public interface ScoringService {
    double computeAffinityScore(Post post);

    double computeRecencyFactor(Post post);

    double computeTotalScore(Post post);

    double computePersonalizedScore(Post post, java.util.UUID viewerId);

    double computePersonalizedScore(Post post,
            Optional<User> viewer);
}