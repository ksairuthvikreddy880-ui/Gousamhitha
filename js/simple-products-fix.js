// SIMPLE PRODUCTS FIX - Ensure products load properly
(function() {
    'use strict';
    
    console.log('🔧 SIMPLE PRODUCTS FIX ACTIVATED');
    
    // Simple function to load products without conflicts
    async function loadProductsSimple() {
        console.log('🔄 Loading products with simple fix...');
        
        const tbody = document.getElementById('products-table-body');
        if (!tbody) {
            console.log('❌ Products table body not found');
            return;
        }
        
        // Prevent duplicate loading calls
        if (tbody.dataset.loading === 'true') {
            console.log('🚫 Products already loading, skipping...');
            return;
        }
        
        // Check if Supabase is available
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            console.log('⚠️ Supabase not ready, retrying in 500ms...');
            setTimeout(loadProductsSimple, 500);
            return;
        }
        
        try {
            tbody.dataset.loading = 'true';
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading products...</td></tr>';
            
            console.log('📡 Fetching products from Supabase...');
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('❌ Supabase error:', error);
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">
                    Error: ${error.message}<br>
                    <button onclick="window.loadProductsSimple()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </td></tr>`;
                return;
            }
            
            console.log('✅ Products fetched:', products);
            console.log('📊 Products count:', products ? products.length : 0);
            
            if (!products || products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products found. Add some products first.</td></tr>';
                return;
            }
            
            // Render products
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td><img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" onerror="this.src='images/placeholder.png'"></td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>${product.stock}</td>
                    <td><span style="background: ${product.in_stock ? '#e8f5e9' : '#ffebee'}; color: ${product.in_stock ? '#2e7d32' : '#c62828'}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">${product.in_stock ? 'In Stock' : 'Out of Stock'}</span></td>
                    <td>
                        <button onclick="editProduct('${product.id}')" style="background: #2196F3; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                        <button onclick="deleteProduct('${product.id}')" style="background: #f44336; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Delete</button>
                        <button onclick="toggleStock('${product.id}')" style="background: #ff9800; color: white; padding: 0.4rem 0.8rem; border: none; border-radius: 4px; cursor: pointer;">${product.in_stock ? 'Mark Out' : 'Mark In'}</button>
                    </td>
                </tr>
            `).join('');
            
            console.log('✅ Products rendered successfully');
            
        } catch (error) {
            console.error('❌ Exception loading products:', error);
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #d32f2f;">
                Exception: ${error.message}<br>
                <button onclick="window.loadProductsSimple()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
            </td></tr>`;
        } finally {
            tbody.dataset.loading = 'false';
        }
    }
    
    // Make function available globally
    window.loadProductsSimple = loadProductsSimple;
    
    // Try to load immediately
    loadProductsSimple();
    
    // Also try when Supabase is ready
    window.addEventListener('supabaseReady', loadProductsSimple);
    
    // Try after DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadProductsSimple);
    }
    
    console.log('✅ Simple Products Fix ready');
    
})();