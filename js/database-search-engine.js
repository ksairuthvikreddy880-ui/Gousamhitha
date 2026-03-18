// Database-Driven Search Engine - Only Real Products from Supabase
class DatabaseSearchEngine {
    constructor() {
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        this.initializeSearch();
    }
    
    initializeSearch() {
        // Wait for Supabase to be ready
        if (window.supabase) {
            this.setupSearchFunctionality();
        } else {
            window.addEventListener('supabaseReady', () => {
                this.setupSearchFunctionality();
            });
        }
        
        // Initialize search on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            this.setupSearchFunctionality();
        });
        
        // If DOM is already loaded
        if (document.readyState !== 'loading') {
            this.setupSearchFunctionality();
        }
    }
    
    setupSearchFunctionality() {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        const searchButtons = document.querySelectorAll('.search-btn');
        
        searchInputs.forEach((searchInput, index) => {
            const searchBtn = searchButtons[index];
            if (!searchInput || !searchBtn) return;
            
            this.setupAutocomplete(searchInput);
            this.setupSearchButton(searchBtn, searchInput);
        });
    }
    
    setupAutocomplete(searchInput) {
        // Remove existing autocomplete container
        const existingContainer = searchInput.parentNode.querySelector('.autocomplete-container');
        if (existingContainer) {
            existingContainer.remove();
        }
        
        const autocompleteContainer = document.createElement('div');
        autocompleteContainer.className = 'autocomplete-container';
        autocompleteContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const searchSection = searchInput.closest('.search-section');
        if (searchSection) {
            searchSection.style.position = 'relative';
            searchSection.appendChild(autocompleteContainer);
        }
        
        let debounceTimer;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            clearTimeout(debounceTimer);
            
            if (query.length < 1) {
                autocompleteContainer.style.display = 'none';
                return;
            }
            
            debounceTimer = setTimeout(() => {
                this.showAutocomplete(query, autocompleteContainer, searchInput);
            }, 300);
        });
        
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                autocompleteContainer.style.display = 'none';
            }, 200);
        });
        
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                autocompleteContainer.style.display = 'none';
                this.performSearch(searchInput.value.trim());
            } else if (e.key === 'Escape') {
                autocompleteContainer.style.display = 'none';
                searchInput.blur();
            }
        });
    }
    
    setupSearchButton(searchBtn, searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.performSearch(searchInput.value.trim());
        });
    }
    
    async showAutocomplete(query, container, searchInput) {
        try {
            const suggestions = await this.getSuggestions(query);
            
            if (suggestions.length === 0) {
                container.style.display = 'none';
                return;
            }
            
            container.innerHTML = suggestions.map(product => `
                <div class="autocomplete-item" style="
                    padding: 12px 16px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f0f0;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                " onmouseover="this.style.backgroundColor='#f8f9fa'" 
                   onmouseout="this.style.backgroundColor='white'"
                   onclick="window.databaseSearchEngine.selectSuggestion('${product.name.replace(/'/g, "\\'")}', '${searchInput.id || 'main-search'}')">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: #f0f0f0;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        overflow: hidden;
                    ">
                        ${product.image_url ? 
                            `<img src="${product.image_url}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                            '📦'
                        }
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 500; margin-bottom: 2px;">${this.highlightMatch(product.name, query)}</div>
                        <div style="font-size: 12px; color: #666;">${product.category || 'Product'} • ₹${product.price}</div>
                    </div>
                </div>
            `).join('');
            
            // Add "View all results" option
            if (suggestions.length >= 5) {
                container.innerHTML += `
                    <div class="autocomplete-item" style="
                        padding: 12px 16px;
                        cursor: pointer;
                        background: #f8f9fa;
                        font-weight: 500;
                        color: #4a7c59;
                        text-align: center;
                        border-top: 1px solid #e0e0e0;
                    " onclick="window.databaseSearchEngine.performSearch('${query}')">
                        View all results for "${query}"
                    </div>
                `;
            }
            
            container.style.display = 'block';
        } catch (error) {
            console.error('Error loading suggestions:', error);
            container.style.display = 'none';
        }
    }
    
    async getSuggestions(query) {
        try {
            if (!window.supabase) {
                console.warn('Supabase not available for suggestions');
                return [];
            }
            
            const normalizedQuery = query.toLowerCase();
            
            // Search in product name, category, and description (case insensitive)
            const { data: products, error } = await window.supabase
                .from('products')
                .select('id, name, category, price, image_url, description')
                .or(`name.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`)
                .limit(8);
            
            if (error) {
                console.error('Error fetching suggestions:', error);
                return [];
            }
            
            // Sort by relevance (name matches first)
            return (products || []).sort((a, b) => {
                const aNameMatch = a.name.toLowerCase().includes(normalizedQuery);
                const bNameMatch = b.name.toLowerCase().includes(normalizedQuery);
                
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error('Error in getSuggestions:', error);
            return [];
        }
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong style="background: #fff3cd;">$1</strong>');
    }
    
    selectSuggestion(suggestion, inputId) {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        searchInputs.forEach(input => {
            input.value = suggestion;
        });
        
        const autocompleteContainers = document.querySelectorAll('.autocomplete-container');
        autocompleteContainers.forEach(container => {
            container.style.display = 'none';
        });
        
        this.performSearch(suggestion);
    }
    
    async performSearch(searchTerm) {
        if (!searchTerm) {
            this.showToast('Please enter a search term', 'error');
            return;
        }
        
        // Add to search history
        this.addToSearchHistory(searchTerm);
        
        try {
            // Get search results from database
            const results = await this.searchProducts(searchTerm);
            
            // Store results and navigate to shop page
            sessionStorage.setItem('searchResults', JSON.stringify(results));
            sessionStorage.setItem('searchTerm', searchTerm);
            
            // Navigate to shop page if not already there
            if (!window.location.pathname.includes('shop.html')) {
                window.location.href = 'shop.html';
            } else {
                // If already on shop page, display results immediately
                this.displaySearchResults();
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showToast('Search failed. Please try again.', 'error');
        }
    }
    
    async searchProducts(query) {
        try {
            if (!window.supabase) {
                throw new Error('Database connection not available');
            }
            
            const normalizedQuery = query.toLowerCase();
            
            // Search in product name, category, and description (case insensitive)
            const { data: products, error } = await window.supabase
                .from('products')
                .select('*')
                .or(`name.ilike.%${normalizedQuery}%,category.ilike.%${normalizedQuery}%,description.ilike.%${normalizedQuery}%`)
                .order('name');
            
            if (error) {
                console.error('Database search error:', error);
                throw new Error('Failed to search products');
            }
            
            console.log(`Found ${products?.length || 0} products for "${query}"`);
            
            // Sort by relevance (name matches first, then category matches)
            return (products || []).sort((a, b) => {
                const aNameMatch = a.name.toLowerCase().includes(normalizedQuery);
                const bNameMatch = b.name.toLowerCase().includes(normalizedQuery);
                
                if (aNameMatch && !bNameMatch) return -1;
                if (!aNameMatch && bNameMatch) return 1;
                
                return a.name.localeCompare(b.name);
            });
        } catch (error) {
            console.error('Error in searchProducts:', error);
            throw error;
        }
    }
    
    displaySearchResults() {
        const searchResults = sessionStorage.getItem('searchResults');
        const searchTerm = sessionStorage.getItem('searchTerm');
        
        if (!searchResults || !searchTerm) return;
        
        const products = JSON.parse(searchResults);
        const productGrid = document.querySelector('.product-grid');
        const pageTitle = document.querySelector('.page-header h1');
        
        if (pageTitle) {
            pageTitle.textContent = `Search Results for "${searchTerm}"`;
        }
        
        if (!productGrid) return;
        
        if (products.length === 0) {
            productGrid.innerHTML = `
                <div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #666;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>No products found</h3>
                    <p>No products found for "${searchTerm}". Try searching with different keywords or browse our categories.</p>
                </div>
            `;
            return;
        }
        
        productGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url || 'images/placeholder.jpg'}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-category">${product.category || 'Product'}</p>
                    <p class="product-price">₹${product.price}</p>
                    <div class="quantity-selector" style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin: 1rem 0;">
                        <button onclick="decreaseQuantity('${product.id}')" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">-</button>
                        <input type="number" id="qty-${product.id}" value="1" min="1" max="${product.stock || 999}" style="width: 60px; height: 35px; text-align: center; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem;" readonly>
                        <button onclick="increaseQuantity('${product.id}', ${product.stock || 999})" class="quantity-btn" style="width: 35px; height: 35px; border: 1px solid #4a7c59; background: white; color: #4a7c59; border-radius: 5px; font-size: 1.2rem; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                    <button onclick="addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.stock || 999})" class="btn btn-primary" style="display: block; width: 100%; text-align: center; margin: 0.5rem 0; padding: 0.7rem; background: #4a7c59; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Add to Cart</button>
                </div>
            </div>
        `).join('');
    }
    
    addToSearchHistory(term) {
        // Remove if already exists
        this.searchHistory = this.searchHistory.filter(item => item !== term);
        
        // Add to beginning
        this.searchHistory.unshift(term);
        
        // Keep only last 10 searches
        this.searchHistory = this.searchHistory.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    }
    
    showToast(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize database search engine globally
window.databaseSearchEngine = new DatabaseSearchEngine();