
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load env vars
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../../.env.local');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            const env = {};
            lines.forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
                    env[key] = value;
                }
            });
            return env;
        }
    } catch (e) {
        console.error("Failed to load .env.local", e);
    }
    return {};
}

const env = loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMenuSettings() {
    console.log("Verifying Menu Settings Data Access (JS)...");

    const email = `testuser${Date.now()}@example.com`;
    const password = 'password123';

    console.log(`Creating test user: ${email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        console.error("Auth Error:", authError);
        return; // Proceeding might be useless if auth fails, but let's try just in case
    }

    const userId = authData.user?.id;
    if (!userId) {
        console.error("User ID missing from signup response");
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
        return;
    }

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

verifyMenuSettings();
