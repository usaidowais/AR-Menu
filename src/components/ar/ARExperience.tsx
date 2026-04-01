'use client';
import React, { useState, useEffect, useRef } from 'react';

interface ARExperienceProps {
    src: string;
    iosSrc?: string;
    alt: string;
    dishName: string;
    dishPrice: string | number;
    secondaryColor?: string;
    arScale?: number;
    onClose: () => void;
}

export const ARExperience: React.FC<ARExperienceProps> = ({
    src: modelUrl,
    iosSrc,
    alt,
    dishName,
    dishPrice,
    secondaryColor = '#FFD700',
    arScale = 1.0,
    onClose
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const modelViewerRef = useRef<HTMLElement>(null);

    // Log what we received
    console.log("AR COMPONENT RECEIVED URL:", modelUrl);

    // STRICT CHECK: No fallbacks. If empty, show error.
    // FIREWALL: Explicitly block the Astronaut URL if it comes from the DB
    const isAstronaut = modelUrl?.includes('Astronaut.glb');
    const isValidUrl = modelUrl && modelUrl.trim() !== '' && !isAstronaut;

    useEffect(() => {
        const viewer = modelViewerRef.current;
        if (!viewer) return;

        // 1. Success Handler
        const handleLoad = () => {
            console.log("Model Loaded Successfully! (Event Listener)");
            setIsLoading(false);
        };

        // 2. Error Handler
        const handleError = (e: any) => {
            console.error("Model Failed (Event Listener):", e);
            setHasError(true);
            setIsLoading(false);
        };

        // 3. Attach Listeners Manually (Bulletproof)
        viewer.addEventListener('load', handleLoad);
        viewer.addEventListener('error', handleError);

        // 4. Safety Timeout (Fallback)
        // If the model loads super fast (cached) or event is missed, force hide loader after 5 seconds.
        const safetyTimer = setTimeout(() => {
            if (isLoading) {
                console.warn("Safety timer triggered: Forcing loader hide.");
                setIsLoading(false);
            }
        }, 5000);

        return () => {
            viewer.removeEventListener('load', handleLoad);
            viewer.removeEventListener('error', handleError);
            clearTimeout(safetyTimer);
        };
    }, []); // Run once on mount

    if (!isValidUrl) {
        return (
            <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white p-4">
                <div className="text-red-500 font-bold text-xl mb-2">NO 3D FILE FOUND</div>
                <p className="text-center text-sm">
                    The database `model_url` is empty for this dish.
                    <br />
                    Please go to the Dish Editor and upload a .glb file.
                </p>
                <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-white text-black rounded font-bold"
                >
                    Close
                </button>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-50 bg-black">
            {/* Debug Source Label */}
            <div className="absolute top-4 left-4 z-[60] bg-black/50 text-white text-[10px] px-2 py-1 rounded max-w-[250px] break-all">
                SRC: {modelUrl}
            </div>

            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[70] bg-white text-black w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg hover:bg-gray-100 active:scale-95 transition-all"
            >
                ✕
            </button>

            {/* Loading Indicator - Only shows while loading */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 z-[65] flex flex-col items-center justify-center bg-black">
                    <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                    <span className="text-white/70 text-sm">Loading 3D Model...</span>
                </div>
            )}

            {/* Error Overlay */}
            {hasError && (
                <div className="absolute inset-0 z-[65] flex flex-col items-center justify-center bg-black/90 text-center p-4">
                    <div className="text-red-500 font-bold text-xl mb-2">Failed to Load Model</div>
                    <p className="text-white/60 text-sm">Check CORS settings or file URL.</p>
                    <button
                        onClick={onClose}
                        className="mt-4 px-4 py-2 bg-white text-black rounded font-bold"
                    >
                        Close
                    </button>
                </div>
            )}

            {/* @ts-ignore - model-viewer is a web component */}
            <model-viewer
                ref={modelViewerRef}
                src={modelUrl}
                ios-src={iosSrc || modelUrl}
                alt={alt}
                scale={`${arScale} ${arScale} ${arScale}`}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                shadow-intensity="1"
                exposure="1"
                ar-scale="fixed"
                ar-placement="floor"
                touch-action="pan-y"
                style={{ width: '100%', height: '100%', backgroundColor: '#1a1a1a' }}
                crossorigin="anonymous"
                loading="eager"
                reveal="auto"
                environment-image="neutral"
            >
                {/* Native Loading Progress Bar Slot */}
                <div slot="progress-bar" className="absolute inset-0 z-[65] flex flex-col items-center justify-center bg-black">
                    <div className="w-10 h-10 border-3 border-neutral-700 border-t-white rounded-full animate-spin mb-4"></div>
                    <span className="text-white/70 text-sm font-medium tracking-wide">Loading 3D Model...</span>
                </div>

                {/* AR Prompt Slot */}
                <div slot="ar-prompt" className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none w-full px-6">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-white text-xl animate-pulse">view_in_ar</span>
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-white text-sm font-bold tracking-wide">Ready to Place</span>
                            <span className="text-white/70 text-xs">Point camera at a flat surface</span>
                        </div>
                    </div>
                </div>
                {/* @ts-ignore */}
            </model-viewer>

            {/* Bottom Info Card */}
            <div className="absolute bottom-6 left-4 right-4 z-[60] pointer-events-none">
                <div className="bg-white/95 backdrop-blur-2xl rounded-2xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/50 pointer-events-auto">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 font-serif leading-tight">{dishName}</h2>
                            <p className="text-gray-500 text-[10px] mt-0.5 uppercase tracking-wider font-bold">AR Preview</p>
                        </div>
                        <span
                            className="text-base font-bold font-serif px-2 py-1 bg-gray-100 rounded-lg"
                            style={{ color: secondaryColor }}
                        >
                            {typeof dishPrice === 'number' ? `PKR ${dishPrice}` : dishPrice}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
