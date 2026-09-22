import React, { useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

interface ScopePanelProps {
  pixels: Uint8Array | null;
  width: number;
  height: number;
  type: 'histogram' | 'waveform' | 'parade' | 'vectorscope';
  className?: string;
}

const SCOPE_HEIGHT = 120;
const SCOPE_WIDTH = 240;

function drawHistogram(ctx: CanvasRenderingContext2D, pixels: Uint8Array, w: number, h: number) {
  const bins = 256;
  const rBins = new Float32Array(bins);
  const gBins = new Float32Array(bins);
  const bBins = new Float32Array(bins);

  for (let i = 0; i < pixels.length; i += 4) {
    rBins[pixels[i]]++;
    gBins[pixels[i + 1]]++;
    bBins[pixels[i + 2]]++;
  }

  const maxVal = Math.max(...rBins, ...gBins, ...bBins, 1);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo((i / 4) * w, 0);
    ctx.lineTo((i / 4) * w, h);
    ctx.stroke();
  }
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i / 3) * h);
    ctx.lineTo(w, (i / 3) * h);
    ctx.stroke();
  }

  const channels = [
    { bins: rBins, color: 'rgba(239,68,68,0.7)' },
    { bins: gBins, color: 'rgba(34,197,94,0.7)' },
    { bins: bBins, color: 'rgba(59,130,246,0.7)' },
  ];

  channels.forEach(({ bins: b, color }) => {
    ctx.beginPath();
    ctx.fillStyle = color.replace('0.7', '0.3');
    for (let i = 0; i < bins; i++) {
      const barH = (b[i] / maxVal) * h;
      const x = (i / bins) * w;
      const bw = w / bins;
      ctx.fillRect(x, h - barH, bw, barH);
    }
  });

  // Labels
  ctx.fillStyle = '#374151';
  ctx.font = '9px monospace';
  ctx.fillText('0', 2, h - 2);
  ctx.fillText('255', w - 22, h - 2);
}

function drawWaveform(ctx: CanvasRenderingContext2D, pixels: Uint8Array, srcW: number, srcH: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, w, h);

  // IRE grid lines
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.5;
  for (let ire = 0; ire <= 100; ire += 25) {
    const y = h - (ire / 100) * h;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const waveData = new Uint8Array(w * h).fill(0);

  for (let px = 0; px < srcW; px++) {
    const x = Math.floor((px / srcW) * w);
    for (let py = 0; py < srcH; py++) {
      const idx = (py * srcW + px) * 4;
      const r = pixels[idx] / 255;
      const g = pixels[idx + 1] / 255;
      const b = pixels[idx + 2] / 255;
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const y = Math.floor((1 - luma) * (h - 1));
      if (y >= 0 && y < h && x >= 0 && x < w) {
        waveData[y * w + x] = Math.min(255, waveData[y * w + x] + 20);
      }
    }
  }

  const imgData = ctx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    if (waveData[i] > 0) {
      imgData.data[i * 4] = 0;
      imgData.data[i * 4 + 1] = Math.min(255, waveData[i] * 2);
      imgData.data[i * 4 + 2] = 60;
      imgData.data[i * 4 + 3] = waveData[i];
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Labels
  ctx.fillStyle = '#4b5563';
  ctx.font = '9px monospace';
  ['100', '75', '50', '25', '0'].forEach((lbl, i) => {
    ctx.fillText(lbl, 2, (i * 25 / 100) * h + 10);
  });
}

function drawParade(ctx: CanvasRenderingContext2D, pixels: Uint8Array, srcW: number, srcH: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, w, h);

  const cw = Math.floor(w / 3);
  const channels = [
    { color: '#ef4444', off: 0 },
    { color: '#22c55e', off: cw },
    { color: '#3b82f6', off: cw * 2 },
  ];

  channels.forEach(({ color, off }, ch) => {
    const waveData = new Uint8Array(cw * h).fill(0);
    for (let px = 0; px < srcW; px++) {
      const x = Math.floor((px / srcW) * cw);
      for (let py = 0; py < srcH; py++) {
        const idx = (py * srcW + px) * 4 + ch;
        const val = pixels[idx] / 255;
        const y = Math.floor((1 - val) * (h - 1));
        if (y >= 0 && y < h && x >= 0 && x < cw) {
          waveData[y * cw + x] = Math.min(200, waveData[y * cw + x] + 15);
        }
      }
    }
    const imgData = ctx.createImageData(cw, h);
    const [r2, g2, b2] = color === '#ef4444' ? [239, 68, 68] : color === '#22c55e' ? [34, 197, 94] : [59, 130, 246];
    for (let i = 0; i < cw * h; i++) {
      if (waveData[i] > 0) {
        imgData.data[i * 4] = r2;
        imgData.data[i * 4 + 1] = g2;
        imgData.data[i * 4 + 2] = b2;
        imgData.data[i * 4 + 3] = waveData[i];
      }
    }
    ctx.putImageData(imgData, off, 0);

    // Divider
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(off + cw, 0);
    ctx.lineTo(off + cw, h);
    ctx.stroke();
  });

  // Labels
  ctx.fillStyle = '#6b7280';
  ctx.font = '9px monospace';
  ctx.fillText('R', 4, h - 4);
  ctx.fillText('G', cw + 4, h - 4);
  ctx.fillText('B', cw * 2 + 4, h - 4);
}

