package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.PostReaction;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostReactionRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostReactionService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;

@Service
public class PostReactionServiceImpl implements PostReactionService {

    private final PostReactionRepository postReactionRepository;
    private final PostRankingService postRankingService;

    public PostReactionServiceImpl(PostReactionRepository postReactionRepository,
            PostRankingService postRankingService) {
        this.postReactionRepository = postReactionRepository;
        this.postRankingService = postRankingService;
    }

    @Override
    @Transactional
    public PostReaction addReaction(PostReaction reaction) {
        PostReaction saved = postReactionRepository.save(reaction);
        try {
            if (saved.getPost() != null && saved.getPost().getId() != null) {
                postRankingService.updatePostScore(saved.getPost().getId());
            }
        } catch (Exception e) {
            // ignore ranking update failures
        }
        return saved;
    }

    @Override
    @Transactional
    public void removeReaction(UUID reactionId) {
        postReactionRepository.findById(reactionId).ifPresent(r -> {
            UUID postId = r.getPost() == null ? null : r.getPost().getId();
            postReactionRepository.delete(r);
            try {
                if (postId != null) {
                    postRankingService.updatePostScore(postId);
                }
            } catch (Exception e) {
                // ignore
            }
        });
    }
}
