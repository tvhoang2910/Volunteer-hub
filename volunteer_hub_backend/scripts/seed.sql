-- Seed script for Volunteer-hub (PostgreSQL)
-- Only INSERTs (assumes tables already exist). Safe to run multiple times.
-- Run with: psql -h <host> -U <user> -d <db> -f scripts/seed.sql
-- Note: Roles are auto-created by DataInitializer.java at app startup, but included here for completeness

-- 0) Roles (create only if missing - normally handled by DataInitializer)
INSERT INTO roles (role_id, role_name, description, created_at, updated_at)
SELECT gen_random_uuid(), 'ADMIN', 'Quản trị viên', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'ADMIN');

INSERT INTO roles (role_id, role_name, description, created_at, updated_at)
SELECT gen_random_uuid(), 'VOLUNTEER', 'Tình nguyện viên', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'VOLUNTEER');

INSERT INTO roles (role_id, role_name, description, created_at, updated_at)
SELECT gen_random_uuid(), 'MANAGER', 'Quản lý sự kiện', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE role_name = 'MANAGER');

-- 1) Users (generate UUID for user_id since we're using raw SQL)
-- Passwords below are bcrypt hashes for 'P@ssw0rd' (adjust if your app uses a different hashing scheme)
-- Admin user
INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Admin User', 'admin@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com');

-- Volunteer users
INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Sarah Johnson', 'sarah.johnson@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah.johnson@example.com');

INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Michael Chen', 'michael.chen@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'michael.chen@example.com');

INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Emily Rodriguez', 'emily.rodriguez@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'emily.rodriguez@example.com');

-- Locked volunteer (inactive account)
INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'James Wilson', 'james.wilson@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', false, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'james.wilson@example.com');

-- Manager user
INSERT INTO users (user_id, name, email, password, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'Lisa Anderson', 'lisa.anderson@example.com', '$2a$10$DOWSDmYyQ1sQy0pFh3q9peb7Jc3fWn8kzqfWQH8mZq6hK2q3e9Y6', true, now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lisa.anderson@example.com');

-- 2) Link users to roles (use subqueries to find generated ids)
-- Note: Roles should exist from DataInitializer startup; if not, create them first
INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'admin@example.com' AND r.role_name = 'ADMIN'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'sarah.johnson@example.com' AND r.role_name = 'VOLUNTEER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'michael.chen@example.com' AND r.role_name = 'VOLUNTEER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'emily.rodriguez@example.com' AND r.role_name = 'VOLUNTEER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'james.wilson@example.com' AND r.role_name = 'VOLUNTEER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

