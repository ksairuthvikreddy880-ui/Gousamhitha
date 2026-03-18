// Desktop Cart Fix - Specific fix for desktop quantity button issues
(function() {
    'use strict';
    
    console.log('🖥️ Desktop Cart Fix loading...');
    
    class DesktopCartFix {
        constructor() {
            this.isDesktop = window.innerWidth > 768;
            this.isUpdating = false;
            this.debugMode = true;
        }
        
        init() {
            if (!this.isDesktop) {
                console.log('Mobile detected, skipping desktop fix');
                return;
            }
            
            console.log('Desktop detected, applying desktop cart fix');
            
            // Wait for cart to load
            this.waitForCart();
            
            // Setup window resize handler
            window.addEventListener('resize', () => {
                this.isDesktop = window.innerWidth > 768;
            });
        }
        
        waitForCart() {
            const checkCart = () => {
                const cartItems = document.getElementById('cart-items');
                if (cartItems && cartItems.children.length > 0) {
                    console.log('Cart found, setting up desktop handlers');
                    setTimeout(() => this.setupDesktopHandlers(), 500);
                } else {
                    setTimeout(checkCart, 500);
                }
            };
            checkCart();
        }
        
        setupDesktopHandlers() {
            console.log('Setting up desktop-specific cart handlers');
            
            // Remove all existing onclick handlers and replace with our own
            const quantityButtons = document.querySelectorAll('.cart-item-quantity button');
            const removeButtons = document.querySelectorAll('.btn-remove');
            
            console.log(`Found ${quantityButtons.length} quantity buttons and ${removeButtons.length} remove buttons`);
            
            // Handle quantity buttons
            quantityButtons.forEach((button, index) => {
                this.setupQuantityButton(button, index);
            });
            
            // Handle remove buttons
            removeButtons.forEach((button, index) => {
                this.setupRemoveButton(button, index);
            });
            
            // Also setup click delegation as backup
            this.setupClickDelegation();
        }
        
        setupQuantityButton(button, index) {
            const buttonText = button.textContent.trim();
            console.log(`Setting up quantity button ${index}: "${buttonText}"`);
            
            // Remove existing onclick
            button.onclick = null;
            button.removeAttribute('onclick');
            
            // Get cart item data
            const cartItem = button.closest('.cart-item');
            if (!cartItem) {
                console.error('Could not find cart item for button', button);
                return;
            }
            
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            const removeButton = cartItem.querySelector('.btn-remove');
            
            if (!quantitySpan || !removeButton) {
                console.error('Could not find quantity span or remove button');
                return;
            }
            
            // Extract cart item ID from remove button
            const removeOnclick = removeButton.getAttribute('onclick') || removeButton.onclick?.toString() || '';
            const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) {
                console.error('Could not extract cart item ID from remove button');
                return;
            }
            
            const cartItemId = cartItemIdMatch[1];
            const currentQuantity = parseInt(quantitySpan.textContent) || 1;
            
            // Get stock limit (default to 999 if not found)
            let maxStock = 999;
            const plusButton = cartItem.querySelector('.cart-item-quantity button:last-child');
            if (plusButton) {
                const plusOnclick = plusButton.getAttribute('onclick') || plusButton.onclick?.toString() || '';
                const stockMatch = plusOnclick.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
                if (stockMatch) {
                    maxStock = parseInt(stockMatch[1]);
                }
            }
            
            console.log(`Button setup: ID=${cartItemId}, Current=${currentQuantity}, Stock=${maxStock}, Action=${buttonText}`);
            
            // Add new click handler
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                console.log(`Desktop quantity button clicked: ${buttonText}`);
                
                const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
                await this.updateQuantityDesktop(cartItemId, newQuantity, maxStock);
            });
            
            // Add visual feedback
            button.style.cursor = 'pointer';
            button.style.userSelect = 'none';
        }
        
        setupRemoveButton(button, index) {
            console.log(`Setting up remove button ${index}`);
            
            // Remove existing onclick
            button.onclick = null;
            button.removeAttribute('onclick');
            
            // Extract cart item ID
            const onclickStr = button.getAttribute('onclick') || button.onclick?.toString() || '';
            const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) {
                console.error('Could not extract cart item ID from remove button');
                return;
            }
            
            const cartItemId = cartItemIdMatch[1];
            
            // Add new click handler
            button.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                console.log(`Desktop remove button clicked for item: ${cartItemId}`);
                
                if (confirm('Remove this item from cart?')) {
                    await this.removeFromCartDesktop(cartItemId);
                }
            });
        }
        
        setupClickDelegation() {
            console.log('Setting up click delegation for desktop');
            
            const cartItems = document.getElementById('cart-items');
            if (!cartItems) return;
            
            cartItems.addEventListener('click', async (event) => {
                const button = event.target;
                
                if (button.tagName !== 'BUTTON') return;
                if (!this.isDesktop) return;
                
                console.log('Click delegation triggered on desktop');
                
                const buttonText = button.textContent.trim();
                
                // Handle quantity buttons
                if (buttonText === '+' || buttonText === '-') {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const cartItem = button.closest('.cart-item');
                    const quantitySpan = cartItem?.querySelector('.cart-item-quantity span');
                    const removeButton = cartItem?.querySelector('.btn-remove');
                    
                    if (!cartItem || !quantitySpan || !removeButton) return;
                    
                    // Get data
                    const currentQuantity = parseInt(quantitySpan.textContent) || 1;
                    const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
                    
                    // Extract cart item ID
                    const removeOnclick = removeButton.getAttribute('onclick') || '';
                    const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                    
                    if (cartItemIdMatch) {
                        const cartItemId = cartItemIdMatch[1];
                        await this.updateQuantityDesktop(cartItemId, newQuantity, 999);
                    }
                }
                
                // Handle remove buttons
                if (button.classList.contains('btn-remove')) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const onclickStr = button.getAttribute('onclick') || '';
                    const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                    
                    if (cartItemIdMatch && confirm('Remove this item from cart?')) {
                        const cartItemId = cartItemIdMatch[1];
                        await this.removeFromCartDesktop(cartItemId);
                    }
                }
            });
        }
        
        async updateQuantityDesktop(cartItemId, newQuantity, maxStock) {
            if (this.isUpdating) {
                console.log('Update already in progress, skipping');
                return;
            }
            
            console.log(`Desktop update: ${cartItemId} -> ${newQuantity} (max: ${maxStock})`);
            
            // Validate quantity
            if (newQuantity < 1) {
                if (confirm('Remove this item from cart?')) {
                    return this.removeFromCartDesktop(cartItemId);
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
                    throw new Error('Supabase not available');
                }
                
                // Disable all buttons
                this.setButtonsDisabled(true);
                
                // Update database
                console.log('Updating database...');
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Database error:', error);
                    throw error;
                }
                
                console.log('Database updated, reloading cart...');
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update navigation count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 500);
                }
                
                console.log('✅ Desktop quantity update successful');
                
            } catch (error) {
                console.error('Desktop update error:', error);
                alert('Error updating quantity. Please try again.');
            } finally {
                this.isUpdating = false;
                this.setButtonsDisabled(false);
                
                // Re-setup handlers after cart reload
                setTimeout(() => this.setupDesktopHandlers(), 1000);
            }
        }
        
        async removeFromCartDesktop(cartItemId) {
            console.log(`Desktop remove: ${cartItemId}`);
            
            this.isUpdating = true;
            
            try {
                if (!window.supabase) {
                    throw new Error('Supabase not available');
                }
                
                this.setButtonsDisabled(true);
                
                const { error } = await window.supabase
                    .from('cart')
                    .delete()
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Database error:', error);
                    throw error;
                }
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update navigation count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 500);
                }
                
                console.log('✅ Desktop remove successful');
                
            } catch (error) {
                console.error('Desktop remove error:', error);
                alert('Error removing item. Please try again.');
            } finally {
                this.isUpdating = false;
                this.setButtonsDisabled(false);
                
                // Re-setup handlers after cart reload
                setTimeout(() => this.setupDesktopHandlers(), 1000);
            }
        }
        
        setButtonsDisabled(disabled) {
            const buttons = document.querySelectorAll('.cart-item-quantity button, .btn-remove');
            buttons.forEach(button => {
                button.disabled = disabled;
                button.style.opacity = disabled ? '0.5' : '1';
                button.style.cursor = disabled ? 'wait' : 'pointer';
            });
        }
    }
    
    // Initialize desktop cart fix
    const desktopCartFix = new DesktopCartFix();
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            desktopCartFix.init();
        });
    } else {
        desktopCartFix.init();
    }
    
    // Also initialize after delay to ensure all scripts loaded
    setTimeout(() => desktopCartFix.init(), 2000);
    
    // Expose for debugging
    window.DesktopCartFix = desktopCartFix;
    
    console.log('✅ Desktop Cart Fix loaded');
    
})();