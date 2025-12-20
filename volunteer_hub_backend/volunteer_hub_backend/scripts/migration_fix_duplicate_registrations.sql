-- Migration: Fix duplicate registrations and add unique constraint
-- Run this script ONCE to clean up existing duplicates

-- Step 1: Identify and keep only the most recent registration per (event_id, user_id)
-- This CTE finds all registration IDs that should be DELETED (older duplicates)
WITH duplicates AS (
    SELECT registration_id,
           ROW_NUMBER() OVER (
               PARTITION BY event_id, user_id 
               ORDER BY registered_at DESC, registration_id DESC
           ) as rn
    FROM registrations
)
DELETE FROM registrations 
WHERE registration_id IN (
    SELECT registration_id FROM duplicates WHERE rn > 1
);

-- Step 2: Add unique constraint to prevent future duplicates
-- This will fail if there are still duplicates (run step 1 first!)
ALTER TABLE registrations 
ADD CONSTRAINT uk_registration_event_user UNIQUE (event_id, user_id);

-- Verify: Check that no duplicates remain
SELECT event_id, user_id, COUNT(*) as count
FROM registrations
GROUP BY event_id, user_id
HAVING COUNT(*) > 1;
-- Should return 0 rows
