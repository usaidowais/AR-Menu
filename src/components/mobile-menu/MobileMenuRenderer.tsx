import React, { useRef, useState, useEffect } from 'react';
import { Dish } from '@/lib/types';
import { cn } from '@/lib/utils'; // Assuming this exists, standard in this project

export interface MobileMenuProps {
    restaurant: {
        name: string;
        logo_url: string | null;
        banner_url: string | null;
        location?: string;
    };
    preset: {
        backgroundColor?: string;
        primaryColor?: string;
        secondaryColor?: string;
        surfaceColor?: string;
        headingFont?: string;
        bodyFont?: string;
        textColor?: string;
        // Legacy support if needed, but we prefer camelCase
        fontFamily?: string;
    };
    dishes: Dish[];
    categories: string[];
    onDishSelect?: (dish: Dish) => void;
}

export function MobileMenuRenderer({
    restaurant,
    preset,
    dishes,
    categories,
    onDishSelect
}: MobileMenuProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0] || 'All');

    // Default styles if undefined
    const bgColor = preset.backgroundColor || '#1a1a1a';
    const btnColor = preset.primaryColor || '#000000';
    const textColor = preset.textColor || '#000000';
    const headingFont = preset.headingFont || 'Inter';
    const bodyFont = preset.bodyFont || 'Inter';
    const cardBg = preset.surfaceColor || '#ffffff';

    // Scroll or Filter? User requested "Filter" explicitly in latest prompt.
    // "Clicking a category pill must filter the displayed dishes instantly."

    // Filtered Dishes Computation
    const displayedDishes = activeCategory === 'All'
        ? dishes
        : dishes.filter(d => (d.category || 'Other') === activeCategory);

    return (
        <div
            className="flex flex-col h-full min-h-full w-full relative transition-colors duration-300 overflow-y-auto no-scrollbar"
            style={{
                backgroundColor: bgColor,
                fontFamily: bodyFont,
                color: textColor
            }}
        >
            {/* --- 1. PROFILE HEADER --- */}
            <div className="relative w-full aspect-[3/1] bg-slate-100 overflow-hidden shadow-sm shrink-0">
                {restaurant.banner_url ? (
                    <img src={restaurant.banner_url} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-white/10">
                        <span className="material-icons-round text-4xl">store</span>
                    </div>
                )}

                {/* Logo & Info Overlay (Left Aligned) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4 pb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-white bg-white shadow-xl overflow-hidden flex items-center justify-center shrink-0"
                        >
                            {restaurant.logo_url ? (
                                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-base font-bold text-gray-400">{restaurant.name?.charAt(0) || 'R'}</span>
                            )}
                        </div>
                        <div className="text-white">
                            <h1 className="font-bold text-lg leading-tight drop-shadow-md line-clamp-1" style={{ fontFamily: headingFont }}>{restaurant.name}</h1>
                            <p className="text-[10px] text-white/80 uppercase tracking-widest pl-0.5">Modern Cuisine</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. STICKY CATEGORY NAV --- */}
            <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-black/5 shadow-sm py-3 shrink-0" style={{ backgroundColor: `${bgColor}E6` }}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 w-full mask-gradient-right">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                backgroundColor: activeCategory === cat ? btnColor : 'transparent',
                                color: activeCategory === cat ? '#ffffff' : textColor,
                                opacity: activeCategory === cat ? 1 : 0.7,
                                borderColor: activeCategory === cat ? 'transparent' : `${textColor}20`,
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm border shrink-0"
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- 3. CONTENT AREA (FILTERED) --- */}
            <div className="flex-1 p-4 pb-20 space-y-6">
                {/* Grid for Filtered Result */}
                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                    {displayedDishes.map((dish) => (
                        <div
                            key={dish.id}
                            className="flex flex-col gap-3 group cursor-pointer p-2 rounded-xl shadow-sm border border-black/5 hover:shadow-md transition-all active:scale-[0.98] overflow-hidden bg-white"
                            style={{ backgroundColor: cardBg }}
                            onClick={() => onDishSelect && onDishSelect(dish)}
                        >
                            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
                                <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover" />
                                {/* Price Badge - Adjusted for theme contrast if needed */}
                                <span className="absolute top-2 right-2 bg-white/95 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md text-gray-900 shadow-sm">
                                    PKR {dish.price}
                                </span>
                            </div>
                            <div className="p-1 flex flex-col flex-1">
                                <h4 className="font-bold text-xs mb-1 leading-tight line-clamp-2" style={{ color: textColor, fontFamily: headingFont }}>{dish.name}</h4>
                                <p className="text-[9px] line-clamp-2 mb-3 flex-1 h-[2.5em]" style={{ color: textColor, opacity: 0.7, fontFamily: bodyFont }}>{dish.description}</p>

                                {/* AR Button */}
                                <button
                                    style={{ backgroundColor: btnColor, fontFamily: bodyFont }}
                                    className="w-full py-2 rounded-lg text-white text-[9px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 active:scale-95 transition-transform shadow-sm mt-auto"
                                >
                                    <span className="material-icons-round text-[10px]">view_in_ar</span>
                                    View in AR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {displayedDishes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <span className="material-icons-round text-3xl mb-2 opacity-20">restaurant_menu</span>
                        <p className="text-sm">No items found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
