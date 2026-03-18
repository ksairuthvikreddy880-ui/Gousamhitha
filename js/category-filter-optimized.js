// Optimized Category Filter System - Performance improvements with caching
(function() {
    'use strict';
    
    // Category cache
    const categoryCache = new Map();
    const CACHE_DURATION = 300000; // 5 minutes
    
    class OptimizedCategoryFilterSystem {
        constructor() {
            this.currentCategory = null;
            this.currentSubcategory = null;
            this.allProducts = [];
            this.init();
        }
        
        init() {
            this.setupCategoryNavigation();
            this.handleURLParameters();
            this.setupPageTitle();
        }
        
        setupCategoryNavigation() {
            // Use event delegation for better performance
            const categoryNav = document.querySelector('.shop-category-nav');
            if (categoryNav) {
                categoryNav.addEventListener('click', this.handleCategoryClick.bind(this));
            }
        }
        
        handleCategoryClick(e) {
            const categoryLink = e.target.closest('.category-link, .category-filter-btn');
            if (categoryLink) {
                e.preventDefault();
                const category = this.extractCategoryFromURL(categoryLink.href);
                if (category) {
                    this.filterByCategory(category);
                    this.updateURL(category);
                    this.updateActiveStates(categoryLink);
                }
            }
        }
        
        extractCategoryFromURL(url) {
            try {
                const urlObj = new URL(url);
                return urlObj.searchParams.get('category');
            } catch (e) {
                return null;
            }
        }
        
        handleURLParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            
            if (category) {
                this.currentCategory = category;
                this.updateActiveStatesFromURL();
            }
        }
        
        async filterByCategory(category) {
            this.currentCategory = category;
            this.currentSubcategory = null;
            
            await this.loadAndDisplayProducts();
            this.updatePageHeader(category);
        }
        
        async loadAndDisplayProducts() {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            // Check cache first
            const cacheKey = this.currentCategory ? `category_${this.currentCategory}` : 'all_products';
            const cached = categoryCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
                productGrid.innerHTML = cached.html;
                if (window.setupLazyLoading) {
                    window.setupLazyLoading();
                }
                return;
            }
            
            productGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">Loading products...</div>';
            
            try {
                // Optimized query with selective columns
                let query = window.supabase
                    .from('products')
                    .select('id, name, category, price, stock, in_stock, image_url, display_unit, unit_quantity, unit, created_at');
                
                if (this.currentCategory) {
                    query = query.eq('category', this.currentCategory);
                }
                
                const { data: products, error } = await query.order('created_at', { ascending: false });
                
                if (error) throw error;
                
                this.allProducts = products || [];
                
                const productsHTML = this.displayProducts(this.allProducts);
                
                // Cache the result
                categoryCache.set(cacheKey, {
                    html: productsHTML,
                    timestamp: Date.now()
                });
                
                // Batch DOM update
                if (window.batchDOMUpdates) {
                    window.batchDOMUpdates([() => productGrid.innerHTML = productsHTML]);
                } else {
                    productGrid.innerHTML = productsHTML;
                }
                
                // Setup lazy loading
                if (window.setupLazyLoading) {
                    window.setupLazyLoading();
                }
                
            } catch (error) {
                console.error('❌ Error loading products:', error);
                this.displayError(error.message);
            }
        }
        
        displayProducts(products) {
            if (products.length === 0) {
                const categoryText = this.currentCategory ? `"${this.currentCategory}"` : 'this';
                
                return `
                    <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">📦</div>
                        <div style="font-size: 1.2rem; color: #666; margin-bottom: 1rem;">
                            No products found in ${categoryText} category
                        </div>
                        <div style="font-size: 1rem; color: #999; margin-bottom: 2rem;">
                            Try browsing other categories or check back later
                        </div>
                        <button onclick="window.location.href='shop.html'" 
                                style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            View All Products
                        </button>
                    </div>
                `;
            }
            
            // Optimized product rendering
            return products.map(product => {
                const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
                const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
                const isAvailable = product.stock > 0;
                const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');

                return `
                    <div class="product-card">
                        <img data-src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3C/svg%3E">
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
        
        displayError(message) {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            productGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1/-1;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Error loading products</div>
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 1rem;">${message}</div>
                    <button onclick="location.reload()" style="padding: 0.7rem 1.5rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Retry</button>
                </div>
            `;
        }
        
        updateURL(category) {
            const url = new URL(window.location);
            url.searchParams.set('category', category);
            url.searchParams.delete('subcategory');
            
            window.history.pushState({}, '', url);
        }
        
        updateActiveStates(activeLink) {
            // Remove active class from all category links
            document.querySelectorAll('.category-link, .category-filter-btn').forEach(link => {
                link.classList.remove('active');
                link.style.background = '';
                link.style.color = '';
            });
            
            // Add active class to clicked link
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.style.background = '#4a7c59';
                activeLink.style.color = 'white';
            }
        }
        
        updateActiveStatesFromURL() {
            const category = this.currentCategory;
            
            if (category) {
                const categoryLink = document.querySelector(`[href*="category=${encodeURIComponent(category)}"]`);
                if (categoryLink) {
                    this.updateActiveStates(categoryLink);
                }
            }
        }
        
        updatePageHeader(category) {
            const pageHeader = document.querySelector('.page-header h1');
            if (pageHeader) {
                pageHeader.textContent = category;
            }
        }
        
        setupPageTitle() {
            if (this.currentCategory) {
                document.title = `${this.currentCategory} - Gousamhitha`;
            }
        }
        
        // Cache invalidation
        invalidateCache() {
            categoryCache.clear();
        }
    }
    
    // Initialize optimized category filter system
    let optimizedCategoryFilterSystem;
    
    function initializeOptimizedCategorySystem() {
        if (optimizedCategoryFilterSystem) return;
        
        optimizedCategoryFilterSystem = new OptimizedCategoryFilterSystem();
        
        // Load products if on shop page
        if (window.location.pathname.includes('shop.html')) {
            optimizedCategoryFilterSystem.loadAndDisplayProducts();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptimizedCategorySystem);
    } else {
        initializeOptimizedCategorySystem();
    }
    
    // Initialize when Supabase is ready
    window.addEventListener('supabaseReady', initializeOptimizedCategorySystem);
    
    // Fallback initialization
    setTimeout(initializeOptimizedCategorySystem, 2000);
    
    // Make system available globally
    window.optimizedCategoryFilterSystem = optimizedCategoryFilterSystem;
    
    // Expose cache invalidation
    window.invalidateCategoryCache = function() {
        if (optimizedCategoryFilterSystem) {
            optimizedCategoryFilterSystem.invalidateCache();
        }
    };
    
})();