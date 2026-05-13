/**
 * captureUtils.ts
 * ─────────────────────────────────────────────────────────────────
 * Professional-grade AR composite capture pipeline.
 *
 * Solves the "black background" problem by compositing:
 *   1. Live camera feed (via getUserMedia <video>)
 *   2. model-viewer's WebGL canvas (transparent, on top)
 *   3. Branded watermark bar
 *
 * Also provides a video recording pipeline using MediaRecorder
 * on a composite canvas stream.
 *
 * Handles memory cleanup to prevent leaks during long AR sessions.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface CaptureOptions {
  dishName: string;
  restaurantName: string;
  quality?: number; // 0–1, defaults to 0.95
}

export interface VideoRecordingHandle {
  stop: () => void;
}

// Extend the HTMLElement type for model-viewer's API
interface ModelViewerElement extends HTMLElement {
  toBlob: (options?: { mimeType?: string; qualityArgument?: number }) => Promise<Blob>;
  shadowRoot: ShadowRoot | null;
}

// ─── Constants ───────────────────────────────────────────────────

const WATERMARK_BAR_HEIGHT = 80;
const GRADIENT_HEIGHT = 120;
const FONT_SERIF = '"Georgia", "Times New Roman", "Playfair Display", serif';
const FONT_SANS = '"Inter", "Helvetica Neue", Arial, sans-serif';

// ─── Helpers ─────────────────────────────────────────────────────

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')
    .substring(0, 50);
}

function isIOSSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return isIOS && isSafari;
}

// ─── Camera Feed Access ─────────────────────────────────────────

/** Cached camera stream — shared across captures to avoid re-prompting */
let _cameraStream: MediaStream | null = null;
let _videoElement: HTMLVideoElement | null = null;

/**
 * Gets or creates a live camera feed video element.
 * Returns null if camera access is denied or unavailable.
 */
