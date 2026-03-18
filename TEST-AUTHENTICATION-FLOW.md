# Complete Authentication Flow - Testing Guide

## Prerequisites
- Backend running on port 5000 ✅
- Frontend accessible on port 8000
- Neon PostgreSQL database connected ✅

## Test Scenario 1: Complete Sign Up Flow

### Step 1: Open Application
```
1. Open http://localhost:8000 in browser
2. You should see the home page with profile icon (top right)
3. Profile icon should show default user icon (not logged in)
```

### Step 2: Click Profile Icon
```
1. Click the profile icon (top right)
2. Login modal should open
3. You should see "Sign In" and "Sign Up" tabs
4. "Sign In" tab should be active by default
```

### Step 3: Switch to Sign Up
```
1. Click "Sign Up" tab
2. Form should show:
   - Full Name field
   - Email field
   - Mobile Number field
   - Password field
   - Confirm Password field
   - "Create Account" button
```

### Step 4: Fill Sign Up Form
```
Full Name: John Doe
Email: john.doe@example.com
Mobile: 9876543210
Password: password123
Confirm Password: password123
```

### Step 5: Submit Sign Up
```
1. Click "Create Account" button
2. You should see: "Creating account..."
3. Then: "Account created! Logging you in..."
4. Modal should close
5. Profile modal should open automatically
6. Profile modal should show:
   - Name: John Doe
   - Email: john.doe@example.com
   - Phone: 9876543210
   - Address: -
   - "Edit Profile" button
   - "Logout" button
```

### Step 6: Verify Profile Icon Changed
```
1. Close profile modal (click X)
2. Profile icon should now show "J" (first letter of name)
3. Icon should be green circle with white text
```

### Step 7: Refresh Page
```
1. Press F5 to refresh page
2. Profile icon should still show "J"
3. Click profile icon
4. Profile modal should open (NOT login modal)
5. Your details should still be displayed
```

**Expected Result**: ✅ User stays logged in after page refresh

---

## Test Scenario 2: Sign In with Existing Account

### Step 1: Logout First
```
1. Click profile icon
2. Click "Logout" button
3. Confirm logout
4. Should redirect to home page
5. Profile icon should return to default user icon
```

### Step 2: Click Profile Icon
```
1. Click profile icon
2. Login modal should open
3. "Sign In" tab should be active
```

### Step 3: Fill Sign In Form
```
Email: john.doe@example.com
Password: password123
```

### Step 4: Submit Sign In
```
1. Click "Sign In" button
2. You should see: "Signing in..."
3. Then: "Login successful!"
4. Modal should close
5. Profile modal should open automatically
6. Your details should be displayed
```

**Expected Result**: ✅ Login successful, profile modal opens

---

## Test Scenario 3: Admin Login

### Step 1: Logout
```
1. Click profile icon
2. Click "Logout"
3. Confirm logout
```

### Step 2: Click Profile Icon
```
1. Click profile icon
2. Login modal should open
```

### Step 3: Fill Admin Credentials
```
Email: admin
Password: Srigouadhar@2026
```

### Step 4: Submit
```
1. Click "Sign In"
2. Should redirect to /admin-dashboard.html
3. Admin dashboard should load
```

**Expected Result**: ✅ Admin redirected to dashboard

---

## Test Scenario 4: Cookie Verification

### Step 1: Open DevTools
```
1. Press F12 to open DevTools
2. Go to "Application" tab
3. Click "Cookies" in left sidebar
4. Select http://localhost:8000
```

### Step 2: Before Login
```
1. You should see NO auth_token cookie
2. Or it should be empty/expired
```

### Step 3: Sign In
```
1. Click profile icon
2. Sign in with: john.doe@example.com / password123
3. Profile modal should open
```

### Step 4: Check Cookie After Login
```
1. Go back to DevTools Cookies
2. You should see auth_token cookie
3. Cookie should have:
   - Name: auth_token
   - Value: (long JWT token)
   - HttpOnly: ✅ (checked)
   - Secure: (unchecked for localhost, checked in production)
   - SameSite: Lax
   - Expires: (7 days from now)
```

**Expected Result**: ✅ HTTP-only cookie is set

---

## Test Scenario 5: Network Request Verification

### Step 1: Open Network Tab
```
1. Press F12
2. Go to "Network" tab
3. Make sure recording is enabled
```

### Step 2: Sign In
```
1. Click profile icon
2. Sign in with credentials
3. Watch network requests
```

### Step 3: Check Login Request
```
1. Look for POST request to /api/auth/login
2. Click on it
3. Go to "Request Headers"
4. You should see:
   - Content-Type: application/json
   - (No Authorization header - using cookie instead)
5. Go to "Response Headers"
6. You should see:
   - Set-Cookie: auth_token=...
```

### Step 4: Check Profile Request
```
1. Look for GET request to /api/auth/me
2. Click on it
3. Go to "Request Headers"
4. You should see:
   - Cookie: auth_token=...
5. Go to "Response"
6. You should see user data:
   - id, email, first_name, last_name, phone, address
```

