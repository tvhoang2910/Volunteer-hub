package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.UUID;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;

public interface PostReactionService {
    PostReaction addReaction(PostReaction reaction);

    void removeReaction(UUID reactionId);
}
