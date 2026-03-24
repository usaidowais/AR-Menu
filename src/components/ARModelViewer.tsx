import React from 'react';

interface ARModelViewerProps {
    src: string;
    poster: string;
    alt: string;
    onView?: () => void;
}

export const ARModelViewer: React.FC<ARModelViewerProps> = ({ src, poster, alt, onView }) => {
    const [loadError, setLoadError] = React.useState<string | null>(null);
    const handleARStart = () => {
        if (onView) onView();
    };

    const ModelViewer = 'model-viewer' as any;

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-gray-50 border-4 border-yellow-400">
            {/* DEBUG OVERLAY */}
            <div className="absolute top-0 left-0 bg-yellow-400 text-black p-1 z-50 text-[10px] font-mono w-full text-center font-bold">
                VIEWER V2 - SRC: {src || "EMPTY"}
            </div>

            {loadError && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 px-4 text-center">
                    <p className="text-red-500 font-bold bg-white p-2 rounded">{loadError}</p>
                </div>
            )}

            <ModelViewer
                src={src}
                // REMOVED POSTER
                alt={alt}
                shadow-intensity="1"
                camera-controls
                touch-action="pan-y"
                ar
                ar-scale="fixed"
                crossorigin="anonymous"
                ar-modes="webxr scene-viewer quick-look"
                onError={(e: any) => {
                    console.error("ARModelViewer error:", e);
                    setLoadError("Model Failed: Check Console");
                    alert("Model Failed to Load (Viewer V2)");
                }}
                on-ar-status={(e: any) => {
                    if (e.detail.status === 'session-started') handleARStart();
                }}
                class="w-full h-full"
            >
                <button slot="ar-button" className="absolute bottom-4 right-4 bg-[#001f3f] text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 z-50">
                    <span className="material-icons-round text-lg">view_in_ar</span>
                    View in AR
                </button>

                {/* REMOVED POSTER SLOT */}
            </ModelViewer>

            <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 border border-white/50 mt-6">
                AR Scale: 1:1 Fixed
            </div>
        </div>
    );
};
