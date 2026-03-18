-- Update Admin Credentials
-- New Email: admin@123.com
-- New Password: Srigouadhar@2026

-- Step 1: Update the email in auth.users table
-- Run this in Supabase SQL Editor

-- First, get the current admin user ID
-- SELECT id, email FROM auth.users WHERE email = 'gowsamhitha123@gmail.com';

-- Update email (replace USER_ID with the actual ID from above query)
-- UPDATE auth.users 
-- SET email = 'admin@123.com',
--     raw_user_meta_data = jsonb_set(
--         COALESCE(raw_user_meta_data, '{}'::jsonb),
--         '{email}',
--         '"admin@123.com"'
--     )
-- WHERE email = 'gowsamhitha123@gmail.com';

-- Step 2: Update password
-- Go to Supabase Dashboard → Authentication → Users
-- Find user: admin@123.com
-- Click the three dots (...) → Reset Password
-- Or use this SQL to set password directly:

-- Note: You need to hash the password first
-- The easiest way is through Supabase Dashboard:
-- 1. Go to Authentication → Users
-- 2. Find the user with email: gowsamhitha123@gmail.com (or admin@123.com after update)
-- 3. Click three dots → "Send Password Reset Email" OR "Reset Password"
-- 4. Set new password: Srigouadhar@2026

-- Alternative: Delete old user and create new one
-- WARNING: This will delete all data associated with the old user

-- Delete old admin user
DELETE FROM auth.users WHERE email = 'gowsamhitha123@gmail.com';

-- Create new admin user
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@123.com
-- Password: Srigouadhar@2026
-- Auto Confirm User: YES

-- Or use this SQL (requires admin privileges):
-- INSERT INTO auth.users (
--     instance_id,
--     id,
--     aud,
--     role,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     created_at,
--     updated_at,
--     raw_user_meta_data,
--     is_super_admin
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     gen_random_uuid(),
--     'authenticated',
--     'authenticated',
--     'admin@123.com',
--     crypt('Srigouadhar@2026', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW(),
--     '{"email": "admin@123.com"}'::jsonb,
--     false
-- );

-- Step 3: Update users table if it exists
UPDATE users 
SET email = 'admin@123.com'
WHERE email = 'gowsamhitha123@gmail.com';

-- Verify the update
SELECT id, email, created_at FROM auth.users WHERE email = 'admin@123.com';
