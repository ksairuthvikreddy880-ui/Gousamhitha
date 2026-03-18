// INSTANT PRODUCT LOADER - Show products immediately
(function() {
    'use strict';
    
    console.log('⚡ INSTANT PRODUCT LOADER ACTIVATED');
    
    // Sample products to show immediately while database loads
    const sampleProducts = [
        {
            id: 'sample-1',
            name: 'Pure A2 Ghee',
            price: 850,
            image_url: 'images/ghee.png',
            stock: 10
        },
        {
            id: 'sample-2',
            name: 'Organic Gomutra',
            price: 200,
            image_url: 'images/gomutra.png',
            stock: 15
        },
        {
            id: 'sample-3',
            name: 'Cow Dung Cakes',
            price: 150,
            image_url: 'images/cow-dung.png',
            stock: 20
        },
        {
            id: 'sample-4',
            name: 'Panchagavya',
            price: 300,
            image_url: 'images/panchagavya.png',
            stock: 8
        }
    ];
    
    // Show products instantly
    function showInstantProducts() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) return;
        
        console.log('⚡ Showing instant products...');
        
        // Show sample products immediately
        const isHome = !!homeProductGrid;
        const displayProducts = isHome ? sampleProducts : sampleProducts;
        
        targetGrid.innerHTML = displayProducts.map(product => `
            <div class="product-card instant-product">
                <img src="${product.image_url}" alt="${product.name}" loading="eager" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
                <h3 style="margin: 1rem 0 0.5rem 0; font-size: 1.1rem;">${product.name}</h3>
                <p class="price" style="font-size: 1.2rem; font-weight: 600; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                <div class="quantity-selector" style="display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0;">
                    <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">-</button>
                    <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly style="width: 50px; text-align: center; border: 1px solid #ddd; padding: 0.25rem; border-radius: 4px;">
                    <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; cursor: pointer; border-radius: 4px;">+</button>
                </div>
                <button onclick="showLoginPrompt()" class="btn btn-primary" style="width: 100%; padding: 0.75rem; background: #4a7c59; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Add to Cart</button>
            </div>
        `).join('');
        
        console.log('✅ Instant products displayed');
    }
    
    // Show login prompt for sample products
    window.showLoginPrompt = function() {
        if (typeof showToast === 'function') {
            showToast('Please login to add items to cart', 'info');
        } else {
            alert('Please login to add items to cart');
        }
        
        // Try to open auth modal if available
        if (typeof openAuthModal === 'function') {
            openAuthModal();
        }
    };
    
    // Replace with real products when database is ready
    function replaceWithRealProducts() {
        if (!window.supabase || typeof window.supabase.from !== 'function') {
            return;
        }
        
        console.log('🔄 Replacing with real products...');
        
        window.supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data: products, error }) => {
                if (error) {
                    console.error('Error loading real products:', error);
                    return;
                }
                
                if (!products || products.length === 0) {
                    console.log('No real products found, keeping samples');
                    return;
                }
                
                const productGrid = document.querySelector('.product-grid');
                const homeProductGrid = document.getElementById('home-product-grid');
                const targetGrid = productGrid || homeProductGrid;
                
                if (!targetGrid) return;
                
                const isHome = !!homeProductGrid;
                const displayProducts = isHome ? products.slice(0, 4) : products;
                
                // Smooth transition to real products
                targetGrid.style.opacity = '0.7';
                
                setTimeout(() => {
                    targetGrid.innerHTML = displayProducts.map(product => `
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
                    
                    targetGrid.style.opacity = '1';
                    console.log('✅ Real products loaded:', displayProducts.length);
                }, 300);
            });
    }
    
    // Basic quantity functions for instant products
    window.increaseQuantity = window.increaseQuantity || function(productId, maxStock) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) {
            const currentQty = parseInt(qtyInput.value);
            if (currentQty < maxStock) {
                qtyInput.value = currentQty + 1;
            }
        }
    };
    
    window.decreaseQuantity = window.decreaseQuantity || function(productId) {
        const qtyInput = document.getElementById(`qty-${productId}`);
        if (qtyInput) {
            const currentQty = parseInt(qtyInput.value);
            if (currentQty > 1) {
                qtyInput.value = currentQty - 1;
            }
        }
    };
    
    // Show instant products immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showInstantProducts);
    } else {
        showInstantProducts();
    }
    
    // Replace with real products when Supabase is ready
    window.addEventListener('supabaseReady', () => {
        setTimeout(replaceWithRealProducts, 1000);
    });
    
    // Fallback: try to replace after 3 seconds
    setTimeout(() => {
        if (window.supabase && typeof window.supabase.from === 'function') {
            replaceWithRealProducts();
        }
    }, 3000);
    
})();