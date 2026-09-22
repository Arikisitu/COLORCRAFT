import React, { useRef, useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Vector3 } from '../types';

interface ColorWheelProps {
  label: string;
  value: Vector3;
  onChange: (v: Vector3) => void;
  size?: number;
  description?: string;
}

const clamp = (v: number, mn: number, mx: number) => Math.max(mn, Math.min(mx, v));
const MAX_RADIUS = 0.3;

export const ColorWheel: React.FC<ColorWheelProps> = ({
  label,
  value,
  onChange,
  size = 120,
  description,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const [hovered, setHovered] = useState(false);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;

    ctx.clearRect(0, 0, size, size);

    // Draw color wheel
    const imageData = ctx.createImageData(size, size);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x - cx) / r;
        const dy = (y - cy) / r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 1) {
          const angle = Math.atan2(dy, dx);
          const hue = ((angle / (Math.PI * 2)) + 1) % 1;
          const sat = dist;
          // HSL to RGB
          const h = hue * 360;
          const s = sat;
          const l = 0.5;
          const c2 = (1 - Math.abs(2 * l - 1)) * s;
          const x2 = c2 * (1 - Math.abs((h / 60) % 2 - 1));
          const m = l - c2 / 2;
          let rr = 0, gg = 0, bb = 0;
          if (h < 60) { rr = c2; gg = x2; }
          else if (h < 120) { rr = x2; gg = c2; }
          else if (h < 180) { gg = c2; bb = x2; }
          else if (h < 240) { gg = x2; bb = c2; }
          else if (h < 300) { rr = x2; bb = c2; }
          else { rr = c2; bb = x2; }
          const idx = (y * size + x) * 4;
          // Fade to gray at center
          const fade = dist;
          imageData.data[idx] = Math.round((rr + m) * fade * 255 + (1 - fade) * 128);
          imageData.data[idx + 1] = Math.round((gg + m) * fade * 255 + (1 - fade) * 128);
          imageData.data[idx + 2] = Math.round((bb + m) * fade * 255 + (1 - fade) * 128);
          imageData.data[idx + 3] = dist < 1 ? 255 : 0;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);

    // Ring border
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx, 4); ctx.lineTo(cx, size - 4);
    ctx.moveTo(4, cy); ctx.lineTo(size - 4, cy);
    ctx.stroke();

    // Dot position
    const dotX = cx + value.r * r / MAX_RADIUS;
    const dotY = cy + value.g * r / MAX_RADIUS;

    // Dot shadow
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(dotX, dotY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [size, value]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const getPosFromEvent = useCallback((e: MouseEvent | React.MouseEvent): Vector3 => {
    const canvas = canvasRef.current;
    if (!canvas) return value;
    const rect = canvas.getBoundingClientRect();
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 4;
    const mx = (e.clientX - rect.left) * (size / rect.width) - cx;
    const my = (e.clientY - rect.top) * (size / rect.height) - cy;
    const dist = Math.sqrt(mx * mx + my * my);
    const maxDist = r;
    const scale = dist > maxDist ? maxDist / dist : 1;
    return {
      r: clamp((mx * scale / r) * MAX_RADIUS, -MAX_RADIUS, MAX_RADIUS),
      g: clamp((my * scale / r) * MAX_RADIUS, -MAX_RADIUS, MAX_RADIUS),
      b: value.b,
    };
  }, [value, size]);

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    onChange(getPosFromEvent(e));
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging.current) onChange(getPosFromEvent(e));
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [getPosFromEvent, onChange]);

  const isDefault = Math.abs(value.r) < 0.002 && Math.abs(value.g) < 0.002;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        {!isDefault && (
          <button
            onClick={() => onChange({ r: 0, g: 0, b: value.b })}
            className="text-gray-600 hover:text-orange-400 transition-colors"
            aria-label={`Reset ${label} wheel`}
          >
            <RotateCcw size={10} />
          </button>
        )}
      </div>
      <div
        className="relative cursor-crosshair"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onMouseDown={handleMouseDown}
          style={{ borderRadius: '50%', display: 'block' }}
        />
      </div>
      <div className="flex gap-3 text-xs font-mono text-gray-500">
        <span>R: <span className={value.r !== 0 ? 'text-red-400' : ''}>{(value.r * 10).toFixed(2)}</span></span>
        <span>G: <span className={value.g !== 0 ? 'text-green-400' : ''}>{(value.g * 10).toFixed(2)}</span></span>
      </div>
      {description && hovered && (
        <div className="text-xs text-gray-500 text-center max-w-[120px] leading-relaxed">
          {description}
        </div>
      )}
    </div>
  );
};
