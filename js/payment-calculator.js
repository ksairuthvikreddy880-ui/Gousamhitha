// Payment Calculator - Clean Implementation
class PaymentCalculator {
    constructor() {
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
        this.taxRate = 0.05; // 5%
        this.init();
    }
    
    init() {
        console.log('💳 Payment Calculator initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Listen for payment modal opening
        document.addEventListener('DOMContentLoaded', () => {
            this.monitorPaymentModal();
        });
        
        // Listen for cart changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart' || e.key === 'selectedCartItems') {
                this.recalculate();
            }
        });
    }
    
    monitorPaymentModal() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.id === 'payment-modal') {
                        console.log('💳 Payment modal detected, calculating...');
                        setTimeout(() => this.recalculate(), 100);
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    calculateFromOrderData(orderData) {
        console.log('💳 Calculating from order data:', orderData);
        console.log('Items:', orderData ? orderData.items : null);

        if (!orderData || !orderData.items || orderData.items.length === 0) {
            console.log('⚠️ No items in order data, cannot calculate');
            return 0;
        }

        // Always compute from raw item data
        this.subtotal = orderData.items.reduce((sum, item) => {
            const unitPrice = Number(item.price) || 0;
            const quantity = Number(item.quantity) || 0;
            return sum + (unitPrice * quantity);
        }, 0);

        console.log('Subtotal:', this.subtotal);

        this.tax = this.subtotal * this.taxRate;
        this.shipping = orderData.delivery_charge || 0;
        this.total = this.subtotal + this.tax + this.shipping;

        console.log('💳 Calculation complete:', {
            subtotal: this.subtotal,
            tax: this.tax,
            shipping: this.shipping,
            total: this.total
        });

        this.updateUI();
        return this.total;
    }
    
    calculateFallback() {
        console.log('💳 Fallback: no items available, subtotal = 0');
        this.subtotal = 0;
        this.tax = 0;
        this.shipping = 0;
        this.total = 0;
        this.updateUI();
        return 0;
    }
    
    updateUI() {
        console.log('💳 Updating UI elements...');
        
        // Update subtotal
        const subtotalEl = document.getElementById('order-subtotal');
        if (subtotalEl) {
            subtotalEl.textContent = `₹${this.subtotal.toFixed(2)}`;
            console.log('✅ Updated subtotal:', subtotalEl.textContent);
        }
        
        // Update tax
        const taxEl = document.getElementById('order-tax');
        if (taxEl) {
            taxEl.textContent = `₹${this.tax.toFixed(2)}`;
            console.log('✅ Updated tax:', taxEl.textContent);
        }
        
        // Update shipping
        const shippingEl = document.getElementById('order-shipping');
        if (shippingEl) {
            shippingEl.textContent = `₹${this.shipping.toFixed(2)}`;
            console.log('✅ Updated shipping:', shippingEl.textContent);
        }
        
        // Total element removed - no longer updating it
        console.log('💳 Total element removed from UI as requested');
    }
    
    updateTotal() {
        const totalEl = document.getElementById('order-total');
        if (!totalEl) {
            console.error('❌ Total element not found');
            return;
        }
        
        const totalText = `₹${this.total.toFixed(2)}`;
        
        // Set total using multiple methods
        totalEl.textContent = totalText;
        totalEl.innerHTML = totalText;
        totalEl.innerText = totalText;
        
        // Apply strong styling
        totalEl.style.cssText = `
            color: #2e7d32 !important;
            font-weight: bold !important;
            font-size: 18px !important;
            display: block !important;
            visibility: visible !important;
        `;
        
        console.log('✅ Updated total:', totalEl.textContent);
        
        // AGGRESSIVE: Override any other scripts trying to change the total
        Object.defineProperty(totalEl, 'textContent', {
            get: function() { return totalText; },
            set: function(value) { 
                if (value !== totalText) {
                    console.log('🚫 Blocked attempt to change total from', totalText, 'to', value);
                }
            },
            configurable: true
        });
        
        // Monitor for changes and fix immediately
        let fixCount = 0;
        const totalMonitor = setInterval(() => {
            if (totalEl.innerHTML !== totalText && fixCount < 100) {
                console.log(`🔄 Total changed (${fixCount + 1}/100), fixing:`, totalText);
                totalEl.innerHTML = totalText;
                totalEl.innerText = totalText;
                fixCount++;
            }
            
            if (fixCount >= 100) {
                clearInterval(totalMonitor);
                console.log('🛑 Stopped total monitoring after 100 fixes');
            }
        }, 50); // Check every 50ms for faster response
        
        // Stop monitoring after 15 seconds
        setTimeout(() => {
            clearInterval(totalMonitor);
            console.log('🛑 Stopped total monitoring after timeout');
        }, 15000);
        
        // Add mutation observer to catch DOM changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    if (totalEl.textContent !== totalText) {
                        console.log('🔄 DOM mutation detected, fixing total');
                        totalEl.textContent = totalText;
                        totalEl.innerHTML = totalText;
                    }
                }
            });
        });
        
        observer.observe(totalEl, {
            childList: true,
            characterData: true,
            subtree: true
        });
        
        // Stop observer after 15 seconds
        setTimeout(() => {
            observer.disconnect();
            console.log('🛑 Stopped DOM mutation observer');
        }, 15000);
    }
    
    recalculate() {
        console.log('💳 Recalculating payment total...');
        
        // Try to get current payment context
        if (window.currentPaymentContext && window.currentPaymentContext.data) {
            return this.calculateFromOrderData(window.currentPaymentContext.data);
        }
        
        // Fallback calculation
        return this.calculateFallback();
    }
    
    // Public methods for manual control
    forceRecalculate() {
        console.log('💳 Force recalculation triggered');
        return this.recalculate();
    }
    
    setCustomTotal(subtotal, tax = null, shipping = 0) {
        this.subtotal = subtotal;
        this.tax = tax !== null ? tax : subtotal * this.taxRate;
        this.shipping = shipping;
        this.total = this.subtotal + this.tax + this.shipping;
        
        console.log('💳 Custom total set:', {
            subtotal: this.subtotal,
            tax: this.tax,
            shipping: this.shipping,
            total: this.total
        });
        
        this.updateUI();
        return this.total;
    }
}

// Initialize payment calculator
const paymentCalculator = new PaymentCalculator();

// Make it globally available
window.paymentCalculator = paymentCalculator;

// Global helper functions
window.fixPaymentTotal = () => paymentCalculator.forceRecalculate();
window.setPaymentTotal = (subtotal, tax, shipping) => paymentCalculator.setCustomTotal(subtotal, tax, shipping);

// forceCorrectTotal: recalculate from actual order data, no hardcoded values
window.forceCorrectTotal = function() {
    if (window.paymentCalculator) {
        window.paymentCalculator.recalculate();
    }
};

console.log('💳 Payment Calculator loaded and ready');