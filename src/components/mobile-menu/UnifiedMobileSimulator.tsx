import React from 'react';
import { cn } from '@/lib/utils';
import { Dish, Restaurant } from '@/lib/types';
import { ARExperience } from '@/components/ar/ARExperience';

interface UnifiedMobileSimulatorProps {
    mode: 'preview' | 'live';
    theme?: {
        primaryColor?: string;
        secondaryColor?: string;
        backgroundColor?: string;
        surfaceColor?: string;
        headingFont?: string;
        bodyFont?: string;
        textColor?: string;
        fontFamily?: string; // Legacy compassion
    };
    data?: {
        restaurant: Partial<Restaurant>;
        dishes: Dish[];
    };
    // Helper to allow custom classnames on the wrapper
    className?: string;
}

// Dummy Data for Preview Mode
const DUMMY_RESTAURANT = {
    name: 'Steakhouse Prime',
    banner_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600',
    logo_url: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?auto=format&fit=crop&q=80&w=200',
    location: 'Downtown Gourmet District'
};

const DUMMY_DISHES = [
    { id: '1', name: 'Wagyu Burger', price: 29.99, description: 'Premium A5 Wagyu beef with truffle mayo and aged cheddar.', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300', category: 'Mains' },
    { id: '2', name: 'Truffle Fries', price: 12.50, description: 'Crispy fries tossed in white truffle oil and parmesan.', image_url: 'https://images.unsplash.com/photo-1573080496987-a226bdfddc20?auto=format&fit=crop&w=300', category: 'Sides' },
    { id: '3', name: 'Caesar Salad', price: 14.00, description: 'Fresh romaine hearts, garlic croutons, and house-made dressing.', image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=300', category: 'Starters' }
];

export function UnifiedMobileSimulator({ mode, theme, data, className }: UnifiedMobileSimulatorProps) {
    // 1. Determine Data Source
    const restaurant = mode === 'live' ? data?.restaurant : DUMMY_RESTAURANT;
    const dishes = mode === 'live' ? (data?.dishes || []) : DUMMY_DISHES;

    // 2. Determine Theme
    const primaryColor = theme?.primaryColor || '#001f3f';
    const secondaryColor = theme?.secondaryColor || '#000000';
    const backgroundColor = theme?.backgroundColor || '#F8F9FA';
    const surfaceColor = theme?.surfaceColor || '#FFFFFF';
    const textColor = theme?.textColor || '#000000';
    const headingFont = theme?.headingFont || theme?.fontFamily || 'Inter';
    const bodyFont = theme?.bodyFont || theme?.fontFamily || 'Inter';

    // Categories
    const categories = React.useMemo(() => {
        return mode === 'live'
            ? Array.from(new Set(dishes.map(d => d.category || 'Other')))
            : ['Mains', 'Sides', 'Starters', 'Drinks'];
    }, [mode, dishes]);

    const [activeCategory, setActiveCategory] = React.useState<string | undefined>(categories[0]);
    const [arViewDish, setArViewDish] = React.useState<Dish | any | null>(null);

    // FIX: Update activeCategory when data loads (categories change)
    React.useEffect(() => {
        if (!activeCategory || !categories.includes(activeCategory)) {
            if (categories.length > 0) {
                setActiveCategory(categories[0]);
            }
        }
    }, [categories, activeCategory]);

    // Filter Logic
    const displayedDishes = dishes.filter(d =>
        // In dummy mode, we might want to show everything or simulate filter.
        // Let's matching real behavior: matches category
        (d.category || 'Other') === activeCategory || (mode === 'preview' && activeCategory === 'Mains' && d.category === 'Mains') // Simplified for dummy
    );
    // For Dummy data, ensure we show *something* if filter mismatches or just show all if categories don't align perfectly in dummy
    const finalDishes = mode === 'preview' ? dishes : displayedDishes;


    return (
        /*
           RIGID PHONE CONTAINER
           - Fixed 375px x 812px
           - Border 8px Gray-900
           - Rounded 3rem
           - Overflow Hidden
        */
        <div
            className={cn(
                "relative shrink-0 mx-auto",
                "w-[345px] h-[750px]",
                "rounded-[2.2rem] shadow-2xl border-[7px] border-gray-900 overflow-hidden ring-1 ring-white/10",
                className
            )}
            style={{ backgroundColor: backgroundColor, fontFamily: bodyFont, color: textColor }}
        >
            {/* Status Bar Mock */}
            <div className="absolute top-0 inset-x-0 h-10 bg-black/20 z-50 flex justify-between px-6 items-center pointer-events-none">
                <span className="text-[12px] font-bold text-white tracking-wide ml-2">9:41</span>
                <div className="flex gap-1.5 mr-2">
                    <span className="material-icons-round text-[14px] text-white">signal_cellular_4_bar</span>
                    <span className="material-icons-round text-[14px] text-white">wifi</span>
                    <span className="material-icons-round text-[14px] text-white">battery_full</span>
                </div>
            </div>

            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-2xl z-50 pointer-events-none"></div>

            {/* --- CONTENT AREA --- */}
            <div
                className="w-full h-full overflow-y-auto no-scrollbar"
                style={{ fontFamily: bodyFont, backgroundColor: backgroundColor, color: textColor }}
            >
                {/* 1. MASTER LAYOUT: BANNER + OVERLAPPING LOGO */}
                <div className="relative mb-12"> {/* Reduced bottom margin */}
                    {/* Banner */}
                    <div className="h-32 w-full overflow-hidden bg-gray-800"> {/* Reduced height to h-32 */}
                        {restaurant?.banner_url ? (
                            <img src={restaurant.banner_url} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <span className="material-icons-round text-4xl">store</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20"></div>
                    </div>

                    {/* Logo - Centered Overlap */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                        <div className="w-20 h-20 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex items-center justify-center"> {/* Reduced to w-20 h-20 */}
                            {restaurant?.logo_url ? (
                                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">{restaurant?.name?.charAt(0) || 'R'}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header Info */}
                <div className="text-center px-4 pb-4">
                    <h1 className="text-xl font-bold leading-tight font-serif" style={{ fontFamily: headingFont }}>{restaurant?.name || 'Restaurant Name'}</h1>
                    <p className="text-xs opacity-70 mt-1 uppercase tracking-widest" style={{ fontFamily: bodyFont }}>Fine Dining • Modern</p>
                </div>

                {/* Sticky Navigation */}
                <div className="sticky top-0 z-40 backdrop-blur-md border-b border-gray-100 py-0 shrink-0" style={{ backgroundColor: `${backgroundColor}D9` }}> {/* Frosted glass */}
                    <div className="flex gap-6 overflow-x-auto no-scrollbar px-6 w-full items-center">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                style={{
                                    color: activeCategory === cat ? primaryColor : textColor,
                                    borderColor: activeCategory === cat ? primaryColor : 'transparent',
                                    fontFamily: headingFont
                                }}
                                className={cn(
                                    "py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 shrink-0",
                                    activeCategory !== cat ? "opacity-60 hover:opacity-100 border-transparent" : "opacity-100"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dishes Grid */}
                <div className="p-4 grid grid-cols-2 gap-4 pb-20">
                    {(mode === 'preview' ? dishes : finalDishes).map((dish) => (
                        <div
                            key={dish.id}
                            style={{ backgroundColor: surfaceColor }}
                            className="rounded-xl overflow-hidden shadow-sm flex flex-col group border border-gray-100/50"
                        >
                            {/* Dish Image - Landscape 3:2 */}
                            <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                                <img src={dish.image_url!} alt={dish.name} className="w-full h-full object-cover" />
                                <span
                                    className="absolute top-2 right-2 bg-white/95 backdrop-blur text-[10px] font-bold px-2 py-0.5 rounded shadow-sm"
                                    style={{ color: secondaryColor }} /* Secondary color for price */
                                >
                                    {dish.price}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="p-3 flex flex-col flex-1">
                                <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1 font-serif" style={{ fontFamily: headingFont }}>{dish.name}</h4>
                                <p className="text-[10px] text-gray-500 line-clamp-2 mb-3 flex-1 leading-relaxed" style={{ fontFamily: bodyFont }}>{dish.description}</p>

                                <button
                                    onClick={() => setArViewDish(dish)}
                                    className="w-full py-1.5 rounded-full border border-current text-[9px] font-bold uppercase flex items-center justify-center gap-1 mt-auto hover:bg-black/5 active:scale-95 transition-all"
                                    style={{ color: primaryColor, borderColor: primaryColor }}
                                >
                                    <span className="material-icons-round text-[12px]">view_in_ar</span>
                                    View AR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* --- REAL AR EXPERIENCE --- */}
            {arViewDish && (
                <div className="absolute inset-0 z-[100] bg-black">
                    <ARExperience
                        src={arViewDish.glb_url || arViewDish.model_url || ''} // Handle both fields
                        iosSrc={arViewDish.usdz_url}
                        alt={arViewDish.name}
                        dishName={arViewDish.name}
                        dishPrice={arViewDish.price}
                        secondaryColor={theme?.secondaryColor}
                        onClose={() => setArViewDish(null)}
                    />
                </div>
            )}

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50 pointer-events-none"></div>
        </div>
    );
}
