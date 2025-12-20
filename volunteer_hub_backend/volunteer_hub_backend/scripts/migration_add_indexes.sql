-- Migration: Add indexes for performance optimization
-- Date: 2025-12-14
-- Purpose: Fix N+1 and improve query performance for comments and post_reactions

-- Index for comments table on post_id (used in COUNT queries)
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);

-- Index for post_reactions table on post_id (used in COUNT/AVG queries)
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions (post_id);

-- Index for registrations table on (event_id, user_id) for faster lookups
-- Note: Registration entity maps volunteer -> column `user_id`, so use user_id here
CREATE INDEX IF NOT EXISTS idx_registrations_event_user ON registrations (event_id, user_id);

-- Index for registrations table on user_id for batch fetch
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations (user_id);

-- Index for posts table on author_id (used in findByAuthorId)
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts (user_id);

-- Index for posts table on event_id (used in countPostsByEventId)
CREATE INDEX IF NOT EXISTS idx_posts_event_id ON posts (event_id);

-- Index for notifications table on user_id (recipient) for faster lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

-- Index for notifications table on is_read for unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_isread ON notifications (user_id, is_read);

-- Index for notifications table on created_at descending for sorting
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

-- ============================================================================
-- ADDITIONAL INDEXES FOR FURTHER OPTIMIZATION (Wave 2)
-- ============================================================================

-- Index for comments table on user_id (used to find comments by author)
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);

-- Index for post_reactions table on user_id (used to find reactions by user)
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions (user_id);

-- Index for users table on is_active (used for finding active users for broadcast)
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);

-- Index for events table on created_by_user_id (used to find events created by user)
CREATE INDEX IF NOT EXISTS idx_events_created_by_user ON events (created_by_user_id);

-- Index for notifications table on event_id (used to filter notifications by event)
CREATE INDEX IF NOT EXISTS idx_notifications_event_id ON notifications (event_id);

-- Composite index for registrations (user, status) for checking approval status efficiently
CREATE INDEX IF NOT EXISTS idx_registrations_user_status ON registrations (user_id, registration_status);

-- Comment for documentation
COMMENT ON INDEX idx_comments_post_id IS 'Optimize COUNT queries for comments per post';
COMMENT ON INDEX idx_post_reactions_post_id IS 'Optimize COUNT/AVG queries for reactions per post';
COMMENT ON INDEX idx_registrations_event_user IS 'Optimize visibility checks for posts (use event_id,user_id)';
COMMENT ON INDEX idx_registrations_user_id IS 'Optimize batch fetch registrations by user (user_id)';
COMMENT ON INDEX idx_notifications_user_id IS 'Optimize notification lookup by recipient user_id';
COMMENT ON INDEX idx_notifications_user_isread IS 'Optimize unread count queries (composite index)';
COMMENT ON INDEX idx_notifications_created_at IS 'Optimize sorting notifications by creation time DESC';
