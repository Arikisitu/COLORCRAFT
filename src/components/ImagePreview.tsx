import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GradeState, ViewMode } from '../types';
import { initWebGLEngine, extractPixelData, WebGLEngine } from '../lib/webglEngine';
import { useStore } from '../lib/store';

interface ImagePreviewProps {
  src: string;
  grade: GradeState;
  viewMode: ViewMode;
  onPixelsReady?: (pixels: Uint8Array, w: number, h: number) => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  grade,
  viewMode,
  onPixelsReady,
  className,
}) => {
  const gradedCanvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WebGLEngine | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const sliderRef = useRef<number>(50);
  const [sliderPct, setSliderPct] = useState(50);
  const [dragging, setDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const rafRef = useRef<number | null>(null);
  const { webGLAvailable, setWebGLAvailable } = useStore();

  const initEngine = useCallback(() => {
    const canvas = gradedCanvasRef.current;
    if (!canvas) return;
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    const engine = initWebGLEngine(canvas);
    if (!engine) {
      setWebGLAvailable(false);
      return;
    }
    engineRef.current = engine;
    setWebGLAvailable(true);
  }, [setWebGLAvailable]);

  useEffect(() => {
    initEngine();
    return () => {
      if (engineRef.current) engineRef.current.destroy();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initEngine]);

  useEffect(() => {
    if (!src) return;
    setLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      const canvas = gradedCanvasRef.current;
      const origCanvas = originalCanvasRef.current;
      if (canvas) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }
      if (origCanvas) {
        origCanvas.width = img.naturalWidth;
        origCanvas.height = img.naturalHeight;
        const ctx = origCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
      if (engineRef.current) {
        engineRef.current.updateTexture(img);
      }
      setLoaded(true);
    };
    img.onerror = () => setLoaded(true);
    img.src = src;
  }, [src]);

  // Render on grade change
  useEffect(() => {
    if (!loaded || !engineRef.current) return;
    const engine = engineRef.current;
    engine.render(grade);
    // Extract pixels for scopes (always use same small region)
    if (onPixelsReady && gradedCanvasRef.current) {
      const canvas = gradedCanvasRef.current;
      // Read a small region for scope calculation
      const sw = Math.min(canvas.width, 160);
      const sh = Math.min(canvas.height, 120);
      if (sw > 0 && sh > 0) {
        try {
          const pixels = extractPixelData(engine.gl, sw, sh);
          onPixelsReady(pixels, sw, sh);
        } catch (_e) {
          // Ignore extraction errors
        }
      }
    }
  }, [grade, loaded, onPixelsReady]);

  // Before/after slider drag
  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const container = gradedCanvasRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      sliderRef.current = pct;
      setSliderPct(pct);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  if (!webGLAvailable) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 rounded border border-gray-700 p-6 ${className}`}>
        <div className="text-center">
          <p className="text-yellow-500 font-medium mb-1">WebGL Unavailable</p>
          <p className="text-gray-500 text-sm">Interactive preview unavailable in this browser. The lesson below explains the actual Resolve workflow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded border border-gray-800 bg-black ${className}`}>
      {/* Loading */}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Original canvas (for comparison) */}
      <canvas
        ref={originalCanvasRef}
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          display: (viewMode === 'toggle' && showOriginal) || viewMode === 'split' || viewMode === 'slider' ? 'block' : 'none',
          clipPath: viewMode === 'slider' ? `inset(0 ${100 - sliderPct}% 0 0)` : viewMode === 'split' ? 'inset(0 50% 0 0)' : 'none',
          objectFit: 'contain',
        }}
      />

      {/* Graded canvas */}
      <canvas
        ref={gradedCanvasRef}
        className="w-full h-full object-contain"
        style={{
          display: viewMode === 'toggle' && showOriginal ? 'none' : 'block',
          clipPath: viewMode === 'slider' ? `inset(0 0 0 ${sliderPct}%)` : viewMode === 'split' ? 'inset(0 0 0 50%)' : 'none',
          objectFit: 'contain',
        }}
      />

      {/* Slider handle */}
      {viewMode === 'slider' && (
        <>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow cursor-ew-resize"
            style={{ left: `${sliderPct}%`, transform: 'translateX(-50%)' }}
            onMouseDown={handleSliderMouseDown}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="flex gap-0.5">
                <div className="w-0.5 h-3 bg-gray-600 rounded" />
                <div className="w-0.5 h-3 bg-gray-600 rounded" />
              </div>
            </div>
          </div>
          <div className="absolute top-2 left-3 text-xs font-medium text-white/70 bg-black/50 px-1.5 py-0.5 rounded">ORIGINAL</div>
          <div className="absolute top-2 right-3 text-xs font-medium text-white/70 bg-black/50 px-1.5 py-0.5 rounded">GRADED</div>
        </>
      )}

      {/* Split labels */}
      {viewMode === 'split' && (
        <>
          <div className="absolute top-2 left-3 text-xs font-medium text-white/70 bg-black/50 px-1.5 py-0.5 rounded">ORIGINAL</div>
          <div className="absolute top-2 right-3 text-xs font-medium text-white/70 bg-black/50 px-1.5 py-0.5 rounded">GRADED</div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/30" />
        </>
      )}

      {/* Toggle */}
      {viewMode === 'toggle' && (
        <button
          onClick={() => setShowOriginal(s => !s)}
          className="absolute bottom-3 right-3 text-xs font-medium text-white/80 bg-black/60 border border-white/20 px-2.5 py-1 rounded hover:bg-black/80 transition-colors"
        >
          {showOriginal ? 'ORIGINAL' : 'GRADED'}
        </button>
      )}
    </div>
  );
};
