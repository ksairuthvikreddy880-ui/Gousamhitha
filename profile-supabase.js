// Profile Page - Supabase Version with Enhanced Error Handling

// Wait for Supabase to be ready
window.addEventListener('supabaseReady', function() {
    console.log('✅ Supabase ready event received');
    checkAndLoadProfile();
});

// Also try after a short delay
setTimeout(checkAndLoadProfile, 1000);

// Fallback check after longer delay
setTimeout(() => {
    if (!window.supabase) {
        console.error('❌ Supabase failed to load after 3 seconds');
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Connection Error</h3>
                <p>Unable to connect to the server. Please:</p>
                <ul style="text-align: left; display: inline-block; margin: 1rem 0;">
                    <li>Check your internet connection</li>
                    <li>Refresh the page</li>
                    <li>Try again in a few moments</li>
                </ul>
                <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Refresh Page
                </button>
                <br><br>
                <a href="index.html" style="color: #4a7c59;">← Go back to Home</a>
            </div>
        `;
    }
}, 3000);

async function checkAndLoadProfile() {
    if (!window.supabase) {
        console.log('⏳ Waiting for Supabase...');
        setTimeout(checkAndLoadProfile, 500);
        return;
    }

    console.log('🔍 Checking authentication...');
    
    try {
        const { data: { user }, error } = await window.supabase.auth.getUser();
        
        if (error) {
            console.error('❌ Auth error:', error);
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <h3>Session Expired</h3>
                    <p>Your session has expired. Please log in again.</p>
                    <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; text-decoration: none; border-radius: 5px;">
                        Go to Home
                    </a>
                </div>
            `;
            return;
        }
        
        console.log('👤 User:', user ? 'Authenticated' : 'Not authenticated');
        
        if (user) {
            loadProfile(user);
        } else {
            console.log('🔄 Not authenticated, showing login prompt...');
            document.getElementById('loading').innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    <h3>Not Logged In</h3>
                    <p>Please log in to view your profile.</p>
                    <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; text-decoration: none; border-radius: 5px;">
                        Go to Home & Login
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error checking auth:', error);
        document.getElementById('loading').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Error Loading Profile</h3>
                <p>There was an error loading your profile. Please try again.</p>
                <button onclick="checkAndLoadProfile()" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0.5rem;">
                    Try Again
                </button>
                <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 5px;">
                    Go to Home
                </a>
            </div>
        `;
    }
}

async function loadProfile(user) {
    const loading = document.getElementById('loading');
    const content = document.getElementById('profile-content');

    try {
        console.log('📊 Loading profile data...');
        
        // Get user data from users table
        const { data: userData, error: userError } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle to handle 0 rows gracefully

        if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('⚠️ Error fetching user data:', userError);
        }

        const fullName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : '';
        const displayName = fullName || user.email?.split('@')[0] || 'User';

        // Get initial from name or email
        const initial = displayName.charAt(0).toUpperCase();

        // Update avatar
        document.getElementById('profile-avatar').textContent = initial;

        // Update header
        document.getElementById('profile-name').textContent = displayName;
        document.getElementById('profile-email').textContent = user.email || 'No email';

        // Update fields
        document.getElementById('field-name').textContent = fullName || '-';
        document.getElementById('field-email').textContent = user.email || '-';
        document.getElementById('field-phone').textContent = userData?.phone || '-';
        document.getElementById('field-address').textContent = userData?.address || '-';

        // Get member since date
        const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : '-';
        document.getElementById('field-joined').textContent = createdAt;

        // Try to get orders and cart count
        try {
            console.log('📈 Loading statistics...');
            
            // Get orders count - handle if table doesn't exist
            try {
                const { count: ordersCount } = await window.supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', user.id);

                document.getElementById('field-orders').textContent = ordersCount || 0;
            } catch (ordersError) {
                console.log('ℹ️ Orders table not available:', ordersError.message);
                document.getElementById('field-orders').textContent = '0';
            }

            // Get cart count - handle if table doesn't exist
            try {
                const { data: cartData } = await window.supabase
                    .from('cart')
                    .select('quantity')
                    .eq('user_id', user.id);

                const cartCount = cartData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                document.getElementById('field-cart').textContent = cartCount;
            } catch (cartError) {
                console.log('ℹ️ Cart table not available:', cartError.message);
                document.getElementById('field-cart').textContent = '0';
            }
        } catch (error) {
            console.error('⚠️ Error fetching stats:', error);
            // Set defaults if stats fail
            document.getElementById('field-orders').textContent = '0';
            document.getElementById('field-cart').textContent = '0';
        }

        // Show content
        console.log('✅ Profile loaded successfully');
        loading.style.display = 'none';
        content.style.display = 'block';

    } catch (error) {
        console.error('❌ Error loading profile:', error);
        loading.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                <h3>Profile Loading Error</h3>
                <p>Unable to load your profile data.</p>
                <button onclick="loadProfile(${JSON.stringify(user)})" style="padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 0.5rem;">
                    Retry
                </button>
                <a href="index.html" style="display: inline-block; margin-top: 1rem; padding: 0.5rem 1rem; background: #666; color: white; text-decoration: none; border-radius: 5px;">
                    Go to Home
                </a>
            </div>
        `;
    }
}

function editProfile() {
    alert('Edit profile feature coming soon!\n\nYou can update your profile information through the account settings.');
}

async function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            console.log('🚪 Logging out...');
            await window.supabase.auth.signOut();
            console.log('✅ Logged out successfully');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('❌ Logout error:', error);
            // Force redirect even if logout fails
            window.location.href = 'index.html';
        }
    }
}

// Make functions globally available for debugging
window.checkAndLoadProfile = checkAndLoadProfile;
window.loadProfile = loadProfile;