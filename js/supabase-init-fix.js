// SUPABASE INITIALIZATION FIX - Single point of initialization
(function() {
    'use strict';
    
    console.log('🚀 SUPABASE INIT FIX LOADING...');
    
    // Prevent multiple initializations
    if (window.supabaseInitialized) {
        console.log('✅ Supabase already initialized');
        return;
    }
    
    // Configuration
    const SUPABASE_URL = 'https://blsgyybaevuytmgpljyk.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU';
    
    let initAttempts = 0;
    const maxAttempts = 50;
    
    function initializeSupabase() {
        initAttempts++;
        
        // Check if Supabase library is loaded
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            if (initAttempts < maxAttempts) {
                setTimeout(initializeSupabase, 100);
                return;
            } else {
                console.error('❌ Supabase library failed to load');
                showConnectionError();
                return;
            }
        }
        
        try {
            // Create Supabase client
            const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            // Make globally available
            window.supabaseClient = supabaseClient;
            window.supabase = supabaseClient;
            window.supabaseInitialized = true;
            
            console.log('✅ Supabase initialized successfully');
            
            // Test connection
            testConnection();
            
            // Dispatch ready event
            window.dispatchEvent(new Event('supabaseReady'));
            
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
            showConnectionError();
        }
    }
    
    async function testConnection() {
        try {
            // Simple test query
            const { data, error } = await window.supabase
                .from('products')
                .select('id')
                .limit(1);
            
            if (error) {
                console.error('❌ Database connection test failed:', error);
                showConnectionError();
            } else {
                console.log('✅ Database connection test passed');
                loadProducts();
            }
        } catch (error) {
            console.error('❌ Database connection error:', error);
            showConnectionError();
        }
    }
    
    function showConnectionError() {
        const grids = document.querySelectorAll('.product-grid');
        grids.forEach(grid => {
            if (grid) {
                grid.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #d32f2f; background: #ffebee; border-radius: 8px; margin: 1rem;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">Database Connection Failed</div>
                        <div style="color: #666; margin-bottom: 1rem;">Please check your connection and try again</div>
                        <button onclick="window.location.reload()" style="padding: 0.75rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Reload Page</button>
                    </div>
                `;
            }
        });
    }
    
    async function loadProducts() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) return;
        
        // Don't show loading if instant products are already displayed
        const hasInstantProducts = targetGrid.querySelector('.instant-product');
        if (!hasInstantProducts) {
            targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; font-size: 1.1rem;">⏳ Loading products...</div>';
        }
        
        try {
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (!products || products.length === 0) {
                // Only show "no products" if we don't have instant products
                if (!hasInstantProducts) {
                    targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">📦 No products available</div>';
                }
                return;
            }
            
            // Show products (4 max for home page)
            const isHome = !!homeProductGrid;
            const displayProducts = isHome ? products.slice(0, 4) : products;
            
            // Smooth transition from instant products
            if (hasInstantProducts) {
                targetGrid.style.opacity = '0.7';
                setTimeout(() => {
                    renderProducts(targetGrid, displayProducts);
                    targetGrid.style.opacity = '1';
                }, 300);
            } else {
                renderProducts(targetGrid, displayProducts);
            }
            
            console.log('✅ Real products loaded:', displayProducts.length);
            
        } catch (error) {
            console.error('❌ Error loading products:', error);
            // Only show error if we don't have instant products as fallback
            if (!hasInstantProducts) {
                targetGrid.innerHTML = `
                    <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                        <div>Error loading products: ${error.message}</div>
                        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
                    </div>
                `;
            }
        }
    }
    
    function renderProducts(targetGrid, products) {
        targetGrid.innerHTML = products.map(product => `
            <div class="product-card real-product">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="eager" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <h3 style="margin: 1rem 0 0.5rem 0; font-size: 1.1rem;">${product.name}</h3>
                <p class="price" style="font-size: 1.2rem; font-weight: 600; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                ${product.stock > 0 ? `
                    <div class="quantity-selector" style="display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0;">
                        <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">-</button>
                        <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly style="width: 50px; text-align: center; border: 1px solid #ddd; padding: 0.25rem; border-radius: 4px;">
                        <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">+</button>
                    </div>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary" style="width: 100%; padding: 0.75rem; background: #4a7c59; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Add to Cart</button>
                ` : `
                    <button class="btn btn-secondary" disabled style="width: 100%; padding: 0.75rem; background: #ccc; color: #666; border: none; border-radius: 6px;">Out of Stock</button>
                `}
            </div>
        `).join('');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSupabase);
    } else {
        initializeSupabase();
    }
    
    // Also try when window loads
    window.addEventListener('load', () => {
        if (!window.supabaseInitialized) {
            initializeSupabase();
        }
    });
    
})();
// Quantity control functions
window.increaseQuantity = function(productId, maxStock) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        const currentQty = parseInt(qtyInput.value);
        if (currentQty < maxStock) {
            qtyInput.value = currentQty + 1;
        }
    }
};

