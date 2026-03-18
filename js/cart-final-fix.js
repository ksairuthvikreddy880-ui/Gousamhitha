// Cart Final Fix - Comprehensive solution for all cart issues
(function() {
    'use strict';
    
    console.log('🔧 Cart Final Fix loading...');
    
    class CartFinalFix {
        constructor() {
            this.isDesktop = () => window.innerWidth > 768;
            this.isUpdating = false;
            this.loadAttempts = 0;
            this.maxLoadAttempts = 15;
            this.cartLoadCheckInterval = null;
        }
        
        init() {
            console.log('🔧 Initializing comprehensive cart fix');
            
            // Fix 1: Ensure complete cart loading
            this.ensureCompleteCartLoad();
            
            // Fix 2: Override quantity functions for desktop
            this.overrideQuantityFunctions();
            
            // Fix 3: Setup proper event handlers
            this.setupEventHandlers();
            
            // Fix 4: Monitor cart changes
            this.monitorCartChanges();
        }
        
        // Fix 1: Complete Cart Loading
        ensureCompleteCartLoad() {
            console.log('🔧 Setting up complete cart loading');
            
            const checkCartComplete = () => {
                const cartItems = document.getElementById('cart-items');
                if (!cartItems) {
                    if (this.loadAttempts < this.maxLoadAttempts) {
                        this.loadAttempts++;
                        setTimeout(checkCartComplete, 1000);
                    }
                    return;
                }
                
                const hasCartItems = cartItems.innerHTML.includes('cart-item');
                const hasCartTotal = cartItems.innerHTML.includes('Cart Total') || 
                                   cartItems.innerHTML.includes('cart-summary') ||
                                   cartItems.innerHTML.includes('Proceed to Checkout');
                const isLoading = cartItems.innerHTML.includes('Loading');
                
                console.log(`🔧 Cart status: items=${hasCartItems}, total=${hasCartTotal}, loading=${isLoading}`);
                
                if (hasCartItems && !hasCartTotal && !isLoading) {
                    console.log('🔧 Cart incomplete - forcing reload');
                    this.forceCartReload();
                } else if (isLoading && this.loadAttempts < this.maxLoadAttempts) {
                    this.loadAttempts++;
                    setTimeout(checkCartComplete, 2000);
                } else if (hasCartItems && hasCartTotal) {
                    console.log('✅ Cart loaded completely');
                    this.setupQuantityButtons();
                }
            };
            
            // Start checking immediately
            checkCartComplete();
            
            // Also setup periodic checks
            this.cartLoadCheckInterval = setInterval(() => {
                if (this.loadAttempts < this.maxLoadAttempts) {
                    checkCartComplete();
                } else {
                    clearInterval(this.cartLoadCheckInterval);
                }
            }, 5000);
        }
        
        async forceCartReload() {
            console.log('🔧 Forcing cart reload');
            
            try {
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Check again after reload
                setTimeout(() => {
                    this.setupQuantityButtons();
                }, 1500);
                
            } catch (error) {
                console.error('🔧 Error reloading cart:', error);
            }
        }
        
        // Fix 2: Override Quantity Functions
        overrideQuantityFunctions() {
            console.log('🔧 Overriding quantity functions');
            
            // Store original functions
            const originalUpdateQuantity = window.updateQuantity;
            const originalRemoveFromCart = window.removeFromCart;
            
            // Override updateQuantity
            window.updateQuantity = async (cartItemId, newQuantity, maxStock) => {
                console.log(`🔧 updateQuantity called: ${cartItemId}, ${newQuantity}, ${maxStock}`);
                
                if (this.isUpdating) {
                    console.log('🔧 Update in progress, skipping');
                    return;
                }
                
                // Check if instant update is available
                if (window.InstantCartUpdate) {
                    console.log('🔧 Instant update system detected, skipping override');
                    return; // Let instant update handle it
                }
                
                // Use our enhanced method for desktop
                if (this.isDesktop()) {
                    return this.updateQuantityEnhanced(cartItemId, newQuantity, maxStock);
                } else {
                    // Use original for mobile
                    if (originalUpdateQuantity) {
                        return originalUpdateQuantity(cartItemId, newQuantity, maxStock);
                    }
                }
            };
            
            // Override removeFromCart
            window.removeFromCart = async (cartItemId) => {
                console.log(`🔧 removeFromCart called: ${cartItemId}`);
                
                if (this.isUpdating) {
                    console.log('🔧 Update in progress, skipping');
                    return;
                }
                
                // Check if instant update is available
                if (window.InstantCartUpdate) {
                    console.log('🔧 Instant update system detected, skipping override');
                    return; // Let instant update handle it
                }
                
                if (this.isDesktop()) {
                    return this.removeFromCartEnhanced(cartItemId);
                } else {
                    if (originalRemoveFromCart) {
                        return originalRemoveFromCart(cartItemId);
                    }
                }
            };
            
            console.log('🔧 Functions overridden successfully');
        }
        
        async updateQuantityEnhanced(cartItemId, newQuantity, maxStock) {
            console.log(`🔧 Enhanced update: ${cartItemId} -> ${newQuantity} (max: ${maxStock})`);
            
            // Validate quantity
            if (newQuantity < 1) {
                if (confirm('Remove this item from cart?')) {
                    return this.removeFromCartEnhanced(cartItemId);
                }
                return;
            }
            
            if (newQuantity > maxStock) {
                alert(`Maximum available stock is ${maxStock}`);
                return;
            }
            
            this.isUpdating = true;
            
            try {
                // Check Supabase
                if (!window.supabase) {
                    throw new Error('Please wait for the page to load completely.');
                }
                
                // Disable all buttons
                this.setButtonsDisabled(true);
                
                console.log('🔧 Updating database...');
                
                // Update database
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('🔧 Database error:', error);
                    throw error;
                }
                
                console.log('🔧 Database updated, reloading cart...');
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count in navigation
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 500);
                }
                
                console.log('✅ Enhanced quantity update successful');
                
            } catch (error) {
                console.error('🔧 Enhanced update error:', error);
                alert('Error updating quantity. Please try again.');
            } finally {
                this.isUpdating = false;
                this.setButtonsDisabled(false);
                
                // Re-setup buttons after cart reload
                setTimeout(() => this.setupQuantityButtons(), 1000);
            }
        }
        
        async removeFromCartEnhanced(cartItemId) {
            console.log(`🔧 Enhanced remove: ${cartItemId}`);
            
            if (!confirm('Remove this item from cart?')) return;
            
            this.isUpdating = true;
            
            try {
                if (!window.supabase) {
                    throw new Error('Please wait for the page to load completely.');
                }
                
                this.setButtonsDisabled(true);
                
                const { error } = await window.supabase
                    .from('cart')
                    .delete()
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('🔧 Database error:', error);
                    throw error;
                }
                
                // Show success message
                if (typeof showToast === 'function') {
                    showToast('Item removed from cart', 'success');
                }
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 500);
                }
                
                console.log('✅ Enhanced remove successful');
                
            } catch (error) {
                console.error('🔧 Enhanced remove error:', error);
                alert('Error removing item. Please try again.');
            } finally {
                this.isUpdating = false;
                this.setButtonsDisabled(false);
                
                // Re-setup buttons after cart reload
                setTimeout(() => this.setupQuantityButtons(), 1000);
            }
        }
        
        // Fix 3: Setup Event Handlers
        setupEventHandlers() {
            console.log('🔧 Setting up event handlers');
            
            // Setup click delegation for all cart buttons
            document.addEventListener('click', async (event) => {
                const button = event.target;
                
                if (button.tagName !== 'BUTTON') return;
                if (this.isUpdating) return;
                
                const buttonText = button.textContent.trim();
                
                // Handle quantity buttons
                if (buttonText === '+' || buttonText === '-') {
                    // Only intercept on desktop
                    if (this.isDesktop()) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        
                        console.log(`🔧 Intercepted ${buttonText} button click on desktop`);
                        
                        await this.handleQuantityButtonClick(button, buttonText);
                    }
                }
                
                // Handle remove buttons
                if (button.classList.contains('btn-remove')) {
                    if (this.isDesktop()) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        
                        console.log('🔧 Intercepted remove button click on desktop');
                        
                        await this.handleRemoveButtonClick(button);
                    }
                }
            }, true); // Use capture phase
            
            // Setup visibility change handler
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    console.log('🔧 Page became visible, checking cart');
                    setTimeout(() => this.ensureCompleteCartLoad(), 500);
                }
            });
            
            // Setup focus handler
            window.addEventListener('focus', () => {
                console.log('🔧 Window focused, checking cart');
                setTimeout(() => this.ensureCompleteCartLoad(), 500);
            });
        }
        
        async handleQuantityButtonClick(button, buttonText) {
            const cartItem = button.closest('.cart-item');
            if (!cartItem) return;
            
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            const removeButton = cartItem.querySelector('.btn-remove');
            
            if (!quantitySpan || !removeButton) return;
            
            // Get current quantity
            const currentQuantity = parseInt(quantitySpan.textContent) || 1;
            const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
            
            // Extract cart item ID from remove button
            const removeOnclick = removeButton.getAttribute('onclick') || '';
            const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) return;
            
            const cartItemId = cartItemIdMatch[1];
            
            // Get stock limit from button onclick
            const buttonOnclick = button.getAttribute('onclick') || '';
            const stockMatch = buttonOnclick.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
            const maxStock = stockMatch ? parseInt(stockMatch[1]) : 999;
            
            console.log(`🔧 Handling ${buttonText}: ${cartItemId}, ${currentQuantity} -> ${newQuantity}, max: ${maxStock}`);
            
            await this.updateQuantityEnhanced(cartItemId, newQuantity, maxStock);
        }
        
        async handleRemoveButtonClick(button) {
            const onclickStr = button.getAttribute('onclick') || '';
            const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) return;
            
            const cartItemId = cartItemIdMatch[1];
            
            console.log(`🔧 Handling remove: ${cartItemId}`);
            
            await this.removeFromCartEnhanced(cartItemId);
        }
        
        // Fix 4: Setup Quantity Buttons
        setupQuantityButtons() {
            if (!this.isDesktop()) return;
            
            console.log('🔧 Setting up quantity buttons for desktop');
            
            const quantityButtons = document.querySelectorAll('.cart-item-quantity button');
            const removeButtons = document.querySelectorAll('.btn-remove');
            
            console.log(`🔧 Found ${quantityButtons.length} quantity buttons, ${removeButtons.length} remove buttons`);
            
            // Add visual feedback and ensure proper styling
            quantityButtons.forEach(button => {
                button.style.cursor = 'pointer';
                button.style.userSelect = 'none';
                button.style.transition = 'all 0.2s ease';
                
                // Add hover effects
                button.addEventListener('mouseenter', () => {
                    if (!button.disabled) {
                        button.style.backgroundColor = '#f0f8f0';
                        button.style.borderColor = '#4a7c59';
                    }
                });
                
                button.addEventListener('mouseleave', () => {
                    if (!button.disabled) {
                        button.style.backgroundColor = 'white';
                        button.style.borderColor = '#ddd';
                    }
                });
            });
            
            removeButtons.forEach(button => {
                button.style.cursor = 'pointer';
                button.style.transition = 'all 0.2s ease';
            });
        }
        
        setButtonsDisabled(disabled) {
            const buttons = document.querySelectorAll('.cart-item-quantity button, .btn-remove');
            buttons.forEach(button => {
                button.disabled = disabled;
                button.style.opacity = disabled ? '0.5' : '1';
                button.style.cursor = disabled ? 'wait' : 'pointer';
            });
        }
        
        // Monitor cart changes
        monitorCartChanges() {
            const cartItems = document.getElementById('cart-items');
            if (!cartItems) {
                setTimeout(() => this.monitorCartChanges(), 500);
                return;
            }
            
            const observer = new MutationObserver(() => {
                console.log('🔧 Cart DOM changed, re-setting up buttons');
                setTimeout(() => this.setupQuantityButtons(), 500);
            });
            
            observer.observe(cartItems, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Initialize cart final fix
    const cartFinalFix = new CartFinalFix();
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cartFinalFix.init();
        });
    } else {
        cartFinalFix.init();
    }
    
    // Multiple initialization attempts for reliability
    setTimeout(() => cartFinalFix.init(), 1000);
    setTimeout(() => cartFinalFix.init(), 3000);
    setTimeout(() => cartFinalFix.init(), 5000);
    
    // Expose for debugging
    window.CartFinalFix = cartFinalFix;
    
    console.log('✅ Cart Final Fix loaded');
    
})();