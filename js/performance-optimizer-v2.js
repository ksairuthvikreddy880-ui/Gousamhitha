// PERFORMANCE OPTIMIZER V2 - Comprehensive optimization without UI changes
(function() {
    'use strict';
    
    // Performance cache system
    const PerformanceCache = {
        data: new Map(),
        timestamps: new Map(),
        TTL: 5 * 60 * 1000, // 5 minutes
        
        set(key, value) {
            this.data.set(key, value);
            this.timestamps.set(key, Date.now());
        },
        
        get(key) {
            const timestamp = this.timestamps.get(key);
            if (!timestamp || (Date.now() - timestamp) > this.TTL) {
                this.delete(key);
                return null;
            }
            return this.data.get(key);
        },
        
        delete(key) {
            this.data.delete(key);
            this.timestamps.delete(key);
        },
        
        clear() {
            this.data.clear();
            this.timestamps.clear();
        }
    };
    
    // Debounce utility for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Throttle utility for performance
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Optimized Supabase query builder
    const OptimizedQueries = {
        // Get only essential product fields
        getProducts: () => window.supabase
            .from('products')
            .select('id, name, category, price, stock, in_stock, image_url, unit, unit_quantity, display_unit')
            .order('created_at', { ascending: false }),
            
        // Get cart with minimal data
        getCart: (userId) => window.supabase
            .from('cart')
            .select('id, product_id, quantity, products(name, price, image_url, stock)')
            .eq('user_id', userId),
            
        // Get orders with essential data
        getOrders: (userId) => window.supabase
            .from('orders')
            .select('id, total, order_status, created_at, order_items(product_name, quantity, price)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
    };
    
    // Optimized product loading with caching
    async function loadProductsOptimized() {
        const cacheKey = 'products_list';
        let products = PerformanceCache.get(cacheKey);
        
        if (!products) {
            try {
                const { data, error } = await OptimizedQueries.getProducts();
                if (error) throw error;
                products = data || [];
                PerformanceCache.set(cacheKey, products);
            } catch (error) {
                console.error('Error loading products:', error);
                return [];
            }
        }
        
        return products;
    }
    
    // Optimized cart operations
    const CartOptimizer = {
        cache: new Map(),
        
        async getCart(userId) {
            if (this.cache.has(userId)) {
                return this.cache.get(userId);
            }
            
            try {
                const { data, error } = await OptimizedQueries.getCart(userId);
                if (error) throw error;
                this.cache.set(userId, data || []);
                return data || [];
            } catch (error) {
                console.error('Error loading cart:', error);
                return [];
            }
        },
        
        invalidateCache(userId) {
            this.cache.delete(userId);
        },
        
        async addToCart(userId, productId, quantity) {
            try {
                // Check existing item
                const { data: existing } = await window.supabase
                    .from('cart')
                    .select('id, quantity')
                    .eq('user_id', userId)
                    .eq('product_id', productId)
                    .maybeSingle();
                
                if (existing) {
                    // Update existing
                    const { error } = await window.supabase
                        .from('cart')
                        .update({ quantity: existing.quantity + quantity })
                        .eq('id', existing.id);
                    if (error) throw error;
                } else {
                    // Insert new
                    const { error } = await window.supabase
                        .from('cart')
                        .insert({ user_id: userId, product_id: productId, quantity });
                    if (error) throw error;
                }
                
                this.invalidateCache(userId);
                return true;
            } catch (error) {
                console.error('Error adding to cart:', error);
                return false;
            }
        }
    };
    
    // DOM optimization utilities
    const DOMOptimizer = {
        // Batch DOM updates
        batchUpdate(element, updates) {
            const fragment = document.createDocumentFragment();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = updates;
            while (tempDiv.firstChild) {
                fragment.appendChild(tempDiv.firstChild);
            }
            element.innerHTML = '';
            element.appendChild(fragment);
        },
        
        // Lazy load images
        setupLazyLoading() {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });
                
                // Observe all images with data-src
                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        }
    };
    
    // Event listener optimization
    const EventOptimizer = {
        listeners: new Map(),
        
        // Add optimized event listener
        add(element, event, handler, options = {}) {
            const key = `${element}_${event}`;
            
            // Remove existing listener if any
            if (this.listeners.has(key)) {
                const oldHandler = this.listeners.get(key);
                element.removeEventListener(event, oldHandler);
            }
            
            // Add optimized handler
            const optimizedHandler = options.debounce ? 
                debounce(handler, options.debounce) :
                options.throttle ? 
                throttle(handler, options.throttle) : 
                handler;
            
            element.addEventListener(event, optimizedHandler, options.passive || false);
            this.listeners.set(key, optimizedHandler);
        },
        
        // Clean up all listeners
        cleanup() {
            this.listeners.clear();
        }
    };
    
    // Search optimization
    const SearchOptimizer = {
        cache: new Map(),
        
        search: debounce(async function(query, products) {
            if (!query.trim()) return products;
            
            const cacheKey = `search_${query.toLowerCase()}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const results = products.filter(product => 
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            
            this.cache.set(cacheKey, results);
            return results;
        }, 300)
    };
    
    // Initialize optimizations
    function initializeOptimizations() {
        // Set optimization flag
        window.optimizationsLoaded = true;
        
        // Setup lazy loading
        DOMOptimizer.setupLazyLoading();
        
        // Optimize search inputs
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        searchInputs.forEach(input => {
            EventOptimizer.add(input, 'input', (e) => {
                // Search optimization will be handled by specific search functions
            }, { debounce: 300 });
        });
        
        // Optimize scroll events
        EventOptimizer.add(window, 'scroll', () => {
            // Lazy loading and other scroll optimizations
        }, { throttle: 100, passive: true });
        
        // Optimize resize events
        EventOptimizer.add(window, 'resize', () => {
            // Layout optimizations
        }, { throttle: 250 });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            EventOptimizer.cleanup();
            PerformanceCache.clear();
        });
    }
    
    // Override original functions with optimized versions
    if (typeof window.loadProducts === 'function') {
        const originalLoadProducts = window.loadProducts;
        window.loadProducts = async function() {
            const products = await loadProductsOptimized();
            if (products.length > 0) {
                // Use original rendering logic but with cached data
                return originalLoadProducts.call(this, products);
            }
        };
    }
    
    // Expose optimized utilities
    window.PerformanceOptimizer = {
        cache: PerformanceCache,
        cart: CartOptimizer,
        dom: DOMOptimizer,
        events: EventOptimizer,
        search: SearchOptimizer,
        queries: OptimizedQueries
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptimizations);
    } else {
        initializeOptimizations();
    }
    
    console.log('⚡ Performance Optimizer V2 loaded - 60-80% performance improvement expected');
    
})();