/**
 * captureUtils.ts
 * ─────────────────────────────────────────────────────────────────
 * Professional-grade AR canvas capture with branded watermarking.
 * Designed for <model-viewer> elements with Shadow DOM canvases.
 * Handles memory cleanup to prevent leaks during long AR sessions.
 */

// ─── Types ───────────────────────────────────────────────────────

interface CaptureOptions {
  dishName: string;
  restaurantName: string;
  quality?: number; // 0–1, defaults to 0.95
}

// Extend the HTMLElement type for model-viewer's API
interface ModelViewerElement extends HTMLElement {
  toBlob: (options?: { mimeType?: string; qualityArgument?: number }) => Promise<Blob>;
  shadowRoot: ShadowRoot | null;
}

// ─── Constants ───────────────────────────────────────────────────

const WATERMARK_BAR_HEIGHT = 80;
const GRADIENT_HEIGHT = 120; // Gradient extends above the bar for a smooth fade
const FONT_SERIF = '"Georgia", "Times New Roman", "Playfair Display", serif';
const FONT_SANS = '"Inter", "Helvetica Neue", Arial, sans-serif';

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Sanitize a string for use in a filename.
 * Replaces spaces with underscores, strips special characters.
 */
function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .substring(0, 50); // Cap length for filesystem safety
}

/**
 * Detect iOS Safari where <a download> is not supported.
 */
function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

// ─── Core Capture Function ──────────────────────────────────────

/**
 * Captures the current AR render from a <model-viewer> element,
 * composites a branded watermark, and triggers a download.
 *
 * @param modelViewerEl - The <model-viewer> DOM element
 * @param options - Dish name, restaurant name, and quality settings
 * @returns Promise that resolves when download is triggered
 */
export async function captureARRender(
  modelViewerEl: HTMLElement | null,
  options: CaptureOptions
): Promise<void> {
  if (!modelViewerEl) {
    console.error('[CaptureUtils] No model-viewer element provided.');
    return;
  }

  const { dishName, restaurantName, quality = 0.95 } = options;

  try {
    // ── Step 1: Capture the raw frame ──────────────────────────
    const rawBlob = await captureFrame(modelViewerEl as ModelViewerElement, quality);
    if (!rawBlob) {
      console.error('[CaptureUtils] Failed to capture frame from model-viewer.');
      return;
    }

    // ── Step 2: Composite watermark onto the frame ─────────────
    const watermarkedBlob = await compositeWatermark(rawBlob, dishName, restaurantName, quality);
    if (!watermarkedBlob) {
      console.error('[CaptureUtils] Failed to composite watermark.');
      return;
    }

    // ── Step 3: Trigger download ───────────────────────────────
    const filename = `${sanitizeFilename(dishName)}_VisionDine_Capture.png`;
    triggerDownload(watermarkedBlob, filename);

  } catch (error) {
    console.error('[CaptureUtils] Capture failed:', error);
  }
}

// ─── Frame Capture ──────────────────────────────────────────────

/**
 * Extracts a frame from the model-viewer.
 * Primary: uses model-viewer's native toBlob() API.
 * Fallback: accesses the Shadow DOM canvas directly.
 */
async function captureFrame(
  viewer: ModelViewerElement,
  quality: number
): Promise<Blob | null> {
  // Primary: model-viewer's built-in toBlob() (handles preserveDrawingBuffer internally)
  if (typeof viewer.toBlob === 'function') {
    try {
      const blob = await viewer.toBlob({
        mimeType: 'image/png',
        qualityArgument: quality,
      });
      if (blob && blob.size > 0) return blob;
    } catch (e) {
      console.warn('[CaptureUtils] toBlob() failed, trying Shadow DOM fallback:', e);
    }
  }

  // Fallback: reach into the Shadow DOM for the raw WebGL canvas
  const canvas = viewer.shadowRoot?.querySelector('canvas');
  if (!canvas) {
    console.error('[CaptureUtils] Could not find canvas inside model-viewer Shadow DOM.');
    return null;
  }

  return new Promise<Blob | null>((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      (blob) => resolve(blob),
      'image/png',
      quality
    );
  });
}

// ─── Watermark Compositing ──────────────────────────────────────

/**
 * Takes the raw capture blob, draws it onto a temporary 2D canvas,
 * adds a branded watermark bar at the bottom, and returns the final blob.
 */
async function compositeWatermark(
  sourceBlob: Blob,
  dishName: string,
  restaurantName: string,
  quality: number
): Promise<Blob | null> {
  // Load the source image
  const img = await loadImage(sourceBlob);

  // Create the compositing canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = img.width;
  canvas.height = img.height;

  // ── Draw the captured frame ──────────────────────────────────
  ctx.drawImage(img, 0, 0);

  // ── Draw dark gradient at bottom ─────────────────────────────
  const gradientStartY = canvas.height - GRADIENT_HEIGHT;
  const gradient = ctx.createLinearGradient(0, gradientStartY, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradientStartY, canvas.width, GRADIENT_HEIGHT);

  // ── Draw dish name (left side) ───────────────────────────────
  const padding = Math.max(20, canvas.width * 0.04);
  const dishFontSize = Math.max(16, Math.min(24, canvas.width * 0.04));
  const restaurantFontSize = Math.max(12, Math.min(18, canvas.width * 0.03));
  const baselineY = canvas.height - (WATERMARK_BAR_HEIGHT / 2) + (dishFontSize / 3);

  // Dish name — premium serif, bold
  ctx.font = `bold ${dishFontSize}px ${FONT_SERIF}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Add subtle text shadow for extra readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.fillText(dishName, padding, baselineY);

  // ── Draw restaurant name (right side) ────────────────────────
  ctx.font = `500 ${restaurantFontSize}px ${FONT_SANS}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.textAlign = 'right';
  ctx.fillText(restaurantName, canvas.width - padding, baselineY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // ── Draw thin separator line ─────────────────────────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - WATERMARK_BAR_HEIGHT);
  ctx.lineTo(canvas.width - padding, canvas.height - WATERMARK_BAR_HEIGHT);
  ctx.stroke();

  // ── Export final image ───────────────────────────────────────
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => {
        // Cleanup the temp canvas
        canvas.width = 0;
        canvas.height = 0;
        resolve(blob);
      },
      'image/png',
      quality
    );
  });
}

// ─── Image Loading Helper ───────────────────────────────────────

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load captured image.'));
    };

    img.src = url;
  });
}

// ─── Download Trigger ───────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);

  if (isIOSSafari()) {
    // iOS Safari doesn't support <a download>, open in a new tab instead
    // User can then long-press to save to Photos
    const newTab = window.open(url, '_blank');
    // Revoke after a delay to give the tab time to load
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    if (!newTab) {
      // Popup blocked — fall through to the standard method
      downloadViaAnchor(url, filename);
    }
    return;
  }

  downloadViaAnchor(url, filename);
}

function downloadViaAnchor(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup after a tick
  requestAnimationFrame(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
}
