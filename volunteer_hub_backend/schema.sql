-- Enums
CREATE TYPE user_role_type AS ENUM ('VOLUNTEER','MANAGER','ADMIN');
CREATE TYPE event_approval_status AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE registration_status AS ENUM ('PENDING','APPROVED','REJECTED','WITHDRAWN','CHECKED_IN','COMPLETED');
CREATE TYPE reaction_type AS ENUM ('LIKE','CARE','LOVE','HAHA','WOW','SAD','ANGRY');
CREATE TYPE notification_type AS ENUM (
  'REGISTRATION_SUBMITTED','REGISTRATION_CONFIRMED','REGISTRATION_REJECTED',
  'COMPLETION_MARKED','EVENT_CREATED_PENDING','EVENT_APPROVED','EVENT_REJECTED',
  'EVENT_UPDATED','NEW_POST','NEW_COMMENT','ACCOUNT_LOCKED','ACCOUNT_UNLOCKED',
  'SYSTEM_ANNOUNCEMENT','DATA_EXPORT_READY'
);
CREATE TYPE push_delivery_status AS ENUM ('PENDING','SUCCESS','FAILED','INVALID_SUBSCRIPTION','RATE_LIMITED','NETWORK_ERROR','MALFORMED_PAYLOAD');

-- Roles
CREATE TABLE roles (
  role_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name    VARCHAR(50) NOT NULL UNIQUE,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users
CREATE TABLE users (
  user_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  account_type user_role_type NOT NULL DEFAULT 'VOLUNTEER',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_is_active ON users(is_active);

-- User -> Role (N-N)
CREATE TABLE user_role (
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Events
CREATE TABLE events (
  event_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by_user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT,
  location              TEXT,
  start_time            TIMESTAMPTZ NOT NULL,
  end_time              TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  max_volunteers        INTEGER,
  admin_approval_status event_approval_status NOT NULL DEFAULT 'PENDING',
  is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_events_created_by_user ON events(created_by_user_id);

-- Registrations
CREATE TABLE registrations (
  registration_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id            UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  event_id           UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  registration_status registration_status NOT NULL DEFAULT 'PENDING',
  checked_in_at      TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ,
  completed_by_user_id UUID REFERENCES users(user_id),
  completion_notes   TEXT,
  approved_by_user_id UUID REFERENCES users(user_id),
  is_completed       BOOLEAN NOT NULL DEFAULT FALSE,
  withdrawn_at       TIMESTAMPTZ
);
CREATE UNIQUE INDEX uq_registrations_event_user ON registrations(event_id, user_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_user_status ON registrations(user_id, registration_status);

-- Posts
CREATE TABLE posts (
  post_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(event_id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_posts_author_id ON posts(user_id);
CREATE INDEX idx_posts_event_id ON posts(event_id);

-- Post reactions
CREATE TABLE post_reactions (
  reaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)  -- tránh react trùng
);
CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id);

-- Comments (hỗ trợ reply)
CREATE TABLE comments (
  comment_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content     VARCHAR(1000) NOT NULL,
  post_id     UUID NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES comments(comment_id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Notifications
CREATE TABLE notifications (
  notification_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  event_id         UUID REFERENCES events(event_id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  body             TEXT NOT NULL,
  notification_type notification_type NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_isread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_event_id ON notifications(event_id);

-- Password reset tokens
CREATE TABLE password_resets (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  token_hash CHAR(128) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN NOT NULL DEFAULT FALSE,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);

-- Web Push subscriptions
CREATE TABLE push_subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  endpoint  VARCHAR(500) NOT NULL,
  p256dh    VARCHAR(200) NOT NULL,
  auth      VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

-- Push delivery logs
CREATE TABLE push_delivery_logs (
  log_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        VARCHAR(100) NOT NULL,          -- giữ nguyên kiểu String trong entity
  endpoint       VARCHAR(500) NOT NULL,
  notification_id VARCHAR(100),
  http_status_code INTEGER,
  status         push_delivery_status NOT NULL,
  error_message  TEXT,
  retry_count    INTEGER NOT NULL DEFAULT 0,
  payload        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_push_logs_user_id ON push_delivery_logs(user_id);
CREATE INDEX idx_push_logs_endpoint ON push_delivery_logs(endpoint);
CREATE INDEX idx_push_logs_status ON push_delivery_logs(status);
CREATE INDEX idx_push_logs_created_at ON push_delivery_logs(created_at);