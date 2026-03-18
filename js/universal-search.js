// Universal Search System - Live Supabase queries only
class UniversalSearch {
    constructor() {
        this.debounceTimer = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initializeAllSearchBars();
        this.addSearchStyles();
        this.isInitialized = true;
        console.log('✅ Universal Search initialized');
    }

    initializeAllSearchBars() {
        const searchInputs = document.querySelectorAll('.main-search-bar');
        const searchButtons = document.querySelectorAll('.search-btn');

        searchInputs.forEach((searchInput, index) => {
            this.setupSearchBar(searchInput, index);
        });

        searchButtons.forEach((searchBtn, index) => {
            const correspondingInput = searchInputs[index];
            if (correspondingInput) {
                searchBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.performSearch(correspondingInput.value.trim());
                });
            }
        });
    }

    setupSearchBar(searchInput, index) {
        const dropdownId = `search-dropdown-${index}`;
        let dropdown = document.getElementById(dropdownId);
        if (dropdown) dropdown.remove();

        dropdown = document.createElement('div');
        dropdown.id = dropdownId;
        dropdown.className = 'universal-search-dropdown';

        // Wrap the input in a relative-positioned container so dropdown anchors to it
        let wrapper = searchInput.parentElement;
        if (!wrapper || !wrapper.classList.contains('search-input-wrapper')) {
            wrapper = document.createElement('div');
            wrapper.className = 'search-input-wrapper';
            searchInput.parentNode.insertBefore(wrapper, searchInput);
            wrapper.appendChild(searchInput);
        }
        wrapper.appendChild(dropdown);

        searchInput.addEventListener('input', (e) => {
            this.handleInput(e.target.value.trim(), dropdown);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                dropdown.style.display = 'none';
                this.performSearch(searchInput.value.trim());
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
                searchInput.blur();
            }
        });

        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim() && dropdown.innerHTML) {
                dropdown.style.display = 'block';
            }
        });

        searchInput.addEventListener('blur', () => {
            setTimeout(() => { dropdown.style.display = 'none'; }, 200);
        });

        dropdown.addEventListener('mousedown', (e) => { e.preventDefault(); });
    }

    handleInput(query, dropdown) {
        clearTimeout(this.debounceTimer);

        if (query.length < 1) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            return;
        }

        this.debounceTimer = setTimeout(() => {
            this.showDropdown(query, dropdown);
        }, 300);
    }

    async showDropdown(query, dropdown) {
        // Show loading state
        dropdown.innerHTML = `
            <div class="search-loading">
                <div class="loading-spinner"></div>
                <span>Searching...</span>
            </div>
        `;
        dropdown.style.display = 'block';

        // Wait for Supabase
        let attempts = 0;
        while (!window.supabase && attempts < 20) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
        }

        if (!window.supabase) {
            dropdown.innerHTML = `<div class="search-no-results"><div class="no-results-text">Search unavailable</div></div>`;
            return;
        }

        try {
            const { data, error } = await window.supabase
                .from('products')
                .select('id, name, price, image_url, category')
                .ilike('name', `%${query}%`)
                .limit(5);

            if (error) throw error;

            this.renderDropdown(data || [], query, dropdown);
        } catch (err) {
            console.error('Search error:', err);
            dropdown.innerHTML = `<div class="search-no-results"><div class="no-results-text">Search failed. Try again.</div></div>`;
        }
    }

    renderDropdown(results, query, dropdown) {
        if (results.length === 0) {
            dropdown.innerHTML = `
                <div class="search-no-results">
                    <div class="no-results-icon">🔍</div>
                    <div class="no-results-text">No products found for "${query}"</div>
                    <div class="no-results-suggestion">Try different keywords</div>
                </div>
            `;
            dropdown.style.display = 'block';
            return;
        }

        const resultsHTML = results.map(product => `
            <div class="search-result-item" onclick="universalSearch.selectProduct(${product.id}, '${this.escapeHtml(product.name)}')">
                <div class="result-image">
                    <img src="${product.image_url || 'images/placeholder.jpg'}"
                         alt="${this.escapeHtml(product.name)}"
                         onerror="this.src='images/placeholder.jpg'">
                </div>
                <div class="result-info">
                    <div class="result-name">${this.highlightMatch(product.name, query)}</div>
                    <div class="result-meta">
                        <span class="result-category">${product.category || 'Product'}</span>
                        <span class="result-price">₹${product.price}</span>
                    </div>
                </div>
            </div>
        `).join('');

        dropdown.innerHTML = resultsHTML;
        dropdown.style.display = 'block';
    }

    highlightMatch(text, query) {
        if (!text || !query) return text;
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<strong style="background:#fff3cd;color:#856404;">$1</strong>');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    selectProduct(productId, productName) {
        document.querySelectorAll('.main-search-bar').forEach(input => { input.value = productName; });
        document.querySelectorAll('.universal-search-dropdown').forEach(d => { d.style.display = 'none'; });
        // Navigate with search query param — shop.html will filter by name
        const query = encodeURIComponent(productName);
        window.location.href = `shop.html?search=${query}`;
    }

    viewProduct(productId) {
        window.location.href = `shop.html?product=${productId}`;
    }

    performSearch(searchTerm) {
        if (!searchTerm) return;
        const query = encodeURIComponent(searchTerm);
        if (!window.location.pathname.includes('shop.html')) {
            window.location.href = `shop.html?search=${query}`;
        } else {
            // Already on shop page — update URL and re-filter
            window.history.replaceState(null, '', `shop.html?search=${query}`);
            if (window.handleSearchNavigation) window.handleSearchNavigation();
        }
    }

    addSearchStyles() {
        const styleId = 'universal-search-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .search-input-wrapper {
                position: relative !important;
                flex: 1;
                min-width: 0;
            }

            .search-section {
                position: relative !important;
                z-index: 1001;
                overflow: visible !important;
            }

            .navbar, .nav-wrapper, .navbar .container {
                overflow: visible !important;
            }

            .universal-search-dropdown {
                position: absolute !important;
                top: calc(100% + 5px) !important;
                left: 0 !important;
                right: 0 !important;
                background: white;
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 99999 !important;
                display: none;
                max-height: 300px;
                overflow-y: auto;
            }

            .search-loading {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px 20px;
                color: #666;
            }

            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #f3f3f3;
                border-top: 2px solid #4a7c59;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            .search-no-results { padding: 20px; text-align: center; color: #666; }
            .no-results-icon { font-size: 24px; margin-bottom: 8px; }
            .no-results-text { font-weight: 500; margin-bottom: 4px; }
            .no-results-suggestion { font-size: 14px; color: #999; }

            .search-result-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f5f5f5;
                transition: background-color 0.2s ease;
            }
            .search-result-item:hover { background-color: #f8f9fa; }
            .search-result-item:last-child { border-bottom: none; }

            .result-image { width: 40px; height: 40px; border-radius: 8px; overflow: hidden; flex-shrink: 0; }
            .result-image img { width: 100%; height: 100%; object-fit: cover; }

            .result-info { flex: 1; min-width: 0; }
            .result-name { font-weight: 500; color: #333; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .result-meta { display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
            .result-category { color: #666; }
            .result-price { color: #4a7c59; font-weight: 600; }

            @media (max-width: 768px) {
                .universal-search-dropdown { max-height: 250px; z-index: 10000; }
                .search-result-item { padding: 10px 12px; }
                .result-image { width: 35px; height: 35px; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize
let universalSearch;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { universalSearch = new UniversalSearch(); window.universalSearch = universalSearch; });
} else {
    universalSearch = new UniversalSearch();
    window.universalSearch = universalSearch;
}

console.log('🔍 Universal Search script loaded');
