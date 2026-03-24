import { Restaurant, Dish, UIPreset, AnalyticsEvent } from '../types';

// In a real app, this would import { createClient } from '@supabase/supabase-js'
// const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/**
 * Mock Data Store
 */
const MOCK_RESTAURANTS: Restaurant[] = [
  { id: '1', name: 'FlavorFusion', slug: 'flavor-fusion', status: 'active', owner_id: 'owner_1' },
  { id: '2', name: 'The Golden Spoon', slug: 'golden-spoon', status: 'onboarding', owner_id: 'owner_2' },
];

const MOCK_DISHES: Dish[] = [
  { 
    id: 'd1', 
    restaurant_id: '1', 
    name: 'Tandoori Chicken', 
    description: 'Marinated chicken grilled in a clay oven.', 
    price: 18, 
    image_url: 'https://picsum.photos/400/400?random=1',
    category: 'Desi',
    glb_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb' // Placeholder model
  },
  { 
    id: 'd2', 
    restaurant_id: '1', 
    name: 'Butter Chicken', 
    description: 'Creamy tomato-based curry with tender chicken.', 
    price: 22, 
    image_url: 'https://picsum.photos/400/400?random=2',
    category: 'Desi',
    glb_url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
  },
];

const MOCK_PRESET: UIPreset = {
  id: 'p1',
  restaurant_id: '1',
  primary_color: '#001f3f',
  font_family: 'Inter',
  card_style: 'shadow'
};

export const supabaseService = {
  // --- Admin Methods ---
  getGlobalStats: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      totalRestaurants: 12,
      activeMenus: 10,
      totalScans: 14502,
      arConversions: 42
    };
  },

  getAllRestaurants: async (): Promise<Restaurant[]> => {
    return MOCK_RESTAURANTS;
  },

  // --- Client Portal Methods ---
  getRestaurantDishes: async (restaurantId: string): Promise<Dish[]> => {
    return MOCK_DISHES.filter(d => d.restaurant_id === restaurantId);
  },

  addDish: async (dish: Omit<Dish, 'id'>): Promise<Dish> => {
    const newDish = { ...dish, id: Math.random().toString(36).substr(2, 9) };
    MOCK_DISHES.push(newDish);
    return newDish;
  },

  updateUIPreset: async (preset: UIPreset): Promise<UIPreset> => {
    // In real app: Update DB
    return preset;
  },

  // --- Public Menu Methods ---
  getMenuBySlug: async (slug: string) => {
    const restaurant = MOCK_RESTAURANTS.find(r => r.slug === slug);
    if (!restaurant) throw new Error('Restaurant not found');
    const dishes = MOCK_DISHES.filter(d => d.restaurant_id === restaurant.id);
    return { restaurant, dishes, preset: MOCK_PRESET };
  },

  // --- Analytics ---
  logEvent: async (event: Omit<AnalyticsEvent, 'id' | 'created_at'>) => {
    console.log('Logging Event to Supabase:', event);
    // In real app: supabase.from('analytics').insert(event);
  }
};
