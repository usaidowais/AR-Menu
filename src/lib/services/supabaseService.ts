import { createClient } from '@supabase/supabase-js';
import { Restaurant, Dish, UIPreset, AnalyticsEvent } from '../types';

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
    // --- Admin Methods ---
    getGlobalStats: async () => {
        const { count: restaurantCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
        const { count: dishesCount } = await supabase.from('dishes').select('*', { count: 'exact', head: true });
        const { count: scanCount } = await supabase.from('analytics').select('*', { count: 'exact', head: true }).eq('event_type', 'scan');

        return {
            totalRestaurants: restaurantCount || 0,
            activeMenus: restaurantCount || 0, // Approximation for now
            totalScans: scanCount || 0,
            arConversions: 0 // Placeholder until we track conversions
        };
    },

    getSystemHealth: async () => {
        // 1. Fetch Real Counts
        const { count: restaurantCount } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
        const { count: dishesCount } = await supabase.from('dishes').select('*', { count: 'exact', head: true });
        const { count: analyticsCount } = await supabase.from('analytics').select('*', { count: 'exact', head: true });

        const totalRestaurants = restaurantCount || 0;
        const totalModels = dishesCount || 0;
        const totalEvents = analyticsCount || 0;

        // 2. Calculate Real Storage Usage (Media Bucket)
        let totalBytes = 0;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: files } = await supabase.storage
                    .from('media')
                    .list(user.id, { limit: 100, offset: 0 }); // Inspecting active user's folder

                if (files) {
                    totalBytes = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);
                }
            }
        } catch (e) {
            console.error('Failed to calculate storage', e);
        }

        const totalStorageUsedMB = totalBytes / (1024 * 1024);
        const totalStorageUsedGB = (totalStorageUsedMB / 1024).toFixed(4); // More precision for small usage

        // Real Limit: 500 MB (Free Tier)
        const storageLimitMB = 500;
        const storageLimitGB = (storageLimitMB / 1024).toFixed(2);

        const storageUsedPercent = Math.min(100, Math.round((totalStorageUsedMB / storageLimitMB) * 100));

        // DB Load: Simulated based on activity (restaurants + events)
        // Base load 5% + 1% per restaurant + 0.01% per event
        const dbLoadPercent = Math.min(95, Math.round(5 + (totalRestaurants * 0.5) + (totalEvents * 0.01)));

        // Active Connections: Simulated based on restaurants (assuming ~2 connections per active resto client)
        const activeConnections = Math.max(5, totalRestaurants * 2 + Math.floor(Math.random() * 10));

        const avgLatency = 20 + Math.floor(Math.random() * 15); // 20-35ms

        // Format usage for display (e.g. "12.5 MB" or "0.01 GB")
        const displayUsage = totalStorageUsedMB < 1000
            ? `${totalStorageUsedMB.toFixed(2)} MB`
            : `${totalStorageUsedGB} GB`;

        const displayLimit = `${storageLimitMB} MB`;

        return {
            dbLoad: {
                percent: dbLoadPercent,
                activeConnections: activeConnections,
                avgLatency: avgLatency,
                iops: (totalEvents / 100).toFixed(1) + 'k'
            },
            storage: {
                percent: storageUsedPercent,
                totalUsed: displayUsage,
                limit: displayLimit,
                projectedFull: 'Unknown',
                modelsCount: totalModels
            }
        };
    },

    getAllRestaurants: async (): Promise<Restaurant[]> => {
        const { data, error } = await supabase.from('restaurants').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching restaurants:', error.message, error);
            return [];
        }
        return data as Restaurant[];
    },

    /**
     * Fetches a restaurant by ID or Slug, including its linked UI Preset and Theme Settings.
     */
    getRestaurantWithTheme: async (idOrSlug: string) => {
        // 1. Fetch Restaurant Only
        let query = supabase.from('restaurants').select('*').eq('id', idOrSlug).single();
        let { data: restaurant, error } = await query;

        // If not found, try slug
        if (error || !restaurant) {
            const slugQuery = supabase.from('restaurants').select('*').eq('slug', idOrSlug).single();
            const result = await slugQuery;
            restaurant = result.data;
            error = result.error;
        }

        if (error || !restaurant) {
            console.error('Error fetching restaurant:', error?.message);
            return null;
        }

        // 2. Return with Local Settings (No Global Presets)
        return restaurant;
    },

    createRestaurant: async (restaurant: Omit<Restaurant, 'id'>): Promise<Restaurant | null> => {
        const { data, error } = await supabase.from('restaurants').insert(restaurant).select().single();
        if (error) {
            console.error('Error creating restaurant:', error.message, error);
            throw error;
        }



        return data as Restaurant;
    },

    // --- Client Portal Methods ---
    getRestaurantDishes: async (restaurantId: string): Promise<Dish[]> => {
        const { data, error } = await supabase
            .from('dishes')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching dishes:', error.message, error);
            return [];
        }
        return data as Dish[];
    },

    addDish: async (dish: Omit<Dish, 'id'>): Promise<Dish | null> => {
        // debug auth
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) console.warn('Warning: No active session when adding dish. RLS may fail.');

        const { data, error } = await supabase.from('dishes').insert(dish).select().single();
        if (error) {
            console.error('Error adding dish:', error.message, error);
            return null;
        }
        return data as Dish;
    },

    updateDish: async (dishId: string, updates: Partial<Dish>): Promise<Dish | null> => {
        const { data, error } = await supabase
            .from('dishes')
            .update(updates)
            .eq('id', dishId)
            .select()
            .single();

        if (error) {
            console.error('Error updating dish:', error.message, error);
            throw error;
        }
        return data as Dish;
    },

    deleteDish: async (dishId: string) => {
        const { error } = await supabase.from('dishes').delete().eq('id', dishId);
        if (error) console.error('Error deleting dish:', error.message, error);
    },

    deleteRestaurant: async (restaurantId: string) => {
        // 1. Delete related dishes
        const { error: dishError } = await supabase.from('dishes').delete().eq('restaurant_id', restaurantId);
        if (dishError) console.error('Error deleting related dishes:', dishError);



        // 3. Delete related analytics
        const { error: analyticsError } = await supabase.from('analytics').delete().eq('restaurant_id', restaurantId);
        if (analyticsError) console.error('Error deleting related analytics:', analyticsError);

        // 4. Delete the restaurant itself
        const { data, error } = await supabase.from('restaurants').delete().eq('id', restaurantId).select();

        if (error) {
            console.error('Error deleting restaurant:', error.message, error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error('Delete operation returned no data. Possible RLS violation or item not found.');
            throw new Error('Permission denied or Restaurant not found.');
        }
    },

    updateRestaurant: async (restaurant: Restaurant): Promise<Restaurant> => {
        // Sanitize: Remove 'ui_presets' or any other joined properties that aren't columns
        const { ui_presets, ...payload } = restaurant as any;

        const { data, error } = await supabase
            .from('restaurants')
            .update(payload)
            .eq('id', restaurant.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating restaurant:', error.message, error);
            throw error;
        }
        return data as Restaurant;
    },



    // --- Public Menu Methods ---
    getMenuBySlug: async (slug: string) => {
        const { data: restaurant, error: rError } = await supabase
            .from('restaurants')
            .select('*')
            .eq('slug', slug)
            .single();

        if (rError || !restaurant) throw new Error('Restaurant not found');

        const { data: dishes } = await supabase
            .from('dishes')
            .select('*')
            .eq('restaurant_id', restaurant.id);

        // Local Settings Only
        const basePreset = {
            id: 'generated-default',
            restaurant_id: restaurant.id,
            primaryColor: '#001f3f',
            secondaryColor: '#000000',
            backgroundColor: '#F8F9FA',
            surfaceColor: '#FFFFFF',
            headingFont: 'Inter',
            bodyFont: 'Inter',
            textColor: '#000000'
        };

        return {
            restaurant: restaurant as Restaurant,
            dishes: (dishes || []) as Dish[],
            preset: basePreset, // Legacy return shape, can be refactored eventually
            themeSettings: restaurant.theme_settings || null
        };
    },

    // --- Theme Inheritance Methods ---

    // Save specific overrides for a restaurant (Menu Settings Workflow)
    updateRestaurantTheme: async (restaurantId: string, overrides: Record<string, any>) => {
        const { data, error } = await supabase
            .from('restaurants')
            .update({ theme_settings: overrides })
            .eq('id', restaurantId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Apply Preset Logic (Bulk Update)


    // --- Storage ---
    uploadImage: async (bucket: string, file: File): Promise<string | null> => {
        // Get current user for RLS compliant path
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User must be authenticated to upload images');

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        // Clean filename and use user-specific folder
        const filePath = `${user.id}/${fileName}`;

        console.log(`Attempting upload to bucket '${bucket}' with path '${filePath}'`);

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError.message, uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        return data.publicUrl;
    },

    // --- Analytics ---
    logEvent: async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
        const { error } = await supabase.from('analytics').insert(event);
        if (error) console.error('Error logging analytics:', error.message, error);
    }
};

