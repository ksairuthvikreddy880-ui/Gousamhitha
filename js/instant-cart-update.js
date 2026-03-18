// Instant Cart Update - No loading screen, immediate UI updates
(function() {
    'use strict';
    
    console.log('⚡ Instant Cart Update loading...');
    
    class InstantCartUpdate {
        constructor() {
            this.isDesktop = () => window.innerWidth > 768;
            this.isUpdating = false;
        }
        
        init() {
            console.log('⚡ Initializing instant cart updates');
            
            // Override the cart functions to provide instant updates
            this.overrideCartFunctions();
            
            // Setup instant event handlers
            this.setupInstantHandlers();
        }
        
        overrideCartFunctions() {
            console.log('⚡ Overriding cart functions for instant updates');
            
            // Store original functions
            const originalUpdateQuantity = window.updateQuantity;
            const originalRemoveFromCart = window.removeFromCart;
            
            // Override updateQuantity with instant UI update
            window.updateQuantity = async (cartItemId, newQuantity, maxStock) => {
                console.log(`⚡ Instant updateQuantity: ${cartItemId} -> ${newQuantity}`);
                
                if (this.isUpdating) {
                    console.log('⚡ Update in progress, skipping');
                    return;
                }
                
                // Validate quantity
                if (newQuantity < 1) {
                    return this.instantRemove(cartItemId);
                }
                
                if (newQuantity > maxStock) {
                    alert(`Maximum available stock is ${maxStock}`);
                    return;
                }
                
                // Update UI instantly
                this.updateQuantityInstantly(cartItemId, newQuantity);
                
                // Update database in background
                await this.updateDatabaseSilently(cartItemId, newQuantity);
            };
            
            // Override removeFromCart with instant UI update
            window.removeFromCart = async (cartItemId) => {
                console.log(`⚡ Instant removeFromCart: ${cartItemId}`);
                
                if (!confirm('Remove this item from cart?')) return;
                
                return this.instantRemove(cartItemId);
            };
            
            console.log('⚡ Functions overridden for instant updates');
        }
        
        updateQuantityInstantly(cartItemId, newQuantity) {
            console.log(`⚡ Updating UI instantly: ${cartItemId} -> ${newQuantity}`);
            
            // Find the cart item
            const cartItem = this.findCartItemById(cartItemId);
            if (!cartItem) {
                console.error('⚡ Cart item not found for instant update');
                return;
            }
            
            // Update quantity display
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            if (quantitySpan) {
                quantitySpan.textContent = newQuantity;
                console.log(`⚡ Updated quantity display to ${newQuantity}`);
            }
            
            // Update item total
            const priceElement = cartItem.querySelector('.cart-item-price');
            const totalElement = cartItem.querySelector('.cart-item-total p');
            
            if (priceElement && totalElement) {
                const priceText = priceElement.textContent.replace('₹', '');
                const price = parseFloat(priceText);
                const newTotal = price * newQuantity;
                
                totalElement.textContent = `₹${newTotal.toFixed(2)}`;
                console.log(`⚡ Updated item total to ₹${newTotal.toFixed(2)}`);
            }
            
            // Update cart total
            this.updateCartTotalInstantly();
            
            // Update navigation cart count
            this.updateCartCountInstantly();
        }
        
        async instantRemove(cartItemId) {
            console.log(`⚡ Instant remove: ${cartItemId}`);
            
            // Find and remove the cart item from UI
            const cartItem = this.findCartItemById(cartItemId);
            if (cartItem) {
                // Add fade out animation
                cartItem.style.transition = 'opacity 0.3s ease';
                cartItem.style.opacity = '0';
                
                setTimeout(() => {
                    cartItem.remove();
                    console.log('⚡ Cart item removed from UI');
                    
                    // Update totals after removal
                    this.updateCartTotalInstantly();
                    this.updateCartCountInstantly();
                    
                    // Check if cart is empty
                    this.checkEmptyCart();
                }, 300);
            }
            
            // Update database in background
            await this.removeDatabaseSilently(cartItemId);
        }
        
        async updateDatabaseSilently(cartItemId, newQuantity) {
            console.log(`⚡ Updating database silently: ${cartItemId} -> ${newQuantity}`);
            
            this.isUpdating = true;
            
            try {
                if (!window.supabase) {
                    throw new Error('Supabase not available');
                }
                
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('⚡ Database error:', error);
                    // Revert UI change on error
                    this.revertUIChange(cartItemId);
                    alert('Error updating quantity. Please refresh the page.');
                    return;
                }
                
                console.log('⚡ Database updated successfully');
                
            } catch (error) {
                console.error('⚡ Silent update error:', error);
                this.revertUIChange(cartItemId);
                alert('Error updating quantity. Please refresh the page.');
            } finally {
                this.isUpdating = false;
            }
        }
        
        async removeDatabaseSilently(cartItemId) {
            console.log(`⚡ Removing from database silently: ${cartItemId}`);
            
            try {
                if (!window.supabase) {
                    throw new Error('Supabase not available');
                }
                
                const { error } = await window.supabase
                    .from('cart')
                    .delete()
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('⚡ Database remove error:', error);
                    alert('Error removing item. Please refresh the page.');
                    return;
                }
                
                console.log('⚡ Item removed from database successfully');
                
                // Show success message
                if (typeof showToast === 'function') {
                    showToast('Item removed from cart', 'success');
                }
                
            } catch (error) {
                console.error('⚡ Silent remove error:', error);
                alert('Error removing item. Please refresh the page.');
            }
        }
        
        findCartItemById(cartItemId) {
            // Find cart item by checking remove button onclick
            const removeButtons = document.querySelectorAll('.btn-remove');
            
            for (const button of removeButtons) {
                const onclick = button.getAttribute('onclick') || '';
                if (onclick.includes(cartItemId)) {
                    return button.closest('.cart-item');
                }
            }
            
            return null;
        }
        
        updateCartTotalInstantly() {
            console.log('⚡ Updating cart total instantly');
            
            let total = 0;
            
            // Calculate total from all visible cart items
            const cartItems = document.querySelectorAll('.cart-item');
            cartItems.forEach(item => {
                const totalElement = item.querySelector('.cart-item-total p');
                if (totalElement) {
                    const totalText = totalElement.textContent.replace('₹', '');
                    const itemTotal = parseFloat(totalText) || 0;
                    total += itemTotal;
                }
            });
            
            // Update cart summary
            const cartSummary = document.querySelector('.cart-summary h3');
            if (cartSummary) {
                cartSummary.textContent = `Cart Total: ₹${total.toFixed(2)}`;
                console.log(`⚡ Updated cart total to ₹${total.toFixed(2)}`);
            }
        }
        
        updateCartCountInstantly() {
            console.log('⚡ Updating cart count instantly');
            
            // Count total items
            let totalItems = 0;
            const quantitySpans = document.querySelectorAll('.cart-item-quantity span');
            quantitySpans.forEach(span => {
                const quantity = parseInt(span.textContent) || 0;
                totalItems += quantity;
            });
            
            // Update navigation cart count
            const navCartCount = document.getElementById('nav-cart-count');
            if (navCartCount) {
                navCartCount.textContent = totalItems;
            }
            
            // Update bottom nav cart count
            const bottomNavCount = document.getElementById('bottom-nav-cart-count');
            if (bottomNavCount) {
                bottomNavCount.textContent = totalItems;
                bottomNavCount.classList.toggle('hidden', totalItems === 0);
            }
            
            console.log(`⚡ Updated cart count to ${totalItems}`);
        }
        
        checkEmptyCart() {
            const cartItems = document.querySelectorAll('.cart-item');
            if (cartItems.length === 0) {
                console.log('⚡ Cart is empty, showing empty message');
                
                const cartItemsDiv = document.getElementById('cart-items');
                if (cartItemsDiv) {
                    cartItemsDiv.innerHTML = `
                        <div class="empty-cart" style="text-align: center; padding: 40px;">
                            <p style="font-size: 18px; margin-bottom: 20px;">Your cart is empty</p>
                            <a href="shop.html" class="btn btn-primary" style="display: inline-block; padding: 12px 24px; background: #4a7c59; color: white; text-decoration: none; border-radius: 8px;">Start Shopping</a>
                        </div>
                    `;
                }
            }
        }
        
        revertUIChange(cartItemId) {
            console.log(`⚡ Reverting UI change for ${cartItemId}`);
            
            // Find the cart item and reload it from database
            // For now, just reload the entire cart
            if (window.loadCart && typeof window.loadCart === 'function') {
                setTimeout(() => window.loadCart(), 500);
            }
        }
        
        setupInstantHandlers() {
            console.log('⚡ Setting up instant event handlers');
            
            // Setup click delegation for instant updates
            document.addEventListener('click', async (event) => {
                const button = event.target;
                
                if (button.tagName !== 'BUTTON') return;
                if (this.isUpdating) return;
                
                const buttonText = button.textContent.trim();
                
                // Handle quantity buttons
                if (buttonText === '+' || buttonText === '-') {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    
                    console.log(`⚡ Instant ${buttonText} button clicked`);
                    
                    await this.handleInstantQuantityClick(button, buttonText);
                }
                
                // Handle remove buttons
                if (button.classList.contains('btn-remove')) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    
                    console.log('⚡ Instant remove button clicked');
                    
                    await this.handleInstantRemoveClick(button);
                }
            }, true); // Use capture phase
        }
        
        async handleInstantQuantityClick(button, buttonText) {
            const cartItem = button.closest('.cart-item');
            if (!cartItem) return;
            
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            const removeButton = cartItem.querySelector('.btn-remove');
            
            if (!quantitySpan || !removeButton) return;
            
            // Get current quantity
            const currentQuantity = parseInt(quantitySpan.textContent) || 1;
            const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
            
            // Extract cart item ID
            const removeOnclick = removeButton.getAttribute('onclick') || '';
            const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) return;
            
            const cartItemId = cartItemIdMatch[1];
            
            // Get stock limit
            const buttonOnclick = button.getAttribute('onclick') || '';
            const stockMatch = buttonOnclick.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
            const maxStock = stockMatch ? parseInt(stockMatch[1]) : 999;
            
            console.log(`⚡ Instant quantity change: ${cartItemId}, ${currentQuantity} -> ${newQuantity}, max: ${maxStock}`);
            
            // Call our instant update function
            await window.updateQuantity(cartItemId, newQuantity, maxStock);
        }
        
        async handleInstantRemoveClick(button) {
            const onclickStr = button.getAttribute('onclick') || '';
            const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) return;
            
            const cartItemId = cartItemIdMatch[1];
            
            console.log(`⚡ Instant remove: ${cartItemId}`);
            
            // Call our instant remove function
            await window.removeFromCart(cartItemId);
        }
    }
    
    // Initialize instant cart update
    const instantCartUpdate = new InstantCartUpdate();
    
    // Start initialization after other cart scripts load
    setTimeout(() => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                instantCartUpdate.init();
            });
        } else {
            instantCartUpdate.init();
        }
    }, 100);
    
    // Also initialize after delay to ensure all scripts loaded
    setTimeout(() => instantCartUpdate.init(), 2000);
    
    // Expose for debugging
    window.InstantCartUpdate = instantCartUpdate;
    
    console.log('✅ Instant Cart Update loaded');
    
})();