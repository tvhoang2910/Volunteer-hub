package vnu.uet.volunteer_hub.volunteer_hub_backend.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import vnu.uet.volunteer_hub.volunteer_hub_backend.dto.response.ScoredPostDTO;

public interface PostService {
    Page<ScoredPostDTO> getVisiblePosts(UUID viewerId, int page, int size);
}
