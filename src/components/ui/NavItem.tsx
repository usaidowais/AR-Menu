import React from 'react';
import { cn } from '@/lib/utils';

interface NavItemProps {
    icon: string;
    label: string;
    active?: boolean;
    onClick?: () => void;
}

export const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
            active
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
    >
        <span className={cn(
            "material-icons-round text-xl transition-transform",
            active ? "" : "group-hover:scale-110"
        )}>{icon}</span>
        <span className="text-sm">{label}</span>
        {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-white/20 rounded-r-full" />
        )}
    </button>
);
