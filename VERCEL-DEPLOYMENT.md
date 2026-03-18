# Vercel Deployment Guide

## Project Configuration

This project is configured for static site deployment on Vercel with Supabase backend.

### Supabase Configuration

The Supabase credentials are hardcoded in `js/supabase-client.js`:
- **URL**: https://blsgyybaevuytmgpljyk.supabase.co
- **Anon Key**: (embedded in the file)

### Deployment Steps

1. **Connect to GitHub**
   - Push all changes to your GitHub repository
   - Connect the repository to Vercel

2. **Vercel Settings**
   - Framework Preset: Other
   - Build Command: (leave empty)
   - Output Directory: `ecommerce-main`
   - Install Command: (leave empty)

3. **No Environment Variables Needed**
   - Supabase credentials are hardcoded for static deployment
   - No build process required

### File Structure

```
project-root/
├── vercel.json (deployment config)
└── ecommerce-main/
    ├── index.html
    ├── shop.html
    ├── cart.html
    ├── checkout.html
    ├── orders.html
    ├── profile.html
    ├── admin-*.html
    ├── js/
    │   ├── supabase-client.js (v=8)
    │   ├── supabase-auth.js
    │   └── ...
    └── ...
```

### Cache Busting

All script files use version query parameters (e.g., `?v=8`) to force browser cache refresh after updates.

### Supabase Initialization

The client uses UMD build from CDN:
1. Loads Supabase library from jsdelivr CDN
2. Creates client with hardcoded credentials
3. Dispatches 'supabaseReady' event
4. All pages wait for this event before making database calls

### Testing After Deployment

1. Visit your domain (e.g., gousamhitha.com)
2. Check browser console for "Supabase initialized"
3. Navigate to /shop.html - products should load
4. Test authentication (sign up/login)
5. Test cart functionality
6. Test checkout process
7. Test admin panel (login with admin email)

### Troubleshooting

If products don't load:
1. Check browser console for errors
2. Verify Supabase URL and key are correct
3. Check Supabase dashboard for RLS policies
4. Ensure tables exist: products, cart, orders, order_items, vendors, delivery_zones
5. Clear browser cache (Ctrl + Shift + Delete)
6. Hard refresh (Ctrl + F5)

### Admin Access

- Email: admin@123.com
- Password: Srigouadhar@2026
- Redirects to admin dashboard on login

### Database Tables Required

- users
- products
- cart
- orders
- order_items
- vendors
- delivery_zones

All tables should have appropriate RLS policies enabled.
