// Performance Optimization Script

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Debounce function for search and other frequent operations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cache for vendor data
const vendorCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000, // 5 minutes
    
    async get() {
        if (this.data && this.timestamp && (Date.now() - this.timestamp < this.ttl)) {
            return this.data;
        }
        
        try {
            const { data, error } = await window.supabase
                .from('vendors')
                .select('*');
            
            if (!error && data) {
                this.data = data;
                this.timestamp = Date.now();
                return data;
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
        
        return this.data || [];
    },
    
    invalidate() {
        this.data = null;
        this.timestamp = null;
    }
};

// Optimize script loading
function loadScriptAsync(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Reduce API calls with request batching
class APIBatcher {
    constructor(delay = 100) {
        this.delay = delay;
        this.queue = [];
        this.timeout = null;
    }
    
    add(request) {
        this.queue.push(request);
        
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        
        this.timeout = setTimeout(() => {
            this.flush();
        }, this.delay);
    }
    
    async flush() {
        if (this.queue.length === 0) return;
        
        const requests = [...this.queue];
        this.queue = [];
        
        // Process all requests
        await Promise.all(requests.map(req => req()));
    }
}

// Initialize performance optimizations
function initPerformanceOptimizations() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        lazyLoadImages();
    }
    
    // Add loading attribute to images
    document.querySelectorAll('img').forEach(img => {
        if (!img.hasAttribute('loading')) {
            img.setAttribute('loading', 'lazy');
        }
    });
    
    // Optimize search with debounce
    const searchBar = document.querySelector('.main-search-bar');
    if (searchBar && typeof performSearch === 'function') {
        const debouncedSearch = debounce(performSearch, 300);
        searchBar.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
}

// Export for use in other scripts
window.PerformanceUtils = {
    debounce,
    vendorCache,
    loadScriptAsync,
    APIBatcher,
    lazyLoadImages
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformanceOptimizations);
} else {
    initPerformanceOptimizations();
}
