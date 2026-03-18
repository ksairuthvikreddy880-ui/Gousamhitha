// Optimized Admin Script - Performance improvements without UI changes
(function() {
    'use strict';
    
    // Cache for frequently accessed data
    const adminCache = {
        products: null,
        vendors: null,
        orders: null,
        lastFetch: {}
    };
    
    // Optimized product loading with caching and selective columns
    async function loadProductsTableOptimized() {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;
        
        // Check cache first
        const cacheKey = 'products_table';
        const cached = window.PerformanceCache?.get(cacheKey);
        if (cached) {
            tbody.innerHTML = cached;
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';
        
        if (!window.supabase) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Database connection not available. Please refresh the page.</td></tr>';
            return;
        }
        
        try {
            // Fetch only required columns for better performance
            const { data: products, error } = await window.supabase
                .from('products')
                .select('id, name, category, price, stock, in_stock, image_url, created_at')
                .order('created_at', { ascending: false });
            
            if (error) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <strong>Error loading products:</strong><br>
                    ${error.message}<br>
                    <button onclick="loadProductsTable()" class="btn-primary">Retry</button>
                </td></tr>`;
                return;
            }
            
            if (!products || products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products yet. Click "Add New Product" to add your first product.</td></tr>';
                return;
            }
            
            // Batch DOM updates for better performance
            const tableHTML = products.map(product => `
                <tr>
                    <td><img data-src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-image-small" onerror="this.src='images/placeholder.png'"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                    <td><span class="status-badge ${product.in_stock ? 'in-stock' : 'out-of-stock'}">${product.in_stock ? 'In Stock' : 'Out of Stock'}</span></td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editProduct('${product.id}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}')">Delete</button>
                        <button class="action-btn btn-toggle" onclick="toggleStock('${product.id}')">${product.in_stock ? 'Mark Out' : 'Mark In'}</button>
                    </td>
                </tr>
            `).join('');
            
            tbody.innerHTML = tableHTML;
            
            // Cache the result
            if (window.PerformanceCache) {
                window.PerformanceCache.set(cacheKey, tableHTML, 120000); // 2 minutes cache
            }
            
            // Setup lazy loading for images
            if (window.setupLazyLoading) {
                window.setupLazyLoading();
            }
            
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">
                <strong>Error loading products:</strong><br>
                ${error.message}<br>
                <button onclick="loadProductsTable()" class="btn-primary">Retry</button>
            </td></tr>`;
        }
    }
    
    // Optimized vendor loading
    async function loadVendorsTableOptimized() {
        const tbody = document.getElementById('vendors-table-body');
        if (!tbody) return;
        
        const cacheKey = 'vendors_table';
        const cached = window.PerformanceCache?.get(cacheKey);
        if (cached) {
            tbody.innerHTML = cached;
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading vendors...</td></tr>';
        
        try {
            // Fetch only required columns
            const { data: vendors, error } = await window.supabase
                .from('vendors')
                .select('id, vendor_name, business_name, phone, address, status, created_at')
                .order('created_at', { ascending: false });
            
            if (error) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading vendors</td></tr>';
                return;
            }
            
            if (!vendors || vendors.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No vendors yet</td></tr>';
                return;
            }
            
            const tableHTML = vendors.map(vendor => `
                <tr>
                    <td>${vendor.id.substring(0, 8)}...</td>
                    <td>${vendor.vendor_name}</td>
                    <td>${vendor.business_name}</td>
                    <td>${vendor.phone || 'N/A'}</td>
                    <td>${vendor.address || 'N/A'}</td>
                    <td><span class="status-badge in-stock">active</span></td>
                    <td>
                        <button class="action-btn btn-edit" onclick="editVendor('${vendor.id}')">Edit</button>
                        <button class="action-btn btn-delete" onclick="deleteVendor('${vendor.id}')">Delete</button>
                    </td>
                </tr>
            `).join('');
            
            tbody.innerHTML = tableHTML;
            
            // Cache the result
            if (window.PerformanceCache) {
                window.PerformanceCache.set(cacheKey, tableHTML, 120000);
            }
            
        } catch (error) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading vendors</td></tr>';
        }
    }
    
    // Optimized orders loading
    async function loadOrdersTableOptimized() {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;
        
        const cacheKey = 'orders_table';
        const cached = window.PerformanceCache?.get(cacheKey);
        if (cached) {
            tbody.innerHTML = cached;
            return;
        }
        
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Loading orders...</td></tr>';
        
        if (!window.supabase) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #d32f2f;">Database not connected. Please refresh the page.</td></tr>';
            return;
        }
        
        try {
            // Fetch only required columns for orders
            const { data: orders, error } = await window.supabase
                .from('orders')
                .select('id, user_id, total_amount, status, delivery_address, created_at, order_items(product_id, quantity, price)')
                .order('created_at', { ascending: false });
            
            if (error) {
                tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading orders: ${error.message}</td></tr>`;
                return;
            }
            
            if (!orders || orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No orders found</td></tr>';
                return;
            }
            
            const tableHTML = orders.map(order => {
                const itemCount = order.order_items ? order.order_items.length : 0;
                const orderDate = new Date(order.created_at).toLocaleDateString();
                
                return `
                    <tr>
                        <td>${order.id.substring(0, 8)}...</td>
                        <td>${order.user_id ? order.user_id.substring(0, 8) + '...' : 'N/A'}</td>
                        <td>₹${order.total_amount}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>${itemCount} items</td>
                        <td>${orderDate}</td>
                        <td>${order.delivery_address ? order.delivery_address.substring(0, 30) + '...' : 'N/A'}</td>
                        <td>
                            <button class="action-btn btn-view" onclick="viewOrder('${order.id}')">View</button>
                            <button class="action-btn btn-edit" onclick="updateOrderStatus('${order.id}', 'delivered')">Mark Delivered</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            tbody.innerHTML = tableHTML;
            
            // Cache the result
            if (window.PerformanceCache) {
                window.PerformanceCache.set(cacheKey, tableHTML, 60000); // 1 minute cache for orders
            }
            
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #d32f2f;">Error loading orders: ${error.message}</td></tr>`;
        }
    }
    
    // Cache invalidation functions
    function invalidateProductsCache() {
        if (window.PerformanceCache) {
            window.PerformanceCache.delete('products_table');
        }
    }
    
    function invalidateVendorsCache() {
        if (window.PerformanceCache) {
            window.PerformanceCache.delete('vendors_table');
        }
    }
    
    function invalidateOrdersCache() {
        if (window.PerformanceCache) {
            window.PerformanceCache.delete('orders_table');
        }
    }
    
    // Override original functions with optimized versions
    if (typeof window.loadProductsTable !== 'undefined') {
        window.loadProductsTable = loadProductsTableOptimized;
    }
    
    if (typeof window.loadVendorsTable !== 'undefined') {
        window.loadVendorsTable = loadVendorsTableOptimized;
    }
    
    if (typeof window.loadOrdersTable !== 'undefined') {
        window.loadOrdersTable = loadOrdersTableOptimized;
    }
    
    // Expose cache invalidation functions
    window.invalidateProductsCache = invalidateProductsCache;
    window.invalidateVendorsCache = invalidateVendorsCache;
    window.invalidateOrdersCache = invalidateOrdersCache;
    
})();