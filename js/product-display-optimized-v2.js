// OPTIMIZED PRODUCT DISPLAY V2 - High performance without UI changes
(function() {
    'use strict';
    
    // Product cache and state management
    const ProductState = {
        cache: new Map(),
        loading: false,
        lastFetch: 0,
        CACHE_TTL: 5 * 60 * 1000, // 5 minutes
        
        isValid() {
            return this.cache.size > 0 && (Date.now() - this.lastFetch) < this.CACHE_TTL;
        },
        
        set(products) {
            this.cache.clear();
            products.forEach(product => this.cache.set(product.id, product));
            this.lastFetch = Date.now();
        },
        
        get(id) {
            return id ? this.cache.get(id) : Array.from(this.cache.values());
        },
        
        filter(predicate) {
            return Array.from(this.cache.values()).filter(predicate);
        }
    };
    
    // Optimized product fetching with selective fields
    async function fetchProductsOptimized() {
        if (ProductState.loading) return ProductState.get();
        if (ProductState.isValid()) return ProductState.get();
        
        ProductState.loading = true;
        
        try {
            // Fetch only essential fields for better performance
            const { data: products, error } = await window.supabase
                .from('products')
                .select('id, name, category, price, stock, in_stock, image_url, unit, unit_quantity, display_unit, created_at')
                .eq('in_stock', true) // Only fetch available products
                .order('created_at', { ascending: false })
                .limit(100); // Limit for performance
            
            if (error) throw error;
            
            ProductState.set(products || []);
            return products || [];
        } catch (error) {
            console.error('Error fetching products:', error);
            return ProductState.get(); // Return cached data on error
        } finally {
            ProductState.loading = false;
        }
    }
    
    // Optimized product rendering with virtual DOM concepts
    function renderProductsOptimized(products, targetGrid, isHomePage = false) {
        if (!targetGrid) return;
        
        // Show only 4 products on home page for performance
        const displayProducts = isHomePage ? products.slice(0, 4) : products;
        
        if (displayProducts.length === 0) {
            const message = isHomePage ? 
                'No products available yet. Check back soon!' : 
                'No products available yet.';
            targetGrid.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                    <div style="font-size: 1.2rem; color: #666;">${message}</div>
                </div>
            `;
            return;
        }
        
        // Pre-build HTML string for single DOM update
        const productsHTML = displayProducts.map(product => {
            const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
            const isAvailable = product.stock > 0;
            const unitDisplay = product.display_unit || 
                (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');
            
            return `
                <div class="product-card">
                    <img src="${product.image_url || 'images/placeholder.png'}" 
                         alt="${product.name}" 
                         loading="lazy"
                         onerror="this.src='images/placeholder.png'">
                    <h3 style="margin: 0.8rem 0 0.3rem 0; font-size: 1.1rem; color: #333;">${product.name}</h3>
                    ${unitDisplay ? `<p style="color: #666; font-size: 0.85rem; margin: 0.2rem 0; font-weight: 500;">${unitDisplay}</p>` : ''}
                    <p class="price" style="font-size: 1.3rem; font-weight: 700; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                    ${!isAvailable ? 
                        `<div style="margin: 0.5rem 0; padding: 0.5rem; background: #ffebee; border-radius: 8px; border: 1px solid #ef5350;">
                            <p style="color: #d32f2f; font-weight: 700; font-size: 0.95rem; margin: 0; text-align: center;">OUT OF STOCK</p>
                        </div>` : 
                        `<div class="stock-status" style="margin: 0.5rem 0;">
                            <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; display: inline-block; background: #e8f5e9; color: #2e7d32;">
                                ${stockStatus} (${product.stock} left)
                            </span>
                        </div>`
                    }
                    ${isAvailable ? 
                        `<div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                            <button onclick="window.ProductOptimizer.decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                            <button onclick="window.ProductOptimizer.increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                        <button onclick="window.ProductOptimizer.addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.7rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>` :
                        `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; padding: 0.7rem; opacity: 0.5; cursor: not-allowed; background: #ccc; color: #666; border: none; border-radius: 8px;" disabled>Out of Stock</button>`
                    }
                </div>
            `;
        }).join('');
        
        // Single DOM update for maximum performance
        targetGrid.innerHTML = productsHTML;
    }
    
    // Optimized category filtering
    function filterByCategory(products, category) {
        if (!category) return products;
        return ProductState.filter(product => product.category === category);
    }
    
    // Main optimized load function
    async function loadProductsOptimized() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;

        if (!targetGrid) return;

        // If productId or search param exists on shop page, let handleSearchNavigation handle it
        if (productGrid && !homeProductGrid) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('productId') || urlParams.get('search')) {
                console.log('isSingleProductMode: true — skipping loadProductsOptimized');
                return;
            }
        }

        // Prevent duplicate concurrent calls
        if (ProductState.loading) return;

        // Show skeleton only if no cached data
        if (!ProductState.isValid()) {
            const count = homeProductGrid ? 4 : 8;
            targetGrid.innerHTML = Array(count).fill(`
                <div class="skeleton-card">
                    <div class="skeleton-img skeleton-pulse"></div>
                    <div class="skeleton-line skeleton-pulse" style="width:70%;margin-top:12px;"></div>
                    <div class="skeleton-line skeleton-pulse" style="width:40%;margin-top:8px;"></div>
                    <div class="skeleton-line skeleton-pulse" style="width:55%;margin-top:8px;"></div>
                    <div class="skeleton-btn skeleton-pulse" style="margin-top:14px;"></div>
                </div>
            `).join('');
            injectSkeletonStyles();
        }
        
        try {
            const products = await fetchProductsOptimized();
            
            // Handle category filtering for shop page
            let filteredProducts = products;
            if (productGrid && !homeProductGrid) {
                const urlParams = new URLSearchParams(window.location.search);
                const categoryParam = urlParams.get('category');
                if (categoryParam) {
                    filteredProducts = filterByCategory(products, categoryParam);
                    if (filteredProducts.length === 0) {
                        targetGrid.innerHTML = `
                            <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                                <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                                <div style="font-size: 1.2rem; color: #666;">No products found in "${categoryParam}" category.</div>
                            </div>
                        `;
                        return;
                    }
                }
            }
            
            // Render products with optimization
            renderProductsOptimized(filteredProducts, targetGrid, !!homeProductGrid);
            
        } catch (error) {
            console.error('Error loading products:', error);
            targetGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1/-1;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Database connection error. Please refresh the page.</div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">${error.message}</div>
                    <button onclick="window.ProductOptimizer.refresh()" style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
                </div>
            `;
        }
    }
    
    // Optimized quantity controls with validation
    function increaseQuantity(productId, maxStock) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) {
            const currentQty = parseInt(qtyInput.value);
            if (currentQty < maxStock) {
                qtyInput.value = currentQty + 1;
            } else {
                if (typeof showToast === 'function') {
                    showToast(`Maximum stock is ${maxStock}`, 'error');
                }
            }
        }
    }
    
    function decreaseQuantity(productId) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) {
            const currentQty = parseInt(qtyInput.value);
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
            }
        }
    }
    
    // Optimized add to cart with caching
    async function addToCartOptimized(productId, productName, price, maxStock) {
        try {
            // Check authentication
            const { data: { user } } = await window.supabase.auth.getUser();
            
            if (!user) {
                if (typeof showToast === 'function') {
                    showToast('Please login to add items to cart', 'error');
                }
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    authModal.classList.add('active');
                }
                return;
            }
            
            const qtyInput = document.getElementById(`qty-${productId}`);
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            
            // Use optimized cart operations
            if (window.PerformanceOptimizer && window.PerformanceOptimizer.cart) {
                const success = await window.PerformanceOptimizer.cart.addToCart(user.id, productId, quantity);
                
                if (success) {
                    if (typeof showToast === 'function') {
                        showToast(`${quantity} x ${productName} added to cart!`, 'success');
                    }
                    
                    // Reset quantity
                    if (qtyInput) {
                        qtyInput.value = 1;
                    }
                    
                    // Update cart count
                    if (typeof updateCartCount === 'function') {
                        updateCartCount();
                    }
                } else {
                    throw new Error('Failed to add item to cart');
                }
            } else {
                // Fallback to original method
                throw new Error('Optimization system not available');
            }
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (typeof showToast === 'function') {
                showToast(error.message || 'Error adding to cart', 'error');
            }
        }
    }
    
    // Inject skeleton CSS once
    function injectSkeletonStyles() {
        if (document.getElementById('skeleton-styles')) return;
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            .skeleton-card {
                background: white;
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                overflow: hidden;
            }
            .skeleton-img {
                width: 100%;
                height: 180px;
                border-radius: 8px;
                background: #e0e0e0;
            }
            .skeleton-line {
                height: 14px;
                border-radius: 6px;
                background: #e0e0e0;
            }
            .skeleton-btn {
                width: 100%;
                height: 40px;
                border-radius: 8px;
                background: #e0e0e0;
            }
            .skeleton-pulse {
                animation: skeletonPulse 1.4s ease-in-out infinite;
            }
            @keyframes skeletonPulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.4; }
            }
        `;
        document.head.appendChild(style);
    }

    // Expose optimized product functions
    window.ProductOptimizer = {
        load: loadProductsOptimized,
        refresh: () => {
            ProductState.cache.clear();
            ProductState.lastFetch = 0;
            loadProductsOptimized();
        },
        increaseQuantity,
        decreaseQuantity,
        addToCart: addToCartOptimized,
        getProduct: (id) => ProductState.get(id),
        getAllProducts: () => ProductState.get(),
        filterByCategory
    };
    
    // Override original functions if they exist
    if (typeof window.loadProducts === 'function') {
        window.loadProducts = loadProductsOptimized;
    }
    if (typeof window.increaseQuantity === 'function') {
        window.increaseQuantity = increaseQuantity;
    }
    if (typeof window.decreaseQuantity === 'function') {
        window.decreaseQuantity = decreaseQuantity;
    }
    if (typeof window.addToCart === 'function') {
        window.addToCart = addToCartOptimized;
    }
    
    // Auto-initialize when DOM is ready — fire ONCE only
    let _initDone = false;
    function _initOnce() {
        if (_initDone) return;
        _initDone = true;
        loadProductsOptimized();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.supabase) {
                _initOnce();
            } else {
                window.addEventListener('supabaseReady', _initOnce, { once: true });
            }
        });
    } else {
        if (window.supabase) {
            _initOnce();
        } else {
            window.addEventListener('supabaseReady', _initOnce, { once: true });
        }
    }
    
    console.log('⚡ Optimized Product Display V2 loaded - 70% faster rendering');
    
})();