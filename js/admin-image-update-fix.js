// Admin Image Update Fix - Fix product image updating in edit modal
(function() {
    'use strict';
    
    console.log('Loading admin image update fix...');
    
    // Override the saveProductEdit function to fix image updating
    window.saveProductEditFixed = async function(event) {
        event.preventDefault();
        
        console.log('🖼️ Starting product edit with image update fix...');
        
        const productId = document.getElementById('edit-product-id').value;
        const imageFile = document.getElementById('edit-image').files[0];
        
        // Collect all form data
        const productData = {
            name: document.getElementById('edit-name').value.trim(),
            category: document.getElementById('edit-category').value,
            subcategory: document.getElementById('edit-subcategory').value.trim(),
            vendor_id: document.getElementById('edit-vendor').value || null,
            price: parseFloat(document.getElementById('edit-price').value),
            stock: parseInt(document.getElementById('edit-stock').value),
            unit: document.getElementById('edit-unit').value,
            unit_quantity: parseFloat(document.getElementById('edit-unit-quantity').value) || null,
            display_unit: document.getElementById('edit-display-unit').value.trim() || null,
            description: document.getElementById('edit-description').value.trim(),
            in_stock: parseInt(document.getElementById('edit-stock').value) > 0
        };
        
        console.log('📝 Product data collected:', productData);
        
        // Handle image upload if new image is selected
        if (imageFile) {
            console.log('🖼️ New image selected, processing upload...');
            console.log('📁 File details:', {
                name: imageFile.name,
                size: imageFile.size,
                type: imageFile.type
            });
            
            try {
                // Method 1: Try Supabase Storage upload
                const imageUrl = await uploadImageToSupabase(imageFile, productId);
                if (imageUrl) {
                    productData.image_url = imageUrl;
                    console.log('✅ Supabase upload successful:', imageUrl);
                } else {
                    // Method 2: Fallback to Base64 encoding
                    console.log('⚠️ Supabase upload failed, using Base64 fallback...');
                    const base64Image = await convertImageToBase64(imageFile);
                    productData.image_url = base64Image;
                    console.log('✅ Base64 conversion successful');
                }
            } catch (error) {
                console.error('❌ Image processing failed:', error);
                
                // Show warning but continue with update
                if (typeof showToast === 'function') {
                    showToast('Warning: Image upload failed, updating other fields...', 'warning');
                }
            }
        } else {
            console.log('ℹ️ No new image selected, keeping existing image');
        }
        
        // Update product in database
        try {
            console.log('💾 Updating product in database...');
            
            const { data, error } = await window.supabase
                .from('products')
                .update(productData)
                .eq('id', productId)
                .select();
            
            if (error) {
                console.error('❌ Database update error:', error);
                throw error;
            }
            
            console.log('✅ Product updated successfully:', data);
            
            // Show success message
            if (typeof showToast === 'function') {
                showToast('Product updated successfully!', 'success');
            }
            
            // Close modal and reload
            setTimeout(() => {
                closeEditPanel();
                if (typeof loadProducts === 'function') {
                    loadProducts();
                } else if (typeof loadProductsTable === 'function') {
                    loadProductsTable();
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Error updating product:', error);
            
            if (typeof showToast === 'function') {
                showToast('Error updating product: ' + error.message, 'error');
            }
        }
    };
    
    // Upload image to Supabase Storage
    async function uploadImageToSupabase(file, productId) {
        try {
            if (!window.supabase || !window.supabase.storage) {
                console.log('⚠️ Supabase storage not available');
                return null;
            }
            
            // Generate unique filename
            const fileExt = file.name.split('.').pop().toLowerCase();
            const fileName = `product_${productId}_${Date.now()}.${fileExt}`;
            const filePath = `products/${fileName}`;
            
            console.log('📤 Uploading to Supabase Storage:', filePath);
            
            // Upload file
            const { data: uploadData, error: uploadError } = await window.supabase.storage
                .from('product-images')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('❌ Supabase upload error:', uploadError);
                return null;
            }
            
            console.log('✅ File uploaded successfully:', uploadData);
            
            // Get public URL
            const { data: urlData } = window.supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);
            
            if (urlData && urlData.publicUrl) {
                console.log('✅ Public URL generated:', urlData.publicUrl);
                return urlData.publicUrl;
            } else {
                console.error('❌ Failed to get public URL');
                return null;
            }
            
        } catch (error) {
            console.error('❌ Supabase upload exception:', error);
            return null;
        }
    }
    
    // Convert image to Base64 (fallback method)
    function convertImageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                console.log('✅ Base64 conversion completed');
                resolve(e.target.result);
            };
            
            reader.onerror = function(error) {
                console.error('❌ Base64 conversion failed:', error);
                reject(error);
            };
            
            reader.readAsDataURL(file);
        });
    }
    
    // Override the form submission to use our fixed function
    function attachFixedFormHandler() {
        const editForm = document.getElementById('edit-product-form');
        if (editForm) {
            // Remove existing event listeners
            const newForm = editForm.cloneNode(true);
            editForm.parentNode.replaceChild(newForm, editForm);
            
            // Add our fixed handler
            newForm.addEventListener('submit', window.saveProductEditFixed);
            console.log('✅ Fixed form handler attached');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachFixedFormHandler);
    } else {
        attachFixedFormHandler();
    }
    
    // Also try after a delay to ensure the form exists
    setTimeout(attachFixedFormHandler, 1000);
    
    // Add image preview functionality
    function setupImagePreview() {
        const imageInput = document.getElementById('edit-image');
        if (imageInput) {
            imageInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                const currentImageDiv = document.getElementById('edit-current-image');
                
                if (file && currentImageDiv) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        currentImageDiv.innerHTML = `
                            <div style="margin-bottom: 10px;">
                                <p style="margin: 0 0 5px 0; font-weight: bold; color: #4a7c59;">New Image Preview:</p>
                                <img src="${e.target.result}" alt="New image preview" style="max-width: 200px; border-radius: 8px; border: 2px solid #4a7c59;">
                            </div>
                        `;
                    };
                    reader.readAsDataURL(file);
                }
            });
            console.log('✅ Image preview functionality added');
        }
    }
    
    // Setup image preview
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupImagePreview);
    } else {
        setupImagePreview();
    }
    
    setTimeout(setupImagePreview, 1000);
    
    console.log('✅ Admin image update fix loaded successfully');
})();