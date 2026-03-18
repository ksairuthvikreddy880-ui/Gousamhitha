// Enhanced Cart System - Real Ecommerce Functionality
class EnhancedCartSystem {
    constructor() {
        this.selectedItems = new Set();
        this.cartItems = new Map();
        this.init();
    }
    
    init() {
        console.log('🛒 Enhanced Cart System initializing...');
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupCart();
            });
        } else {
            this.setupCart();
        }
    }
    
    setupCart() {
        // Wait for cart to load, then enhance it
        setTimeout(() => {
            this.enhanceCartItems();
            // Skip select all toggle setup - disabled per user request
            this.updateCartSummary();
            this.setupEventListeners();
        }, 1000);
        
        // Listen for cart updates
        document.addEventListener('cartUpdated', () => {
            setTimeout(() => {
                this.enhanceCartItems();
                this.updateCartSummary();
            }, 100);
        });
    }
    
    enhanceCartItems() {
        const cartItems = document.querySelectorAll('.cart-item:not(.enhanced)');
        
        cartItems.forEach(item => {
            this.enhanceCartItem(item);
        });
        
        this.updateCartSummary();
    }
    
    enhanceCartItem(cartItem) {
        if (cartItem.classList.contains('enhanced')) return;
        
        console.log('✨ Enhancing cart item');
        
        // Get cart item data
        const cartItemId = this.getCartItemId(cartItem);
        const itemData = this.extractItemData(cartItem);
        
        // Store item data
        this.cartItems.set(cartItemId, itemData);
        
        // Skip checkbox creation - disabled per user request
        
        // Enhance quantity controls
        this.enhanceQuantityControls(cartItem, cartItemId);
        
        // Enhance remove button
        this.enhanceRemoveButton(cartItem, cartItemId);
        
        // Mark as enhanced
        cartItem.classList.add('enhanced');
        cartItem.dataset.cartId = cartItemId;
        
        // Select all items by default (no checkboxes, just for calculation)
        this.selectedItems.add(cartItemId);
    }
    
    getCartItemId(cartItem) {
        // Try to get existing ID
        let cartItemId = cartItem.dataset.cartId || cartItem.dataset.productId;
        
        // If no ID, try to extract from onclick handlers
        if (!cartItemId) {
            const buttons = cartItem.querySelectorAll('button[onclick]');
            for (const button of buttons) {
                const onclick = button.getAttribute('onclick');
                const match = onclick?.match(/['"]([^'"]+)['"]/);
                if (match) {
                    cartItemId = match[1];
                    break;
                }
            }
        }
        
        // Fallback: generate ID
        if (!cartItemId) {
            cartItemId = 'cart_' + Math.random().toString(36).substr(2, 9);
        }
        
        return cartItemId;
    }
    
    extractItemData(cartItem) {
        const nameElement = cartItem.querySelector('.cart-item-details h3, h3');
        const priceElement = cartItem.querySelector('.cart-item-price');
        const imageElement = cartItem.querySelector('img');
        const quantityElement = cartItem.querySelector('.quantity-input, .mobile-quantity-input, .cart-item-quantity span');
        
        let quantity = 1;
        if (quantityElement) {
            if (quantityElement.tagName === 'INPUT') {
                quantity = parseInt(quantityElement.value) || 1;
            } else {
                quantity = parseInt(quantityElement.textContent) || 1;
            }
        }
        
        const unitPrice = priceElement ? 
            parseFloat(priceElement.textContent.replace('₹', '').replace(',', '')) || 0 : 0;
        
        return {
            name: nameElement ? nameElement.textContent.trim() : 'Unknown Product',
            unitPrice: unitPrice,
            quantity: quantity,
            image: imageElement ? imageElement.src : '',
            total: unitPrice * quantity
        };
    }
    
    addSelectionCheckbox(cartItem, cartItemId) {
        // Checkbox creation disabled per user request
        console.log('🚫 Checkbox creation disabled per user request');
        return;
    }
    
    enhanceQuantityControls(cartItem, cartItemId) {
        // Find existing quantity controls or create new ones
        let quantityContainer = cartItem.querySelector('.quantity-selector, .mobile-quantity-controls');
        
        if (!quantityContainer) {
            quantityContainer = this.createQuantityControls(cartItemId);
            
            // Find where to insert quantity controls
            const controlsArea = cartItem.querySelector('.cart-item-controls, .cart-item-actions');
            if (controlsArea) {
                controlsArea.insertBefore(quantityContainer, controlsArea.firstChild);
            } else {
                // Create controls area
                const newControlsArea = document.createElement('div');
                newControlsArea.className = 'cart-item-controls';
                newControlsArea.style.cssText = 'display: flex; align-items: center; justify-content: space-between; margin-top: 8px; gap: 8px;';
                newControlsArea.appendChild(quantityContainer);
                
                const detailsContainer = cartItem.querySelector('.cart-item-details');
                if (detailsContainer) {
                    detailsContainer.appendChild(newControlsArea);
                }
            }
        } else {
            // Enhance existing controls
            this.enhanceExistingQuantityControls(quantityContainer, cartItemId);
        }
    }
    
    createQuantityControls(cartItemId) {
        const quantityContainer = document.createElement('div');
        quantityContainer.className = 'quantity-selector enhanced-quantity';
        quantityContainer.style.cssText = `
            display: flex; 
            align-items: center; 
            background: #f8f9fa; 
            border-radius: 20px; 
            padding: 4px; 
            gap: 4px; 
            border: 1px solid #e0e0e0;
        `;
        
        // Decrease button
        const decreaseBtn = document.createElement('button');
        decreaseBtn.className = 'quantity-btn decrease-btn';
        decreaseBtn.textContent = '−';
        decreaseBtn.style.cssText = `
            width: 28px; height: 28px; border: none; background: white; 
            border-radius: 50%; display: flex; align-items: center; 
            justify-content: center; font-size: 14px; font-weight: bold; 
            color: #4a7c59; cursor: pointer; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        `;
        
        // Quantity input
        const quantityInput = document.createElement('input');
        quantityInput.type = 'number';
        quantityInput.className = 'quantity-input enhanced-quantity-input';
        quantityInput.value = this.cartItems.get(cartItemId)?.quantity || 1;
        quantityInput.min = '1';
        quantityInput.dataset.cartId = cartItemId;
        quantityInput.style.cssText = `
            width: 35px; text-align: center; border: none; 
            background: transparent; font-size: 13px; 
            font-weight: 600; color: #333; padding: 0;
        `;
        
        // Increase button
        const increaseBtn = document.createElement('button');
        increaseBtn.className = 'quantity-btn increase-btn';
        increaseBtn.textContent = '+';
        increaseBtn.style.cssText = `
            width: 28px; height: 28px; border: none; background: white; 
            border-radius: 50%; display: flex; align-items: center; 
            justify-content: center; font-size: 14px; font-weight: bold; 
            color: #4a7c59; cursor: pointer; 
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        `;
        
        // Add event listeners
        decreaseBtn.addEventListener('click', () => this.decreaseQuantity(cartItemId));
        increaseBtn.addEventListener('click', () => this.increaseQuantity(cartItemId));
        quantityInput.addEventListener('change', (e) => this.updateQuantity(cartItemId, parseInt(e.target.value)));
        
        quantityContainer.appendChild(decreaseBtn);
        quantityContainer.appendChild(quantityInput);
        quantityContainer.appendChild(increaseBtn);
        
        return quantityContainer;
    }
    
    enhanceExistingQuantityControls(quantityContainer, cartItemId) {
        const decreaseBtn = quantityContainer.querySelector('.decrease-btn, button[onclick*="-"], .mobile-quantity-btn:first-child');
        const increaseBtn = quantityContainer.querySelector('.increase-btn, button[onclick*="+"], .mobile-quantity-btn:last-child');
        const quantityInput = quantityContainer.querySelector('.quantity-input, .mobile-quantity-input, input[type="number"]');
        
        if (decreaseBtn) {
            decreaseBtn.onclick = null;
            decreaseBtn.addEventListener('click', () => this.decreaseQuantity(cartItemId));
        }
        
        if (increaseBtn) {
            increaseBtn.onclick = null;
            increaseBtn.addEventListener('click', () => this.increaseQuantity(cartItemId));
        }
        
        if (quantityInput) {
            quantityInput.dataset.cartId = cartItemId;
            quantityInput.addEventListener('change', (e) => this.updateQuantity(cartItemId, parseInt(e.target.value)));
        }
    }
    
    enhanceRemoveButton(cartItem, cartItemId) {
        let removeBtn = cartItem.querySelector('.remove-btn, .mobile-remove-btn, button[onclick*="remove"]');
        
        if (!removeBtn) {
            // Create remove button
            removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn enhanced-remove-btn';
            removeBtn.textContent = 'REMOVE';
            removeBtn.style.cssText = `
                background: none; border: none; color: #dc3545; 
                font-size: 11px; padding: 4px 8px; border-radius: 4px; 
                cursor: pointer; text-transform: uppercase; 
                letter-spacing: 0.5px; font-weight: 500;
            `;
            
            // Add to controls area
            const controlsArea = cartItem.querySelector('.cart-item-controls');
            if (controlsArea) {
                controlsArea.appendChild(removeBtn);
            }
        }
        
        // Remove existing onclick and add new event listener
        if (removeBtn) {
            removeBtn.onclick = null;
            removeBtn.addEventListener('click', () => this.removeItem(cartItemId));
        }
    }
    
    handleItemSelection(checkbox) {
        const cartItemId = checkbox.dataset.cartId;
        const cartItem = checkbox.closest('.cart-item');
        
        if (checkbox.checked) {
            this.selectedItems.add(cartItemId);
            this.updateItemSelectionState(cartItem, true);
            console.log(`✅ Selected item: ${cartItemId}`);
        } else {
            this.selectedItems.delete(cartItemId);
            this.updateItemSelectionState(cartItem, false);
            console.log(`❌ Deselected item: ${cartItemId}`);
        }
        
        this.updateSelectAllState();
        this.updateCartSummary();
        this.updateCheckoutButton();
    }
    
    updateItemSelectionState(cartItem, isSelected) {
        if (isSelected) {
            cartItem.classList.add('selected');
            cartItem.style.opacity = '1';
            cartItem.style.backgroundColor = '#ffffff';
            cartItem.style.border = '2px solid #4a7c59';
            cartItem.style.borderRadius = '8px';
            cartItem.style.boxShadow = '0 2px 8px rgba(74, 124, 89, 0.15)';
        } else {
            cartItem.classList.remove('selected');
            cartItem.style.opacity = '0.6';
            cartItem.style.backgroundColor = '#f8f9fa';
            cartItem.style.border = '2px solid #e0e0e0';
            cartItem.style.borderRadius = '8px';
            cartItem.style.boxShadow = 'none';
        }
    }
    
    decreaseQuantity(cartItemId) {
        const itemData = this.cartItems.get(cartItemId);
        if (!itemData || itemData.quantity <= 1) return;
        
        itemData.quantity -= 1;
        itemData.total = itemData.unitPrice * itemData.quantity;
        
        this.updateQuantityDisplay(cartItemId);
        this.updateCartSummary();
        this.syncWithDatabase(cartItemId, itemData.quantity);
    }
    
    increaseQuantity(cartItemId) {
        const itemData = this.cartItems.get(cartItemId);
        if (!itemData) return;
        
        itemData.quantity += 1;
        itemData.total = itemData.unitPrice * itemData.quantity;
        
        this.updateQuantityDisplay(cartItemId);
        this.updateCartSummary();
        this.syncWithDatabase(cartItemId, itemData.quantity);
    }
    
    updateQuantity(cartItemId, newQuantity) {
        if (newQuantity < 1) newQuantity = 1;
        
        const itemData = this.cartItems.get(cartItemId);
        if (!itemData) return;
        
        itemData.quantity = newQuantity;
        itemData.total = itemData.unitPrice * itemData.quantity;
        
        this.updateQuantityDisplay(cartItemId);
        this.updateCartSummary();
        this.syncWithDatabase(cartItemId, newQuantity);
    }
    
    updateQuantityDisplay(cartItemId) {
        const cartItem = document.querySelector(`[data-cart-id="${cartItemId}"]`);
        if (!cartItem) return;
        
        const itemData = this.cartItems.get(cartItemId);
        const quantityInput = cartItem.querySelector('.quantity-input, .enhanced-quantity-input');
        
        if (quantityInput) {
            quantityInput.value = itemData.quantity;
        }
        
        // Update item total display
        const itemTotalElement = cartItem.querySelector('.mobile-item-total, .cart-item-total p');
        if (itemTotalElement) {
            itemTotalElement.textContent = `₹${itemData.total.toFixed(2)}`;
        }
    }
    
    removeItem(cartItemId) {
        console.log(`🗑️ Removing item: ${cartItemId}`);
        
        // Remove from selected items
        this.selectedItems.delete(cartItemId);
        
        // Remove from cart items
        this.cartItems.delete(cartItemId);
        
        // Remove from DOM
        const cartItem = document.querySelector(`[data-cart-id="${cartItemId}"]`);
        if (cartItem) {
            cartItem.style.transition = 'all 0.3s ease';
            cartItem.style.opacity = '0';
            cartItem.style.transform = 'translateX(-100%)';
            
            setTimeout(() => {
                cartItem.remove();
                // Skip select all state update - disabled per user request
                this.updateCartSummary();
                this.updateCheckoutButton();
            }, 300);
        }
        
        // Sync with database
        this.removeFromDatabase(cartItemId);
    }
    
    setupSelectAllToggle() {
        // Select All toggle disabled per user request
        console.log('🚫 Select All toggle creation disabled per user request');
        return;
    }
    
    handleSelectAll(selectAll) {
        // Select All functionality disabled per user request
        console.log('🚫 Select All functionality disabled per user request');
        return;
    }
    
    updateSelectAllState() {
        // Select All state updates disabled per user request
        console.log('🚫 Select All state updates disabled per user request');
        return;
    }
    
    updateSelectionCount() {
        // Selection count display disabled per user request
        console.log('🚫 Selection count display disabled per user request');
        return;
    }
    
    updateCartSummary() {
        let totalItemsCount = 0;
        let totalPrice = 0;
        let totalSavings = 0;
        
        // Calculate totals for ALL items (since checkboxes are disabled)
        this.cartItems.forEach((itemData, cartItemId) => {
            totalItemsCount += itemData.quantity;
            totalPrice += itemData.total;
            totalSavings += itemData.unitPrice * itemData.quantity * 0.05; // 5% savings
        });
        
        console.log(`💰 Cart Summary: ${totalItemsCount} items, ₹${totalPrice.toFixed(2)}`);
        
        // Update mobile sticky bar
        this.updateMobileStickyBar(totalItemsCount, totalPrice, totalSavings);
        
        // Update desktop summary if exists
        this.updateDesktopSummary(totalItemsCount, totalPrice, totalSavings);
        
        // Update selection count (disabled per user request)
        // this.updateSelectionCount();
    }
    
    updateMobileStickyBar(itemCount, totalPrice, savings) {
        // Mobile cart total bar disabled - skip update
        const totalItemsElement = document.getElementById('mobile-total-items');
        const totalPriceElement = document.getElementById('mobile-total-price');
        const totalSavingsElement = document.getElementById('mobile-total-savings');
        
        // Skip if mobile elements don't exist (bar removed)
        if (!totalItemsElement || !totalPriceElement || !totalSavingsElement) {
            return;
        }
        
        if (totalItemsElement) {
            totalItemsElement.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''} selected`;
        }
        
        if (totalPriceElement) {
            totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
        }
        
        if (totalSavingsElement) {
            totalSavingsElement.textContent = savings > 0 ? `You saved ₹${savings.toFixed(0)}` : '';
        }
    }
    
    updateDesktopSummary(itemCount, totalPrice, savings) {
        // Update desktop cart summary if it exists
        const cartSummary = document.querySelector('.cart-summary');
        if (cartSummary) {
            let summaryHTML = `
                <h3>Cart Summary</h3>
                <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>Items (${itemCount})</span>
                        <span>₹${totalPrice.toFixed(2)}</span>
                    </div>
                    ${savings > 0 ? `
                    <div style="display: flex; justify-content: space-between; color: #4caf50; font-size: 14px;">
                        <span>Savings</span>
                        <span>-₹${savings.toFixed(0)}</span>
                    </div>` : ''}
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 18px; padding: 15px 0;">
                    <span>Total</span>
                    <span>₹${totalPrice.toFixed(2)}</span>
                </div>
            `;
            
            cartSummary.innerHTML = summaryHTML;
        }
    }
    
    updateCheckoutButton() {
        const checkoutButtons = document.querySelectorAll('.checkout-btn-mobile');
        const selectedCount = this.selectedItems.size;
        
        checkoutButtons.forEach(button => {
            if (selectedCount === 0) {
                button.textContent = 'Select Items to Checkout';
                button.disabled = true;
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
                button.style.background = '#ccc';
            } else {
                button.textContent = `Checkout ${selectedCount} Item${selectedCount !== 1 ? 's' : ''}`;
                button.disabled = false;
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
                button.style.background = '#4a7c59';
            }
        });
    }
    
    setupEventListeners() {
        // Listen for window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.updateCartSummary();
                }, 100);
            }
        });
        
        // Listen for storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                setTimeout(() => {
                    this.enhanceCartItems();
                    this.updateCartSummary();
                }, 100);
            }
        });
    }
    
    async syncWithDatabase(cartItemId, quantity) {
        if (!window.supabase) return;
        
        try {
            const { error } = await window.supabase
                .from('cart')
                .update({ quantity: quantity })
                .eq('id', cartItemId);
            
            if (error) {
                console.error('❌ Error syncing quantity:', error);
            } else {
                console.log(`✅ Synced quantity for ${cartItemId}: ${quantity}`);
            }
        } catch (error) {
            console.error('❌ Exception syncing quantity:', error);
        }
    }
    
    async removeFromDatabase(cartItemId) {
        if (!window.supabase) return;
        
        try {
            const { error } = await window.supabase
                .from('cart')
                .delete()
                .eq('id', cartItemId);
            
            if (error) {
                console.error('❌ Error removing from database:', error);
            } else {
                console.log(`✅ Removed from database: ${cartItemId}`);
            }
        } catch (error) {
            console.error('❌ Exception removing from database:', error);
        }
    }
    
    getSelectedItemsData() {
        const selectedItemsData = [];
        
        this.selectedItems.forEach(cartItemId => {
            const itemData = this.cartItems.get(cartItemId);
            if (itemData) {
                selectedItemsData.push({
                    cartId: cartItemId,
                    name: itemData.name,
                    unitPrice: itemData.unitPrice,
                    quantity: itemData.quantity,
                    total: itemData.total,
                    image: itemData.image
                });
            }
        });
        
        return selectedItemsData;
    }
    
    proceedToCheckout() {
        const selectedItems = this.getSelectedItemsData();
        
        if (selectedItems.length === 0) {
            alert('Please select at least one item to checkout.');
            return;
        }
        
        console.log('🛒 Proceeding to checkout with:', selectedItems);
        
        // Store selected items for checkout page
        localStorage.setItem('selectedCartItems', JSON.stringify(selectedItems));
        
        const totalAmount = selectedItems.reduce((sum, item) => sum + item.total, 0);
        const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
        
        localStorage.setItem('checkoutSummary', JSON.stringify({
            totalItems: totalItems,
            totalAmount: totalAmount,
            selectedItemsCount: selectedItems.length
        }));
        
        // Redirect to checkout
        window.location.href = 'checkout.html';
    }
}

// Override global proceedToCheckout function
function proceedToCheckout() {
    // Since checkboxes are disabled, proceed with all cart items
    console.log('🛒 Proceeding to checkout with all cart items (no selection needed)');
    
    const cartItems = document.querySelectorAll('.cart-item');
    if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
    }
    
    // Redirect to checkout - let checkout.html handle loading all cart items
    window.location.href = 'checkout.html';
}

// Initialize enhanced cart system
window.enhancedCartSystem = new EnhancedCartSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCartSystem;
}