INSERT INTO user_role (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'lisa.anderson@example.com' AND r.role_name = 'MANAGER'
  AND NOT EXISTS (
    SELECT 1 FROM user_role ur WHERE ur.user_id = u.user_id AND ur.role_id = r.role_id
  );

-- 3) Events (reference created_by_user by email)
-- Event 1: Community Cleanup (PENDING approval, created by Sarah)
INSERT INTO events (event_id, created_by_user_id, title, description, location, start_time, end_time, max_volunteers, admin_approval_status, is_archived, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'), 
       'Community Cleanup', 
       'Join us in cleaning up the local park and making our community more beautiful. We''ll provide all necessary supplies.',
       'Central Park, Downtown',
       now() + interval '7 days',
       now() + interval '7 days' + interval '2 hours',
       50,
       'PENDING',
       false,
       now(),
       now()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Community Cleanup');

-- Event 2: Food Drive (APPROVED, created by Michael)
INSERT INTO events (event_id, created_by_user_id, title, description, location, start_time, end_time, max_volunteers, admin_approval_status, is_archived, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       'Food Drive',
       'Help us collect and distribute food donations to families in need. Your contribution makes a real difference!',
       'Community Center, Main Street',
       now() - interval '10 days',
       now() - interval '9 days',
       30,
       'APPROVED',
       false,
       now() - interval '12 days',
       now() - interval '11 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Food Drive');

-- Event 3: Beach Cleanup (APPROVED, created by Emily)
INSERT INTO events (event_id, created_by_user_id, title, description, location, start_time, end_time, max_volunteers, admin_approval_status, is_archived, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com'),
       'Beach Cleanup',
       'Let''s keep our beaches pristine! Participate in this environmental conservation event and remove plastic waste.',
       'Sunset Beach',
       now() - interval '3 days',
       now() - interval '2 days',
       60,
       'APPROVED',
       false,
       now() - interval '5 days',
       now() - interval '4 days'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Beach Cleanup');

-- Event 4: Tree Planting Initiative (REJECTED, created by Sarah)
INSERT INTO events (event_id, created_by_user_id, title, description, location, start_time, end_time, max_volunteers, admin_approval_status, is_archived, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'Tree Planting Initiative',
       'Plant native trees to improve air quality and create green spaces. All supplies and training provided.',
       'Riverside Forest Reserve',
       now() + interval '21 days',
       now() + interval '21 days' + interval '4 hours',
       100,
       'REJECTED',
       false,
       now() - interval '2 days',
       now() - interval '1 day'
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tree Planting Initiative');

-- Event 5: Tutoring Program (PENDING, created by Lisa)
INSERT INTO events (event_id, created_by_user_id, title, description, location, start_time, end_time, max_volunteers, admin_approval_status, is_archived, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT user_id FROM users WHERE email = 'lisa.anderson@example.com'),
       'Tutoring Program',
       'We''re recruiting tutors for Math, English, and Science subjects. If you have expertise in these areas, please register!',
       'Community Learning Center',
       now() + interval '14 days',
       now() + interval '14 days' + interval '3 hours',
       25,
       'PENDING',
       false,
       now(),
       now()
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Tutoring Program');

-- 4) Registrations (link volunteers to events with various statuses)
-- Registration 1: Sarah registered for Food Drive (APPROVED, completed)
INSERT INTO registrations (registration_id, event_id, user_id, registration_status, is_completed, completion_notes, approved_by_user_id, registered_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Food Drive'),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'APPROVED',
       true,
       'Great participation! Collected 50 lbs of food.',
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       now() - interval '10 days',
       now() - interval '10 days'
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r 
  WHERE r.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
    AND r.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
);

-- Registration 2: Michael registered for Beach Cleanup (APPROVED, completed)
INSERT INTO registrations (registration_id, event_id, user_id, registration_status, is_completed, completion_notes, approved_by_user_id, registered_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Beach Cleanup'),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       'APPROVED',
       true,
       'Excellent effort! Removed 30 kg of plastic waste.',
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       now() - interval '5 days',
       now() - interval '5 days'
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r 
  WHERE r.event_id = (SELECT event_id FROM events WHERE title = 'Beach Cleanup')
    AND r.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
);

-- Registration 3: Emily registered for Food Drive (APPROVED, not completed)
INSERT INTO registrations (registration_id, event_id, user_id, registration_status, is_completed, approved_by_user_id, registered_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Food Drive'),
       (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com'),
       'APPROVED',
       false,
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       now() - interval '9 days',
       now() - interval '9 days'
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r 
  WHERE r.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
    AND r.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
);

-- Registration 4: Sarah registered for Community Cleanup (PENDING)
INSERT INTO registrations (registration_id, event_id, user_id, registration_status, is_completed, registered_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Community Cleanup'),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'PENDING',
       false,
       now() - interval '1 day',
       now() - interval '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r 
  WHERE r.event_id = (SELECT event_id FROM events WHERE title = 'Community Cleanup')
    AND r.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
);

-- Registration 5: Michael registered for Tutoring Program (PENDING)
INSERT INTO registrations (registration_id, event_id, user_id, registration_status, is_completed, registered_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Tutoring Program'),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       'PENDING',
       false,
       now(),
       now()
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r 
  WHERE r.event_id = (SELECT event_id FROM events WHERE title = 'Tutoring Program')
    AND r.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
);

-- 5) Posts (user-generated content for events)
-- Post 1: Michael's post on Food Drive
INSERT INTO posts (post_id, event_id, user_id, content, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Food Drive'),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       'This was an amazing experience! I was touched by seeing how our community comes together to help those in need.',
       now() - interval '9 days',
       now() - interval '9 days'
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
    AND p.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
);

-- Post 2: Sarah's post on Beach Cleanup
INSERT INTO posts (post_id, event_id, user_id, content, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Beach Cleanup'),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'The beach looks so much better now! Thanks to all volunteers who dedicated their time to environmental conservation.',
       now() - interval '2 days',
       now() - interval '2 days'
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Beach Cleanup')
    AND p.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
);

-- Post 3: Emily's post on Food Drive
INSERT INTO posts (post_id, event_id, user_id, content, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Food Drive'),
       (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com'),
       'Looking forward to the next event! It feels great to make a difference in our community.',
       now() - interval '8 days',
       now() - interval '8 days'
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
    AND p.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
);

-- Post 4: Admin announcement on Community Cleanup
INSERT INTO posts (post_id, event_id, user_id, content, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Community Cleanup'),
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       'Sign-ups are now open! We''re excited for this upcoming cleanup drive. Mark your calendars and register today.',
       now() - interval '1 day',
       now() - interval '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Community Cleanup')
    AND p.user_id = (SELECT user_id FROM users WHERE email = 'admin@example.com')
);

-- Post 5: Manager update on Tutoring Program
INSERT INTO posts (post_id, event_id, user_id, content, created_at, updated_at)
SELECT gen_random_uuid(), (SELECT event_id FROM events WHERE title = 'Tutoring Program'),
       (SELECT user_id FROM users WHERE email = 'lisa.anderson@example.com'),
       'We''re recruiting tutors for Math, English, and Science subjects. If you have expertise in these areas, please register!',
       now(),
       now()
WHERE NOT EXISTS (
  SELECT 1 FROM posts p 
  WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Tutoring Program')
    AND p.user_id = (SELECT user_id FROM users WHERE email = 'lisa.anderson@example.com')
);

-- 6) Notifications (system and event-related notifications)
-- Notification 1: Registration confirmed for Sarah
INSERT INTO notifications (notification_id, user_id, event_id, notification_type, title, body, is_read, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       (SELECT event_id FROM events WHERE title = 'Food Drive'),
       'REGISTRATION_CONFIRMED',
       'Registration Approved',
       'Your registration for Food Drive has been approved. Please arrive on time and bring enthusiasm!',
       true,
       now() - interval '9 days',
       now() - interval '9 days'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
    AND n.notification_type = 'REGISTRATION_CONFIRMED'
    AND n.title = 'Registration Approved'
);

-- Notification 2: Event approved notification to Michael
INSERT INTO notifications (notification_id, user_id, event_id, notification_type, title, body, is_read, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       (SELECT event_id FROM events WHERE title = 'Food Drive'),
       'EVENT_APPROVED',
       'Event Approved: Food Drive',
       'Your event "Food Drive" has been approved by an administrator and is now live!',
       true,
       now() - interval '11 days',
       now() - interval '11 days'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
    AND n.notification_type = 'EVENT_APPROVED'
);

-- Notification 3: New post notification for Emily
INSERT INTO notifications (notification_id, user_id, event_id, notification_type, title, body, is_read, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com'),
       (SELECT event_id FROM events WHERE title = 'Food Drive'),
       'NEW_POST',
       'New Post in Food Drive',
       'Michael Chen posted in Food Drive: "This was an amazing experience! I was touched by seeing how our community comes together..."',
       false,
       now() - interval '8 days',
       now() - interval '8 days'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
    AND n.notification_type = 'NEW_POST'
);

-- Notification 4: Completion marked for Michael
INSERT INTO notifications (notification_id, user_id, event_id, notification_type, title, body, is_read, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       (SELECT event_id FROM events WHERE title = 'Beach Cleanup'),
       'COMPLETION_MARKED',
       'Event Completed: Beach Cleanup',
       'Congratulations! Your participation in Beach Cleanup has been marked as completed.',
       true,
       now() - interval '2 days',
       now() - interval '2 days'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
    AND n.notification_type = 'COMPLETION_MARKED'
);

-- Notification 5: System announcement to all users (using admin as recipient for demo)
INSERT INTO notifications (notification_id, user_id, notification_type, title, body, is_read, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       'SYSTEM_ANNOUNCEMENT',
       'Welcome to Volunteer Hub!',
       'Welcome to our volunteer platform! We''re excited to have you join our community of change-makers.',
       true,
       now() - interval '14 days',
       now() - interval '14 days'
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n 
  WHERE n.user_id = (SELECT user_id FROM users WHERE email = 'admin@example.com')
    AND n.notification_type = 'SYSTEM_ANNOUNCEMENT'
);

-- 7) Post Reactions (user reactions to posts)
-- Reaction 1: Sarah likes Michael's post
INSERT INTO post_reactions (reaction_id, post_id, user_id, reaction_type, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT post_id FROM posts p 
        WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
          AND p.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
        LIMIT 1),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'LIKE',
       now() - interval '8 days',
       now() - interval '8 days'
