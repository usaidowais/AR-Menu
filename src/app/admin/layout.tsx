'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/services/supabaseService';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Auth Check
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error || !user) {
                    router.push('/');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    // Mock Logout
    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar
                onLogout={handleLogout}
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            <div className="flex-1 md:ml-64 flex flex-col transition-all duration-300">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-40 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">SA</div>
                        <span className="font-bold text-foreground">WebAR Admin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="material-icons-round text-foreground">menu</span>
                    </button>
                </div>

                <main className="flex-1 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}
