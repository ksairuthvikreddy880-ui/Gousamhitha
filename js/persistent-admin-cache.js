// PERSISTENT ADMIN CACHE - Keep data loaded across admin pages
(function() {
    'use strict';
    
    console.log('💾 PERSISTENT ADMIN CACHE ACTIVATED');
    
    const CACHE_KEY = 'adminDashboardCache';
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache
    
    // Global admin cache object
    window.AdminCache = {
        // Get cached data
        get: function() {
            try {
                const cached = localStorage.getItem(CACHE_KEY);
                if (!cached) return null;
                
                const data = JSON.parse(cached);
                const now = Date.now();
                
                // Check if cache is still valid
                if (now - data.timestamp > CACHE_TTL) {
                    console.log('📅 Cache expired, clearing...');
                    this.clear();
                    return null;
                }
                
                console.log('✅ Using cached admin data:', {
                    products: data.products?.length || 0,
                    vendors: data.vendors?.length || 0,
                    orders: data.orders?.length || 0,
                    age: Math.round((now - data.timestamp) / 1000) + 's'
                });
                
                return data;
            } catch (error) {
                console.error('❌ Error reading cache:', error);
                return null;
            }
        },
        
        // Set cached data
        set: function(products, vendors, orders) {
            try {
                const data = {
                    products: products || [],
                    vendors: vendors || [],
                    orders: orders || [],
                    timestamp: Date.now()
                };
                
                localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                
                console.log('💾 Admin data cached:', {
                    products: data.products.length,
                    vendors: data.vendors.length,
                    orders: data.orders.length
                });
                
                return true;
            } catch (error) {
                console.error('❌ Error saving cache:', error);
                return false;
            }
        },
        
        // Clear cache
        clear: function() {
            localStorage.removeItem(CACHE_KEY);
            console.log('🗑️ Admin cache cleared');
        },
        
        // Check if cache exists and is valid
        isValid: function() {
            const cached = this.get();
            return cached !== null;
        }
    };
    
    // Clear cache on admin logout
    window.addEventListener('beforeunload', function() {
        // Don't clear cache on page navigation, only on window close
        if (performance.navigation.type === 1) { // Reload
            // Keep cache on refresh
        }
    });
    
    // Clear cache when admin logs out
    const originalAdminLogout = window.adminLogout;
    if (typeof originalAdminLogout === 'function') {
        window.adminLogout = function() {
            console.log('🚪 Admin logout detected, clearing cache...');
            window.AdminCache.clear();
            return originalAdminLogout.apply(this, arguments);
        };
    }
    
    console.log('✅ Persistent Admin Cache ready');
    
})();