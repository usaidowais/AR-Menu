export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  RESTAURANT_OWNER = 'RESTAURANT_OWNER',
  PUBLIC_USER = 'PUBLIC_USER'
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string; // For the URL
  logo_url?: string;
  status: 'active' | 'onboarding' | 'suspended';
  owner_id: string;
}

export interface UIPreset {
  id: string;
  restaurant_id: string;
  primary_color: string;
  font_family: 'Inter' | 'Playfair Display';
  card_style: 'minimal' | 'bordered' | 'shadow';
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  glb_url?: string; // For Android/Web
  usdz_url?: string; // For iOS AR Quick Look
  category: string;
}

export interface AnalyticsEvent {
  id: string;
  restaurant_id: string;
  dish_id?: string;
  event_type: 'qr_scan' | 'view_ar' | 'click_dish';
  created_at: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: string;
  color: string;
}
