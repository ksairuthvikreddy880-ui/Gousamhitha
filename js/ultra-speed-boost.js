// ULTRA SPEED BOOST - Maximum performance without UI changes
(function() {
    'use strict';
    
    // INSTANT CACHE SYSTEM - Store everything in memory
    const ultraCache = {
        products: null,
        cart: null,
        user: null,
        orders: null,
        categories: null,
        timestamp: 0,
        TTL: 60000 // 1 minute cache
    };
    
    // PRELOAD EVERYTHING IMMEDIATELY
    function preloadEverything() {
        if (window.supabase) {
            // Preload products instantly
            window.supabase.from('products').select('*').then(({data}) => {
                if (data) {
                    ultraCache.products = data;
                    ultraCache.timestamp = Date.now();
                    console.log('⚡ Products preloaded:', data.length);
                }
            });
            
            // Preload user data
            window.supabase.auth.getUser().then(({data}) => {
                if (data.user) {
                    ultraCache.user = data.user;
                    // Preload user's cart
                    window.supabase.from('cart').select('*').eq('user_id', data.user.id).then(({data: cart}) => {
                        ultraCache.cart = cart || [];
                    });
                    // Preload user's orders
                    window.supabase.from('orders').select('*').eq('user_id', data.user.id).then(({data: orders}) => {
                        ultraCache.orders = orders || [];
                    });
                }
            });
        }
    }
    
    // INSTANT PRODUCT LOADING
    window.loadProductsUltraFast = function() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) return;
        
        // Use cached data if available
        if (ultraCache.products && (Date.now() - ultraCache.timestamp) < ultraCache.TTL) {
            const products = ultraCache.products;
            const isHome = !!homeProductGrid;
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            
            let displayProducts = products;
            if (category) {
                displayProducts = products.filter(p => p.category === category);
            }
            if (isHome) {
                displayProducts = displayProducts.slice(0, 4);
            }
            
            // INSTANT RENDER
            targetGrid.innerHTML = displayProducts.map(product => `
                <div class="product-card">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="lazy">
                    <h3>${product.name}</h3>
                    ${product.display_unit ? `<p>${product.display_unit}</p>` : ''}
                    <p class="price">₹${product.price}</p>
                    ${product.stock > 0 ? `
                        <div class="stock-status">
                            <span class="status-badge in-stock">In Stock (${product.stock} left)</span>
                        </div>
                        <div class="quantity-selector">
                            <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn">-</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly>
                            <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn">+</button>
                        </div>
                        <button onclick="addToCartUltraFast('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary">Add to Cart</button>
                    ` : `
                        <div style="background: #ffebee; padding: 0.5rem; border-radius: 8px;">
                            <p style="color: #d32f2f; font-weight: 700; margin: 0;">OUT OF STOCK</p>
                        </div>
                        <button class="btn btn-secondary" disabled>Out of Stock</button>
                    `}
                </div>
            `).join('');
            
            console.log('⚡ INSTANT product load:', displayProducts.length);
            return;
        }
        
        // Fallback to optimized loading
        if (window.loadProducts) {
            window.loadProducts();
        }
    };
    
    // ULTRA FAST ADD TO CART
    window.addToCartUltraFast = async function(productId, productName, price, maxStock) {
        const user = ultraCache.user || (await window.supabase.auth.getUser()).data.user;
        
        if (!user) {
            if (typeof showToast === 'function') {
                showToast('Please login to add items to cart', 'error');
            }
            return;
        }
        
        const qtyInput = document.getElementById(`qty-${productId}`);
        const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
        
        try {
            // Check cache first
            let cartItem = ultraCache.cart?.find(item => item.product_id === productId);
            
            if (cartItem) {
                const newQuantity = cartItem.quantity + quantity;
                if (newQuantity > maxStock) {
                    if (typeof showToast === 'function') {
                        showToast(`Cannot add more. Maximum stock is ${maxStock}`, 'error');
                    }
                    return;
                }
                
                // Update in database
                await window.supabase.from('cart').update({ quantity: newQuantity }).eq('id', cartItem.id);
                
                // Update cache
                cartItem.quantity = newQuantity;
            } else {
                // Insert new item
                const { data } = await window.supabase.from('cart').insert({
                    user_id: user.id,
                    product_id: productId,
                    quantity: quantity
                }).select().single();
                
                // Update cache
                if (!ultraCache.cart) ultraCache.cart = [];
                ultraCache.cart.push(data);
            }
            
            if (typeof showToast === 'function') {
                showToast(`${quantity} x ${productName} added to cart!`, 'success');
            }
            
            // Reset quantity
            if (qtyInput) qtyInput.value = 1;
            
            // Update cart count instantly
            updateCartCountUltraFast();
            
        } catch (error) {
            console.error('Cart error:', error);
            if (typeof showToast === 'function') {
                showToast('Error adding to cart', 'error');
            }
        }
    };
    
    // ULTRA FAST CART COUNT UPDATE
    function updateCartCountUltraFast() {
        if (!ultraCache.cart) return;
        
        const totalItems = ultraCache.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Update all cart count elements instantly
        const cartCounts = document.querySelectorAll('.cart-count, #bottom-nav-cart-count');
        cartCounts.forEach(element => {
            element.textContent = totalItems;
            if (totalItems > 0) {
                element.classList.remove('hidden');
            }
        });
    }
    
    // INSTANT ORDER PROCESSING
    window.processOrderUltraFast = async function(orderData) {
        try {
            // Process order instantly
            const { data: order } = await window.supabase.from('orders').insert(orderData).select().single();
            
            // Clear cart cache
            ultraCache.cart = [];
            
            // Update UI instantly
            updateCartCountUltraFast();
            
            return order;
        } catch (error) {
            console.error('Order processing error:', error);
            throw error;
        }
    };
    
    // PRELOAD CRITICAL RESOURCES
    function preloadCriticalResources() {
        // Preload images
        const criticalImages = [
            'images/ghee.png',
            'images/gomutra.png', 
            'images/cow-dung.png',
            'images/panchagavya.png'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        
        // Preload fonts
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.as = 'font';
        fontPreload.type = 'font/woff2';
        fontPreload.crossOrigin = 'anonymous';
        document.head.appendChild(fontPreload);
    }
    
    // INSTANT SEARCH
    window.searchProductsUltraFast = function(query) {
        if (!ultraCache.products) return [];
        
        const searchTerm = query.toLowerCase();
        return ultraCache.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    };
    
    // OVERRIDE SLOW FUNCTIONS WITH ULTRA FAST VERSIONS
    function overrideSlowFunctions() {
        // Wait for instant-fix to be ready first
        if (window.loadProductsInstant) {
            // Override product loading with instant version
            const originalLoadProducts = window.loadProducts;
            window.loadProducts = function() {
                // Use instant loading first
                window.loadProductsInstant();
            };
        } else {
            // Fallback: Override after instant-fix loads
            setTimeout(() => {
                if (window.loadProductsInstant) {
                    window.loadProducts = window.loadProductsInstant;
                }
            }, 500);
        }
        
        // Override add to cart
        if (window.addToCart) {
            window.addToCart = window.addToCartUltraFast;
        }
        
        // Override cart count update
        if (window.updateCartCount) {
            window.updateCartCount = updateCartCountUltraFast;
        }
    }
    
    // INITIALIZE ULTRA SPEED BOOST
    function initUltraSpeedBoost() {
        console.log('🚀 ULTRA SPEED BOOST ACTIVATED');
        
        // Wait for instant-fix to be ready
        setTimeout(() => {
            preloadEverything();
            preloadCriticalResources();
            overrideSlowFunctions();
            
            // Update cart count on load
            setTimeout(updateCartCountUltraFast, 100);
            
            // Refresh cache periodically
            setInterval(() => {
                if (Date.now() - ultraCache.timestamp > ultraCache.TTL) {
                    preloadEverything();
                }
            }, 30000);
        }, 1000); // Give instant-fix time to load
    }
    
    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUltraSpeedBoost);
    } else {
        initUltraSpeedBoost();
    }
    
    // Start when Supabase is ready
    window.addEventListener('supabaseReady', initUltraSpeedBoost);
    
})();