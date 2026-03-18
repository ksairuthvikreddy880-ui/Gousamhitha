// Admin Edit Modal Error Fix - Comprehensive fix for product edit errors
(function() {
    'use strict';
    
    console.log('🔧 Loading admin edit modal error fix...');
    
    // Wait for DOM and Supabase to be ready
    let isInitialized = false;
    
    function initializeEditModalFix() {
        if (isInitialized) return;
        
        console.log('🔧 Initializing edit modal error fix...');
        
        // Fix 1: Override the editProduct function to handle errors properly
        window.editProductFixed = async function(id) {
            try {
                console.log('🔧 Opening edit modal for product:', id);
                
                // Ensure Supabase is available
                if (!window.supabase) {
                    console.error('❌ Supabase not available');
                    alert('Database connection not available. Please refresh the page.');
                    return;
                }
                
                // Load vendors for dropdown
                await loadVendorsForEditModal();
                
                // Fetch product data
                const { data: product, error } = await window.supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error || !product) {
                    console.error('❌ Error loading product:', error);
                    alert('Error loading product details. Please try again.');
                    return;
                }
                
                console.log('✅ Product loaded:', product);
                
                // Populate form fields safely
                populateEditForm(product);
                
                // Show modal
                showEditModal();
                
            } catch (error) {
                console.error('❌ Error in editProductFixed:', error);
                alert('Error opening edit modal: ' + error.message);
            }
        };
        
        // Fix 2: Safe form population
        function populateEditForm(product) {
            try {
                console.log('📝 Populating edit form...');
                
                // Set form values safely
                const fields = {
                    'edit-product-id': product.id,
                    'edit-name': product.name || '',
                    'edit-category': product.category || '',
                    'edit-subcategory': product.subcategory || '',
                    'edit-vendor': product.vendor_id || '',
                    'edit-price': product.price || 0,
                    'edit-stock': product.stock || 0,
                    'edit-unit': product.unit || 'piece',
                    'edit-unit-quantity': product.unit_quantity || '',
                    'edit-display-unit': product.display_unit || '',
                    'edit-description': product.description || ''
                };
                
                // Set each field safely
                Object.entries(fields).forEach(([fieldId, value]) => {
                    const element = document.getElementById(fieldId);
                    if (element) {
                        element.value = value;
                        console.log(`✅ Set ${fieldId}:`, value);
                    } else {
                        console.warn(`⚠️ Field not found: ${fieldId}`);
                    }
                });
                
                // Handle image display
                const currentImageDiv = document.getElementById('edit-current-image');
                if (currentImageDiv) {
                    if (product.image_url) {
                        currentImageDiv.innerHTML = `
                            <div style="margin-bottom: 10px;">
                                <p style="margin: 0 0 5px 0; font-weight: bold;">Current Image:</p>
                                <img src="${product.image_url}" alt="${product.name}" 
                                     style="max-width: 200px; border-radius: 8px; border: 1px solid #ddd;"
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                                <p style="display: none; color: #999;">Image not available</p>
                            </div>
                        `;
                    } else {
                        currentImageDiv.innerHTML = '<p style="color: #999;">No image available</p>';
                    }
                }
                
                console.log('✅ Form populated successfully');
                
            } catch (error) {
                console.error('❌ Error populating form:', error);
            }
        }
        
        // Fix 3: Safe modal display
        function showEditModal() {
            try {
                console.log('🔧 Showing edit modal...');
                
                const overlay = document.getElementById('edit-overlay');
                const panel = document.getElementById('edit-panel');
                
                if (overlay && panel) {
                    overlay.classList.add('active');
                    panel.classList.add('active');
                    document.body.style.overflow = 'hidden';
                    console.log('✅ Modal displayed successfully');
                } else {
                    console.error('❌ Modal elements not found');
                    alert('Edit modal not available. Please refresh the page.');
                }
                
            } catch (error) {
                console.error('❌ Error showing modal:', error);
            }
        }
        
        // Fix 4: Load vendors safely
        async function loadVendorsForEditModal() {
            try {
                console.log('👥 Loading vendors for edit modal...');
                
                const { data: vendors, error } = await window.supabase
                    .from('vendors')
                    .select('id, vendor_name, business_name')
                    .eq('status', 'active')
                    .order('vendor_name');
                
                if (error) {
                    console.warn('⚠️ Error loading vendors:', error);
                    return;
                }
                
                const vendorSelect = document.getElementById('edit-vendor');
                if (vendorSelect) {
                    vendorSelect.innerHTML = '<option value="">Select Vendor (Optional)</option>';
                    
                    if (vendors && vendors.length > 0) {
                        vendors.forEach(vendor => {
                            const option = document.createElement('option');
                            option.value = vendor.id;
                            option.textContent = `${vendor.vendor_name} - ${vendor.business_name}`;
                            vendorSelect.appendChild(option);
                        });
                    }
                    
                    console.log('✅ Vendors loaded:', vendors?.length || 0);
                }
                
            } catch (error) {
                console.warn('⚠️ Error loading vendors:', error);
            }
        }
        
        // Fix 5: Override save function with better error handling
        window.saveProductEditFixed = async function(event) {
            event.preventDefault();
            
            try {
                console.log('💾 Starting product save...');
                
                const productId = document.getElementById('edit-product-id').value;
                if (!productId) {
                    throw new Error('Product ID not found');
                }
                
                // Collect form data
                const productData = {
                    name: document.getElementById('edit-name').value.trim(),
                    category: document.getElementById('edit-category').value,
                    subcategory: document.getElementById('edit-subcategory').value.trim() || null,
                    vendor_id: document.getElementById('edit-vendor').value || null,
                    price: parseFloat(document.getElementById('edit-price').value),
                    stock: parseInt(document.getElementById('edit-stock').value),
                    unit: document.getElementById('edit-unit').value,
                    unit_quantity: parseFloat(document.getElementById('edit-unit-quantity').value) || null,
                    display_unit: document.getElementById('edit-display-unit').value.trim() || null,
                    description: document.getElementById('edit-description').value.trim() || null,
                    in_stock: parseInt(document.getElementById('edit-stock').value) > 0
                };
                
                console.log('📝 Product data collected:', productData);
                
                // Validate required fields
                if (!productData.name || !productData.category || isNaN(productData.price) || isNaN(productData.stock)) {
                    throw new Error('Please fill in all required fields');
                }
                
                // Handle image upload if new image selected
                const imageFile = document.getElementById('edit-image').files[0];
                if (imageFile) {
                    console.log('🖼️ Processing new image...');
                    
                    try {
                        // Try Base64 conversion (more reliable)
                        const base64Image = await convertToBase64(imageFile);
                        productData.image_url = base64Image;
                        console.log('✅ Image converted to Base64');
                    } catch (imageError) {
                        console.warn('⚠️ Image processing failed:', imageError);
                        // Continue without image update
                    }
                }
                
                // Update product in database
                console.log('💾 Updating product in database...');
                
                const { data, error } = await window.supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId)
                    .select();
                
                if (error) {
                    console.error('❌ Database update error:', error);
                    throw new Error('Failed to update product: ' + error.message);
                }
                
                console.log('✅ Product updated successfully:', data);
                
                // Show success message
                alert('Product updated successfully!');
                
                // Close modal and reload
                closeEditModalSafely();
                
                // Reload products table
                setTimeout(() => {
                    if (typeof loadProducts === 'function') {
                        loadProducts();
                    } else if (typeof loadProductsTable === 'function') {
                        loadProductsTable();
                    } else {
                        window.location.reload();
                    }
                }, 500);
                
            } catch (error) {
                console.error('❌ Error saving product:', error);
                alert('Error updating product: ' + error.message);
            }
        };
        
        // Fix 6: Safe modal closing
        function closeEditModalSafely() {
            try {
                const overlay = document.getElementById('edit-overlay');
                const panel = document.getElementById('edit-panel');
                
                if (overlay) overlay.classList.remove('active');
                if (panel) panel.classList.remove('active');
                
                document.body.style.overflow = 'auto';
                
                // Reset form
                const form = document.getElementById('edit-product-form');
                if (form) form.reset();
                
                console.log('✅ Modal closed successfully');
                
            } catch (error) {
                console.error('❌ Error closing modal:', error);
            }
        }
        
        // Fix 7: Base64 conversion helper
        function convertToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = e => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        // Fix 8: Override existing functions
        function overrideExistingFunctions() {
            // Override editProduct
            if (window.editProduct) {
                window.editProduct = window.editProductFixed;
                console.log('✅ editProduct function overridden');
            }
            
            // Override saveProductEdit
            if (window.saveProductEdit) {
                window.saveProductEdit = window.saveProductEditFixed;
                console.log('✅ saveProductEdit function overridden');
            }
            
            // Override closeEditPanel
            window.closeEditPanel = closeEditModalSafely;
            console.log('✅ closeEditPanel function overridden');
        }
        
        // Initialize overrides
        overrideExistingFunctions();
        
        // Set up form handler
        const editForm = document.getElementById('edit-product-form');
        if (editForm) {
            editForm.removeEventListener('submit', window.saveProductEdit);
            editForm.addEventListener('submit', window.saveProductEditFixed);
            console.log('✅ Form handler updated');
        }
        
        isInitialized = true;
        console.log('✅ Edit modal error fix initialized successfully');
    }
    
    // Initialize when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEditModalFix);
    } else {
        initializeEditModalFix();
    }
    
    // Also initialize after Supabase is ready
    window.addEventListener('supabaseReady', initializeEditModalFix);
    
    // Fallback initialization
    setTimeout(initializeEditModalFix, 2000);
    
})();