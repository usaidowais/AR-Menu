'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { supabaseService } from '@/lib/services/supabaseService';
import { Restaurant } from '@/lib/types';

export default function RestaurantListPage() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await supabaseService.getAllRestaurants();
                setRestaurants(data);
            } catch (error) {
                console.error('Failed to load restaurants', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeActionId && !(event.target as Element).closest('.action-menu-container')) {
                setActiveActionId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeActionId]);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
            try {
                await supabaseService.deleteRestaurant(id);
                setRestaurants(prev => prev.filter(r => r.id !== id));
            } catch (error: any) {
                console.error('Failed to delete restaurant', error);
                alert(`Failed to delete restaurant: ${error.message || 'Unknown error'}`);
            }
        }
        setActiveActionId(null);
    };

    if (loading) {
        return (
            <div className="p-8 max-w-7xl mx-auto flex justify-center items-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Restaurants Directory</h2>
                    <p className="text-muted-foreground mt-1">Manage all client accounts</p>
                </div>
                <Button
                    className="gap-2 shadow-lg shadow-primary/20"
                    onClick={() => router.push('/admin/restaurants/new')}
                >
                    <span className="material-icons-round">add</span>
                    Onboard New Client
                </Button>
            </div>

            <div className="flex bg-white rounded-lg border border-input p-1 focus-within:ring-2 focus-within:ring-ring max-w-md shadow-sm">
                <span className="material-icons-round p-2 text-muted-foreground">search</span>
                <input className="w-full outline-none bg-transparent placeholder:text-muted-foreground" placeholder="Search by name, slug or ID..." />
            </div>

            <div className="glass-card rounded-xl overflow-hidden border border-border/50 shadow-md">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Restaurant Name</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Slug (URL)</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Status</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground">Created At</th>
                            <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {restaurants.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                    No restaurants found. Click "Onboard New Client" to create one.
                                </td>
                            </tr>
                        ) : (
                            restaurants.map((repo, index) => {
                                const isLastRow = index === restaurants.length - 1 && restaurants.length > 2;
                                return (
                                <tr
                                    key={repo.id}
                                    className="hover:bg-secondary/30 transition-colors group relative"
                                >
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/admin/restaurants/${repo.slug || repo.id}`)}>
                                        <div className="flex items-center gap-3">
                                            {repo.logo_url ? (
                                                <img
                                                    src={repo.logo_url}
                                                    alt={repo.name}
                                                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                                    {repo.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{repo.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground cursor-pointer" onClick={() => router.push(`/admin/restaurants/${repo.slug || repo.id}`)}>{repo.slug}</td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => router.push(`/admin/restaurants/${repo.slug || repo.id}`)}>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-xs font-bold border flex items-center w-fit gap-1",
                                            repo.status === 'active' ? "bg-green-50 text-green-700 border-green-100" :
                                                repo.status === 'onboarding' ? "bg-yellow-50 text-yellow-700 border-yellow-100" :
                                                    "bg-secondary text-muted-foreground border-border"
                                        )}>
                                            <span className={cn("w-1.5 h-1.5 rounded-full", repo.status === 'active' ? "bg-green-600" : repo.status === 'onboarding' ? "bg-yellow-600" : "bg-gray-400")}></span>
                                            {repo.status.charAt(0).toUpperCase() + repo.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground cursor-pointer" onClick={() => router.push(`/admin/restaurants/${repo.slug || repo.id}`)}>
                                        {(repo as any).created_at ? new Date((repo as any).created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right relative action-menu-container">
                                        <button
                                            className="text-muted-foreground hover:text-primary p-2 transition-colors rounded-full hover:bg-secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveActionId(activeActionId === repo.id ? null : repo.id);
                                            }}
                                        >
                                            <span className="material-icons-round">more_vert</span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeActionId === repo.id && (
                                            <div className={`absolute right-8 ${isLastRow ? 'bottom-12 origin-bottom-right' : 'top-12 origin-top-right'} w-48 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
                                                <div className="p-1">
                                                    <button
                                                        onClick={() => router.push(`/admin/restaurants/${repo.id}/edit`)}
                                                        className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg flex items-center gap-2"
                                                    >
                                                        <span className="material-icons-round text-lg text-blue-500">edit</span>
                                                        Edit Restaurant
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/admin/restaurants/${repo.id}/settings`)}
                                                        className="w-full text-left px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg flex items-center gap-2"
                                                    >
                                                        <span className="material-icons-round text-lg text-purple-500">tune</span>
                                                        Menu Settings
                                                    </button>
                                                    <div className="h-px bg-border/50 my-1 mx-2"></div>
                                                    <button
                                                        onClick={() => handleDelete(repo.id, repo.name)}
                                                        className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                                                    >
                                                        <span className="material-icons-round text-lg">delete</span>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
