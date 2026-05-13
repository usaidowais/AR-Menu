'use client';

import React, { useState, useCallback } from 'react';
import { captureARRender } from '@/lib/utils/captureUtils';

// ─── Types ───────────────────────────────────────────────────────

interface CaptureOverlayProps {
  modelViewerRef: React.RefObject<HTMLElement | null>;
  dishName: string;
  restaurantName: string;
}

// ─── Component ───────────────────────────────────────────────────

export const CaptureOverlay: React.FC<CaptureOverlayProps> = ({
  modelViewerRef,
  dishName,
  restaurantName,
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  React.useEffect(() => {
    console.log("[CaptureOverlay] Mounted for:", dishName);
  }, [dishName]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return; // Prevent double-clicks

    setIsCapturing(true);
    setIsFlashing(true);

    // Trigger the flash animation (100ms)
    setTimeout(() => setIsFlashing(false), 150);

    try {
      await captureARRender(modelViewerRef.current, {
        dishName,
        restaurantName,
      });
    } catch (error) {
      console.error('[CaptureOverlay] Capture error:', error);
    } finally {
      // Re-enable button after a short delay to prevent rapid-fire
      setTimeout(() => setIsCapturing(false), 500);
    }
  }, [isCapturing, modelViewerRef, dishName, restaurantName]);

  return (
    <>
      {/* ── Shutter Flash Overlay ──────────────────────────────── */}
      {isFlashing && (
        <div
          className="absolute inset-0 z-[1000] pointer-events-none animate-shutter-flash"
          style={{ backgroundColor: 'white' }}
          aria-hidden="true"
        />
      )}

      {/* ── Shutter Button Container ──────────────────────────── */}
      {/* pointer-events: none on the wrapper keeps AR interactive */}
      <div
        className="absolute bottom-52 left-0 right-0 z-[999] flex flex-col items-center pointer-events-none"
        id="capture-overlay"
      >
        {/* Shutter Button — double-ring camera style */}
        <button
          id="ar-capture-button"
          onClick={handleCapture}
          disabled={isCapturing}
          className="pointer-events-auto group relative flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-50"
          aria-label="Capture AR screenshot"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {/* Outer Ring */}
          <div
            className="w-[68px] h-[68px] rounded-full border-[3px] border-white/90 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all duration-150 group-hover:border-white group-active:border-white/60"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Inner Circle */}
            <div
              className="w-[52px] h-[52px] rounded-full transition-all duration-100 group-active:scale-90 group-active:bg-white/70"
              style={{
                background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,1) 0%, rgba(240,240,240,1) 100%)',
                boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.2)',
              }}
            />
          </div>
        </button>

        {/* "CAPTURE" Label */}
        <span
          className="mt-2 text-[10px] font-medium tracking-[2px] uppercase select-none"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          CAPTURE
        </span>
      </div>
    </>
  );
};
