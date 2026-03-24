
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMenuSettings() {
    console.log("Verifying Menu Settings Data Access...");

    // 1. Login (Simulate Admin/User)
    // We need a valid user. I'll use the one from previous context if possible, or just sign up a temp one?
    // Actually, I'll rely on the fact that I can't easily login without password. 
    // BUT I can try to access public data functionality if I assume RLS allows public read (maybe not).

    // Instead of full login, I'll use the service role key if available? No, I only have ANON key.
    // I will try to sign up/in a test user to test RLS.

    const email = `test_admin_${Date.now()}@test.com`;
    const password = 'password123';

    console.log(`Creating test user: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("Use ID missing");
        return;
    }
    console.log(`User created: ${userId}`);

    // 2. Create a test restaurant
    const { data: restaurant, error: restError } = await supabase.from('restaurants').insert({
        name: 'Test Restaurant For Settings',
        slug: `test-rest-${Date.now()}`,
        status: 'Active',
        owner_id: userId
    }).select().single();

    if (restError) {
        console.error("Restaurant Creation Error:", restError);
        // If this fails, then my previous fix for restaurants might be needed or verified.
    } else {
        console.log("Restaurant created:", restaurant.id);

        // 3. Try to Insert/Upsert UI Preset
        console.log("Attempting UI Preset Upsert...");
        const { data: preset, error: presetError } = await supabase.from('ui_presets').upsert({
            restaurant_id: restaurant.id,
            background_color: '#ffffff',
            button_color: '#000000'
        }).select().single();

        if (presetError) {
            console.error("UI Preset Upsert Failed (RLS Issue Likely):", presetError);
        } else {
            console.log("UI Preset Upsert Success:", preset);
        }

        // 4. Try to Add Dish
        console.log("Attempting Dish Insert...");
        const { data: dish, error: dishError } = await supabase.from('dishes').insert({
            restaurant_id: restaurant.id,
            name: 'Test Dish',
            description: 'Test Desc',
            price: 10,
            category: 'Main'
        }).select().single();

        if (dishError) {
            console.error("Dish Insert Failed:", dishError);
        } else {
            console.log("Dish Insert Success:", dish.id);

            // 5. Try to Select Dishes
            const { data: dishes, error: fetchError } = await supabase.from('dishes').select('*').eq('restaurant_id', restaurant.id);
            if (fetchError) {
                console.error("Dish Fetch Failed:", fetchError);
            } else {
                console.log(`Fetched ${dishes.length} dishes.`);
            }
        }
    }
}

verifyMenuSettings();
