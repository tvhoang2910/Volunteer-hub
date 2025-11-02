package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.ScoringService;

@Service
public class PostRankingServiceImpl implements PostRankingService {
    private final StringRedisTemplate redisTemplate;
    private final PostRepository postRepository;
    private final ScoringService scoringService;
    private final String rankingKey;
    private final int pageSize;

    public PostRankingServiceImpl(StringRedisTemplate redisTemplate, PostRepository postRepository,
            ScoringService scoringService, @Value("${posts.ranking.key:posts:rank}") String rankingKey,
            @Value("${posts.ranking.page-size:200}") int pageSize) {
        this.redisTemplate = redisTemplate;
        this.postRepository = postRepository;
        this.scoringService = scoringService;
        this.rankingKey = rankingKey;
        this.pageSize = pageSize;
    }

    /**
     * Refresh the entire ZSET by scanning posts in pages. This is scheduled to run
     * periodically.
     */
    @Scheduled(fixedDelayString = "${posts.ranking.refresh-seconds:60}000")
    public void refreshAllScoresToZSet() {
        int page = 0;
        boolean hasMore = true;
        while (hasMore) {
            var pageable = PageRequest.of(page, pageSize);
            var p = postRepository.findAll(pageable);
            if (p.isEmpty()) {
                break;
            }
            p.forEach(post -> {
                try {
                    double score = scoringService.computeTotalScore(post);
                    redisTemplate.opsForZSet().add(rankingKey, post.getId().toString(), score);
                } catch (Exception e) {
                    // ignore individual failures
                }
            });
            page++;
            if (p.getTotalPages() <= page)
                hasMore = false;
        }
    }

    /**
     * This Java function updates the score of a post in a ranking system using a
     * computed total score.
     * 
     * @param postId A unique identifier for the post that you want to update the
     *               score for.
     */
    public void updatePostScore(UUID postId) {
        postRepository.findById(postId).ifPresent(post -> {
            double score = scoringService.computeTotalScore(post);
            redisTemplate.opsForZSet().add(rankingKey, post.getId().toString(), score);
        });
    }

    /**
     * This Java function retrieves the top elements with scores from a Redis sorted
     * set and returns
     * them as a list of TypedTuple objects.
     * 
     * @param limit The `limit` parameter in the `getTopWithScores` method specifies
     *              the maximum number
     *              of elements to retrieve from a sorted set. It is used to limit
     *              the number of results returned by
     *              the method to the specified value.
     * @return The method `getTopWithScores` returns a list of `TypedTuple<String>`
     *         objects
     *         representing the top elements with their scores from a Redis sorted
     *         set, up to the specified
     *         limit. If the retrieved set is empty or null, an empty list is
     *         returned.
     */
    public List<TypedTuple<String>> getTopWithScores(int limit) {
        Set<TypedTuple<String>> raw = redisTemplate.opsForZSet().reverseRangeWithScores(rankingKey, 0, limit - 1);
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(raw);
    }

    /**
     * The function `getTopIds` retrieves the top IDs from a Redis sorted set in
     * reverse order and
     * returns them as a list.
     * 
     * @param limit The `limit` parameter in the `getTopIds` method specifies the
     *              maximum number of
     *              elements to retrieve from the Redis sorted set. The method
     *              retrieves the top `limit` number of
     *              elements from the sorted set stored in Redis and returns them as
     *              a list of strings.
     * @return The `getTopIds` method returns a list of top IDs from a Redis sorted
     *         set, with the
     *         number of IDs limited by the `limit` parameter. The IDs are retrieved
     *         in descending order based
     *         on their scores in the sorted set. If the set is empty or null, an
     *         empty list is returned.
     */
    public List<String> getTopIds(int limit) {
        Set<String> raw = redisTemplate.opsForZSet().reverseRange(rankingKey, 0, limit - 1);
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        // maintain order as returned by Redis (reverse range returns ordered set)
        return new ArrayList<>(raw);
    }

    /**
     * This Java function retrieves a range of elements with scores from a Redis
     * sorted set and returns
     * them as a list of TypedTuple objects.
     * 
     * @param start The `start` parameter in the `getRangeWithScores` method
     *              represents the starting index
     *              of the range for retrieving elements from a sorted set. It
     *              indicates the position of the first
     *              element to be included in the range.
     * @param end   The `end` parameter in the `getRangeWithScores` method
     *              represents the ending index of the
     *              range for retrieving elements from a sorted set. It specifies
     *              the position of the last element to
     *              include in the range.
     * @return A List of TypedTuple<String> containing the elements within the
     *         specified range (start to
     *         end) from a Redis sorted set with their respective scores. If the
     *         result is empty or null, an empty
     *         List is returned.
     */
    public List<TypedTuple<String>> getRangeWithScores(int start, int end) {
        Set<TypedTuple<String>> raw = redisTemplate.opsForZSet().reverseRangeWithScores(rankingKey, start, end);
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(raw);
    }

    /**
     * The function `getRangeIds` retrieves a range of IDs from a Redis sorted set
     * and returns them as a
     * list.
     * 
     * @param start Start parameter specifies the starting index of the range for
     *              retrieving IDs from a
     *              Redis sorted set.
     * @param end   The `end` parameter in the `getRangeIds` method represents the
     *              ending index of the range
     *              for retrieving elements from a Redis sorted set. It is used to
     *              specify the end of the range of
     *              elements to be fetched from the sorted set.
     * @return A List of String values representing the range of IDs from the Redis
     *         sorted set stored in
     *         the rankingKey, starting from the index "start" to the index "end".
     *         If the retrieved set is empty or
     *         null, an empty List is returned.
     */
    public List<String> getRangeIds(int start, int end) {
        Set<String> raw = redisTemplate.opsForZSet().reverseRange(rankingKey, start, end);
        if (raw == null || raw.isEmpty()) {
            return List.of();
        }
        return new ArrayList<>(raw);
    }

    /**
     * The `rebuildRankingFromDatabase` function clears existing data in Redis and
     * refreshes all scores to
     * a sorted set.
     */
    public void rebuildRankingFromDatabase() {
        // clear existing
        redisTemplate.delete(rankingKey);
        refreshAllScoresToZSet();
    }
}