window.decreaseQuantity = function(productId) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    if (qtyInput) {
        const currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    }
};

// Add to cart function
window.addToCart = async function(productId, productName, price, maxStock) {
    try {
        // Check if user is logged in
        const { data: { user } } = await window.supabase.auth.getUser();
        
        if (!user) {
            if (typeof showToast === 'function') {
                showToast('Please login to add items to cart', 'error');
            } else {
                alert('Please login to add items to cart');
            }
            return;
        }
        
        const qtyInput = document.getElementById(`qty-${productId}`);
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        
        // Check if item already exists in cart
        const { data: existingItems } = await window.supabase
            .from('cart')
            .select('*')
            .eq('user_id', user.id)
            .eq('product_id', productId);
        
        if (existingItems && existingItems.length > 0) {
            // Update existing item
            const newQuantity = existingItems[0].quantity + quantity;
            if (newQuantity > maxStock) {
                if (typeof showToast === 'function') {
                    showToast(`Cannot add more. Maximum stock is ${maxStock}`, 'error');
                } else {
                    alert(`Cannot add more. Maximum stock is ${maxStock}`);
                }
                return;
            }
            
            await window.supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', existingItems[0].id);
        } else {
            // Add new item
            await window.supabase
                .from('cart')
                .insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity: quantity
                });
        }
        
        if (typeof showToast === 'function') {
            showToast(`${quantity} x ${productName} added to cart!`, 'success');
        } else {
            alert(`${quantity} x ${productName} added to cart!`);
        }
        
        // Reset quantity
        if (qtyInput) qtyInput.value = 1;
        
        // Update cart count
        updateCartCount();
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (typeof showToast === 'function') {
            showToast('Error adding to cart', 'error');
        } else {
            alert('Error adding to cart');
        }
    }
};

// Update cart count
window.updateCartCount = async function() {
    try {
        const { data: { user } } = await window.supabase.auth.getUser();
        
        if (!user) {
            const cartCounts = document.querySelectorAll('.cart-count, #bottom-nav-cart-count');
            cartCounts.forEach(element => {
                element.textContent = '0';
                element.classList.add('hidden');
            });
            return;
        }
        
        const { data: cartItems } = await window.supabase
            .from('cart')
            .select('quantity')
            .eq('user_id', user.id);
        
        const totalItems = cartItems ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;
        
        const cartCounts = document.querySelectorAll('.cart-count, #bottom-nav-cart-count');
        cartCounts.forEach(element => {
            element.textContent = totalItems;
            if (totalItems > 0) {
                element.classList.remove('hidden');
            } else {
                element.classList.add('hidden');
            }
        });
        
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
};

// Initialize cart count when ready
window.addEventListener('supabaseReady', () => {
    setTimeout(updateCartCount, 500);
});