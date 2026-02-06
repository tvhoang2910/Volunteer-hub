-- Seed a specific ADMIN account for local dev
-- Creates role ADMIN if missing, then creates user and links role.
-- Idempotent: safe to run multiple times.
--
-- Run (PowerShell):
--   $env:PGPASSWORD='27092005'; psql -h localhost -U postgres -d volunteer_hub_db -f scripts/seed_admin_lehunglep.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure ADMIN role exists
INSERT INTO roles (role_id, role_name, description, created_at, updated_at)
SELECT gen_random_uuid(), 'ADMIN', 'Quản trị viên', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'ADMIN');

-- Create the admin user
INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Le Manh Hung', 'lehunglep@gmail.com',
       '$2a$12$/8l7itp9BNHsZQGNCqlZguqGnt8T3XSVW.MSkzhkqh3CvkGyUdJ/e',
       true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lehunglep@gmail.com');

-- Link user to ADMIN role
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'lehunglep@gmail.com' AND r.role_name = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );
