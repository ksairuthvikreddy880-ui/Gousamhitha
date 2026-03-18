// Fast Loading Enhancement - Immediate product loading
(function() {
    'use strict';
    
    // Start loading products as soon as possible
    let fastLoadingStarted = false;
    
    function startFastLoading() {
        if (fastLoadingStarted) return;
        fastLoadingStarted = true;
        
        // Skip fast loading on shop page to prevent conflicts
        if (window.location.pathname.includes('shop.html') || 
            window.location.pathname.includes('shop')) {
            console.log('⚠️ Skipping fast loading on shop page to prevent image blinking');
            return;
        }
        
        // Check if we're on a page that needs products
        const needsProducts = document.querySelector('.product-grid') || 
                             document.getElementById('home-product-grid') ||
                             window.location.pathname.includes('index');
        
        if (!needsProducts) return;
        
        console.log('🚀 Starting fast loading...');
        
        // Preload Supabase connection
        if (window.supabase) {
            // Test connection immediately
            window.supabase.from('products').select('count').limit(1)
                .then(() => console.log('✅ Database connection ready'))
                .catch(() => console.log('⚠️ Database connection slow'));
        }
        
        // Show skeleton immediately if product grid exists and is empty
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (targetGrid && !targetGrid.innerHTML.trim()) {
            showFastSkeleton(targetGrid);
        } else if (targetGrid && targetGrid.innerHTML.includes('Loading products...')) {
            // Replace text loading with skeleton
            showFastSkeleton(targetGrid);
        }
    }
    
    function showFastSkeleton(targetGrid) {
        const skeletonHTML = `
            <div class="fast-skeleton-card" style="border: 1px solid #eee; padding: 15px; text-align: center; background: #fafafa; border-radius: 8px;">
                <div class="fast-skeleton-image" style="width: 100%; height: 200px; background: #e0e0e0; margin-bottom: 10px; border-radius: 4px; position: relative; overflow: hidden;">
                    <div class="fast-skeleton-shimmer" style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: fast-shimmer 1.5s infinite;"></div>
                </div>
                <div class="fast-skeleton-text" style="height: 20px; background: #e0e0e0; margin-bottom: 8px; border-radius: 4px; position: relative; overflow: hidden;">
                    <div class="fast-skeleton-shimmer" style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: fast-shimmer 1.5s infinite;"></div>
                </div>
                <div class="fast-skeleton-text" style="height: 16px; background: #e0e0e0; margin-bottom: 8px; border-radius: 4px; width: 60%; position: relative; overflow: hidden;">
                    <div class="fast-skeleton-shimmer" style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: fast-shimmer 1.5s infinite;"></div>
                </div>
                <div class="fast-skeleton-text" style="height: 24px; background: #e0e0e0; border-radius: 4px; width: 40%; position: relative; overflow: hidden;">
                    <div class="fast-skeleton-shimmer" style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); animation: fast-shimmer 1.5s infinite;"></div>
                </div>
            </div>
        `.repeat(4);
        
        targetGrid.innerHTML = skeletonHTML;
        
        // Add fast skeleton CSS
        if (!document.getElementById('fast-skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'fast-skeleton-styles';
            style.textContent = `
                @keyframes fast-shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                .fast-skeleton-card {
                    animation: fast-pulse 2s ease-in-out infinite alternate;
                }
                @keyframes fast-pulse {
                    0% { opacity: 1; }
                    100% { opacity: 0.8; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Start immediately - don't wait for DOM
    if (document.readyState === 'loading') {
        // Start as soon as possible
        setTimeout(startFastLoading, 0);
        document.addEventListener('DOMContentLoaded', startFastLoading);
    } else {
        startFastLoading();
    }
    
    // Also start when Supabase is ready
    window.addEventListener('supabaseReady', startFastLoading);
    
})();