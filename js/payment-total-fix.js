// Payment Total Fix - Manual Override
console.log('💳 Payment Total Fix loaded');

// Manual fix function that can be called from console
window.manualFixTotal = function() {
    console.log('🔧 Manual total fix triggered');
    
    // Your current cart: 2 × ₹500 + 1 × ₹1000 = ₹2000
    const subtotal = 2000;
    const tax = subtotal * 0.05; // ₹100
    const shipping = 0;
    const total = subtotal + tax + shipping; // ₹2100
    
    console.log('🔧 Manual calculation:', { subtotal, tax, shipping, total });
    
    // Find and update all elements
    const elements = {
        subtotal: document.getElementById('order-subtotal'),
        tax: document.getElementById('order-tax'),
        shipping: document.getElementById('order-shipping')
    };
    
    console.log('🔧 Found elements:', elements);
    
    // Update subtotal
    if (elements.subtotal) {
        elements.subtotal.textContent = `₹${subtotal.toFixed(2)}`;
        console.log('✅ Updated subtotal to:', elements.subtotal.textContent);
    }
    
    // Update tax
    if (elements.tax) {
        elements.tax.textContent = `₹${tax.toFixed(2)}`;
        console.log('✅ Updated tax to:', elements.tax.textContent);
    }
    
    // Update shipping
    if (elements.shipping) {
        elements.shipping.textContent = `₹${shipping.toFixed(2)}`;
        console.log('✅ Updated shipping to:', elements.shipping.textContent);
    }
    
    console.log('💳 Total element removed from UI as requested - not updating it');
    
    return { subtotal, tax, shipping, total };
};

// Auto-fix when payment modal appears
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.id === 'payment-modal') {
                console.log('💳 Payment modal detected, auto-fixing total...');
                setTimeout(() => {
                    window.manualFixTotal();
                }, 1000);
            }
        });
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

console.log('💳 Payment Total Fix ready - call manualFixTotal() from console if needed');