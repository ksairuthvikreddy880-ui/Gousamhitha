// REAL PRODUCTS ONLY LOADER - Show only products from admin panel
(function() {
    'use strict';
    
    console.log('🎯 REAL PRODUCTS ONLY LOADER ACTIVATED');
    
    // Block any dummy/sample product displays
    function blockDummyProducts() {
        // Override any function that might show sample products
        window.showInstantProducts = function() {
            console.log('🚫 Blocked dummy products - waiting for real products');
        };
        
        window.showProductsInstantly = function() {
            console.log('🚫 Blocked sample products - loading real products only');
        };
        
        // Block loading messages but don't show dummy products
        const originalLoadProducts = window.loadProducts;
        window.loadProducts = function() {
            console.log('🔄 Loading real products from database...');
            loadRealProductsOnly();
        };
    }
    
    // Load only real products from database
    async function loadRealProductsOnly() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) {
            setTimeout(loadRealProductsOnly, 100);
            return;
        }
        
        // Show minimal loading indicator
        targetGrid.innerHTML = '<div style="text-align: center; padding: 3rem; color: #4a7c59; font-size: 1.1rem;">🔄 Loading products...</div>';
        
        // Wait for Supabase to be ready
        let attempts = 0;
        while ((!window.supabase || typeof window.supabase.from !== 'function') && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            targetGrid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #d32f2f;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-weight: 600; margin-bottom: 1rem;">Unable to connect to database</div>
                    <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
                </div>
            `;
            return;
        }
        
        try {
            console.log('📡 Fetching real products from database...');
            
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            if (!products || products.length === 0) {
                targetGrid.innerHTML = `
                    <div style="text-align: center; padding: 3rem; color: #666;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📦</div>
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">No products available</div>
                        <div style="color: #999;">Please add products through the admin panel</div>
                    </div>
                `;
                return;
            }
            
            // Show real products only
            const isHome = !!homeProductGrid;
            const displayProducts = isHome ? products.slice(0, 4) : products;
            
            console.log('✅ Displaying real products from admin panel:', displayProducts.length);
            
            targetGrid.innerHTML = displayProducts.map(product => `
                <div class="product-card admin-product" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 1.5rem; background: white; box-shadow: 0 2px 12px rgba(0,0,0,0.08); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="eager" style="width: 100%; height: 220px; object-fit: cover; border-radius: 10px; margin-bottom: 1rem;">
                    <h3 style="margin: 0 0 0.75rem 0; font-size: 1.2rem; color: #333; font-weight: 600; line-height: 1.3;">${product.name}</h3>
                    ${product.display_unit ? `<p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem;">${product.display_unit}</p>` : ''}
                    <p class="price" style="font-size: 1.4rem; font-weight: 700; color: #4a7c59; margin: 0.75rem 0;">₹${product.price}</p>
                    ${product.stock > 0 ? `
                        <div style="background: #e8f5e8; padding: 0.5rem; border-radius: 6px; margin: 1rem 0;">
                            <span style="color: #2e7d32; font-weight: 600; font-size: 0.9rem;">✓ In Stock (${product.stock} available)</span>
                        </div>
                        <div class="quantity-selector" style="display: flex; align-items: center; gap: 0.75rem; margin: 1.25rem 0; justify-content: center;">
                            <button onclick="adjustQuantity('${product.id}', -1)" style="width: 40px; height: 40px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 8px; font-weight: bold; font-size: 18px; transition: all 0.2s;" onmouseover="this.style.background='#4a7c59'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#4a7c59'">-</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly style="width: 70px; text-align: center; border: 2px solid #e0e0e0; padding: 0.75rem; border-radius: 8px; font-weight: 600; font-size: 1rem;">
                            <button onclick="adjustQuantity('${product.id}', 1)" style="width: 40px; height: 40px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 8px; font-weight: bold; font-size: 18px; transition: all 0.2s;" onmouseover="this.style.background='#4a7c59'; this.style.color='white'" onmouseout="this.style.background='white'; this.style.color='#4a7c59'">+</button>
                        </div>
                        <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" style="width: 100%; padding: 1rem; background: #4a7c59; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 600; font-size: 1.1rem; transition: background 0.2s;" onmouseover="this.style.background='#3d6b4a'" onmouseout="this.style.background='#4a7c59'">Add to Cart</button>
                    ` : `
                        <div style="background: #ffebee; padding: 0.75rem; border-radius: 8px; margin: 1rem 0;">
                            <span style="color: #d32f2f; font-weight: 600;">⚠️ Out of Stock</span>
                        </div>
                        <button disabled style="width: 100%; padding: 1rem; background: #e0e0e0; color: #999; border: none; border-radius: 10px; font-weight: 600; font-size: 1.1rem;">Currently Unavailable</button>
                    `}
                </div>
            `).join('');
            
            // Mark as real products loaded
            targetGrid.setAttribute('data-real-products-loaded', 'true');
            
        } catch (error) {
            console.error('❌ Error loading real products:', error);
            targetGrid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #d32f2f;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Error loading products</div>
                    <div style="color: #666; margin-bottom: 1.5rem;">${error.message}</div>
                    <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Reload Page</button>
                </div>
            `;
        }
    }
    
    // Quantity adjustment function
    window.adjustQuantity = function(productId, change) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) {
            const currentQty = parseInt(qtyInput.value);
            const newQty = currentQty + change;
            const maxStock = parseInt(qtyInput.max);
            
            if (newQty >= 1 && newQty <= maxStock) {
                qtyInput.value = newQty;
            }
        }
    };
    
    // Initialize
    blockDummyProducts();
    
    // Start loading real products
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadRealProductsOnly);
    } else {
        loadRealProductsOnly();
    }
    
    // Also try when Supabase is ready
    window.addEventListener('supabaseReady', loadRealProductsOnly);
    
    // Fallback
    setTimeout(loadRealProductsOnly, 1000);
    
})();