function drawVectorscope(ctx: CanvasRenderingContext2D, pixels: Uint8Array, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 8;

  // Circles
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.5;
  [0.25, 0.5, 0.75, 1].forEach(f => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Cross
  ctx.beginPath();
  ctx.moveTo(cx - r, cy);
  ctx.lineTo(cx + r, cy);
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx, cy + r);
  ctx.stroke();

  // Skin tone line (about 10.7° in YUV space, from center toward upper-right)
  ctx.strokeStyle = 'rgba(255,180,100,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  const skinAngle = -9.5 * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(skinAngle) * r, cy + Math.sin(skinAngle) * r);
  ctx.stroke();
  ctx.setLineDash([]);

  // Target labels
  const targets = [
    { angle: 0, label: 'R', color: '#ef4444' },
    { angle: 60, label: 'Y', color: '#eab308' },
    { angle: 120, label: 'G', color: '#22c55e' },
    { angle: 180, label: 'C', color: '#06b6d4' },
    { angle: 240, label: 'B', color: '#3b82f6' },
    { angle: 300, label: 'M', color: '#a855f7' },
  ];

  targets.forEach(({ angle, label, color }) => {
    const rad = (angle - 90) * Math.PI / 180;
    const tx = cx + Math.cos(rad) * (r - 6);
    const ty = cy + Math.sin(rad) * (r - 6);
    // Box
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(tx - 4, ty - 4, 8, 8);
    ctx.fillStyle = color + '40';
    ctx.fillRect(tx - 4, ty - 4, 8, 8);
    ctx.fillStyle = color;
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, tx, ty + 3);
  });
  ctx.textAlign = 'left';

  // Plot pixels
  const imgData = ctx.createImageData(w, h);
  for (let i = 0; i < pixels.length; i += 4) {
    const rr = pixels[i] / 255;
    const gg = pixels[i + 1] / 255;
    const bb = pixels[i + 2] / 255;
    const u = -0.147 * rr - 0.289 * gg + 0.436 * bb;
    const v = 0.615 * rr - 0.515 * gg - 0.100 * bb;
    const px = Math.round(cx + u * r * 2.5);
    const py = Math.round(cy - v * r * 2.5);
    if (px >= 0 && px < w && py >= 0 && py < h) {
      const idx2 = (py * w + px) * 4;
      imgData.data[idx2] = Math.min(255, imgData.data[idx2] + 40);
      imgData.data[idx2 + 1] = Math.min(255, imgData.data[idx2 + 1] + 60);
      imgData.data[idx2 + 2] = Math.min(255, imgData.data[idx2 + 2] + 40);
      imgData.data[idx2 + 3] = Math.min(255, imgData.data[idx2 + 3] + 80);
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Skin tone label
  ctx.fillStyle = 'rgba(255,180,100,0.6)';
  ctx.font = '8px monospace';
  ctx.fillText('SKIN', cx + r * 0.55, cy - r * 0.05);
}

export const ScopePanel: React.FC<ScopePanelProps> = ({
  pixels,
  width,
  height,
  type,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const titles: Record<string, string> = {
    histogram: 'Histogram',
    waveform: 'Waveform',
    parade: 'RGB Parade',
    vectorscope: 'Vectorscope',
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pixels) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    switch (type) {
      case 'histogram': drawHistogram(ctx, pixels, w, h); break;
      case 'waveform': drawWaveform(ctx, pixels, width, height, w, h); break;
      case 'parade': drawParade(ctx, pixels, width, height, w, h); break;
      case 'vectorscope': drawVectorscope(ctx, pixels, w, h); break;
    }
  }, [pixels, type, width, height]);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{titles[type]}</span>
      <canvas
        ref={canvasRef}
        width={SCOPE_WIDTH}
        height={SCOPE_HEIGHT}
        className="w-full rounded border border-gray-800"
        style={{ height: SCOPE_HEIGHT }}
      />
    </div>
  );
};
