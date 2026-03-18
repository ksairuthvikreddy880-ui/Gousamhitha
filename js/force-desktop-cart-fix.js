// Force Desktop Cart Fix - Aggressive fix for desktop quantity buttons
(function() {
    'use strict';
    
    console.log('💪 Force Desktop Cart Fix loading...');
    
    // Detect if we're on desktop
    const isDesktop = () => window.innerWidth > 768;
    
    // Force override all cart functions on desktop
    function forceDesktopFix() {
        if (!isDesktop()) {
            console.log('Mobile detected, skipping force desktop fix');
            return;
        }
        
        console.log('🖥️ Desktop detected - Applying FORCE desktop cart fix');
        
        // Completely override updateQuantity function
        window.updateQuantity = async function(cartItemId, newQuantity, maxStock) {
            console.log(`🔧 FORCE updateQuantity called: ${cartItemId}, ${newQuantity}, ${maxStock}`);
            
            // Validate
            if (newQuantity < 1) {
                if (confirm('Remove this item from cart?')) {
                    return window.removeFromCart(cartItemId);
                }
                return;
            }
            
            if (newQuantity > maxStock) {
                alert(`Maximum stock available: ${maxStock}`);
                return;
            }
            
            try {
                // Ensure Supabase is available
                if (!window.supabase) {
                    alert('Please wait for the page to load and try again.');
                    return;
                }
                
                console.log('🔧 Updating database...');
                
                // Update database
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Database error:', error);
                    alert('Error updating quantity. Please try again.');
                    return;
                }
                
                console.log('🔧 Database updated, reloading cart...');
                
                // Force reload cart
                if (window.loadCart) {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 300);
                }
                
                console.log('✅ FORCE update successful');
                
            } catch (error) {
                console.error('FORCE update error:', error);
                alert('Error updating quantity. Please refresh and try again.');
            }
        };
        
        // Completely override removeFromCart function
        window.removeFromCart = async function(cartItemId) {
            console.log(`🔧 FORCE removeFromCart called: ${cartItemId}`);
            
            try {
                if (!window.supabase) {
                    alert('Please wait for the page to load and try again.');
                    return;
                }
                
                console.log('🔧 Removing from database...');
                
                const { error } = await window.supabase
                    .from('cart')
                    .delete()
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('Database error:', error);
                    alert('Error removing item. Please try again.');
                    return;
                }
                
                console.log('🔧 Item removed, reloading cart...');
                
                // Force reload cart
                if (window.loadCart) {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 300);
                }
                
                console.log('✅ FORCE remove successful');
                
            } catch (error) {
                console.error('FORCE remove error:', error);
                alert('Error removing item. Please refresh and try again.');
            }
        };
        
        console.log('✅ FORCE functions overridden');
    }
    
    // Force click handlers on desktop
    function forceClickHandlers() {
        if (!isDesktop()) return;
        
        console.log('🖥️ Setting up FORCE click handlers for desktop');
        
        // Remove all existing event listeners and onclick handlers
        document.addEventListener('click', function(event) {
            if (!isDesktop()) return;
            
            const button = event.target;
            if (button.tagName !== 'BUTTON') return;
            
            const buttonText = button.textContent.trim();
            
            // Handle + and - buttons
            if (buttonText === '+' || buttonText === '-') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log(`🔧 FORCE handling ${buttonText} button click`);
                
                const cartItem = button.closest('.cart-item');
                if (!cartItem) return;
                
                const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
                const removeButton = cartItem.querySelector('.btn-remove');
                
                if (!quantitySpan || !removeButton) return;
                
                const currentQuantity = parseInt(quantitySpan.textContent) || 1;
                const newQuantity = buttonText === '+' ? currentQuantity + 1 : currentQuantity - 1;
                
                // Extract cart item ID from remove button
                const removeOnclick = removeButton.getAttribute('onclick') || removeButton.onclick?.toString() || '';
                const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                
                if (!cartItemIdMatch) {
                    console.error('Could not extract cart item ID');
                    return;
                }
                
                const cartItemId = cartItemIdMatch[1];
                
                // Get stock limit
                let maxStock = 999;
                const allButtons = cartItem.querySelectorAll('.cart-item-quantity button');
                for (const btn of allButtons) {
                    const onclick = btn.getAttribute('onclick') || btn.onclick?.toString() || '';
                    const stockMatch = onclick.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
                    if (stockMatch) {
                        maxStock = parseInt(stockMatch[1]);
                        break;
                    }
                }
                
                console.log(`🔧 FORCE calling updateQuantity: ${cartItemId}, ${newQuantity}, ${maxStock}`);
                window.updateQuantity(cartItemId, newQuantity, maxStock);
                
                return false;
            }
            
            // Handle remove buttons
            if (button.classList.contains('btn-remove')) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                console.log('🔧 FORCE handling remove button click');
                
                if (!confirm('Remove this item from cart?')) return;
                
                const onclickStr = button.getAttribute('onclick') || button.onclick?.toString() || '';
                const cartItemIdMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                
                if (cartItemIdMatch) {
                    const cartItemId = cartItemIdMatch[1];
                    console.log(`🔧 FORCE calling removeFromCart: ${cartItemId}`);
                    window.removeFromCart(cartItemId);
                }
                
                return false;
            }
        }, true); // Use capture phase to intercept before other handlers
        
        console.log('✅ FORCE click handlers setup');
    }
    
    // Initialize force fix
    function initForceDesktopFix() {
        if (!isDesktop()) return;
        
        console.log('🖥️ Initializing FORCE desktop cart fix');
        
        // Apply fixes immediately
        forceDesktopFix();
        forceClickHandlers();
        
        // Re-apply after cart loads
        setTimeout(() => {
            forceDesktopFix();
            forceClickHandlers();
        }, 2000);
        
        // Re-apply when cart content changes
        const observer = new MutationObserver(() => {
            if (isDesktop()) {
                setTimeout(() => {
                    forceDesktopFix();
                    forceClickHandlers();
                }, 500);
            }
        });
        
        const cartItems = document.getElementById('cart-items');
        if (cartItems) {
            observer.observe(cartItems, { childList: true, subtree: true });
        }
        
        console.log('✅ FORCE desktop fix initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForceDesktopFix);
    } else {
        initForceDesktopFix();
    }
    
    // Also initialize after delay
    setTimeout(initForceDesktopFix, 1000);
    setTimeout(initForceDesktopFix, 3000);
    
    console.log('💪 Force Desktop Cart Fix loaded');
    
})();