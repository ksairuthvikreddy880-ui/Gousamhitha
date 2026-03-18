// ZERO DELAY SUPABASE - Initialize Supabase immediately
(function() {
    'use strict';
    
    console.log('⚡ ZERO DELAY SUPABASE INITIALIZER');
    
    // Initialize Supabase immediately when script loads
    function initializeSupabaseInstantly() {
        if (typeof window.supabase !== 'undefined' && window.supabase.from) {
            console.log('✅ Supabase already initialized');
            return;
        }
        
        // Check if Supabase library is loaded
        if (typeof supabase === 'undefined' || !supabase.createClient) {
            console.log('⚠️ Supabase library not loaded yet, waiting...');
            setTimeout(initializeSupabaseInstantly, 50);
            return;
        }
        
        try {
            // Initialize Supabase client immediately
            const supabaseUrl = 'https://blsgyybaevuytmgpljyk.supabase.co';
            const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsc2d5eWJhZXZ1eXRtZ3BsanlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NjcyMjYsImV4cCI6MjA4NzM0MzIyNn0.G4gvoW-_7DxQ1y28oZEHS7OIVpsyHTlZewV02Th_meU';
            
            window.supabase = supabase.createClient(supabaseUrl, supabaseKey);
            
            console.log('✅ Supabase initialized instantly');
            
            // Dispatch ready event immediately
            window.dispatchEvent(new Event('supabaseReady'));
            
        } catch (error) {
            console.error('❌ Error initializing Supabase:', error);
        }
    }
    
    // Start initialization immediately
    initializeSupabaseInstantly();
    
})();