// INSTANT PAYMENT & ORDER BOOST - Ultra fast payments and confirmations
(function() {
    'use strict';
    
    // INSTANT PAYMENT PROCESSING
    window.processPaymentUltraFast = function(amount, items) {
        // Generate UPI link instantly
        const upiId = '7893059116@paytm';
        const merchantName = 'Gousamhitha';
        const transactionId = 'TXN' + Date.now();
        
        // Create UPI URL instantly
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order Payment - ' + transactionId)}`;
        
        // Redirect instantly
        window.location.href = upiUrl;
        
        // Show instant confirmation
        setTimeout(() => {
            if (typeof showToast === 'function') {
                showToast('Payment initiated! Complete payment in your UPI app', 'success');
            }
        }, 100);
        
        return transactionId;
    };
    
    // INSTANT ORDER CONFIRMATION
    window.confirmOrderUltraFast = async function(orderData) {
        try {
            // Show instant loading
            const confirmBtn = document.querySelector('.confirm-order-btn, .place-order-btn');
            if (confirmBtn) {
                confirmBtn.textContent = 'Processing...';
                confirmBtn.disabled = true;
            }
            
            // Process order instantly
            const order = await window.processOrderUltraFast(orderData);
            
            // Show instant success
            if (typeof showToast === 'function') {
                showToast('Order placed successfully!', 'success');
            }
            
            // Redirect to orders page instantly
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 500);
            
            return order;
        } catch (error) {
            console.error('Order confirmation error:', error);
            if (typeof showToast === 'function') {
                showToast('Order failed. Please try again.', 'error');
            }
        }
    };
    
    // INSTANT CART TOTAL CALCULATION
    window.calculateTotalUltraFast = function(cartItems) {
        if (!cartItems || cartItems.length === 0) return 0;
        
        return cartItems.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    };
    
    // INSTANT CHECKOUT PROCESS
    window.checkoutUltraFast = async function() {
        try {
            // Get cart data instantly from cache
            const user = window.ultraCache?.user || (await window.supabase.auth.getUser()).data.user;
            if (!user) {
                if (typeof showToast === 'function') {
                    showToast('Please login to checkout', 'error');
                }
                return;
            }
            
            const cartItems = window.ultraCache?.cart || [];
            if (cartItems.length === 0) {
                if (typeof showToast === 'function') {
                    showToast('Your cart is empty', 'error');
                }
                return;
            }
            
            // Calculate total instantly
            const total = window.calculateTotalUltraFast(cartItems);
            
            // Create order data instantly
            const orderData = {
                user_id: user.id,
                items: cartItems,
                total_amount: total,
                status: 'pending',
                created_at: new Date().toISOString()
            };
            
            // Process payment instantly
            const transactionId = window.processPaymentUltraFast(total, cartItems);
            orderData.transaction_id = transactionId;
            
            // Confirm order instantly
            return await window.confirmOrderUltraFast(orderData);
            
        } catch (error) {
            console.error('Checkout error:', error);
            if (typeof showToast === 'function') {
                showToast('Checkout failed. Please try again.', 'error');
            }
        }
    };
    
    // INSTANT FORM VALIDATION
    window.validateFormUltraFast = function(formData) {
        const errors = [];
        
        // Instant validation rules
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        }
        
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            errors.push('Valid email is required');
        }
        
        if (!formData.mobile || !/^\d{10}$/.test(formData.mobile)) {
            errors.push('Valid 10-digit mobile number is required');
        }
        
        return errors;
    };
    
    // INSTANT ADDRESS VALIDATION
    window.validateAddressUltraFast = function(address) {
        const errors = [];
        
        if (!address.street || address.street.trim().length < 5) {
            errors.push('Street address must be at least 5 characters');
        }
        
        if (!address.city || address.city.trim().length < 2) {
            errors.push('City is required');
        }
        
        if (!address.pincode || !/^\d{6}$/.test(address.pincode)) {
            errors.push('Valid 6-digit pincode is required');
        }
        
        return errors;
    };
    
    // INSTANT ORDER STATUS UPDATE
    window.updateOrderStatusUltraFast = async function(orderId, status) {
        try {
            await window.supabase.from('orders').update({ status }).eq('id', orderId);
            
            // Update cache if exists
            if (window.ultraCache?.orders) {
                const order = window.ultraCache.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = status;
                }
            }
            
            if (typeof showToast === 'function') {
                showToast(`Order ${status}`, 'success');
            }
            
        } catch (error) {
            console.error('Order status update error:', error);
        }
    };
    
    // INSTANT DELIVERY TRACKING
    window.trackDeliveryUltraFast = function(orderId) {
        // Simulate instant tracking (replace with real API)
        const trackingStates = [
            'Order Confirmed',
            'Preparing',
            'Out for Delivery', 
            'Delivered'
        ];
        
        const randomState = trackingStates[Math.floor(Math.random() * trackingStates.length)];
        
        if (typeof showToast === 'function') {
            showToast(`Order Status: ${randomState}`, 'info');
        }
        
        return randomState;
    };
    
    // OVERRIDE PAYMENT FUNCTIONS
    function overridePaymentFunctions() {
        // Override existing payment functions
        if (window.processPayment) {
            window.processPayment = window.processPaymentUltraFast;
        }
        
        if (window.confirmOrder) {
            window.confirmOrder = window.confirmOrderUltraFast;
        }
        
        if (window.checkout) {
            window.checkout = window.checkoutUltraFast;
        }
        
        if (window.calculateTotal) {
            window.calculateTotal = window.calculateTotalUltraFast;
        }
    }
    
    // INITIALIZE INSTANT PAYMENT BOOST
    function initInstantPaymentBoost() {
        console.log('💳 INSTANT PAYMENT BOOST ACTIVATED');
        
        overridePaymentFunctions();
        
        // Add instant click handlers
        document.addEventListener('click', function(e) {
            // Fix for browsers that don't support matches
            const matches = e.target.matches || e.target.msMatchesSelector || e.target.webkitMatchesSelector;
            
            if (matches && matches.call(e.target, '.checkout-btn, .place-order-btn')) {
                e.preventDefault();
                window.checkoutUltraFast();
            }
            
            if (matches && matches.call(e.target, '.track-order-btn')) {
                e.preventDefault();
                const orderId = e.target.dataset.orderId;
                if (orderId) {
                    window.trackDeliveryUltraFast(orderId);
                }
            }
        });
    }
    
    // Start immediately
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initInstantPaymentBoost);
    } else {
        initInstantPaymentBoost();
    }
    
})();