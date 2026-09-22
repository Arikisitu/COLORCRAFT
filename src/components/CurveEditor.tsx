import React, { useRef, useCallback, useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { CurvePoint } from '../types';

interface CurveEditorProps {
  points: CurvePoint[];
  onChange: (points: CurvePoint[]) => void;
  color?: string;
  label?: string;
  width?: number;
  height?: number;
}

const GRID_LINES = 4;

function catmullRom(p0: CurvePoint, p1: CurvePoint, p2: CurvePoint, p3: CurvePoint, t: number): CurvePoint {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

export const CurveEditor: React.FC<CurveEditorProps> = ({
  points,
  onChange,
  color = '#60a5fa',
  label = 'Y',
  width = 280,
  height = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingIdx = useRef<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const toCanvas = (p: CurvePoint) => ({
    x: p.x * width,
    y: (1 - p.y) * height,
  });

  const fromCanvas = (x: number, y: number): CurvePoint => ({
    x: Math.max(0, Math.min(1, x / width)),
    y: Math.max(0, Math.min(1, 1 - y / height)),
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let i = 1; i <= GRID_LINES; i++) {
      const x = (i / (GRID_LINES + 1)) * width;
      const y = (i / (GRID_LINES + 1)) * height;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Diagonal reference
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(width, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sorted points
    const sorted = [...points].sort((a, b) => a.x - b.x);

    // Draw filled area under curve
    if (sorted.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(0, height);

      const allPts = [
        { x: sorted[0].x - 0.01, y: sorted[0].y },
        ...sorted,
        { x: sorted[sorted.length - 1].x + 0.01, y: sorted[sorted.length - 1].y },
      ];

      // Draw via canvas to edge
      const first = toCanvas(sorted[0]);
      ctx.lineTo(first.x, first.y);

      for (let i = 0; i < allPts.length - 1; i++) {
        const p0 = allPts[Math.max(0, i - 1)];
        const p1 = allPts[i];
        const p2 = allPts[i + 1];
        const p3 = allPts[Math.min(allPts.length - 1, i + 2)];
        for (let t = 0; t <= 1; t += 0.05) {
          const pt = catmullRom(p0, p1, p2, p3, t);
          const cp = toCanvas(pt);
          ctx.lineTo(cp.x, cp.y);
        }
      }

      const last = toCanvas(sorted[sorted.length - 1]);
      ctx.lineTo(width, last.y);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fillStyle = `${color}18`;
      ctx.fill();
    }

    // Draw curve line
    if (sorted.length >= 2) {
      ctx.beginPath();
      const allPts = [
        { x: sorted[0].x - 0.01, y: sorted[0].y },
        ...sorted,
        { x: sorted[sorted.length - 1].x + 0.01, y: sorted[sorted.length - 1].y },
      ];

      let first = true;
      for (let i = 0; i < allPts.length - 1; i++) {
        const p0 = allPts[Math.max(0, i - 1)];
        const p1 = allPts[i];
        const p2 = allPts[i + 1];
        const p3 = allPts[Math.min(allPts.length - 1, i + 2)];
        for (let t = 0; t <= 1; t += 0.02) {
          const pt = catmullRom(p0, p1, p2, p3, t);
          const cp = toCanvas(pt);
          if (first) { ctx.moveTo(cp.x, cp.y); first = false; }
          else ctx.lineTo(cp.x, cp.y);
        }
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (sorted.length === 1) {
      const cp = toCanvas(sorted[0]);
      ctx.beginPath();
      ctx.moveTo(0, cp.y);
      ctx.lineTo(width, cp.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw control points
    sorted.forEach((pt, i) => {
      const cp = toCanvas(pt);
      const isHovered = hoveredIdx === i;
      const isDragging = draggingIdx.current === i;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, isDragging ? 7 : isHovered ? 6 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isDragging || isHovered ? color : '#1f2937';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    });
  }, [points, color, width, height, hoveredIdx]);

  useEffect(() => { draw(); }, [draw]);

  const getMousePt = (e: React.MouseEvent | MouseEvent): CurvePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    return fromCanvas(
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY
    );
  };

  const findNearestPoint = (pt: CurvePoint): number => {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    let nearest = -1;
    let minDist = 0.03;
    sorted.forEach((p, i) => {
      const d = Math.sqrt((p.x - pt.x) ** 2 + (p.y - pt.y) ** 2);
      if (d < minDist) { minDist = d; nearest = i; }
    });
    return nearest;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pt = getMousePt(e);
    const idx = findNearestPoint(pt);
    if (idx >= 0) {
      draggingIdx.current = idx;
    } else {
      // Add new point, but don't allow duplicate x positions
      const sorted = [...points].sort((a, b) => a.x - b.x);
      const tooClose = sorted.some(p => Math.abs(p.x - pt.x) < 0.03);
      if (!tooClose) {
        const newPts = [...points, pt].sort((a, b) => a.x - b.x);
        onChange(newPts);
        draggingIdx.current = newPts.findIndex(p => Math.abs(p.x - pt.x) < 0.005);
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const pt = getMousePt(e);
    const idx = findNearestPoint(pt);
    if (idx >= 0 && points.length > 2) {
      onChange(points.filter((_, i) => i !== idx));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pt = getMousePt(e);
    const idx = findNearestPoint(pt);
    setHoveredIdx(idx);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (draggingIdx.current === null) return;
      const pt = getMousePt(e);
      const sorted = [...points].sort((a, b) => a.x - b.x);
      const updated = sorted.map((p, i) =>
        i === draggingIdx.current ? pt : p
      );
      onChange(updated);
    };
    const onUp = () => { draggingIdx.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [points, onChange]);

  const isDefault = points.length === 2 &&
    Math.abs(points[0].x) < 0.01 && Math.abs(points[0].y) < 0.01 &&
    Math.abs(points[1].x - 1) < 0.01 && Math.abs(points[1].y - 1) < 0.01;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">{points.length} pts</span>
          {!isDefault && (
            <button
              onClick={() => onChange([{ x: 0, y: 0 }, { x: 1, y: 1 }])}
              className="text-gray-600 hover:text-orange-400 transition-colors"
              aria-label="Reset curve"
            >
              <RotateCcw size={10} />
            </button>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
        onDoubleClick={handleDoubleClick}
        className="cursor-crosshair rounded border border-gray-800"
        style={{ width: '100%', height: 'auto' }}
      />
      <p className="text-xs text-gray-600">Click to add • Double-click to remove • Drag to adjust</p>
    </div>
  );
};
