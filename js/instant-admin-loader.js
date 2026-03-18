// INSTANT ADMIN LOADER - Load real data within 1 second on refresh
(function() {
    'use strict';
    
    console.log('⚡ INSTANT ADMIN LOADER ACTIVATED');
    
    // Immediately try to load data when script loads
    let loadAttempts = 0;
    const maxAttempts = 10;
    
    // Try to load data immediately and keep trying until Supabase is ready
    function attemptInstantLoad() {
        loadAttempts++;
        console.log(`🔄 Attempt ${loadAttempts}: Checking for Supabase...`);
        
        if (window.supabase && typeof window.supabase.from === 'function') {
            console.log('✅ Supabase found! Loading data instantly...');
            loadAdminDataInstantly();
            return;
        }
        
        if (loadAttempts < maxAttempts) {
            // Try again in 50ms for faster response
            setTimeout(attemptInstantLoad, 50);
        } else {
            console.log('⚠️ Max attempts reached, waiting for supabaseReady event...');
        }
    }
    
    // Load admin data instantly
    async function loadAdminDataInstantly() {
        console.log('🚀 Loading admin data instantly...');
        
        // Always show loading state first
        updateDashboardCards('loading');
        
        // Check persistent cache first
        if (window.AdminCache && window.AdminCache.isValid()) {
            const cachedData = window.AdminCache.get();
            if (cachedData) {
                console.log('⚡ Using persistent cache - instant load!');
                // Small delay to show loading dots briefly
                setTimeout(() => {
                    updateDashboardCards('success', cachedData);
                    updateVendorsTable(cachedData.vendors, cachedData.products);
                    updateRecentOrders(cachedData.orders);
                }, 100);
                return; // Exit early with cached data
            }
        }
        
        try {
            // Load all data in parallel for maximum speed
            const [productsResult, vendorsResult, ordersResult] = await Promise.all([
                window.supabase.from('products').select('*'),
                window.supabase.from('vendors').select('*'),
                window.supabase.from('orders').select('*, order_items(*)')
            ]);
            
            // Process results
            const products = productsResult.data || [];
            const vendors = vendorsResult.data || [];
            const orders = ordersResult.data || [];
            
            console.log('✅ Data loaded from database:', {
                products: products.length,
                vendors: vendors.length,
                orders: orders.length
            });
            
            // Cache the data for future use
            if (window.AdminCache) {
                window.AdminCache.set(products, vendors, orders);
            }
            
            // Update UI immediately
            updateDashboardCards('success', { products, vendors, orders });
            updateVendorsTable(vendors, products);
            updateRecentOrders(orders);
            
        } catch (error) {
            console.error('❌ Error loading admin data:', error);
            updateDashboardCards('error');
        }
    }
    
    // Update dashboard cards with different states
    function updateDashboardCards(state, data = null) {
        const elements = {
            'total-products': document.getElementById('total-products'),
            'total-vendors': document.getElementById('total-vendors'),
            'total-orders': document.getElementById('total-orders'),
            'out-of-stock': document.getElementById('out-of-stock')
        };
        
        switch (state) {
            case 'loading':
                Object.values(elements).forEach(el => {
                    if (el) {
                        el.textContent = '...';
                        el.style.color = '#666';
                    }
                });
                break;
                
            case 'success':
                const { products, vendors, orders } = data;
                const outOfStock = products.filter(p => !p.in_stock || p.stock === 0).length;
                
                if (elements['total-products']) elements['total-products'].textContent = products.length;
                if (elements['total-vendors']) elements['total-vendors'].textContent = vendors.length;
                if (elements['total-orders']) elements['total-orders'].textContent = orders.length;
                if (elements['out-of-stock']) elements['out-of-stock'].textContent = outOfStock;
                
                // Reset colors
                Object.values(elements).forEach(el => {
                    if (el) el.style.color = '';
                });
                break;
                
            case 'error':
                Object.values(elements).forEach(el => {
                    if (el) {
                        el.textContent = '—';
                        el.style.color = '#d32f2f';
                    }
                });
                break;
        }
    }
    
    // Update vendors table
    function updateVendorsTable(vendors, products) {
        const tbody = document.getElementById('vendors-list-body');
        if (!tbody) return;
        
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No vendors yet</td></tr>';
            return;
        }
        
        tbody.innerHTML = vendors.map(vendor => {
            const vendorProducts = products.filter(p => p.vendor_id === vendor.id);
            const createdDate = vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A';
            
            return `
                <tr>
                    <td style="font-weight: 600;">${vendor.vendor_name}</td>
                    <td>${vendor.business_name}</td>
                    <td>${vendor.phone || 'N/A'}</td>
                    <td><span class="status-badge in-stock" style="background: #e8f5e9; color: #2e7d32; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">active</span></td>
                    <td style="font-weight: 600; color: #4a7c59;">${vendorProducts.length}</td>
                    <td style="color: #666;">${createdDate}</td>
                </tr>
            `;
        }).join('');
    }
    
    // Update recent orders
    function updateRecentOrders(orders) {
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (!recentOrdersList) return;
        
        if (!orders || orders.length === 0) {
            recentOrdersList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">No orders yet</div>';
            return;
        }
        
        const recentOrders = orders.slice(0, 5);
        
        recentOrdersList.innerHTML = recentOrders.map(order => `
            <div style="padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: #333;">#${order.id.substring(0, 8)}</div>
                    <div style="font-size: 0.9rem; color: #666;">${order.customer_name}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: #4a7c59;">₹${order.total}</div>
                    <div style="font-size: 0.8rem; color: #666;">${order.order_status || 'Pending'}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Start attempting to load immediately
    attemptInstantLoad();
    
    // Also try when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attemptInstantLoad);
    } else {
        // DOM is already ready, try again immediately
        setTimeout(attemptInstantLoad, 10);
    }
    
    // Also listen for supabaseReady event as backup
    window.addEventListener('supabaseReady', () => {
        console.log('🔄 supabaseReady event received, loading data...');
        loadAdminDataInstantly();
    });
    
    // Override the original loadDashboard function to prevent conflicts
    window.loadDashboard = loadAdminDataInstantly;
    
    // Expose function for manual refresh
    window.refreshAdminData = loadAdminDataInstantly;
    
    console.log('✅ Instant Admin Loader ready - will load data within 1 second');
    
})();