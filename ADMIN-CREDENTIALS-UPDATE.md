# Update Admin Credentials in Supabase

## New Admin Credentials
- **Email**: `admin@123.com`
- **Password**: `Srigouadhar@2026`

## Steps to Update in Supabase Dashboard

### Method 1: Update Existing User (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `blsgyybaevuytmgpljyk`

2. **Open Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Find Current Admin User**
   - Look for user with email: `gowsamhitha123@gmail.com`
   - Click on the user to open details

4. **Update Email**
   - In the user details, find the email field
   - Change from `gowsamhitha123@gmail.com` to `admin@123.com`
   - Click "Save" or "Update"

5. **Reset Password**
   - Click the three dots (...) menu on the user
   - Select "Reset Password"
   - Enter new password: `Srigouadhar@2026`
   - Confirm the password
   - Click "Update Password"

### Method 2: Create New Admin User (Alternative)

If Method 1 doesn't work, create a new admin user:

1. **Go to Authentication → Users**
2. **Click "Add User" button**
3. **Fill in details**:
   - Email: `admin@123.com`
   - Password: `Srigouadhar@2026`
   - Auto Confirm User: ✓ (check this box)
4. **Click "Create User"**
5. **Delete old admin user** (optional):
   - Find `gowsamhitha123@gmail.com`
   - Click three dots → Delete

### Method 3: Using SQL Editor

1. **Go to SQL Editor** in Supabase Dashboard
2. **Run this query** to update email:

```sql
UPDATE auth.users 
SET email = 'admin@123.com',
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{email}',
        '"admin@123.com"'
    )
WHERE email = 'gowsamhitha123@gmail.com';
```

3. **Update password** through Dashboard (Authentication → Users → Reset Password)

## Verification

After updating, test the login:

1. Go to your website
2. Click on Profile/Login
3. Enter:
   - Email: `admin@123.com`
   - Password: `Srigouadhar@2026`
4. Should redirect to admin dashboard

## Updated in Code

The following files reference the admin email and have been updated:

- `DEPLOYMENT-CHECKLIST.md`
- `VERCEL-DEPLOYMENT.md`
- `VERCEL-ENV-SETUP.md`

## Important Notes

- The old email `gowsamhitha123@gmail.com` will no longer work
- Make sure to save the new credentials securely
- If you have any orders or data associated with the old admin account, they will remain linked to that user ID
- The admin check in the code looks for the email, so updating the email will automatically make the new email the admin

---

**New Admin Credentials**
- Email: `admin@123.com`
- Password: `Srigouadhar@2026`