async function getCameraVideoElement(): Promise<HTMLVideoElement | null> {
  // Check if we already have a playing video
  if (_videoElement && _videoElement.readyState >= 2 && !_videoElement.paused) {
    return _videoElement;
  }

  // Try to find an existing <video> element on the page (some AR setups inject one)
  const existingVideo = document.querySelector('video[autoplay]') as HTMLVideoElement | null;
  if (existingVideo && existingVideo.readyState >= 2 && existingVideo.videoWidth > 0) {
    console.log('[CaptureUtils] Found existing camera <video> element.');
    _videoElement = existingVideo;
    return existingVideo;
  }

  // Request camera access via getUserMedia
  try {
    if (!_cameraStream || !_cameraStream.active) {
      _cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // rear camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    }

    const video = document.createElement('video');
    video.srcObject = _cameraStream;
    video.setAttribute('playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.muted = true;
    video.style.position = 'fixed';
    video.style.top = '-9999px'; // Hidden off-screen
    video.style.left = '-9999px';
    video.style.width = '1px';
    video.style.height = '1px';
    document.body.appendChild(video);

    await video.play();
    // Wait for at least one frame to be available
    await new Promise<void>((resolve) => {
      const check = () => {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          resolve();
        } else {
          requestAnimationFrame(check);
        }
      };
      check();
      // Safety timeout
      setTimeout(resolve, 2000);
    });

    _videoElement = video;
    console.log('[CaptureUtils] Camera feed acquired:', video.videoWidth, 'x', video.videoHeight);
    return video;
  } catch (err) {
    console.warn('[CaptureUtils] Camera access unavailable, will capture model-only:', err);
    return null;
  }
}

/**
 * Get the WebGL canvas from inside model-viewer's Shadow DOM.
 */
function getModelViewerCanvas(viewer: ModelViewerElement): HTMLCanvasElement | null {
  // model-viewer hides its canvas inside Shadow DOM
  const canvas = viewer.shadowRoot?.querySelector('canvas') as HTMLCanvasElement | null;
  return canvas;
}

// ─── Composite Frame Capture ────────────────────────────────────

/**
 * Creates a composite frame: camera feed + model-viewer overlay.
 * If camera feed is unavailable, falls back to model-only capture.
 */
async function captureCompositeFrame(
  viewer: ModelViewerElement,
  quality: number
): Promise<Blob | null> {
  const mvCanvas = getModelViewerCanvas(viewer);
  const cameraVideo = await getCameraVideoElement();

  // Determine output dimensions
  const width = mvCanvas?.width || cameraVideo?.videoWidth || 1080;
  const height = mvCanvas?.height || cameraVideo?.videoHeight || 1920;

  const compositeCanvas = document.createElement('canvas');
  compositeCanvas.width = width;
  compositeCanvas.height = height;
  const ctx = compositeCanvas.getContext('2d');
  if (!ctx) return null;

  // Layer 1: Camera feed (background)
  if (cameraVideo && cameraVideo.readyState >= 2 && cameraVideo.videoWidth > 0) {
    ctx.drawImage(cameraVideo, 0, 0, width, height);
    console.log('[CaptureUtils] Drew camera feed layer.');
  } else {
    // No camera — fill with a subtle dark gradient instead of pure black
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#1a1a2e');
    bgGrad.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    console.log('[CaptureUtils] No camera feed, using gradient background.');
  }

  // Layer 2: Model-viewer WebGL canvas (transparent overlay)
  if (mvCanvas && mvCanvas.width > 0 && mvCanvas.height > 0) {
    ctx.drawImage(mvCanvas, 0, 0, width, height);
    console.log('[CaptureUtils] Drew model-viewer canvas layer.');
  } else {
    // Fallback: try model-viewer's native toBlob
    console.warn('[CaptureUtils] No shadow DOM canvas, trying toBlob() fallback.');
    if (typeof viewer.toBlob === 'function') {
      try {
        const blob = await viewer.toBlob({ mimeType: 'image/png', qualityArgument: quality });
        if (blob && blob.size > 0) {
          const img = await loadImage(blob);
          ctx.drawImage(img, 0, 0, width, height);
        }
      } catch (e) {
        console.error('[CaptureUtils] toBlob fallback also failed:', e);
      }
    }
  }

  // Export the composite
  return new Promise<Blob | null>((resolve) => {
    compositeCanvas.toBlob(
      (blob) => {
        // Cleanup
        compositeCanvas.width = 0;
        compositeCanvas.height = 0;
        resolve(blob);
      },
      'image/png',
      quality
    );
  });
}

// ─── Core Photo Capture ─────────────────────────────────────────

/**
 * Captures a composite AR frame (camera + model), applies branded
 * watermark, and triggers download.
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
    // Step 1: Composite capture (camera + model)
    const rawBlob = await captureCompositeFrame(modelViewerEl as ModelViewerElement, quality);
    if (!rawBlob) {
      console.error('[CaptureUtils] Failed to capture composite frame.');
      return;
    }

    // Step 2: Watermark
    const watermarkedBlob = await compositeWatermark(rawBlob, dishName, restaurantName, quality);
    if (!watermarkedBlob) {
      console.error('[CaptureUtils] Failed to composite watermark.');
      return;
    }

    // Step 3: Download
    const filename = `${sanitizeFilename(dishName)}_VisionDine_Capture.png`;
    triggerDownload(watermarkedBlob, filename);
  } catch (error) {
    console.error('[CaptureUtils] Capture failed:', error);
  }
}

// ─── Video Recording ────────────────────────────────────────────

/**
 * Starts recording a composite video (camera feed + model overlay).
 * Returns a handle with a stop() method that triggers the download.
 *
 * Uses a render loop that continuously composites camera + model
 * onto a hidden canvas, then captures the canvas stream via MediaRecorder.
 */
export function startVideoRecording(
  modelViewerEl: HTMLElement | null,
  options: CaptureOptions
): VideoRecordingHandle | null {
  if (!modelViewerEl) {
    console.error('[CaptureUtils] No model-viewer element for video recording.');
    return null;
  }

  const viewer = modelViewerEl as ModelViewerElement;
  const mvCanvas = getModelViewerCanvas(viewer);

  // Create the composite canvas for recording
  const recordCanvas = document.createElement('canvas');
  const width = mvCanvas?.width || 1080;
  const height = mvCanvas?.height || 1920;
  recordCanvas.width = width;
  recordCanvas.height = height;
  const ctx = recordCanvas.getContext('2d');

  if (!ctx) {
    console.error('[CaptureUtils] Could not get 2D context for video recording.');
    return null;
  }

  // Start the composite render loop
  let animFrameId: number;
  let isRecording = true;

  const renderFrame = () => {
    if (!isRecording) return;

    // Layer 1: Camera feed
    if (_videoElement && _videoElement.readyState >= 2 && _videoElement.videoWidth > 0) {
      ctx.drawImage(_videoElement, 0, 0, width, height);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#1a1a2e');
      bgGrad.addColorStop(1, '#16213e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Layer 2: Model-viewer canvas
    if (mvCanvas && mvCanvas.width > 0 && mvCanvas.height > 0) {
      ctx.drawImage(mvCanvas, 0, 0, width, height);
    }

    animFrameId = requestAnimationFrame(renderFrame);
  };

  renderFrame();

  // Capture the canvas stream
  const stream = recordCanvas.captureStream(30); // 30 FPS
  const chunks: Blob[] = [];

  // Determine best supported MIME type
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
    ? 'video/webm;codecs=vp9'
    : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
      ? 'video/webm;codecs=vp8'
      : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

  let recorder: MediaRecorder;
  try {
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5_000_000, // 5 Mbps for high quality
    });
  } catch (e) {
    console.error('[CaptureUtils] MediaRecorder init failed:', e);
    isRecording = false;
    cancelAnimationFrame(animFrameId!);
    return null;
  }

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.onstop = () => {
    isRecording = false;
    cancelAnimationFrame(animFrameId);

    const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
    const blob = new Blob(chunks, { type: mimeType });
    const filename = `VisionDine_${sanitizeFilename(options.dishName)}_Video.${ext}`;
    triggerDownload(blob, filename);

    // Cleanup
    recordCanvas.width = 0;
    recordCanvas.height = 0;
    stream.getTracks().forEach((t) => t.stop());
    console.log('[CaptureUtils] Video recording saved:', filename);
  };

  recorder.start(100); // Collect data every 100ms
  console.log('[CaptureUtils] Video recording started, MIME:', mimeType);

  return {
    stop: () => {
      if (recorder.state === 'recording') {
        recorder.stop();
      }
    },
  };
}

/**
 * Pre-warm the camera feed so it's ready for instant capture.
 * Call this when the AR experience mounts.
 */
export async function prewarmCamera(): Promise<void> {
  try {
    await getCameraVideoElement();
  } catch {
    // Silently fail — capture will use fallback background
  }
}

/**
 * Release the camera stream and clean up resources.
 * Call this when the AR experience unmounts.
 */
export function releaseCamera(): void {
  if (_videoElement) {
    _videoElement.pause();
    _videoElement.srcObject = null;
    if (_videoElement.parentNode) {
      _videoElement.parentNode.removeChild(_videoElement);
    }
    _videoElement = null;
  }
  if (_cameraStream) {
    _cameraStream.getTracks().forEach((t) => t.stop());
    _cameraStream = null;
  }
  console.log('[CaptureUtils] Camera resources released.');
}

// ─── Watermark Compositing ──────────────────────────────────────

async function compositeWatermark(
  sourceBlob: Blob,
  dishName: string,
  restaurantName: string,
  quality: number
): Promise<Blob | null> {
  const img = await loadImage(sourceBlob);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  canvas.width = img.width;
  canvas.height = img.height;

  // Draw the captured frame
  ctx.drawImage(img, 0, 0);

  // Dark gradient at bottom
  const gradientStartY = canvas.height - GRADIENT_HEIGHT;
  const gradient = ctx.createLinearGradient(0, gradientStartY, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradientStartY, canvas.width, GRADIENT_HEIGHT);

  // Dish name (left)
  const padding = Math.max(20, canvas.width * 0.04);
  const dishFontSize = Math.max(16, Math.min(24, canvas.width * 0.04));
  const restaurantFontSize = Math.max(12, Math.min(18, canvas.width * 0.03));
  const baselineY = canvas.height - (WATERMARK_BAR_HEIGHT / 2) + (dishFontSize / 3);

  ctx.font = `bold ${dishFontSize}px ${FONT_SERIF}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;
  ctx.fillText(dishName, padding, baselineY);

  // Restaurant name (right)
  ctx.font = `500 ${restaurantFontSize}px ${FONT_SANS}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.textAlign = 'right';
  ctx.fillText(restaurantName, canvas.width - padding, baselineY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Thin separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - WATERMARK_BAR_HEIGHT);
  ctx.lineTo(canvas.width - padding, canvas.height - WATERMARK_BAR_HEIGHT);
  ctx.stroke();

  // Export
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => {
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
    const newTab = window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    if (!newTab) {
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

  requestAnimationFrame(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  });
}
