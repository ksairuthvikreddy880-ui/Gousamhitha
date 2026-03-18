// Optimized Search System - Performance improvements with debouncing and caching
(function() {
    'use strict';
    
    // Search cache
    const searchCache = new Map();
    const SEARCH_CACHE_DURATION = 300000; // 5 minutes
    
    class OptimizedSearchEngine {
        constructor() {
            this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            this.debouncedSearch = window.debounce ? window.debounce(this.performSearch.bind(this), 300) : this.performSearch.bind(this);
            this.init();
        }
        
        init() {
            this.setupSearchListeners();
            this.displaySearchResults();
        }
        
        setupSearchListeners() {
            // Main search bar
            const searchBars = document.querySelectorAll('.main-search-bar, .search-input, input[type="search"]');
            searchBars.forEach(searchBar => {
                if (searchBar) {
                    // Remove existing listeners to avoid duplicates
                    searchBar.removeEventListener('input', this.handleSearchInput);
                    searchBar.removeEventListener('keypress', this.handleSearchKeypress);
                    
                    // Add optimized listeners
                    searchBar.addEventListener('input', this.handleSearchInput.bind(this));
                    searchBar.addEventListener('keypress', this.handleSearchKeypress.bind(this));
                }
            });
            
            // Search buttons
            const searchButtons = document.querySelectorAll('.search-btn, .search-button');
            searchButtons.forEach(button => {
                if (button) {
                    button.removeEventListener('click', this.handleSearchClick);
                    button.addEventListener('click', this.handleSearchClick.bind(this));
                }
            });
        }
        
        handleSearchInput(event) {
            const searchTerm = event.target.value.trim();
            if (searchTerm.length >= 2) {
                // Use debounced search for real-time results
                this.debouncedSearch(searchTerm);
            }
        }
        
        handleSearchKeypress(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const searchTerm = event.target.value.trim();
                if (searchTerm) {
                    this.performSearch(searchTerm);
                }
            }
        }
        
        handleSearchClick(event) {
            event.preventDefault();
            const searchBar = document.querySelector('.main-search-bar, .search-input');
            if (searchBar) {
                const searchTerm = searchBar.value.trim();
                if (searchTerm) {
                    this.performSearch(searchTerm);
                }
            }
        }
        
        async performSearch(searchTerm) {
            if (!searchTerm || searchTerm.length < 2) return;
            
            // Check cache first
            const cacheKey = `search_${searchTerm.toLowerCase()}`;
            const cached = searchCache.get(cacheKey);
            
            if (cached && (Date.now() - cached.timestamp) < SEARCH_CACHE_DURATION) {
                this.displayResults(cached.results, searchTerm);
                return;
            }
            
            try {
                // Optimized database search with selective columns
                const results = await this.searchProductsOptimized(searchTerm);
                
                // Cache results
                searchCache.set(cacheKey, {
                    results: results,
                    timestamp: Date.now()
                });
                
                // Add to search history (throttled)
                this.addToSearchHistory(searchTerm);
                
                // Store results for navigation
                sessionStorage.setItem('searchResults', JSON.stringify(results));
                sessionStorage.setItem('searchTerm', searchTerm);
                
                // Display results or navigate
                if (window.location.pathname.includes('shop.html')) {
                    this.displayResults(results, searchTerm);
                } else {
                    window.location.href = 'shop.html';
                }
                
            } catch (error) {
                console.error('Search error:', error);
                this.showToast('Search failed. Please try again.', 'error');
            }
        }
        
        async searchProductsOptimized(searchTerm) {
            if (!window.supabase) {
                throw new Error('Database connection not available');
            }
            
            const searchPattern = `%${searchTerm.toLowerCase()}%`;
            
            // Optimized query with selective columns and better indexing
            const { data: products, error } = await window.supabase
                .from('products')
                .select('id, name, category, price, stock, in_stock, image_url, display_unit, unit_quantity, unit')
                .or(`name.ilike.${searchPattern},category.ilike.${searchPattern}`)
                .eq('in_stock', true)
                .order('name');
            
            if (error) {
                throw new Error(error.message);
            }
            
            return products || [];
        }
        
        displayResults(results, searchTerm) {
            const productGrid = document.querySelector('.product-grid');
            if (!productGrid) return;
            
            if (results.length === 0) {
                productGrid.innerHTML = `
                    <div class="empty-state" style="text-align: center; padding: 3rem; grid-column: 1/-1;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">🔍</div>
                        <div style="font-size: 1.2rem; color: #666; margin-bottom: 0.5rem;">No products found for "${searchTerm}"</div>
                        <div style="font-size: 1rem; color: #999;">Try different keywords or browse our categories</div>
                    </div>
                `;
                return;
            }
            
            // Use optimized product rendering
            const productsHTML = this.renderSearchResults(results);
            
            // Batch DOM update
            if (window.batchDOMUpdates) {
                window.batchDOMUpdates([() => productGrid.innerHTML = productsHTML]);
            } else {
                productGrid.innerHTML = productsHTML;
            }
            
            // Setup lazy loading
            if (window.setupLazyLoading) {
                window.setupLazyLoading();
            }
        }
        
        renderSearchResults(products) {
            return products.map(product => {
                const stockStatus = product.stock > 0 ? 'In Stock' : 'Out of Stock';
                const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
                const isAvailable = product.stock > 0;
                const unitDisplay = product.display_unit || (product.unit_quantity ? product.unit_quantity + product.unit : product.unit || '');
                
                return `
                    <div class="product-card">
                        <img data-src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" loading="lazy" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f0f0f0' width='200' height='200'/%3E%3C/svg%3E">
                        <h3 style="margin: 0.8rem 0 0.3rem 0; font-size: 1.1rem; color: #333;">${product.name}</h3>
                        ${unitDisplay ? `<p style="color: #666; font-size: 0.85rem; margin: 0.2rem 0; font-weight: 500;">${unitDisplay}</p>` : ''}
                        <p class="price" style="font-size: 1.3rem; font-weight: 700; color: #4a7c59; margin: 0.5rem 0;">₹${product.price}</p>
                        <div class="stock-status" style="margin: 0.5rem 0;">
                            <span class="status-badge ${stockClass}" style="padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.75rem; font-weight: 600; display: inline-block; background: #e8f5e9; color: #2e7d32;">
                                ${stockStatus} (${product.stock} left)
                            </span>
                        </div>
                        ${isAvailable ? 
                            `<div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                                <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                                <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                                <button onclick="increaseQuantity('${product.id}', ${product.stock})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                            </div>
                            <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, ${product.stock})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.7rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>` :
                            `<button class="btn btn-secondary" style="display: block; width: 100%; text-align: center; margin: 1rem 0; padding: 0.7rem; opacity: 0.5; cursor: not-allowed; background: #ccc; color: #666; border: none; border-radius: 8px;" disabled>Out of Stock</button>`
                        }
                    </div>
                `;
            }).join('');
        }
        
        displaySearchResults() {
            const searchResults = sessionStorage.getItem('searchResults');
            const searchTerm = sessionStorage.getItem('searchTerm');
            
            if (searchResults && searchTerm) {
                try {
                    const results = JSON.parse(searchResults);
                    this.displayResults(results, searchTerm);
                    
                    // Update page title
                    const pageHeader = document.querySelector('.page-header h1');
                    if (pageHeader) {
                        pageHeader.textContent = `Search Results for "${searchTerm}"`;
                    }
                    
                    // Clear session storage after use
                    sessionStorage.removeItem('searchResults');
                    sessionStorage.removeItem('searchTerm');
                } catch (error) {
                    console.error('Error displaying search results:', error);
                }
            }
        }
        
        addToSearchHistory(searchTerm) {
            if (!this.searchHistory.includes(searchTerm)) {
                this.searchHistory.unshift(searchTerm);
                this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10 searches
                
                // Throttled localStorage update
                if (this.saveHistoryTimeout) {
                    clearTimeout(this.saveHistoryTimeout);
                }
                this.saveHistoryTimeout = setTimeout(() => {
                    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
                }, 1000);
            }
        }
        
        showToast(message, type) {
            if (window.showToast) {
                window.showToast(message, type);
            } else {
                console.log(`${type.toUpperCase()}: ${message}`);
            }
        }
    }
    
    // Initialize optimized search engine
    let optimizedSearchEngine;
    
    function initializeOptimizedSearch() {
        if (!optimizedSearchEngine) {
            optimizedSearchEngine = new OptimizedSearchEngine();
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeOptimizedSearch);
    } else {
        initializeOptimizedSearch();
    }
    
    // Also initialize when Supabase is ready
    window.addEventListener('supabaseReady', initializeOptimizedSearch);
    
    // Expose for external use
    window.optimizedSearchEngine = optimizedSearchEngine;
    
})();