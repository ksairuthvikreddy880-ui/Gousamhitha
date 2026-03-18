# Quick Start Guide - Authentication System

## Prerequisites
- Node.js installed
- Backend running on port 5000
- Frontend accessible on port 8000
- Neon PostgreSQL database configured

## Starting the System

### 1. Start Backend Server
```bash
cd ecommerce-main/backend
npm install  # First time only
npm start
```

Expected output:
```
🚀 Server running on port 5000
✅ Connected to Neon PostgreSQL
```

### 2. Open Frontend
```
http://localhost:8000
```

## Testing the Authentication System

### Test 1: Sign Up
1. Click profile icon (top right)
2. Click "Sign Up" tab
3. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com`
   - Mobile: `9876543210`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Create Account"
5. **Expected**: Profile modal opens with your details

### Test 2: Sign In
1. Click profile icon
2. Fill in:
   - Email: `john@example.com`
   - Password: `password123`
3. Click "Sign In"
4. **Expected**: Profile modal opens with your details

### Test 3: Profile Persistence
1. After login, refresh the page (F5)
2. Click profile icon
3. **Expected**: Profile modal opens (not login modal)
4. Your details are displayed

### Test 4: Logout
1. In profile modal, click "Logout"
2. Confirm logout
3. **Expected**: Redirected to home page
4. Profile icon returns to default state

### Test 5: Admin Login
1. Click profile icon
2. Fill in:
   - Email: `admin`
   - Password: `Srigouadhar@2026`
3. Click "Sign In"
4. **Expected**: Redirected to admin dashboard

## Using Test Page

Open `http://localhost:8000/test-auth.html` for automated testing:

1. **Test Backend** - Verify backend is running
2. **Sign Up Test** - Create test account
3. **Sign In Test** - Login with test account
4. **Get Profile Test** - Fetch user profile
5. **Logout Test** - Logout user
6. **Cookie Check** - Verify cookies (HTTP-only cookies won't show)

## API Endpoints

### Public Endpoints
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

### Protected Endpoints
```
GET /api/auth/me
PUT /api/profile
```

## Common Issues

### Backend Not Running
```
Error: Cannot connect to server
Solution: npm start in backend directory
```

### "No token provided" Error
```
Error: Failed to load profile: No token provided
Solution: 
1. Check if backend is running
2. Verify credentials: 'include' in fetch calls
3. Check browser cookies (DevTools → Application → Cookies)
```

### Profile Modal Not Opening
```
Error: Profile modal doesn't appear after login
Solution:
1. Check browser console for errors
2. Verify backend response in Network tab
3. Ensure user data is returned from /api/auth/login
```

### Database Connection Error
```
Error: Connected to Neon PostgreSQL (but fails)
Solution:
1. Check DATABASE_URL in backend/.env
2. Verify Neon database is accessible
3. Check network connectivity
```

## File Structure

```
ecommerce-main/
├── index.html                    # Main page with profile modal
├── js/
│   ├── auth-handler.js          # Login/signup forms & profile modal
│   ├── auth-manager.js          # Auth state management
│   └── ...
├── backend/
│   ├── server.js                # Express app
│   ├── controllers/
│   │   └── authController.js    # Auth logic
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification
│   ├── routes/
│   │   └── authRoutes.js        # Auth endpoints
│   ├── config/
│   │   └── db.js                # Database connection
│   └── package.json
├── test-auth.html               # Testing page
├── AUTHENTICATION-SYSTEM-COMPLETE.md
├── IMPLEMENTATION-SUMMARY.md
└── QUICK-START.md              # This file
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    phone TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
```

## Security Notes

1. **HTTP-Only Cookies**: Token stored securely, not accessible by JavaScript
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **JWT Tokens**: Signed with secret, 7-day expiration
4. **CORS**: Restricted to localhost:8000
5. **No localStorage**: Sensitive data never stored in browser

## Next Steps

1. ✅ Authentication system working
2. ⬜ Add edit profile functionality
3. ⬜ Add password change feature
4. ⬜ Add email verification
5. ⬜ Add forgot password feature
6. ⬜ Deploy to production

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs
3. Review AUTHENTICATION-SYSTEM-COMPLETE.md
4. Review IMPLEMENTATION-SUMMARY.md
5. Test with test-auth.html

## Success Indicators

✅ Backend running on port 5000
✅ Frontend accessible on port 8000
✅ Can sign up with new account
✅ Can sign in with credentials
✅ Profile modal opens after login
✅ Profile details display correctly
✅ Can logout successfully
✅ Profile persists after page refresh
✅ Admin login redirects to dashboard
