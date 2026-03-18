// Direct Cart Buttons Fix - Simple and reliable quantity button fix
(function() {
    'use strict';
    
    console.log('🛒 Direct Cart Buttons Fix loading...');
    
    // Simple function to update quantity
    async function directUpdateQuantity(cartItemId, newQuantity, maxStock) {
        console.log(`Direct update: ${cartItemId}, quantity: ${newQuantity}, max: ${maxStock}`);
        
        // Validate inputs
        if (newQuantity < 1) {
            if (confirm('Remove this item from cart?')) {
                return directRemoveFromCart(cartItemId);
            }
            return;
        }
        
        if (newQuantity > maxStock) {
            alert(`Maximum available stock is ${maxStock}`);
            return;
        }
        
        // Check Supabase availability
        if (!window.supabase) {
            alert('Please wait for the page to load completely and try again.');
            return;
        }
        
        try {
            // Show loading state
            const buttons = document.querySelectorAll(`[onclick*="${cartItemId}"]`);
            buttons.forEach(btn => btn.disabled = true);
            
            // Update in database
            const { error } = await window.supabase
                .from('cart')
                .update({ quantity: newQuantity })
                .eq('id', cartItemId);
            
            if (error) {
                console.error('Database error:', error);
                alert('Failed to update quantity. Please try again.');
                return;
            }
            
            // Reload cart
            if (window.loadCart) {
                await window.loadCart();
            } else {
                window.location.reload();
            }
            
            // Update cart count
            if (window.updateCartCount) {
                setTimeout(() => window.updateCartCount(), 500);
            }
            
            console.log('✅ Quantity updated successfully');
            
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error updating quantity. Please refresh the page and try again.');
        } finally {
            // Re-enable buttons
            const buttons = document.querySelectorAll(`[onclick*="${cartItemId}"]`);
            buttons.forEach(btn => btn.disabled = false);
        }
    }
    
    // Simple function to remove item
    async function directRemoveFromCart(cartItemId) {
        console.log(`Direct remove: ${cartItemId}`);
        
        if (!window.supabase) {
            alert('Please wait for the page to load completely and try again.');
            return;
        }
        
        try {
            // Show loading state
            const buttons = document.querySelectorAll(`[onclick*="${cartItemId}"]`);
            buttons.forEach(btn => btn.disabled = true);
            
            // Remove from database
            const { error } = await window.supabase
                .from('cart')
                .delete()
                .eq('id', cartItemId);
            
            if (error) {
                console.error('Database error:', error);
                alert('Failed to remove item. Please try again.');
                return;
            }
            
            // Reload cart
            if (window.loadCart) {
                await window.loadCart();
            } else {
                window.location.reload();
            }
            
            // Update cart count
            if (window.updateCartCount) {
                setTimeout(() => window.updateCartCount(), 500);
            }
            
            console.log('✅ Item removed successfully');
            
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Error removing item. Please refresh the page and try again.');
        }
    }
    
    // Override global functions with direct versions
    function setupDirectFunctions() {
        // Store originals as backup
        window._originalUpdateQuantity = window.updateQuantity;
        window._originalRemoveFromCart = window.removeFromCart;
        
        // Replace with direct versions
        window.updateQuantity = directUpdateQuantity;
        window.removeFromCart = directRemoveFromCart;
        
        console.log('✅ Direct cart functions installed');
    }
    
    // Setup click handlers as backup
    function setupClickHandlers() {
        document.addEventListener('click', function(event) {
            const button = event.target;
            
            // Handle quantity buttons
            if (button.tagName === 'BUTTON' && button.onclick) {
                const onclickStr = button.onclick.toString();
                
                // Check if it's an updateQuantity call
                const updateMatch = onclickStr.match(/updateQuantity\(['"]([^'"]+)['"],\s*(\d+),\s*(\d+)\)/);
                if (updateMatch) {
                    event.preventDefault();
                    const [, cartItemId, newQuantity, maxStock] = updateMatch;
                    directUpdateQuantity(cartItemId, parseInt(newQuantity), parseInt(maxStock));
                    return;
                }
                
                // Check if it's a removeFromCart call
                const removeMatch = onclickStr.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                if (removeMatch) {
                    event.preventDefault();
                    const [, cartItemId] = removeMatch;
                    if (confirm('Remove this item from cart?')) {
                        directRemoveFromCart(cartItemId);
                    }
                    return;
                }
            }
        });
        
        console.log('✅ Direct click handlers setup');
    }
    
    // Initialize everything
    function init() {
        setupDirectFunctions();
        setupClickHandlers();
        
        // Re-setup when cart loads
        setTimeout(() => {
            if (document.getElementById('cart-items')) {
                setupDirectFunctions();
            }
        }, 2000);
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also initialize after a delay to ensure all other scripts have loaded
    setTimeout(init, 1000);
    
    console.log('✅ Direct Cart Buttons Fix loaded');
    
})();