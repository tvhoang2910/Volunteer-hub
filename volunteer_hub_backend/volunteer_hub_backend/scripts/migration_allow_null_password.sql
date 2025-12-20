-- Migration: Allow NULL password for OAuth2 users
-- Date: 2025-12-19
-- Description: Remove NOT NULL constraint on password column to support OAuth2 authentication

ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Add comment to explain why password can be null
COMMENT ON COLUMN users.password IS 'Mật khẩu đã mã hóa (BCrypt) - NULL cho OAuth2 users';
