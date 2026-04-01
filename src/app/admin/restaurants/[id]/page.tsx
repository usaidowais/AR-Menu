'use client';

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/Button';
import { useParams, useRouter } from 'next/navigation';
import { computeActiveTheme, DEFAULT_THEME } from '@/lib/utils/themeManager';

import { supabaseService } from '@/lib/services/supabaseService';
import { UnifiedMobileSimulator } from '@/components/mobile-menu/UnifiedMobileSimulator';
import { Dish } from '@/lib/types';

export default function RestaurantDetailDashboard() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [restaurantName, setRestaurantName] = React.useState<string>('Loading...');
    const [restaurant, setRestaurant] = React.useState<any>(null);
    const [restaurantSlug, setRestaurantSlug] = useState<string>('');
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [preset, setPreset] = useState<any>(DEFAULT_THEME);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

    const downloadQR = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to download QR code', error);
        }
    };

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                // 1. Fetch Restaurant with linked Global Preset AND Local Overrides
                const found = await supabaseService.getRestaurantWithTheme(id);

                if (found) {
                    setRestaurantName(found.name);
                    setRestaurantSlug(found.slug);
                    setRestaurant(found);

                    // 2. Fetch dishes
                    const fetchedDishes = await supabaseService.getRestaurantDishes(found.id);
                    setDishes(fetchedDishes || []);

                    // 3. Compute Active Theme (Local Settings Only)
                    console.log('Dashboard Debug - Found:', {
                        overrides: found.theme_settings,
                        id: found.id
                    });

                    const finalTheme = computeActiveTheme(found.theme_settings);

                    console.log('Dashboard Debug - Final Computed:', finalTheme);
                    setPreset(finalTheme);

                } else {
                    setRestaurantName('Restaurant Not Found');
                }
            } catch (error) {
                console.error('Failed to fetch restaurant details:', error);
                setRestaurantName('Error loading details');
            }
        };

        fetchRestaurant();
    }, [id]);


    // This ensures that for a given ID, the data is always the same (consistent),
    // but different IDs will have different stats.

    // Hash function to get a seed number from the ID
    const getSeed = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const seed = getSeed(id || 'default');

    // Helper to generate a random number between min and max based on a changing seed
    const pseudoRandom = (customSeed: number, min: number, max: number) => {
        const x = Math.sin(seed + customSeed) * 10000;
        const result = Math.floor((x - Math.floor(x)) * (max - min) + min);
        return result;
    };

    // Generate Chart Data
    const data = [
        { name: 'Mon', views: pseudoRandom(1, 200, 500), orders: pseudoRandom(2, 50, 200) },
        { name: 'Tue', views: pseudoRandom(3, 150, 400), orders: pseudoRandom(4, 40, 150) },
        { name: 'Wed', views: pseudoRandom(5, 300, 800), orders: pseudoRandom(6, 100, 400) },
        { name: 'Thu', views: pseudoRandom(7, 250, 600), orders: pseudoRandom(8, 80, 250) },
        { name: 'Fri', views: pseudoRandom(9, 400, 900), orders: pseudoRandom(10, 150, 500) },
        { name: 'Sat', views: pseudoRandom(11, 350, 850), orders: pseudoRandom(12, 140, 450) },
        { name: 'Sun', views: pseudoRandom(13, 300, 700), orders: pseudoRandom(14, 120, 350) },
    ];

    // Generate Key Metrics
    const totalScans = data.reduce((acc, curr) => acc + curr.views, 0);
    const interactions = Math.floor(totalScans * (pseudoRandom(50, 40, 70) / 100)); // 40-70% interaction rate
    const ctr = (pseudoRandom(60, 15, 35) / 10 + 10).toFixed(1); // 10% - 35% CTR



    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors">
                            <span className="material-icons-round text-sm">arrow_back</span>
                            Back to Directory
                        </button>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">{restaurantName}</h2>
                    <p className="text-muted-foreground mt-1">Tenant ID: {id} • <span className="text-green-600 font-medium">Active</span></p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2" onClick={() => setIsQrModalOpen(true)}>
                        <span className="material-icons-round text-sm">qr_code</span>
                        Download Menu QR
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={() => router.push(`/admin/restaurants/${id}/menu`)}>
                        <span className="material-icons-round text-sm">restaurant_menu</span>
                        Manage Menu Items
                    </Button>
                    <Button className="gap-2" onClick={() => router.push(`/admin/restaurants/${id}/edit`)}>
                        <span className="material-icons-round text-sm">edit</span>
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Column: Stats & Charts */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-muted-foreground">Total Menu Scans</p>
                                <h3 className="text-3xl font-bold text-foreground mt-2">{totalScans.toLocaleString()}</h3>
                                <span className="text-green-600 text-xs font-bold mt-2 inline-flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    <span className="material-icons-round text-xs mr-0.5">trending_up</span>
                                    +{pseudoRandom(90, 5, 25)}.3%
                                </span>
                            </div>
                            <span className="material-icons-round absolute -bottom-4 -right-4 text-9xl text-muted-foreground/10 group-hover:text-primary/10 transition-colors group-hover:scale-110 duration-500">qr_code_scanner</span>
                        </div>
                        <div className="glass-card p-6 rounded-xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-sm font-medium text-muted-foreground">AR Interactions</p>
                                <h3 className="text-3xl font-bold text-foreground mt-2">{interactions.toLocaleString()}</h3>
                                <span className="text-green-600 text-xs font-bold mt-2 inline-flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                    <span className="material-icons-round text-xs mr-0.5">trending_up</span>
                                    +{pseudoRandom(91, 2, 15)}.2%
                                </span>
                            </div>
                            <span className="material-icons-round absolute -bottom-4 -right-4 text-9xl text-muted-foreground/10 group-hover:text-accent/10 transition-colors group-hover:scale-110 duration-500">view_in_ar</span>
                        </div>
                    </div>

                    {/* Engagement Chart */}
                    <div className="glass p-6 rounded-2xl border border-border/50">
                        <h3 className="font-bold text-lg text-foreground mb-6">Engagement Overview</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="views" stroke="var(--primary)" fillOpacity={1} fill="url(#colorViews)" />
                                    <Area type="monotone" dataKey="orders" stroke="#10b981" fillOpacity={1} fill="url(#colorOrders)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Column: Live Menu Preview */}
                <div className="flex flex-col items-center sticky top-24">
                    {/* Added sticky top-24 to keep it visible while scrolling */}
                    <div className="w-full text-left mb-4">  {/* Changed center to left to align with column title style if needed, or keep center */}
                        <h3 className="font-bold text-lg text-foreground w-full text-center lg:text-left">Live Menu Preview</h3>
                    </div>

                    <UnifiedMobileSimulator
                        mode="live"
                        className="transform hover:scale-[1.02] transition-transform duration-300"
                        data={{
                            restaurant: restaurant || {},
                            dishes: dishes
                        }}
                        theme={preset}
                    />
                </div>

            </div>

            {/* QR Modal */}
            {isQrModalOpen && restaurant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-background rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-foreground">Menu QR Code</h3>
                            <button onClick={() => setIsQrModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <span className="material-icons-round">close</span>
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-inner mb-6 flex justify-center items-center h-64">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/menu/${restaurant.slug || restaurant.id}` : '')}`}
                                alt={`${restaurant.name} QR Code`}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <p className="text-sm text-muted-foreground mb-6">
                            Scan this code to view the full digital menu for {restaurant.name}.
                        </p>

                        <div className="flex gap-3">
                            <Button
                                className="w-full bg-[#001f3f] text-white gap-2 flex items-center justify-center"
                                onClick={() => downloadQR(
                                    `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}/menu/${restaurant.slug || restaurant.id}` : '')}`,
                                    `${restaurant.name || 'Restaurant'}-Menu-QR.png`
                                )}
                            >
                                <span className="material-icons-round text-sm">download</span>
                                Download High-Quality QR
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
