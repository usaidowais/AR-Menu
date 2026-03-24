import React from 'react';
import { cn } from '@/lib/utils';

interface PhoneSimulatorProps {
    children: React.ReactNode;
    className?: string;
}

export function PhoneSimulator({ children, className }: PhoneSimulatorProps) {
    return (
        /* 
           RIGID WRAPPER 
           - Fixed Width: 375px
           - Fixed Height: 812px
           - Flex Shrink 0: Prevents squashing
        */
        <div className={cn(
            "relative flex-shrink-0 mx-auto",
            "w-[375px] h-[812px]", // EXACT DIMENSIONS
            "bg-black rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]",
            "border-[8px] border-gray-900",
            "overflow-hidden ring-1 ring-white/10",
            className
        )}>
            {/* Status Bar Mock */}
            <div className="absolute top-0 inset-x-0 h-10 bg-black/20 z-30 flex justify-between px-6 items-center pointer-events-none sticky-header-protection">
                <span className="text-[12px] font-bold text-white tracking-wide ml-2">9:41</span>
                <div className="flex gap-1.5 mr-2">
                    <span className="material-icons-round text-[14px] text-white">signal_cellular_4_bar</span>
                    <span className="material-icons-round text-[14px] text-white">wifi</span>
                    <span className="material-icons-round text-[14px] text-white">battery_full</span>
                </div>
            </div>

            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-gray-900 rounded-b-2xl z-40 pointer-events-none"></div>

            {/* Screen Content Area */}
            {/* Must be full height and handle its own scroll */}
            <div className="w-full h-full bg-[#1a1a1a] overflow-hidden">
                {children}
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-40 pointer-events-none"></div>
        </div>
    );
}
