// Optimized Product Display - Performance improvements without UI changes
(function() {
    'use strict';
    
    // Product cache with category-specific caching
    const productCache = new Map();
    let allProductsCache = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 300000; // 5 minutes
    let isLoading = false; // Prevent multiple simultaneous loads
    
    // Show skeleton loading for better UX
    function showSkeletonLoading(targetGrid) {
        const skeletonHTML = `
            <div class="product-card skeleton-card" style="border: 1px solid #eee; padding: 15px; text-align: center; background: #f9f9f9;">
                <div style="width: 100%; height: 200px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; margin-bottom: 10px;"></div>
                <div style="height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; margin-bottom: 8px; border-radius: 4px;"></div>
                <div style="height: 16px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; margin-bottom: 8px; border-radius: 4px; width: 60%;"></div>
                <div style="height: 24px; background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 4px; width: 40%;"></div>
            </div>
        `.repeat(4);
        
        targetGrid.innerHTML = skeletonHTML;
        
        // Add skeleton animation CSS if not already added
        if (!document.getElementById('skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = `
                @keyframes skeleton-loading {
                    0% { background-position: -200px 0; }
                    100% { background-position: calc(200px + 100%) 0; }
                }
                .skeleton-card {
                    animation: skeleton-pulse 1.5s ease-in-out infinite alternate;
                }
                @keyframes skeleton-pulse {
                    0% { opacity: 1; }
                    100% { opacity: 0.7; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Optimized product loading with caching and selective fetching
    async function loadProductsOptimized() {
        // Prevent multiple simultaneous loads
        if (isLoading) {
            console.log('⏳ Already loading products, skipping...');
            return;
        }
        
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) return;
        
        // Check if products are already loaded (avoid replacing existing content)
        const currentContent = targetGrid.innerHTML;
        const hasProducts = currentContent.includes('product-card') && 
                           !currentContent.includes('skeleton') && 
                           !currentContent.includes('Loading products...');
        
        if (hasProducts) {
            console.log('✅ Products already loaded, skipping reload');
            return;
        }
        
        isLoading = true;
        
        // Show skeleton loading only if no content or loading text
        if (!currentContent.trim() || currentContent.includes('Loading products...')) {
            showSkeletonLoading(targetGrid);
        }
        
        try {
            // Check cache first
            const now = Date.now();
            const isHomeGrid = !!homeProductGrid;
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            
            // Create cache key
            const cacheKey = isHomeGrid ? 'home_products' : (categoryParam ? `category_${categoryParam}` : 'all_products');
            
            // Check if we have valid cached data
            if (allProductsCache && (now - cacheTimestamp) < CACHE_DURATION) {
                const cachedResult = productCache.get(cacheKey);
                if (cachedResult) {
                    targetGrid.innerHTML = cachedResult;
                    return;
                }
            }
            
            // Fetch products with optimized query - use Promise.race for timeout
            const queryPromise = (async () => {
                const query = window.supabase
                    .from('products')
                    .select('id, name, category, price, stock, in_stock, image_url, display_unit, unit_quantity, unit, created_at');
                
                // Add category filter if needed
                if (categoryParam && !isHomeGrid) {
                    query.eq('category', categoryParam);
                }
                
                return await query.order('created_at', { ascending: false });
            })();
            
            // Add timeout to prevent long loading
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database query timeout')), 8000)
            );
            
            const { data: products, error } = await Promise.race([queryPromise, timeoutPromise]);
            
            if (error) {
                throw new Error(error.message || 'Failed to fetch products');
            }
            
            // Update cache
            if (!categoryParam || isHomeGrid) {
                allProductsCache = products;
                cacheTimestamp = now;
            }
            
            if (products.length === 0) {
                const message = isHomeGrid ? 
                    'No products available yet. Check back soon!' : 
                    (categoryParam ? `No products found in "${categoryParam}" category.` : 'No products available yet.');
                
                const emptyStateHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">${categoryParam ? '🔍' : '📦'}</div>
                        <div style="font-size: 1.2rem; color: #666;">${message}</div>
                    </div>
                `;
                
                targetGrid.innerHTML = emptyStateHTML;
                productCache.set(cacheKey, emptyStateHTML);
                return;
            }
            
            // Show only 4 products on home page
            const displayProducts = isHomeGrid ? products.slice(0, 4) : products;
            
            // Render products with optimized template
            const productsHTML = renderProductsOptimized(displayProducts);
            
            // Batch DOM update
            window.batchDOMUpdates ? 
                window.batchDOMUpdates([() => targetGrid.innerHTML = productsHTML]) :
                targetGrid.innerHTML = productsHTML;
            
            // Cache the result
            productCache.set(cacheKey, productsHTML);
            
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Try to show cached data even if expired as fallback
            const isHomeGrid = !!homeProductGrid;
            const urlParams = new URLSearchParams(window.location.search);
            const categoryParam = urlParams.get('category');
            const cacheKey = isHomeGrid ? 'home_products' : (categoryParam ? `category_${categoryParam}` : 'all_products');
            const expiredCache = productCache.get(cacheKey);
            
            if (expiredCache) {
                targetGrid.innerHTML = expiredCache;
                // Show a subtle indicator that data might be stale
                const staleIndicator = document.createElement('div');
                staleIndicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #ff9800; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px; z-index: 1000;';
                staleIndicator.textContent = 'Showing cached data';
                document.body.appendChild(staleIndicator);
                setTimeout(() => staleIndicator.remove(), 3000);
                return;
            }
            
            // Show error with retry option
            const errorHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1/-1;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Unable to load products</div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">Please check your connection and try again</div>
                    <button onclick="window.location.reload()" style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; margin-right: 10px;">Retry</button>
                    <button onclick="loadProductsOptimized()" style="padding: 0.7rem 1.5rem; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Try Again</button>
                </div>
            `;
            targetGrid.innerHTML = errorHTML;
        } finally {
            // Reset loading flag
            isLoading = false;
        }
    }
    
    // Optimized product rendering with template caching
    function renderProductsOptimized(products) {
        // Use document fragment for better performance
        return products.map(product => {
            const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
            const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
            const isAvailable = product.stock > 0;
            const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');
            
            return `
                <div class="product-card">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="lazy">
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
                            <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                            <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                        </div>
                        <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.7rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>` :
                        `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; padding: 0.7rem; opacity: 0.5; cursor: not-allowed; background: #ccc; color: #666; border: none; border-radius: 8px;" disabled>Out of Stock</button>`
                    }
                </div>
            `;
        }).join('');
    }
    
    // Optimized quantity controls with debouncing
    const debouncedQuantityUpdate = window.debounce ? window.debounce((productId, newValue) => {
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            input.value = newValue;
        }
    }, 100) : null;
    
    function increaseQuantityOptimized(productId, maxStock) {
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentValue = parseInt(input.value);
            const newValue = Math.min(currentValue + 1, maxStock);
            
            if (debouncedQuantityUpdate) {
                debouncedQuantityUpdate(productId, newValue);
            } else {
                input.value = newValue;
            }
        }
    }
    
    function decreaseQuantityOptimized(productId) {
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentValue = parseInt(input.value);
            const newValue = Math.max(currentValue - 1, 1);
            
            if (debouncedQuantityUpdate) {
                debouncedQuantityUpdate(productId, newValue);
            } else {
                input.value = newValue;
            }
        }
    }
    
    // Cache invalidation
    function invalidateProductCache() {
        productCache.clear();
        allProductsCache = null;
        cacheTimestamp = 0;
    }
    
    // Override original functions
    if (typeof window.loadProducts !== 'undefined') {
        window.loadProducts = loadProductsOptimized;
    }
    
    if (typeof window.increaseQuantity !== 'undefined') {
        window.increaseQuantity = increaseQuantityOptimized;
    }
    
    if (typeof window.decreaseQuantity !== 'undefined') {
        window.decreaseQuantity = decreaseQuantityOptimized;
    }
    
    // Expose cache invalidation
    window.invalidateProductCache = invalidateProductCache;
    
    // Preload products for faster subsequent loads
    function preloadProducts() {
        if (window.supabase && typeof window.supabase.from === 'function') {
            // Preload in background without showing loading state
            window.supabase
                .from('products')
                .select('id, name, category, price, stock, in_stock, image_url, display_unit, unit_quantity, unit, created_at')
                .order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (!error && data) {
                        allProductsCache = data;
                        cacheTimestamp = Date.now();
                        console.log('✅ Products preloaded in background');
                    }
                })
                .catch(() => {
                    // Silent fail for preloading
                });
        }
    }
    
    // Initialize when DOM is ready (if not already initialized)
    function initializeOptimizedProductDisplay() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                loadProductsOptimized();
                // Preload for next time
                setTimeout(preloadProducts, 2000);
            });
        } else {
            // DOM already loaded, initialize immediately
            loadProductsOptimized();
            // Preload for next time
            setTimeout(preloadProducts, 2000);
        }
    }
    
    // Initialize if Supabase is ready, otherwise wait
    if (window.supabase && typeof window.supabase.from === 'function') {
        initializeOptimizedProductDisplay();
    } else {
        window.addEventListener('supabaseReady', initializeOptimizedProductDisplay);
    }
    
})();