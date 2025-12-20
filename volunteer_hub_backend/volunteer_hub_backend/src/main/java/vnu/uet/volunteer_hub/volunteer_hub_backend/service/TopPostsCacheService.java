package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.List;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;

public interface TopPostsCacheService {
    void scheduledRefresh();

    void refreshTopPostsCache(int limit);

    void invalidateTopPostsCache(int limit);

    List<ScoredPostDTO> getTopPostsCached(int limit);
}
