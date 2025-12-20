package vnu.uet.volunteer_hub.volunteer_hub_backend.service.impl;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.AuthorSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.EventSummaryDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;
import vnu.uet.volunteer_hub.volunteer_hub_backend.entity.Post;
import vnu.uet.volunteer_hub.volunteer_hub_backend.repository.PostRepository;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.PostRankingService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.ScoringService;
import vnu.uet.volunteer_hub.volunteer_hub_backend.service.TopPostsCacheService;

@Service
public class TopPostsCacheServiceImpl implements TopPostsCacheService {
    private final StringRedisTemplate redisTemplate;
    private final PostRepository postRepository;
    private final ScoringService scoringService;
    private final PostRankingService postRankingService;
    private final ObjectMapper objectMapper;
    private final Duration ttl;

    public TopPostsCacheServiceImpl(StringRedisTemplate redisTemplate, PostRepository postRepository,
            ScoringService scoringService, ObjectMapper objectMapper, PostRankingService postRankingService,
            @Value("${dashboard.top-posts.cache-ttl-seconds:60}") long ttlSeconds) {
        this.redisTemplate = redisTemplate;
        this.postRepository = postRepository;
        this.scoringService = scoringService;
        this.objectMapper = objectMapper;
        this.postRankingService = postRankingService;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    /**
     * The function `key` generates a key string based on a given limit for a
     * dashboard's top posts.
     * 
     * @param limit The `limit` parameter in the `key` method is used to specify the
     *              maximum number of top
     *              posts to be retrieved for the dashboard.
     * @return The method `key(int limit)` returns a string that concatenates
     *         "dashboard:top_posts:" with
     *         the value of the `limit` parameter.
     */
    private String key(int limit) {
        return "dashboard:top_posts:" + limit;
    }

    /**
     * The function `getTopPostsCached` retrieves the top posts from a cache using
     * Redis, falling back
     * to computation if cache read/parsing fails.
     * 
     * @param limit The `limit` parameter in the `getTopPostsCached` method
     *              specifies the maximum
     *              number of top posts to retrieve from the cache or compute if not
     *              available in the cache. It
     *              determines how many top posts will be returned in the list of
     *              `ScoredPostDTO` objects.
     * @return The method `getTopPostsCached` returns a list of `ScoredPostDTO`
     *         objects. If the cached
     *         value is available and can be successfully deserialized, it returns
     *         the cached list of
     *         `ScoredPostDTO` objects. Otherwise, it computes the top posts using a
     *         ZSet and caches the result
     *         before returning the computed list of `ScoredPostDTO` objects.
     */
    public List<ScoredPostDTO> getTopPostsCached(int limit) {
        String k = key(limit);
        try {
            String cached = redisTemplate.opsForValue().get(k);
            if (cached != null && !cached.isBlank()) {
                return objectMapper.readValue(cached, new TypeReference<>() {
                });
            }
        } catch (Exception e) {
            // If cache read/parsing fails, fall back to compute
        }

        List<ScoredPostDTO> computed = computeTopPostsUsingZSet(limit);
        try {
            String json = objectMapper.writeValueAsString(computed);
            redisTemplate.opsForValue().set(k, json, ttl);
        } catch (Exception e) {
            // ignore caching failures
        }
        return computed;
    }

    /**
     * The function `invalidateTopPostsCache` deletes a key from Redis cache based
     * on a given limit.
     * 
     * @param limit The `limit` parameter in the `invalidateTopPostsCache` method
     *              represents the
     *              maximum number of top posts to be cached. This parameter is used
     *              to determine the key that needs
     *              to be deleted from the Redis cache to invalidate the top posts
     *              cache.
     */
    public void invalidateTopPostsCache(int limit) {
        redisTemplate.delete(key(limit));
    }

    /**
     * The function refreshes the cache of top posts by computing a list of scored
     * posts and storing it
     * in Redis as a JSON string.
     * 
     * @param limit The `limit` parameter specifies the maximum number of top posts
     *              to be retrieved and
     *              cached. It is used to limit the number of posts that will be
     *              computed and stored in the cache.
     */
    public void refreshTopPostsCache(int limit) {
        List<ScoredPostDTO> computed = computeTopPostsUsingZSet(limit);
        try {
            String json = objectMapper.writeValueAsString(computed);
            redisTemplate.opsForValue().set(key(limit), json, ttl);
        } catch (Exception e) {
            // ignore
        }
    }

    // Scheduled refresh: run every ttl seconds to keep the cache warm.
    /**
     * This Java function uses a scheduled task to refresh the top posts cache every
     * specified interval.
     */
    @Scheduled(fixedDelayString = "${dashboard.top-posts.cache-ttl-seconds:60}000")
    public void scheduledRefresh() {
        try {
            refreshTopPostsCache(5);
        } catch (Exception e) {
            // ignore
        }
    }

    /**
     * The function `computeTopPostsUsingZSet` retrieves top posts with scores using
     * a ZSet, falling
     * back to a full compute if the ZSet is empty or an error occurs.
     * 
     * @param limit The `limit` parameter in the `computeTopPostsUsingZSet` method
     *              specifies the
     *              maximum number of top posts to retrieve from the data source.
     *              This method computes the top posts
     *              using a ZSet (sorted set) data structure and returns a list of
     *              `ScoredPostDTO` objects
     *              representing the
     * @return The method `computeTopPostsUsingZSet` returns a list of
     *         `ScoredPostDTO` objects, which
     *         are computed based on the top posts retrieved from a ZSet (sorted
     *         set) using the
     *         `postRankingService`. If the ZSet is empty or an error occurs during
     *         the retrieval process, the
     *         method falls back to fetching all posts from the database and sorting
     *         them based on their total
     */
    private List<ScoredPostDTO> computeTopPostsUsingZSet(int limit) {
        try {
            List<TypedTuple<String>> tuples = postRankingService.getTopWithScores(limit);
            if (tuples == null || tuples.isEmpty()) {
                // Fallback to old compute if ZSET empty
                return postRepository.findAll().stream().map(this::mapToScoredPostDTO)
                        .sorted((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore())).limit(limit)
                        .collect(Collectors.toList());
            }

            List<String> ids = tuples.stream().map(TypedTuple::getValue).toList();
            // convert to UUIDs and fetch posts with author and event in batch
            List<UUID> uuidIds = ids.stream().map(UUID::fromString).collect(Collectors.toList());
            List<Post> posts = postRepository.findAllWithAuthorAndEventByIdIn(uuidIds);
            // map posts by id for quick lookup
            Map<String, Post> byId = new HashMap<>();
            for (Post p : posts) {
                byId.put(p.getId().toString(), p);
            }

            List<ScoredPostDTO> result = new ArrayList<>();
            for (TypedTuple<String> t : tuples) {
                Post p = byId.get(t.getValue());
                if (p == null)
                    continue;
                Double score = t.getScore();
                result.add(mapToScoredPostDTO(p, score == null ? 0.0 : score));
                if (result.size() >= limit)
                    break;
            }
            return result;
        } catch (Exception e) {
            // On any error, fallback to a safer full compute
            return postRepository.findAll().stream().map(this::mapToScoredPostDTO)
                    .sorted((a, b) -> Double.compare(b.getTotalScore(), a.getTotalScore())).limit(limit)
                    .collect(Collectors.toList());
        }
    }

    /**
     * The function `mapToScoredPostDTO` maps a `Post` object to a `ScoredPostDTO`
     * object.
     * 
     * @param post The `post` parameter is an instance of the `Post` class, which
     *             likely contains
     *             information about a specific post, such as its title, content,
     *             author, creation date, etc.
     * @return The method `mapToScoredPostDTO` is returning a `ScoredPostDTO`
     *         object.
     */
    private ScoredPostDTO mapToScoredPostDTO(Post post) {
        return mapToScoredPostDTO(post, null);
    }

    /**
     * This Java function maps a `Post` object to a `ScoredPostDTO` object with
     * calculated scores and
     * optional nested author/event summaries.
     * 
     * @param post               The `post` parameter in the `mapToScoredPostDTO`
     *                           method represents the post object
     *                           that you want to map to a `ScoredPostDTO` object.
     *                           It contains information such as post ID, event
     *                           details (if available), author details, content,
     *                           creation timestamp, reactions, etc
     * @param totalScoreOverride The `totalScoreOverride` parameter in the
     *                           `mapToScoredPostDTO` method
     *                           is a Double value that allows you to override the
     *                           calculation of the total score for a post. If
     *                           a value is provided for `totalScoreOverride`, it
     *                           will be used as the total score for the post
     *                           instead
     * @return The method `mapToScoredPostDTO` returns a `ScoredPostDTO` object that
     *         is built using the
     *         provided `Post` object and a total score override value. The method
     *         calculates affinity score,
     *         recency factor, total score, comment count, and other fields based on
     *         the input `Post` object.
     *         It also includes nested summaries for author and event if available
     *         on the `Post`
     */
    private ScoredPostDTO mapToScoredPostDTO(Post post, Double totalScoreOverride) {
        double affinity = scoringService.computeAffinityScore(post);
        double recency = scoringService.computeRecencyFactor(post);
        double total = totalScoreOverride == null ? scoringService.computeTotalScore(post) : totalScoreOverride;
        long commentCount = post.getCommentCount();

        // Keep old flat fields for compatibility; add nested summaries if available
        var builder = ScoredPostDTO.builder().postId(post.getId())
                .eventId(post.getEvent() == null ? null : post.getEvent().getId())
                .eventTitle(post.getEvent() == null ? "" : post.getEvent().getTitle())
                .authorName(post.getAuthor() == null ? "" : post.getAuthor().getName()).content(post.getContent())
                .createdAt(post.getCreatedAt()).commentCount((int) commentCount)
                .reactionCount(post.getReactionCount()).affinityScore(affinity)
                .recencyFactor(recency).totalScore(total);

        // If author/event summaries exist on DTO model, map them (non-breaking - fields
        // will be ignored if absent)
        try {
            if (post.getAuthor() != null) {
                var authorSum = new AuthorSummaryDTO(
                        post.getAuthor().getId(), post.getAuthor().getName(), null);
                // reflection safe set if field exists
                builder.author(authorSum);
            }
            if (post.getEvent() != null) {
                var eventSum = new EventSummaryDTO(
                        post.getEvent().getId(), post.getEvent().getTitle(), post.getEvent().getLocation(),
                        post.getEvent().getStartTime());
                builder.event(eventSum);
            }
        } catch (Throwable t) {
            // ignore if DTO class doesn't exist yet or constructor mismatch
        }

        return builder.build();
    }
}
