// ADMIN FAST LOADER - Load admin dashboard data instantly
(function() {
    'use strict';
    
    console.log('⚡ ADMIN FAST LOADER ACTIVATED');
    
    // Cache for admin data
    const adminCache = {
        products: null,
        vendors: null,
        orders: null,
        timestamp: 0,
        TTL: 30000 // 30 seconds cache
    };
    
    // Load all admin data in parallel for maximum speed
    async function loadAdminDataFast() {
        console.log('🚀 Loading admin data in parallel...');
        
        try {
            // Check cache first
            if (adminCache.timestamp && (Date.now() - adminCache.timestamp) < adminCache.TTL) {
                console.log('📊 Using cached admin data');
                updateDashboardUI(adminCache);
                return;
            }
            
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
            
            // Update cache
            adminCache.products = products;
            adminCache.vendors = vendors;
            adminCache.orders = orders;
            adminCache.timestamp = Date.now();
            
            console.log('✅ Admin data loaded:', {
                products: products.length,
                vendors: vendors.length,
                orders: orders.length
            });
            
            // Update UI immediately
            updateDashboardUI(adminCache);
            
        } catch (error) {
            console.error('❌ Error loading admin data:', error);
            showErrorState();
        }
    }
    
    // Update dashboard UI with loaded data
    function updateDashboardUI(data) {
        const { products, vendors, orders } = data;
        
        // Update dashboard cards
        const outOfStock = products.filter(p => !p.in_stock || p.stock === 0).length;
        
        updateElement('total-products', products.length);
        updateElement('total-vendors', vendors.length);
        updateElement('total-orders', orders.length);
        updateElement('out-of-stock', outOfStock);
        
        // Update vendors table
        updateVendorsTable(vendors, products);
        
        // Update recent orders
        updateRecentOrders(orders);
        
        console.log('✅ Dashboard UI updated instantly');
    }
    
    // Update element with animation
    function updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animate the number change
            const currentValue = parseInt(element.textContent) || 0;
            animateNumber(element, currentValue, value, 500);
        }
    }
    
    // Animate number changes
    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }
    
    // Update vendors table with fast rendering
    function updateVendorsTable(vendors, products) {
        const tbody = document.getElementById('vendors-list-body');
        if (!tbody) return;
        
        if (!vendors || vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #666;">No vendors yet</td></tr>';
            return;
        }
        
        // Fast rendering with document fragment
        const fragment = document.createDocumentFragment();
        
        vendors.forEach(vendor => {
            const vendorProducts = products.filter(p => p.vendor_id === vendor.id);
            const createdDate = vendor.created_at ? new Date(vendor.created_at).toLocaleDateString() : 'N/A';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="font-weight: 600;">${vendor.vendor_name}</td>
                <td>${vendor.business_name}</td>
                <td>${vendor.phone || 'N/A'}</td>
                <td><span class="status-badge in-stock" style="background: #e8f5e9; color: #2e7d32; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">active</span></td>
                <td style="font-weight: 600; color: #4a7c59;">${vendorProducts.length}</td>
                <td style="color: #666;">${createdDate}</td>
            `;
            
            fragment.appendChild(row);
        });
        
        tbody.innerHTML = '';
        tbody.appendChild(fragment);
    }
    
    // Update recent orders section
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
    
    // Show error state
    function showErrorState() {
        const elements = ['total-products', 'total-vendors', 'total-orders', 'out-of-stock'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '—';
                element.style.color = '#d32f2f';
            }
        });
        
        const tbody = document.getElementById('vendors-list-body');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading data. Please refresh the page.</td></tr>';
        }
        
        const recentOrdersList = document.getElementById('recent-orders-list');
        if (recentOrdersList) {
            recentOrdersList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading orders</div>';
        }
    }
    
    // Preload data when Supabase is ready
    window.addEventListener('supabaseReady', () => {
        console.log('🔄 Supabase ready, loading admin data...');
        loadAdminDataFast();
    });
    
    // Also try after a short delay
    setTimeout(() => {
        if (window.supabase && typeof window.supabase.from === 'function') {
            loadAdminDataFast();
        }
    }, 500);
    
    // Refresh data periodically
    setInterval(() => {
        if (window.supabase && typeof window.supabase.from === 'function') {
            loadAdminDataFast();
        }
    }, 60000); // Every minute
    
    // Expose function for manual refresh
    window.refreshAdminData = loadAdminDataFast;
    
    // Override the original loadDashboard function
    window.loadDashboard = loadAdminDataFast;
    
    console.log('✅ Admin Fast Loader ready');
    
})();