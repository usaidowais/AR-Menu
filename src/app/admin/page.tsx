'use client';

import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function SuperAdminDashboard() {
    const router = useRouter();

    // --- Mock Data ---
    const sparklineData1 = [{ v: 10 }, { v: 25 }, { v: 18 }, { v: 40 }, { v: 35 }, { v: 50 }, { v: 65 }];
    const sparklineData2 = [{ v: 30 }, { v: 25 }, { v: 35 }, { v: 30 }, { v: 45 }, { v: 55 }, { v: 60 }];
    const sparklineData3 = [{ v: 15 }, { v: 20 }, { v: 18 }, { v: 25 }, { v: 22 }, { v: 30 }, { v: 38 }];

    const barChartData = [
        { name: 'Mon', scans: 2400 },
        { name: 'Tue', scans: 3200 },
        { name: 'Wed', scans: 2800 },
        { name: 'Thu', scans: 3600 },
        { name: 'Fri', scans: 4800 },
        { name: 'Sat', scans: 5200 },
        { name: 'Sun', scans: 4300 },
    ];

    const topRestaurants = [
        { name: 'The Coastal Catch', category: 'Seafood', scans: 12450, color: 'bg-cyan-500' },
        { name: 'Urban Spice', category: 'Indian', scans: 9230, color: 'bg-orange-500' },
        { name: 'Green Leaf', category: 'Vegan', scans: 8105, color: 'bg-green-500' },
        { name: 'Sushi Zen', category: 'Japanese', scans: 6400, color: 'bg-rose-500' },
        { name: 'Burger Joint', category: 'American', scans: 4200, color: 'bg-yellow-500' },
    ];

    // Gauge Data
    const gaugeValue = 85;
    const gaugeData = [
        {
            name: 'Scans',
            value: gaugeValue,
            fill: 'url(#gaugeGradient)',
        }
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background/90 backdrop-blur-md border border-border/50 p-3 rounded-xl shadow-xl">
                    <p className="font-bold text-foreground text-sm mb-1">{label}</p>
                    <p className="text-primary font-bold text-lg">
                        {payload[0].value.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">Scans</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">Overview</div>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Super Admin Dashboard</h2>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <span className="material-icons-round">download</span>
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card 1: Total Scans */}
                <div className="glass-card p-0 rounded-3xl overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="p-6 pb-0 z-10 relative">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <span className="material-icons-round">qr_code_scanner</span>
                            </div>
                            <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                <span className="material-icons-round text-xs">trending_up</span> 12%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground">24,567</h3>
                        <p className="text-muted-foreground text-sm font-medium">Total Scans (7d)</p>
                    </div>

                    <div className="h-20 w-full mt-2 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50"></div>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData1}>
                                <defs>
                                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} fill="url(#colorScans)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Card 2: Active Restaurants */}
                <div className="glass-card p-0 rounded-3xl overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
                    <div className="p-6 pb-0 z-10 relative">
                        <div className="flex justify-between items-start">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                                <span className="material-icons-round">store</span>
                            </div>
                            <span className="bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 flex items-center gap-1">
                                <span className="material-icons-round text-xs">trending_up</span> 5%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground">412</h3>
                        <p className="text-muted-foreground text-sm font-medium">Active Restaurants</p>
                    </div>

                    <div className="h-20 w-full mt-2 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sparklineData2}>
                                <defs>
                                    <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#f97316" strokeWidth={3} fill="url(#colorActive)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Card 3: Top Dish */}
                <div className="glass-card p-6 rounded-3xl border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <div className="flex justify-between items-start">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <span className="material-icons-round">emoji_events</span>
                        </div>
                    </div>

                    <div>
                        <p className="text-muted-foreground text-sm font-medium mb-1">Top Performing Dish</p>
                        <h3 className="text-2xl font-bold text-foreground">Spicy Tuna Roll</h3>
                        <div className="flex items-center gap-2 mt-3">
                            <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 w-[78%] rounded-full"></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600">78% Conv.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Top Restaurants */}
                <div className="lg:col-span-2 glass-card p-8 rounded-3xl border border-border/50">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-foreground">Top Performing Restaurants</h3>
                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push('/admin/restaurants')}>View All</Button>
                    </div>

                    <div className="space-y-5">
                        {topRestaurants.map((resto, idx) => (
                            <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-secondary/30 p-3 rounded-2xl transition-all border border-transparent hover:border-border/50" onClick={() => router.push('/admin/restaurants/1')}>
                                <div className="flex items-center gap-4">
                                    <div className="font-bold text-muted-foreground/30 text-lg w-6">{idx + 1}</div>
                                    <div>
                                        <h4 className="font-bold text-foreground">{resto.name}</h4>
                                        <p className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-md inline-block mt-1">{resto.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 flex-1 justify-end">
                                    <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden hidden md:block">
                                        <div className={cn("h-full rounded-full transition-all duration-1000", resto.color)} style={{ width: `${(resto.scans / 13000) * 100}%` }}></div>
                                    </div>
                                    <span className="font-bold text-foreground w-16 text-right tabular-nums">{resto.scans.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scan Velocity - Stylized Radial Bar */}
                <div className="glass-card p-8 rounded-3xl border border-border/50 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-white/80 to-white/40">

                    <h3 className="font-bold text-xl text-foreground w-full text-center mb-4">Live Scan Velocity</h3>

                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart
                                cx="50%"
                                cy="50%"
                                innerRadius="70%"
                                outerRadius="100%"
                                barSize={20}
                                data={gaugeData}
                                startAngle={180}
                                endAngle={0}
                            >
                                <defs>
                                    <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                <RadialBar
                                    background={{ fill: 'var(--secondary)' }}
                                    dataKey="value"
                                    angleAxisId={0}
                                    cornerRadius={10}
                                />
                            </RadialBarChart>
                        </ResponsiveContainer>

                        <div className="absolute flex flex-col items-center justify-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-[20%]">
                            <span className="text-6xl font-black text-foreground tracking-tighter drop-shadow-sm">{gaugeValue}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-1">Scans / Hour</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-12 w-full mt-2">
                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Avg</p>
                            <p className="font-bold text-foreground text-lg">45</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Peak</p>
                            <p className="font-bold text-foreground text-lg">112</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="glass-card p-8 rounded-3xl border border-border/50">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="font-bold text-xl text-foreground">Activity Overview</h3>
                        <p className="text-muted-foreground text-sm">Real-time scan analytics</p>
                    </div>
                    <div className="flex bg-secondary p-1 rounded-xl">
                        <button className="px-3 py-1 bg-white shadow-sm rounded-lg text-xs font-bold text-foreground">Weekly</button>
                        <button className="px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">Monthly</button>
                    </div>
                </div>

                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData} barSize={50}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--secondary)', opacity: 0.3 }} />
                            <Bar
                                dataKey="scans"
                                fill="url(#barGradient)"
                                radius={[8, 8, 8, 8]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
