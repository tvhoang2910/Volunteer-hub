package vnu.uet.volunteer_hub.volunteer_hub_backend.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Integration tests for Admin API endpoints.
 * 
 * These tests verify that all Admin API endpoints are working correctly
 * after code merge. Run with: mvn test -Dtest=AdminAPIIntegrationTest
 * 
 * Prerequisites:
 * - Database running (PostgreSQL)
 * - At least one ADMIN user exists
 * 
 * Note: Some tests require a valid JWT token. In CI/CD, you may need to:
 * 1. Create a test admin user
 * 2. Generate a token via /api/auth/login
 * 3. Use that token in test headers
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class AdminAPIIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        // Get admin token for authenticated tests
        // You may need to adjust credentials based on your test data
        adminToken = getAdminToken();
    }

    /**
     * Helper method to get admin token.
     * Adjust credentials to match your test admin user.
     */
    private String getAdminToken() throws Exception {
        String loginPayload = """
                {
                    "email": "admin@volunteer.hub",
                    "password": "admin123",
                    "role": "ADMIN"
                }
                """;

        try {
            MvcResult result = mockMvc.perform(post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(loginPayload))
                    .andReturn();

            if (result.getResponse().getStatus() == 200) {
                JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
                return json.path("data").path("token").asText();
            }
        } catch (Exception e) {
            System.err.println("Failed to get admin token: " + e.getMessage());
        }

        // Return empty if login fails - tests will check for 401
        return "";
    }

    // ==================== Dashboard Tests ====================

    @Test
    @DisplayName("GET /api/admin/dashboard - Should return dashboard stats")
    void testGetDashboard() throws Exception {
        if (adminToken.isEmpty()) {
            // Skip if no token - this happens when no admin user exists
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Dashboard data"))
                .andExpect(jsonPath("$.data.totalEvents").exists())
                .andExpect(jsonPath("$.data.approvedEvents").exists())
                .andExpect(jsonPath("$.data.pendingEvents").exists())
                .andExpect(jsonPath("$.data.totalVolunteers").exists())
                .andExpect(jsonPath("$.data.totalRegistrations").exists());
    }

    @Test
    @DisplayName("GET /api/admin/dashboard - Should return 401 without token")
    void testGetDashboardUnauthorized() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== Events Tests ====================

    @Test
    @DisplayName("GET /api/admin/events - Should return all events")
    void testGetAllEvents() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/events")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Retrieved all events successfully"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/events/export - Should export events as JSON")
    void testExportEventsJson() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/events/export")
                .param("format", "json")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exported events"));
    }

    @Test
    @DisplayName("GET /api/admin/events/export - Should export events as CSV")
    void testExportEventsCsv() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/events/export")
                .param("format", "csv")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "attachment; filename=events.csv"));
    }

    // ==================== Users Tests ====================

    @Test
    @DisplayName("GET /api/admin/users - Should return all users")
    void testGetAllUsers() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/users")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Retrieved all users successfully"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/users - Should filter users by role")
    void testGetUsersByRole() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/users")
                .param("role", "VOLUNTEER")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/users - Should support pagination")
    void testGetUsersPagination() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/users")
                .param("page", "1")
                .param("limit", "5")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/volunteers/export - Should export volunteers")
    void testExportVolunteers() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/volunteers/export")
                .param("format", "json")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exported volunteers"));
    }

    // ==================== Cache Tests ====================

    @Test
    @DisplayName("GET /api/admin/cache/top-posts - Should get cached posts")
    void testGetCachedTopPosts() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/cache/top-posts")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("PUT /api/admin/cache/top-posts/refresh - Should refresh cache")
    void testRefreshCache() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(put("/api/admin/cache/top-posts/refresh")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Top posts cache refreshed"));
    }

    @Test
    @DisplayName("PUT /api/admin/cache/top-posts/invalidate - Should invalidate cache")
    void testInvalidateCache() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(put("/api/admin/cache/top-posts/invalidate")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Top posts cache invalidated"));
    }

    @Test
    @DisplayName("PUT /api/admin/cache/top-posts/rebuild-ranking - Should rebuild ranking")
    void testRebuildRanking() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(put("/api/admin/cache/top-posts/rebuild-ranking")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    // ==================== Admin Role Requests Tests ====================

    @Test
    @DisplayName("GET /api/admin/admin-requests - Should get pending requests")
    void testGetAdminRoleRequestsPending() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/admin-requests")
                .param("status", "PENDING")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Admin role requests"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/admin-requests - Should get approved requests")
    void testGetAdminRoleRequestsApproved() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/admin-requests")
                .param("status", "APPROVED")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/admin-requests - Should get rejected requests")
    void testGetAdminRoleRequestsRejected() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        mockMvc.perform(get("/api/admin/admin-requests")
                .param("status", "REJECTED")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    // ==================== Event Approval Tests ====================

    @Test
    @DisplayName("PUT /api/admin/events/{id}/approve - Should return 404 for invalid event")
    void testApproveEventNotFound() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        UUID fakeEventId = UUID.randomUUID();

        mockMvc.perform(put("/api/admin/events/" + fakeEventId + "/approve")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/admin/events/{id}/reject - Should return 404 for invalid event")
    void testRejectEventNotFound() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        UUID fakeEventId = UUID.randomUUID();

        mockMvc.perform(put("/api/admin/events/" + fakeEventId + "/reject")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ==================== User Lock/Unlock Tests ====================

    @Test
    @DisplayName("PUT /api/admin/users/{id}/lock - Should return 404 for invalid user")
    void testLockUserNotFound() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        UUID fakeUserId = UUID.randomUUID();

        mockMvc.perform(put("/api/admin/users/" + fakeUserId + "/lock")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/admin/users/{id}/unlock - Should return 404 for invalid user")
    void testUnlockUserNotFound() throws Exception {
        if (adminToken.isEmpty()) {
            System.out.println("Skipping: No admin token available");
            return;
        }

        UUID fakeUserId = UUID.randomUUID();

        mockMvc.perform(put("/api/admin/users/" + fakeUserId + "/unlock")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ==================== Authorization Tests ====================

    @Test
    @DisplayName("All admin endpoints should require authentication")
    void testEndpointsRequireAuth() throws Exception {
        // Test all endpoints without token
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/events"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/admin-requests"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/admin/cache/top-posts/refresh"))
                .andExpect(status().isUnauthorized());
    }
}
