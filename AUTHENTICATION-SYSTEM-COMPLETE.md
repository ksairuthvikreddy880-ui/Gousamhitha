# Complete Authentication System - HTTP-Only Cookies

## Overview
This document describes the complete authentication system using HTTP-only cookies for secure token storage and Neon PostgreSQL for user data persistence.

## Architecture

### Backend (Node.js + Express)
- **Port**: 5000
- **Database**: Neon PostgreSQL
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Password Hashing**: bcrypt

### Frontend (HTML/CSS/JS)
- **Port**: 8000
- **Token Storage**: HTTP-only cookies (set by backend)
- **User Data**: Fetched from API on demand
- **No localStorage or sessionStorage**: All sensitive data in cookies

## Authentication Flow

### 1. Sign Up
```
User fills signup form
  ↓
POST /api/auth/signup
  ↓
Backend validates & hashes password
  ↓
User inserted into database
  ↓
Auto-login with same credentials
  ↓
JWT token set in HTTP-only cookie
  ↓
Profile modal opens with user details
```

### 2. Sign In
```
User enters email & password
  ↓
POST /api/auth/login
  ↓
Backend verifies credentials
  ↓
JWT token generated & set in HTTP-only cookie
  ↓
User data returned to frontend
  ↓
Profile modal opens with user details
```

### 3. Profile Access
```
User clicks profile icon
  ↓
Check if logged in (user data in memory)
  ↓
If logged in: Show profile modal
If not logged in: Show login modal
  ↓
GET /api/auth/me (with credentials: 'include')
  ↓
Backend reads token from cookie
  ↓
Verifies JWT token
  ↓
Returns user data from database
  ↓
Profile modal displays user details
```

### 4. Logout
```
User clicks logout
  ↓
POST /api/auth/logout (with credentials: 'include')
  ↓
Backend clears HTTP-only cookie
  ↓
Frontend clears user data from memory
  ↓
Redirect to home page
```

## Key Files

### Backend
- `backend/server.js` - Express app with CORS & cookie-parser
- `backend/controllers/authController.js` - Auth logic (signup, login, logout, getCurrentUser)
- `backend/middleware/authMiddleware.js` - JWT verification from cookies
- `backend/routes/authRoutes.js` - Auth endpoints
- `backend/config/db.js` - Neon PostgreSQL connection

### Frontend
- `index.html` - Main page with profile modal
- `js/auth-handler.js` - Sign up/in forms & profile modal
- `js/auth-manager.js` - Auth state management (uses HTTP-only cookies)

## API Endpoints

### Public Endpoints
```
POST /api/auth/signup
  Body: { email, password, first_name, last_name, phone }
  Response: { success, user }

POST /api/auth/login
  Body: { email, password }
  Response: { success, token, user }
  Sets: auth_token HTTP-only cookie

POST /api/auth/logout
  Response: { success }
  Clears: auth_token cookie
```

### Protected Endpoints (require valid JWT in cookie)
```
GET /api/auth/me
  Response: { success, user }
  Requires: credentials: 'include' in fetch

PUT /api/profile
  Body: { first_name, last_name, phone, address }
  Response: { success, user }
  Requires: credentials: 'include' in fetch
```

## HTTP-Only Cookie Details

### Cookie Settings
```javascript
res.cookie('auth_token', token, {
    httpOnly: true,      // Cannot be accessed by JavaScript
    secure: false,       // Set to true in production (HTTPS only)
    sameSite: 'lax',     // CSRF protection
    path: '/',           // Available to entire site
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});
```

### Why HTTP-Only?
- Cannot be stolen by XSS attacks
- Automatically sent with every request to backend
- Cannot be accessed or modified by JavaScript
- Cleared on logout

## Frontend Implementation

### Fetch with Credentials
All API calls must include `credentials: 'include'`:

```javascript
fetch('/api/auth/me', {
    method: 'GET',
    credentials: 'include',  // IMPORTANT: Sends cookies
    headers: { 'Content-Type': 'application/json' }
})
```

### Auth Manager
The `AuthManager` class handles:
- Login/signup
- User state management
- Authenticated API calls
- Logout

```javascript
window.authManager.isLoggedIn()  // Check if user is logged in
window.authManager.user          // Get current user data
window.authManager.logout()      // Logout
```

### Profile Modal
Shows user details after login:
- Name
- Email
- Phone
- Address
- Edit Profile button
- Logout button

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Admin Login
Special admin credentials:
- Email: `admin`
- Password: `Srigouadhar@2026`
- Redirects to: `/admin-dashboard.html`

## Testing

### Test User
- Email: `test@example.com`
- Password: `password123`

### Test Flow
1. Open http://localhost:8000
2. Click profile icon
3. Click "Sign Up" tab
4. Create account with test data
5. Auto-login and profile modal opens
6. Verify user details display
7. Click logout
8. Profile icon returns to default state
9. Click profile icon again
10. Login modal appears

## Security Features

1. **Password Hashing**: bcrypt with salt rounds
2. **JWT Tokens**: Signed with secret key, 7-day expiration
3. **HTTP-Only Cookies**: Cannot be accessed by JavaScript
4. **CORS**: Restricted to localhost:8000
5. **Middleware**: Token verification on protected routes
6. **No localStorage**: Sensitive data never stored in browser storage

## Troubleshooting

### "No token provided" Error
- Ensure `credentials: 'include'` in fetch calls
- Check browser DevTools → Application → Cookies
- Verify cookie is set after login
- Check CORS configuration

### Cookie Not Being Set
- Verify backend is setting cookie correctly
- Check response headers for Set-Cookie
- Ensure sameSite and secure settings are correct
- Test with curl: `curl -v http://localhost:5000/api/auth/login`

### Profile Modal Not Opening
- Check browser console for errors
- Verify backend is running on port 5000
- Check network tab for failed requests
- Ensure user data is in memory after login

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
```

## Deployment Notes

For production:
1. Set `secure: true` in cookie settings (HTTPS only)
2. Use strong JWT_SECRET
3. Update CORS origin to production domain
4. Use environment variables for sensitive data
5. Enable HTTPS
6. Set appropriate sameSite policy