**Expected Result**: ✅ Cookies are sent with requests

---

## Test Scenario 6: Error Handling

### Test 6a: Wrong Password
```
1. Click profile icon
2. Enter email: john.doe@example.com
3. Enter password: wrongpassword
4. Click "Sign In"
5. You should see error: "Invalid email or password"
6. Modal should stay open
```

### Test 6b: Non-existent Email
```
1. Click profile icon
2. Enter email: nonexistent@example.com
3. Enter password: password123
4. Click "Sign In"
5. You should see error: "Invalid email or password"
```

### Test 6c: Password Mismatch on Signup
```
1. Click profile icon
2. Click "Sign Up"
3. Fill form with mismatched passwords
4. Click "Create Account"
5. You should see error: "Passwords do not match"
```

### Test 6d: Short Password
```
1. Click profile icon
2. Click "Sign Up"
3. Enter password: 123 (less than 6 characters)
4. Click "Create Account"
5. You should see error: "Password must be at least 6 characters"
```

**Expected Result**: ✅ All error messages display correctly

---

## Test Scenario 7: Backend Connection

### Step 1: Open Test Page
```
1. Open http://localhost:8000/test-auth.html
2. You should see testing interface
```

### Step 2: Test Backend Connection
```
1. Click "Test Backend" button
2. You should see: "✅ Backend Connected"
3. Response should show:
   - message: "Backend is running"
   - status: "success"
   - timestamp: (current time)
```

### Step 3: Test Signup
```
1. Fill in test form:
   - Email: testuser@example.com
   - Password: password123
   - Name: Test User
   - Phone: 9876543210
2. Click "Sign Up"
3. You should see: "✅ Signup Successful"
```

### Step 4: Test Login
```
1. Fill in:
   - Email: testuser@example.com
   - Password: password123
2. Click "Sign In"
3. You should see: "✅ Login Successful"
4. Response should include token and user data
```

### Step 5: Test Get Profile
```
1. Click "Get Profile"
2. You should see: "✅ Profile Fetched"
3. Response should show user details
```

### Step 6: Test Logout
```
1. Click "Logout"
2. You should see: "✅ Logout Successful"
```

**Expected Result**: ✅ All tests pass

---

## Troubleshooting

### Issue: "No token provided" Error
```
Cause: credentials: 'include' not in fetch call
Solution: Check that all auth fetch calls have credentials: 'include'
Files to check:
- js/auth-handler.js
- js/auth-manager.js
- google-auth-direct.js
```

### Issue: Profile Modal Not Opening
```
Cause: Backend not running or API error
Solution:
1. Check backend is running: npm start in backend directory
2. Check browser console for errors (F12)
3. Check network tab for failed requests
4. Verify backend is on port 5000
```

### Issue: Cookie Not Being Set
```
Cause: Backend not setting cookie or CORS issue
Solution:
1. Check backend/server.js has CORS with credentials: true
2. Check backend/controllers/authController.js sets cookie
3. Check browser DevTools → Application → Cookies
4. Verify cookie-parser middleware is enabled
```

### Issue: User Data Not Persisting
```
Cause: Cookie not being sent with requests
Solution:
1. Verify credentials: 'include' in all fetch calls
2. Check browser DevTools → Network tab
3. Verify Cookie header is present in requests
4. Check HTTP-only cookie is set correctly
```

### Issue: Backend Connection Failed
```
Cause: Backend not running
Solution:
1. Open terminal in backend directory
2. Run: npm start
3. Wait for: "🚀 Server running on port 5000"
4. Wait for: "✅ Connected to Neon PostgreSQL"
```

---

## Success Checklist

- [ ] Backend running on port 5000
- [ ] Frontend accessible on port 8000
- [ ] Can sign up with new account
- [ ] Auto-login works after signup
- [ ] Profile modal opens after login
- [ ] User details display correctly
- [ ] Profile icon shows user initial
- [ ] Can refresh page and stay logged in
- [ ] Can sign in with existing account
- [ ] Can logout successfully
- [ ] Admin login redirects to dashboard
- [ ] HTTP-only cookie is set
- [ ] Cookie is sent with requests
- [ ] No "No token provided" errors
- [ ] All test page tests pass

---

## Performance Notes

- Login should complete in < 1 second
- Profile modal should open in < 500ms
- Page refresh should maintain login state instantly
- No console errors should appear

---

## Security Verification

- [ ] HTTP-only cookie set (cannot access via JavaScript)
- [ ] Credentials sent with all auth requests
- [ ] CORS allows credentials
- [ ] No localStorage usage
- [ ] No sessionStorage usage
- [ ] JWT token verified on backend
- [ ] Password hashed with bcrypt
- [ ] Token expires in 7 days

---

## Next Steps After Testing

1. ✅ Verify all tests pass
2. ⬜ Add edit profile functionality
3. ⬜ Add password change feature
4. ⬜ Add email verification
5. ⬜ Add forgot password feature
6. ⬜ Deploy to production with HTTPS
