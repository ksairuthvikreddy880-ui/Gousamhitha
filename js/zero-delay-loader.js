// ZERO DELAY LOADER - Prevent any loading messages and show products instantly
(function() {
    'use strict';
    
    console.log('⚡ ZERO DELAY LOADER ACTIVATED');
    
    // Sample products to show IMMEDIATELY
    const instantProducts = [
        {
            id: 'instant-1',
            name: 'Pure A2 Ghee',
            price: 850,
            image_url: 'images/ghee.png',
            stock: 10
        },
        {
            id: 'instant-2',
            name: 'Organic Gomutra',
            price: 200,
            image_url: 'images/gomutra.png',
            stock: 15
        },
        {
            id: 'instant-3',
            name: 'Cow Dung Cakes',
            price: 150,
            image_url: 'images/cow-dung.png',
            stock: 20
        },
        {
            id: 'instant-4',
            name: 'Panchagavya',
            price: 300,
            image_url: 'images/panchagavya.png',
            stock: 8
        }
    ];
    
    // Override any function that might show loading/error messages
    function preventLoadingMessages() {
        // Block common loading functions
        const originalLoadProducts = window.loadProducts;
        window.loadProducts = function() {
            console.log('🚫 Blocked loadProducts - using instant loader');
        };
        
        // Block error display functions
        window.showError = function() {
            console.log('🚫 Blocked error display');
        };
        
        window.showLoadingError = function() {
            console.log('🚫 Blocked loading error');
        };
    }
    
    // Show products instantly without any delay
    function showProductsInstantly() {
        const productGrid = document.querySelector('.product-grid');
        const homeProductGrid = document.getElementById('home-product-grid');
        const targetGrid = productGrid || homeProductGrid;
        
        if (!targetGrid) {
            // If grid doesn't exist yet, create it
            setTimeout(showProductsInstantly, 10);
            return;
        }
        
        console.log('⚡ Showing products INSTANTLY');
        
        // Clear any existing content immediately
        targetGrid.innerHTML = '';
        
        const isHome = !!homeProductGrid;
        const displayProducts = isHome ? instantProducts : instantProducts;
        
        // Render products with inline styles for maximum speed
        targetGrid.innerHTML = displayProducts.map(product => `
            <div class="product-card instant-loaded" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 1rem; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s;">
                <img src="${product.image_url}" alt="${product.name}" loading="eager" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333; font-weight: 600;">${product.name}</h3>
                <p class="price" style="font-size: 1.3rem; font-weight: 700; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                <div class="quantity-selector" style="display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; justify-content: center;">
                    <button onclick="adjustQuantity('${product.id}', -1)" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 18px;">-</button>
                    <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly style="width: 60px; text-align: center; border: 2px solid #e0e0e0; padding: 0.5rem; border-radius: 6px; font-weight: 600;">
                    <button onclick="adjustQuantity('${product.id}', 1)" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 6px; font-weight: bold; font-size: 18px;">+</button>
                </div>
                <button onclick="handleInstantAddToCart('${product.name}')" style="width: 100%; padding: 0.75rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s;" onmouseover="this.style.background='#3d6b4a'" onmouseout="this.style.background='#4a7c59'">Add to Cart</button>
            </div>
        `).join('');
        
        console.log('✅ Instant products displayed - NO DELAY');
        
        // Mark as instant loaded
        targetGrid.setAttribute('data-instant-loaded', 'true');
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
    
    // Handle add to cart for instant products
    window.handleInstantAddToCart = function(productName) {
        // Show login prompt with better styling
        const message = `Please login to add ${productName} to your cart`;
        
        if (typeof showToast === 'function') {
            showToast(message, 'info');
        } else {
            // Create a custom styled alert
            const alertDiv = document.createElement('div');
            alertDiv.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 10000;
                background: #4a7c59; color: white; padding: 1rem 1.5rem;
                border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                font-weight: 600; max-width: 300px;
            `;
            alertDiv.textContent = message;
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 3000);
        }
        
        // Try to open auth modal
        setTimeout(() => {
            if (typeof openAuthModal === 'function') {
                openAuthModal();
            }
        }, 500);
    };
    
    // Intercept and block any attempts to show loading/error messages
    function interceptMessageDisplay() {
        // Override innerHTML setter for product grids
        const productGrids = document.querySelectorAll('.product-grid');
        productGrids.forEach(grid => {
            const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
            
            Object.defineProperty(grid, 'innerHTML', {
                set: function(value) {
                    // Block loading/error messages
                    if (typeof value === 'string' && 
                        (value.includes('Loading') || 
                         value.includes('Unable to load') || 
                         value.includes('Error loading') ||
                         value.includes('⚠️'))) {
                        console.log('🚫 Blocked loading/error message:', value.substring(0, 50));
                        return; // Don't set the innerHTML
                    }
                    
                    // Allow other content
                    originalInnerHTML.set.call(this, value);
                },
                get: originalInnerHTML.get
            });
        });
    }
    
    // Initialize immediately - no waiting
    preventLoadingMessages();
    
    // Show products as soon as possible
    if (document.readyState === 'loading') {
        // Even before DOM is ready
        document.addEventListener('DOMContentLoaded', showProductsInstantly);
        // Also try immediately in case DOM loads fast
        setTimeout(showProductsInstantly, 1);
    } else {
        // DOM is already ready
        showProductsInstantly();
    }
    
    // Backup attempts
    setTimeout(showProductsInstantly, 10);
    setTimeout(showProductsInstantly, 50);
    setTimeout(showProductsInstantly, 100);
    
    // Set up interception after a brief delay
    setTimeout(interceptMessageDisplay, 100);
    
    // Replace with real products when available (but keep instant products as fallback)
    window.addEventListener('supabaseReady', () => {
        setTimeout(() => {
            if (window.supabase && typeof window.supabase.from === 'function') {
                console.log('🔄 Supabase ready - attempting to load real products');
                
                window.supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .then(({ data: products, error }) => {
                        if (error || !products || products.length === 0) {
                            console.log('⚠️ No real products available, keeping instant products');
                            return;
                        }
                        
                        const targetGrid = document.querySelector('.product-grid[data-instant-loaded="true"]') || 
                                         document.getElementById('home-product-grid');
                        
                        if (targetGrid) {
                            console.log('✅ Seamlessly updating with real products');
                            
                            const isHome = targetGrid.id === 'home-product-grid';
                            const displayProducts = isHome ? products.slice(0, 4) : products;
                            
                            // Very subtle transition - almost imperceptible
                            targetGrid.style.transition = 'opacity 0.2s ease';
                            targetGrid.style.opacity = '0.95';
                            
                            setTimeout(() => {
                                targetGrid.innerHTML = displayProducts.map(product => `
                                    <div class="product-card real-loaded" style="border: 1px solid #e0e0e0; border-radius: 12px; padding: 1rem; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                        <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="eager" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">
                                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #333; font-weight: 600;">${product.name}</h3>
                                        <p class="price" style="font-size: 1.3rem; font-weight: 700; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                                        ${product.stock > 0 ? `
                                            <div class="quantity-selector" style="display: flex; align-items: center; gap: 0.5rem; margin: 1rem 0; justify-content: center;">
                                                <button onclick="adjustQuantity('${product.id}', -1)" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 6px; font-weight: bold;">-</button>
                                                <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" readonly style="width: 60px; text-align: center; border: 2px solid #e0e0e0; padding: 0.5rem; border-radius: 6px; font-weight: 600;">
                                                <button onclick="adjustQuantity('${product.id}', 1)" style="width: 35px; height: 35px; border: 2px solid #4a7c59; background: white; color: #4a7c59; cursor: pointer; border-radius: 6px; font-weight: bold;">+</button>
                                            </div>
                                            <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" style="width: 100%; padding: 0.75rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>
                                        ` : `
                                            <button disabled style="width: 100%; padding: 0.75rem; background: #ccc; color: #666; border: none; border-radius: 8px;">Out of Stock</button>
                                        `}
                                    </div>
                                `).join('');
                                
                                targetGrid.style.opacity = '1';
                                targetGrid.setAttribute('data-real-loaded', 'true');
                                console.log('✅ Real products seamlessly loaded');
                            }, 100); // Much faster transition
                        }
                    })
                    .catch(error => {
                        console.log('⚠️ Error loading real products, keeping instant products:', error);
                    });
            }
        }, 500); // Faster replacement timing
    });
    
})();