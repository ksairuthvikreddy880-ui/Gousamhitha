// Plus Button Fix - Specific fix for the + (increase) button on desktop
(function() {
    'use strict';
    
    console.log('➕ Plus Button Fix loading...');
    
    class PlusButtonFix {
        constructor() {
            this.isDesktop = () => window.innerWidth > 768;
            this.debugMode = true;
        }
        
        init() {
            if (!this.isDesktop()) {
                console.log('Mobile detected, skipping plus button fix');
                return;
            }
            
            console.log('🖥️ Desktop detected - Applying PLUS button fix');
            this.setupPlusButtonFix();
            
            // Re-setup when cart changes
            this.observeCartChanges();
        }
        
        setupPlusButtonFix() {
            console.log('➕ Setting up plus button specific fix');
            
            // Wait for cart to load
            const checkCart = () => {
                const cartItems = document.getElementById('cart-items');
                if (cartItems && cartItems.innerHTML.includes('cart-item')) {
                    console.log('Cart found, fixing plus buttons');
                    this.fixPlusButtons();
                } else {
                    setTimeout(checkCart, 500);
                }
            };
            checkCart();
        }
        
        fixPlusButtons() {
            // Find all + buttons specifically
            const allButtons = document.querySelectorAll('.cart-item-quantity button');
            const plusButtons = Array.from(allButtons).filter(btn => 
                btn.textContent.trim() === '+' || 
                btn.textContent.includes('+') ||
                btn.innerHTML.includes('+')
            );
            
            console.log(`➕ Found ${plusButtons.length} plus buttons to fix`);
            
            plusButtons.forEach((button, index) => {
                this.setupSinglePlusButton(button, index);
            });
            
            // Also setup universal click handler
            this.setupUniversalPlusHandler();
        }
        
        setupSinglePlusButton(button, index) {
            console.log(`➕ Setting up plus button ${index}`);
            
            // Remove all existing handlers
            button.onclick = null;
            button.removeAttribute('onclick');
            
            // Get cart item context
            const cartItem = button.closest('.cart-item');
            if (!cartItem) {
                console.error('Could not find cart item for plus button');
                return;
            }
            
            // Extract data
            const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
            const removeButton = cartItem.querySelector('.btn-remove');
            
            if (!quantitySpan || !removeButton) {
                console.error('Could not find quantity span or remove button');
                return;
            }
            
            // Get cart item ID from remove button
            const removeOnclick = removeButton.getAttribute('onclick') || removeButton.onclick?.toString() || '';
            const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
            
            if (!cartItemIdMatch) {
                console.error('Could not extract cart item ID');
                return;
            }
            
            const cartItemId = cartItemIdMatch[1];
            
            // Get current quantity
            const getCurrentQuantity = () => parseInt(quantitySpan.textContent) || 1;
            
            // Get stock limit from any button in the same cart item
            let maxStock = 999;
            const allItemButtons = cartItem.querySelectorAll('.cart-item-quantity button');
            for (const btn of allItemButtons) {
                const onclick = btn.getAttribute('onclick') || btn.onclick?.toString() || '';
                const stockMatch = onclick.match(/updateQuantity\([^,]+,\s*[^,]+,\s*(\d+)\)/);
                if (stockMatch) {
                    maxStock = parseInt(stockMatch[1]);
                    break;
                }
            }
            
            console.log(`➕ Plus button setup: ID=${cartItemId}, Stock=${maxStock}`);
            
            // Add multiple event handlers for reliability
            const handlePlusClick = async (event) => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                const currentQuantity = getCurrentQuantity();
                const newQuantity = currentQuantity + 1;
                
                console.log(`➕ Plus button clicked: ${currentQuantity} -> ${newQuantity}`);
                
                await this.increasePlusQuantity(cartItemId, newQuantity, maxStock);
            };
            
            // Add event listeners
            button.addEventListener('click', handlePlusClick, true);
            button.addEventListener('mousedown', handlePlusClick, true);
            button.addEventListener('touchstart', handlePlusClick, true);
            
            // Visual feedback
            button.style.cursor = 'pointer';
            button.style.userSelect = 'none';
            button.style.backgroundColor = '#f0f8f0';
            button.style.border = '2px solid #4a7c59';
            
            console.log(`➕ Plus button ${index} setup complete`);
        }
        
        setupUniversalPlusHandler() {
            console.log('➕ Setting up universal plus handler');
            
            // Universal click handler for + buttons
            document.addEventListener('click', async (event) => {
                if (!this.isDesktop()) return;
                
                const button = event.target;
                if (button.tagName !== 'BUTTON') return;
                
                const buttonText = button.textContent.trim();
                if (buttonText !== '+' && !buttonText.includes('+')) return;
                
                console.log('➕ Universal plus handler triggered');
                
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                const cartItem = button.closest('.cart-item');
                if (!cartItem) return;
                
                const quantitySpan = cartItem.querySelector('.cart-item-quantity span');
                const removeButton = cartItem.querySelector('.btn-remove');
                
                if (!quantitySpan || !removeButton) return;
                
                const currentQuantity = parseInt(quantitySpan.textContent) || 1;
                const newQuantity = currentQuantity + 1;
                
                // Extract cart item ID
                const removeOnclick = removeButton.getAttribute('onclick') || '';
                const cartItemIdMatch = removeOnclick.match(/removeFromCart\(['"]([^'"]+)['"]\)/);
                
                if (!cartItemIdMatch) return;
                
                const cartItemId = cartItemIdMatch[1];
                
                console.log(`➕ Universal plus: ${cartItemId}, ${currentQuantity} -> ${newQuantity}`);
                
                await this.increasePlusQuantity(cartItemId, newQuantity, 999);
                
            }, true); // Use capture phase
        }
        
        async increasePlusQuantity(cartItemId, newQuantity, maxStock) {
            console.log(`➕ Increasing quantity: ${cartItemId} -> ${newQuantity} (max: ${maxStock})`);
            
            // Validate stock
            if (newQuantity > maxStock) {
                alert(`Maximum available stock is ${maxStock}`);
                return;
            }
            
            try {
                // Check Supabase
                if (!window.supabase) {
                    alert('Please wait for the page to load completely.');
                    return;
                }
                
                // Disable all buttons
                this.setButtonsDisabled(true);
                
                console.log('➕ Updating database...');
                
                // Update database
                const { error } = await window.supabase
                    .from('cart')
                    .update({ quantity: newQuantity })
                    .eq('id', cartItemId);
                
                if (error) {
                    console.error('➕ Database error:', error);
                    alert('Error increasing quantity. Please try again.');
                    return;
                }
                
                console.log('➕ Database updated successfully');
                
                // Reload cart
                if (window.loadCart && typeof window.loadCart === 'function') {
                    await window.loadCart();
                } else {
                    window.location.reload();
                }
                
                // Update cart count
                if (window.updateCartCount) {
                    setTimeout(() => window.updateCartCount(), 300);
                }
                
                console.log('✅ Plus quantity increase successful');
                
            } catch (error) {
                console.error('➕ Error increasing quantity:', error);
                alert('Error increasing quantity. Please refresh and try again.');
            } finally {
                this.setButtonsDisabled(false);
                
                // Re-setup plus buttons after cart reload
                setTimeout(() => this.fixPlusButtons(), 1000);
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
        
        observeCartChanges() {
            const cartItems = document.getElementById('cart-items');
            if (!cartItems) {
                setTimeout(() => this.observeCartChanges(), 500);
                return;
            }
            
            const observer = new MutationObserver(() => {
                if (this.isDesktop()) {
                    console.log('➕ Cart changed, re-fixing plus buttons');
                    setTimeout(() => this.fixPlusButtons(), 500);
                }
            });
            
            observer.observe(cartItems, {
                childList: true,
                subtree: true
            });
        }
        
        // Override the global updateQuantity function specifically for increases
        overrideUpdateQuantity() {
            const originalUpdateQuantity = window.updateQuantity;
            
            window.updateQuantity = async (cartItemId, newQuantity, maxStock) => {
                console.log(`➕ updateQuantity override called: ${cartItemId}, ${newQuantity}, ${maxStock}`);
                
                // If it's an increase operation on desktop, use our method
                if (this.isDesktop()) {
                    // Get current quantity from DOM to determine if it's an increase
                    const cartItems = document.querySelectorAll('.cart-item');
                    for (const item of cartItems) {
                        const removeBtn = item.querySelector('.btn-remove');
                        if (removeBtn) {
                            const onclick = removeBtn.getAttribute('onclick') || '';
                            if (onclick.includes(cartItemId)) {
                                const quantitySpan = item.querySelector('.cart-item-quantity span');
                                if (quantitySpan) {
                                    const currentQuantity = parseInt(quantitySpan.textContent) || 1;
                                    if (newQuantity > currentQuantity) {
                                        console.log('➕ Detected increase operation, using plus fix');
                                        return this.increasePlusQuantity(cartItemId, newQuantity, maxStock);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
                
                // For decreases or mobile, use original function
                if (originalUpdateQuantity) {
                    return originalUpdateQuantity(cartItemId, newQuantity, maxStock);
                }
            };
            
            console.log('➕ updateQuantity function overridden');
        }
    }
    
    // Initialize plus button fix
    const plusButtonFix = new PlusButtonFix();
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            plusButtonFix.init();
            setTimeout(() => plusButtonFix.overrideUpdateQuantity(), 1000);
        });
    } else {
        plusButtonFix.init();
        setTimeout(() => plusButtonFix.overrideUpdateQuantity(), 1000);
    }
    
    // Multiple initialization attempts
    setTimeout(() => plusButtonFix.init(), 2000);
    setTimeout(() => plusButtonFix.init(), 4000);
    
    // Expose for debugging
    window.PlusButtonFix = plusButtonFix;
    
    console.log('✅ Plus Button Fix loaded');
    
})();