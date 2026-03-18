// ULTRA FAST PRODUCTS LOADER - Load products instantly
(function() {
    'use strict';
    
    console.log('⚡ ULTRA FAST PRODUCTS LOADER ACTIVATED');
    
    let isLoading = false;
    let loadAttempts = 0;
    const maxAttempts = 10;
    
    // Ultra-fast products loading with aggressive optimization
    async function loadProductsUltraFast() {
        if (isLoading) {
            console.log('🚫 Already loading, skipping...');
            return;
        }
        
        isLoading = true;
        loadAttempts++;
        
        const tbody = document.getElementById('products-table-body');
        if (!tbody) {
            console.log('❌ Table not found, retrying...');
            isLoading = false;
            if (loadAttempts < maxAttempts) {
                setTimeout(loadProductsUltraFast, 50);
            }
            return;
        }
        
        // Check cache first for instant loading
        if (window.AdminCache && window.AdminCache.isValid()) {
            const cached = window.AdminCache.get();
            if (cached && cached.products && cached.products.length > 0) {
                console.log('⚡ INSTANT LOAD from cache!');
                renderProductsUltraFast(cached.products, tbody);
                isLoading = false;
                return;
            }
        }
        
        // Check if Supabase is ready
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('⚠️ Supabase not ready, retrying in 25ms...');
            isLoading = false;
            if (loadAttempts < maxAttempts) {
                setTimeout(loadProductsUltraFast, 25);
            }
            return;
        }
        
        try {
            // Show minimal loading state
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 1rem; color: #666;">⚡ Loading...</td></tr>';
            
            console.log('🚀 Fetching products with ultra-fast query...');
            
            // Ultra-optimized query - only essential fields
            const { data: products, error } = await window.supabase
                .from('products')
                .select('id, name, category, price, stock, in_stock, image_url')
                .order('created_at', { ascending: false })
                .limit(100); // Limit for faster loading
            
            if (error) {
                console.error('❌ Error:', error);
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1rem; color: #d32f2f;">
                    Error: ${error.message}<br>
                    <button onclick="window.loadProductsUltraFast()" style="margin-top: 0.5rem; padding: 0.4rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </td></tr>`;
                isLoading = false;
                return;
            }
            
            console.log('✅ Products loaded:', products ? products.length : 0);
            
            if (!products || products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 1rem;">No products found.</td></tr>';
                isLoading = false;
                return;
            }
            
            // Cache for future instant loading
            if (window.AdminCache) {
                const existingCache = window.AdminCache.get() || {};
                window.AdminCache.set(
                    products,
                    existingCache.vendors || [],
                    existingCache.orders || []
                );
            }
            
            // Ultra-fast rendering
            renderProductsUltraFast(products, tbody);
            
        } catch (error) {
            console.error('❌ Exception:', error);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 1rem; color: #d32f2f;">
                Exception: ${error.message}<br>
                <button onclick="window.loadProductsUltraFast()" style="margin-top: 0.5rem; padding: 0.4rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
            </td></tr>`;
        } finally {
            isLoading = false;
        }
    }
    
    // Ultra-fast rendering with optimized DOM manipulation
    function renderProductsUltraFast(products, tbody) {
        console.log('🎨 Ultra-fast rendering...');
        
        // Pre-build all HTML in one go for maximum speed
        const html = products.map(product => {
            const stockColor = product.in_stock ? '#e8f5e9' : '#ffebee';
            const stockTextColor = product.in_stock ? '#2e7d32' : '#c62828';
            const stockText = product.in_stock ? 'In Stock' : 'Out of Stock';
            const toggleText = product.in_stock ? 'Mark Out' : 'Mark In';
            
            return `<tr>
                <td><img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.png'"></td>
                <td style="font-weight: 600;">${product.name}</td>
                <td>${product.category}</td>
                <td style="font-weight: 600; color: #4a7c59;">₹${product.price}</td>
                <td>${product.stock}</td>
                <td><span style="background: ${stockColor}; color: ${stockTextColor}; padding: 0.2rem 0.6rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600;">${stockText}</span></td>
                <td>
                    <button onclick="editProduct('${product.id}')" style="background: #2196F3; color: white; padding: 0.3rem 0.6rem; border: none; border-radius: 3px; cursor: pointer; margin-right: 0.3rem; font-size: 0.8rem;">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" style="background: #f44336; color: white; padding: 0.3rem 0.6rem; border: none; border-radius: 3px; cursor: pointer; margin-right: 0.3rem; font-size: 0.8rem;">Delete</button>
                    <button onclick="toggleStock('${product.id}')" style="background: #ff9800; color: white; padding: 0.3rem 0.6rem; border: none; border-radius: 3px; cursor: pointer; font-size: 0.8rem;">${toggleText}</button>
                </td>
            </tr>`;
        }).join('');
        
        // Single DOM update for maximum performance
        tbody.innerHTML = html;
        
        console.log('✅ Ultra-fast rendering complete:', products.length, 'products');
    }
    
    // Make function globally available
    window.loadProductsUltraFast = loadProductsUltraFast;
    
    // Override existing functions
    window.loadProducts = loadProductsUltraFast;
    window.loadProductsTable = loadProductsUltraFast;
    window.loadProductsSimple = loadProductsUltraFast;
    
    // Start loading immediately with multiple triggers
    loadProductsUltraFast();
    
    // Try again after minimal delay
    setTimeout(loadProductsUltraFast, 10);
    setTimeout(loadProductsUltraFast, 50);
    
    // Listen for Supabase ready
    window.addEventListener('supabaseReady', loadProductsUltraFast);
    
    // DOM ready fallback
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProductsUltraFast);
    }
    
    console.log('✅ Ultra Fast Products Loader ready - targeting sub-500ms load time');
    
})();