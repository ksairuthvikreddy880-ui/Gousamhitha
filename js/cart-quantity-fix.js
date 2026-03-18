// Cart Quantity Fix - Ensure quantity buttons work properly
(function() {
    'use strict';
    
    console.log('🔧 Cart Quantity Fix loading...');
    
    class CartQuantityFixer {
        constructor() {
            this.isUpdating = false;
        }
        
        init() {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.setupQuantityButtons();
                });
            } else {
                this.setupQuantityButtons();
            }
            
            // Re-setup buttons when cart is reloaded
            this.observeCartChanges();
        }
        
        setupQuantityButtons() {
            // Add event listeners to quantity buttons using event delegation
            const cartItemsDiv = document.getElementById('cart-items');
            if (!cartItemsDiv) {
                setTimeout(() => this.setupQuantityButtons(), 500);
                return;
            }
            
            // Remove existing listeners to prevent duplicates
            cartItemsDiv.removeEventListener('click', this.handleQuantityClick);
            
            // Add new listener
            cartItemsDiv.addEventListener('click', this.handleQuantityClick.bind(this));
            
            console.log('✅ Quantity button listeners setup');
        }
        
        async handleQuantityClick(event) {
            const button = event.target;
            
            // Check if it's a quantity button
            if (button.tagName !== 'BUTTON') return;
            
            const buttonText = button.textContent.trim();
            if (buttonText !== '+' && buttonText !== '-') return;
            
            event.preventDefault();
            event.stopPropagation();
            
            if (this.isUpdating) {
                console.log('Update already in progress, skipping...');
                return;
            }
            
            // Extract data from button's onclick attribute or parent elements
            const cartItem = button.closest('.cart-item');
            if (!cartItem) return;
            
            // Find the quantity span
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            if (!quantitySpan) return;
            
            const currentQuantity = parseInt(quantitySpan.textContent) || 1;
            const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
            
            // Find cart item ID and stock from the onclick attribute
            const removeButton = cartItem.querySelector('.btn-remove');
            if (!removeButton || !removeButton.onclick) return;
            
            const onclickStr = removeButton.onclick.toString();
            const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            if (!cartItemIdMatch) return;
            
            const cartItemId = cartItemIdMatch[1];
            
            // Get stock from the + button's onclick
            const plusButton = cartItem.querySelector('button:last-of-type');
            if (!plusButton || !plusButton.onclick) return;
            
            const plusOnclickStr = plusButton.onclick.toString();
            const stockMatch = plusOnclickStr.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
            const maxStock = stockMatch ? parseInt(stockMatch[1]) : 999;
            
            console.log(`Updating quantity: ${currentQuantity} -> ${newQuantity}, Stock: ${maxStock}`);
            
            await this.updateQuantitySafe(cartItemId, newQuantity, maxStock);
        }
        
        async updateQuantitySafe(cartItemId, newQuantity, maxStock) {
            if (this.isUpdating) return;
            
            this.isUpdating = true;
            
            try {
                // Validate quantity
                if (newQuantity < 1) {
                    if (confirm('Remove this item from cart?')) {
                        await this.removeFromCartSafe(cartItemId);
                    }
                    return;
                }
                
                if (newQuantity > maxStock) {
                    alert(`Maximum stock available is ${maxStock}`);
                    return;
                }
                
                // Check if Supabase is available
                if (!window.supabase) {
                    alert('Database connection not available. Please refresh the page.');
                    return;
                }
                
                // Update quantity in database
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Error updating quantity:', error);
                    alert('Error updating quantity. Please try again.');
                    return;
                }
                
                // Reload cart to show updated data
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    // Fallback: reload page
                    window.location.reload();
                }
                
                // Update cart count in navigation
                if (window.updateCartCount && typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
                
                console.log('✅ Quantity updated successfully');
                
            } catch (error) {
                console.error('Error in updateQuantitySafe:', error);
                alert('Error updating quantity. Please try again.');
            } finally {
                this.isUpdating = false;
            }
        }
        
        async removeFromCartSafe(cartItemId) {
            try {
                if (!window.supabase) {
                    alert('Database connection not available. Please refresh the page.');
                    return;
                }
                
                const { error } = await window.supabase
                    .from('cart')
                    .delete()
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Error removing item:', error);
                    alert('Error removing item. Please try again.');
                    return;
                }
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count
                if (window.updateCartCount && typeof window.updateCartCount === 'function') {
                    window.updateCartCount();
                }
                
                console.log('✅ Item removed successfully');
                
            } catch (error) {
                console.error('Error in removeFromCartSafe:', error);
                alert('Error removing item. Please try again.');
            }
        }
        
        observeCartChanges() {
            // Watch for changes in cart items div
            const cartItemsDiv = document.getElementById('cart-items');
            if (!cartItemsDiv) {
                setTimeout(() => this.observeCartChanges(), 500);
                return;
            }
            
            const observer = new MutationObserver(() => {
                // Re-setup buttons when cart content changes
                setTimeout(() => this.setupQuantityButtons(), 100);
            });
            
            observer.observe(cartItemsDiv, {
                childList: true,
                subtree: true
            });
        }
        
        // Override original functions to ensure they work
        overrideOriginalFunctions() {
            // Backup original functions
            const originalUpdateQuantity = window.updateQuantity;
            const originalRemoveFromCart = window.removeFromCart;
            
            // Override with safe versions
            window.updateQuantity = async (cartItemId, newQuantity, maxStock) => {
                console.log('updateQuantity called via override');
                await this.updateQuantitySafe(cartItemId, newQuantity, maxStock);
            };
            
            window.removeFromCart = async (cartItemId) => {
                console.log('removeFromCart called via override');
                if (confirm('Remove this item from cart?')) {
                    await this.removeFromCartSafe(cartItemId);
                }
            };
            
            console.log('✅ Original functions overridden with safe versions');
        }
    }
    
    // Initialize cart quantity fixer
    const cartQuantityFixer = new CartQuantityFixer();
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            cartQuantityFixer.init();
            setTimeout(() => cartQuantityFixer.overrideOriginalFunctions(), 1000);
        });
    } else {
        cartQuantityFixer.init();
        setTimeout(() => cartQuantityFixer.overrideOriginalFunctions(), 1000);
    }
    
    // Expose for debugging
    window.CartQuantityFixer = cartQuantityFixer;
    
    console.log('✅ Cart Quantity Fix loaded');
    
})();