
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, value] = line.split('=');
    if (key && value) {
        acc[key.trim()] = value.trim();
    }
    return acc;
}, {} as Record<string, string>);

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseAnonKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDelete() {
    console.log('1. Signing in...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email: 'usaidowais123@gmail.com',
        password: 'admin123'
    });

    if (authError || !user) {
        console.error('Login failed:', authError?.message);
        return;
    }
    console.log('User signed in:', user.id);

    // 1. Create a Test Restaurant
    console.log('2. Creating Test Restaurant...');
    const suffix = Math.floor(Math.random() * 1000);
    const newRestaurant = {
        name: `Debug Delete ${suffix}`,
        slug: `debug-delete-${suffix}`,
        status: 'onboarding',
        owner_id: user.id
    };

    const { data: restaurant, error: createError } = await supabase
        .from('restaurants')
        .insert(newRestaurant)
        .select()
        .single();

    if (createError) {
        console.error('Failed to create restaurant:', createError.message);
        return;
    }
    console.log('Restaurant created:', restaurant.id);

    // 2. Add a dummy UI preset (to simulate real data)
    await supabase.from('ui_presets').insert({ restaurant_id: restaurant.id });
    console.log('UI Preset created.');

    // 3. Try to delete it using the logic from supabaseService
    console.log('3. Attempting to delete...');
    const restaurantId = restaurant.id;

    try {
        // Step A: Delete related dishes
        console.log('   A. Deleting dishes...');
        const { error: dishError } = await supabase.from('dishes').delete().eq('restaurant_id', restaurantId);
        if (dishError) console.error('Error deleting related dishes:', dishError);

        // Step B: Delete related UI presets
        console.log('   B. Deleting presets...');
        const { error: presetError } = await supabase.from('ui_presets').delete().eq('restaurant_id', restaurantId);
        if (presetError) console.error('Error deleting related presets:', presetError);

        // Step C: Delete related analytics
        console.log('   C. Deleting analytics...');
        const { error: analyticsError } = await supabase.from('analytics').delete().eq('restaurant_id', restaurantId);
        if (analyticsError) console.error('Error deleting related analytics:', analyticsError);

        // Step D: Delete restaurant
        console.log('   D. Deleting restaurant row...');
        const { data: delData, error: delError } = await supabase.from('restaurants').delete().eq('id', restaurantId).select();

        if (delError) {
            console.error('   FATAL: Error deleting restaurant:', delError.message, delError);
        } else if (!delData || delData.length === 0) {
            console.error('   FATAL: Delete operation returned no data. Possible RLS violation or FK constraint check failed.');
        } else {
            console.log('SUCCESS: Restaurant deleted!', delData);
        }

    } catch (e: any) {
        console.error('EXCEPTION during delete:', e.message);
    }
}

debugDelete();
