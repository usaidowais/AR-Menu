'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { supabaseService } from '@/lib/services/supabaseService';
export default function EditRestaurantPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);

    const [realId, setRealId] = useState<string>('');
    const [currentSlug, setCurrentSlug] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        location: '',
        status: 'Active',
        scans: 0,
        last_active: '',
        initial: ''
    });

    // Refs for file inputs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Load initial data
        const loadData = async () => {
            setIsLoading(true);
            try {
                const allRestaurants = await supabaseService.getAllRestaurants();
                const found = allRestaurants.find(r => r.id === id || r.slug === id);

                if (found) {
                    setRealId(found.id);
                    setCurrentSlug(found.slug);
                    setFormData({
                        name: found.name || '',
                        email: '', // Add email to DB schema if needed, currently missing in type
                        contact: found.contact_number || '',
                        location: found.location || '',
                        status: found.status || 'Active',
                        scans: 0, // Placeholder
                        last_active: '', // Placeholder
                        initial: found.name.charAt(0)
                    });
                    if (found.logo_url) setLogoPreview(found.logo_url);
                    if (found.banner_url) setBannerPreview(found.banner_url);
                } else {
                    console.warn('Restaurant not found');
                }
            } catch (error) {
                console.error('Failed to load restaurant details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void, setFile: (file: File | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            setFile(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!formData.name) return;

        setIsLoading(true);
        try {
            let logoUrl = logoPreview;
            let bannerUrl = bannerPreview;

            // Upload new images if selected
            if (logoFile) {
                const url = await supabaseService.uploadImage('media', logoFile);
                if (url) logoUrl = url;
            }

            if (bannerFile) {
                const url = await supabaseService.uploadImage('media', bannerFile);
                if (url) bannerUrl = url;
            }

            const updatedRestaurant: any = {
                id: realId, // Use the real UUID
                name: formData.name,
                contact_number: formData.contact,
                // location: formData.location, // Column does not exist in DB
                logo_url: logoUrl || undefined,
                banner_url: bannerUrl || undefined,
                status: formData.status as any,
                slug: currentSlug // Preserve original slug
            };


            await supabaseService.updateRestaurant(updatedRestaurant);

            // Redirect to the detail page (using slug if available)
            router.push(`/admin/restaurants/${currentSlug || id}`);
            router.refresh();
        } catch (error) {
            console.error('Failed to save changes', error);
            alert('Failed to save changes. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-all">
                    <span className="material-icons-round text-3xl">arrow_back</span>
                </button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Restaurant</h2>
                    <p className="text-muted-foreground mt-1">Update tenant details and configuration.</p>
                </div>
            </div>

            <div className="space-y-6">

                {/* Restaurant Name */}
                <div className="glass-card p-8 rounded-2xl border border-border/50">
                    <h3 className="font-bold text-lg text-foreground mb-4">Restaurant Name</h3>
                    <p className="text-sm text-muted-foreground mb-4">Enter the official name of the restaurant as it should appear in the menu.</p>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. The Coastal Catch"
                        className="w-full bg-secondary/30 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                {/* Visual Identity */}
                <div className="glass-card p-8 rounded-2xl border border-border/50">
                    <h3 className="font-bold text-lg text-foreground mb-6">Visual Identity</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Brand Logo</label>
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setLogoPreview, setLogoFile)}
                            />
                            <div
                                className={`border-2 border-dashed ${logoPreview ? 'border-primary' : 'border-border'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/30 transition-colors h-48 relative overflow-hidden group`}
                                onClick={() => logoInputRef.current?.click()}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                            <span className="material-icons-round text-muted-foreground group-hover:text-primary">cloud_upload</span>
                                        </div>
                                        <span className="font-bold text-foreground text-sm">Upload Logo</span>
                                        <span className="text-xs text-muted-foreground mt-1">1:1 Ratio, Max 2MB</span>
                                    </>
                                )}
                                {logoPreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm">Change Logo</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Background Banner</label>
                            <input
                                type="file"
                                ref={bannerInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setBannerPreview, setBannerFile)}
                            />
                            <div
                                className={`border-2 border-dashed ${bannerPreview ? 'border-primary' : 'border-border'} rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-secondary/30 transition-colors h-48 relative overflow-hidden group`}
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                {bannerPreview ? (
                                    <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                                            <span className="material-icons-round text-muted-foreground group-hover:text-primary">image</span>
                                        </div>
                                        <span className="font-bold text-foreground text-sm">Upload Banner</span>
                                        <span className="text-xs text-muted-foreground mt-1">Landscape, Max 3MB</span>
                                    </>
                                )}
                                {bannerPreview && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-white font-bold text-sm">Change Banner</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin & Location */}
                <div className="glass-card p-8 rounded-2xl border border-border/50">
                    <h3 className="font-bold text-lg text-foreground mb-6">Contact & Location</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Owner Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="owner@example.com"
                                className="w-full bg-secondary/30 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                value={formData.contact}
                                onChange={handleInputChange}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-secondary/30 border border-input rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2">Location</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">place</span>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="Search for a location"
                                className="w-full bg-secondary/30 border border-input rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => router.back()} disabled={isLoading}>Cancel</Button>
                <Button
                    className="shadow-lg shadow-primary/25 min-w-[140px]"
                    onClick={handleSaveChanges}
                    disabled={isLoading || !formData.name}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Saving...
                        </div>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </div>
    );
}