WHERE NOT EXISTS (
  SELECT 1 FROM post_reactions pr 
  WHERE pr.post_id = (SELECT post_id FROM posts p 
                      WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
                        AND p.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
                      LIMIT 1)
    AND pr.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
);

-- Reaction 2: Emily loves Sarah's post
INSERT INTO post_reactions (reaction_id, post_id, user_id, reaction_type, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT post_id FROM posts p 
        WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Beach Cleanup')
          AND p.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
        LIMIT 1),
       (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com'),
       'LOVE',
       now() - interval '1 day',
       now() - interval '1 day'
WHERE NOT EXISTS (
  SELECT 1 FROM post_reactions pr 
  WHERE pr.post_id = (SELECT post_id FROM posts p 
                      WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Beach Cleanup')
                        AND p.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
                      LIMIT 1)
    AND pr.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
);

-- Reaction 3: Michael cares about Emily's post
INSERT INTO post_reactions (reaction_id, post_id, user_id, reaction_type, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT post_id FROM posts p 
        WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
          AND p.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
        LIMIT 1),
       (SELECT user_id FROM users WHERE email = 'michael.chen@example.com'),
       'CARE',
       now() - interval '7 days',
       now() - interval '7 days'
WHERE NOT EXISTS (
  SELECT 1 FROM post_reactions pr 
  WHERE pr.post_id = (SELECT post_id FROM posts p 
                      WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Food Drive')
                        AND p.user_id = (SELECT user_id FROM users WHERE email = 'emily.rodriguez@example.com')
                      LIMIT 1)
    AND pr.user_id = (SELECT user_id FROM users WHERE email = 'michael.chen@example.com')
);

-- Reaction 4: Admin likes the announcement post
INSERT INTO post_reactions (reaction_id, post_id, user_id, reaction_type, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT post_id FROM posts p 
        WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Community Cleanup')
          AND p.user_id = (SELECT user_id FROM users WHERE email = 'admin@example.com')
        LIMIT 1),
       (SELECT user_id FROM users WHERE email = 'admin@example.com'),
       'LIKE',
       now(),
       now()
WHERE NOT EXISTS (
  SELECT 1 FROM post_reactions pr 
  WHERE pr.post_id = (SELECT post_id FROM posts p 
                      WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Community Cleanup')
                        AND p.user_id = (SELECT user_id FROM users WHERE email = 'admin@example.com')
                      LIMIT 1)
    AND pr.user_id = (SELECT user_id FROM users WHERE email = 'admin@example.com')
);

-- Reaction 5: Sarah reacts with HAHA to Lisa's post
INSERT INTO post_reactions (reaction_id, post_id, user_id, reaction_type, comment, comment_at, created_at, updated_at)
SELECT gen_random_uuid(),
       (SELECT post_id FROM posts p 
        WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Tutoring Program')
          AND p.user_id = (SELECT user_id FROM users WHERE email = 'lisa.anderson@example.com')
        LIMIT 1),
       (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com'),
       'HAHA',
       'This is going to be so much fun! I love helping kids learn.',
       now(),
       now(),
       now()
WHERE NOT EXISTS (
  SELECT 1 FROM post_reactions pr 
  WHERE pr.post_id = (SELECT post_id FROM posts p 
                      WHERE p.event_id = (SELECT event_id FROM events WHERE title = 'Tutoring Program')
                        AND p.user_id = (SELECT user_id FROM users WHERE email = 'lisa.anderson@example.com')
                      LIMIT 1)
    AND pr.user_id = (SELECT user_id FROM users WHERE email = 'sarah.johnson@example.com')
);

-- End of seed script
