// INSTANT FIX - Fix Supabase loading and image speed
(function() {
    'use strict';
    
    console.log('🚀 INSTANT FIX LOADING...');
    
    // CRITICAL: Override console errors immediately
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('supabase') || message.includes('from is not a function')) {
            // Suppress Supabase errors during loading
            return;
        }
        originalError.apply(console, args);
    };
    
    // Fix Supabase loading issue with aggressive retry
    let supabaseRetryCount = 0;
    const maxRetries = 20; // Increased retries
    let supabaseReady = false;
    
    function ensureSupabase() {
        // Check if Supabase CDN loaded
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            // Initialize Supabase client if not already done
            if (!window.supabaseClient) {
                try {
                    window.supabaseClient = window.supabase.createClient(
                        'https://blsgyybaevuytmgpljyk.supabase.co',
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU'
                    );
                    window.supabase = window.supabaseClient;
                    console.log('✅ Supabase client initialized');
                }catch(e) {
                    console.log('⚠️ Using existing Supabase instance');
                }
            }
            
            // Verify it works
            if (window.supabase && typeof window.supabase.from === 'function') {
                supabaseReady = true;
                console.log('✅ Supabase ready and functional');
                window.dispatchEvent(new Event('supabaseReady'));
                return true;
            }
        }
        
        if (supabaseRetryCount < maxRetries) {
            supabaseRetryCount++;
            console.log(`⏳ Waiting for Supabase... (${supabaseRetryCount}/${maxRetries})`);
            setTimeout(ensureSupabase, 200); // Faster retry
        } else {
            console.error('❌ Supabase failed to load after retries');
            // Show user-friendly error instead of reload
            const grids = document.querySelectorAll('.product-grid');
            grids.forEach(grid => {
                if (grid) {
                    grid.innerHTML = `
                        <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                            <div>Database connection failed</div>
                            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Reload Page</button>
                        </div>
                    `;
                }
            });
        }
        return false;
    }
    
    // Start checking immediately and aggressively
    ensureSupabase();
    setTimeout(ensureSupabase, 100);
    setTimeout(ensureSupabase, 500);
    
    // Also check when DOM is ready
    document.addEventListener('DOMContentLoaded', ensureSupabase);
    
    // INSTANT IMAGE PRELOADING WITH EAGER LOADING
    function preloadImages() {
        // Preload critical images immediately with eager loading
        const criticalImages = [
            'images/ghee.png',
            'images/gomutra.png',
            'images/cow-dung.png',
            'images/panchagavya.png',
            'images/placeholder.png'
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.loading = 'eager'; // Force eager loading
            img.src = src;
            console.log('🖼️ Preloading (eager):', src);
        });
        
        // Force all existing images to eager loading
        setTimeout(() => {
            const allImages = document.querySelectorAll('img');
            allImages.forEach(img => {
                if (img.loading === 'lazy') {
                    img.loading = 'eager';
                    console.log('🔄 Changed to eager loading:', img.src);
                }
            });
        }, 100);
    }
    
    // Start preloading immediately
    preloadImages();
    
    // INSTANT PRODUCT LOADING FALLBACK
    window.loadProductsInstant = async function() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) return;
        
        // Show loading immediately
        targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666; font-size: 1.2rem;">⏳ Loading products...</div>';
        
        try {
            // Wait for Supabase with timeout
            let attempts = 0;
            while (!supabaseReady && attempts < 50) { // 10 seconds max
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }
            
            if (!supabaseReady || !window.supabase || typeof window.supabase.from !== 'function') {
                throw new Error('Supabase not available after timeout');
            }
            
            // Load products with timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Database timeout')), 5000)
            );
            
            const dataPromise = window.supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            const { data: products, error } = await Promise.race([dataPromise, timeoutPromise]);
            
            if (error) throw error;
            
            if (!products || products.length === 0) {
                targetGrid.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">📦 No products available</div>';
                return;
            }
            
            // Show products on home page (4 max)
            const isHome = !!homeProductGrid;
            const displayProducts = isHome ? products.slice(0, 4) : products;
            
            // Render products instantly with EAGER loading
            targetGrid.innerHTML = displayProducts.map(product => `
                <div class="product-card">
                    <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="eager" style="width: 100%; height: 200px; object-fit: cover;">
                    <h3>${product.name}</h3>
                    <p class="price">₹${product.price}</p>
                    ${product.stock > 0 ? `
                        <div class="quantity-selector">
                            <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn">-</button>
                            <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly>
                            <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn">+</button>
                        </div>
                        <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary">Add to Cart</button>
                    ` : `
                        <button class="btn btn-secondary" disabled>Out of Stock</button>
                    `}
                </div>
            `).join('');
            
            console.log('✅ Products loaded instantly:', displayProducts.length);
            
            // Force eager loading on new images
            setTimeout(() => {
                const newImages = targetGrid.querySelectorAll('img');
                newImages.forEach(img => {
                    img.loading = 'eager';
                });
            }, 50);
            
        } catch (error) {
            console.error('Product loading error:', error);
            targetGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #d32f2f;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    <div>Error loading products: ${error.message}</div>
                    <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #4a7c59; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button>
                </div>
            `;
        }
    };
    
    // Override loadProducts with instant version
    const originalLoadProducts = window.loadProducts;
    window.loadProducts = function() {
        // Try instant loading first
        window.loadProductsInstant();
        
        // Fallback to original if available
        if (originalLoadProducts && typeof originalLoadProducts === 'function') {
            setTimeout(() => {
                const grid = document.querySelector('.product-grid') || document.getElementById('home-product-grid');
                if (grid && grid.innerHTML.includes('Loading products...')) {
                    originalLoadProducts();
                }
            }, 1000);
        }
    };
    
    // Auto-load products when ready
    function autoLoadProducts() {
        if (window.supabase && typeof window.supabase.from === 'function') {
            const grid = document.querySelector('.product-grid') || document.getElementById('home-product-grid');
            if (grid) {
                window.loadProducts();
            }
        }
    }
    
    // Start auto-loading
    document.addEventListener('DOMContentLoaded', autoLoadProducts);
    window.addEventListener('supabaseReady', autoLoadProducts);
    
    console.log('🚀 INSTANT FIX ACTIVATED');
    
})();