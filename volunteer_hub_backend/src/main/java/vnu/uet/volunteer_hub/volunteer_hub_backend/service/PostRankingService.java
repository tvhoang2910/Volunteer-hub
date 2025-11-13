package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.redis.core.ZSetOperations.TypedTuple;

public interface PostRankingService {

    void refreshAllScoresToZSet();

    void updatePostScore(UUID postId);

    List<TypedTuple<String>> getTopWithScores(int limit);

    List<String> getTopIds(int limit);

    List<TypedTuple<String>> getRangeWithScores(int start, int end);

    List<String> getRangeIds(int start, int end);

    void rebuildRankingFromDatabase();
}