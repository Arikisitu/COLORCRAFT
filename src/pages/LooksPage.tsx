import React, { useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { GRADE_PRESETS } from '../data/grades';
import { SAMPLE_IMAGES } from '../data/samples';
import { ImagePreview } from '../components/ImagePreview';

import { cn } from '../utils/cn';

export const LooksPage: React.FC = () => {
  const { grade, setGrade, setActiveSection } = useStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [intensity, setIntensity] = useState(1);
  const handlePixels = useCallback((_p: Uint8Array) => {}, []);

  const preset = selectedPreset ? GRADE_PRESETS.find(p => p.id === selectedPreset) : null;
  const sample = SAMPLE_IMAGES[selectedImage];

  const applyPreset = (p: typeof GRADE_PRESETS[0]) => {
    setSelectedPreset(p.id);
    const g = p.grade;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    setGrade({
      exposure: lerp(0, g.exposure ?? 0, intensity),
      contrast: lerp(0, g.contrast ?? 0, intensity),
      temperature: lerp(0, g.temperature ?? 0, intensity),
      tint: lerp(0, g.tint ?? 0, intensity),
      saturation: lerp(0, g.saturation ?? 0, intensity),
      highlights: lerp(0, g.highlights ?? 0, intensity),
      shadows: lerp(0, g.shadows ?? 0, intensity),
      blacks: lerp(0, g.blacks ?? 0, intensity),
      whites: lerp(0, g.whites ?? 0, intensity),
      liftRGB: {
        r: lerp(0, g.liftRGB?.r ?? 0, intensity),
        g: lerp(0, g.liftRGB?.g ?? 0, intensity),
        b: lerp(0, g.liftRGB?.b ?? 0, intensity),
      },
      gainRGB: {
        r: lerp(0, g.gainRGB?.r ?? 0, intensity),
        g: lerp(0, g.gainRGB?.g ?? 0, intensity),
        b: lerp(0, g.gainRGB?.b ?? 0, intensity),
      },
    });
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left — Preset list */}
      <div className="w-64 border-r border-gray-800 bg-gray-950 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-bold text-white mb-1">Cinematic Looks</h2>
          <p className="text-xs text-gray-500">Educational grade configurations</p>
        </div>

        {/* Category filter */}
        <div className="p-3 border-b border-gray-800">
          <div className="flex flex-wrap gap-1">
            {['All', 'Natural', 'Warm', 'Cinematic', 'Film', 'Vintage', 'Commercial'].map(cat => (
              <button key={cat} className="text-[10px] text-gray-500 hover:text-gray-300 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded transition-colors">
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="flex-1 overflow-y-auto">
          {GRADE_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-gray-900 transition-colors',
                selectedPreset === p.id ? 'bg-gray-800' : 'hover:bg-gray-900'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{p.name}</span>
                <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded">{p.category}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
            </button>
          ))}
        </div>

        {/* Intensity */}
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Intensity</span>
            <span className="text-xs font-mono text-gray-400">{Math.round(intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={intensity}
            onChange={e => {
              setIntensity(parseFloat(e.target.value));
              if (preset) applyPreset(preset);
            }}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Center — Preview */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-950">
        <div className="p-4 border-b border-gray-800 flex items-center gap-3">
          {SAMPLE_IMAGES.slice(0, 4).map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(i)}
              className={cn(
                'text-xs px-2 py-1 rounded transition-colors',
                selectedImage === i ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {img.category}
            </button>
          ))}
        </div>

        <div className="flex-1 p-4">
          <ImagePreview
            src={sample.src}
            grade={grade}
            viewMode="slider"
            onPixelsReady={handlePixels}
            className="w-full h-full"
          />
        </div>
      </div>

      {/* Right — Breakdown */}
      <div className="w-72 border-l border-gray-800 bg-gray-950 overflow-y-auto">
        {preset ? (
          <div className="p-5">
            <h3 className="text-base font-bold text-white mb-1">{preset.name}</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">{preset.description}</p>

            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Grade Breakdown</h4>
            <div className="space-y-2">
              {Object.entries(preset.grade).filter(([k]) => !['liftRGB', 'gainRGB', 'gammaRGB', 'offsetRGB', 'curvePoints'].includes(k)).map(([key, val]) => {
                const v = val as number;
                const isPos = v > 0;
                return (
                  <div key={key} className="flex items-center justify-between py-1.5 border-b border-gray-900">
                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                    <span className={cn('text-xs font-mono', isPos ? 'text-blue-400' : v < 0 ? 'text-orange-400' : 'text-gray-600')}>
                      {isPos ? '+' : ''}{typeof v === 'number' ? v.toFixed(2) : String(v)}
                    </span>
                  </div>
                );
              })}

              {preset.grade.liftRGB && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-900">
                  <span className="text-xs text-gray-400">Lift (RGB)</span>
                  <span className="text-xs font-mono text-gray-500">
                    <span className="text-red-400">{preset.grade.liftRGB.r.toFixed(2)}</span> /
                    <span className="text-green-400">{preset.grade.liftRGB.g.toFixed(2)}</span> /
                    <span className="text-blue-400">{preset.grade.liftRGB.b.toFixed(2)}</span>
                  </span>
                </div>
              )}
              {preset.grade.gainRGB && (
                <div className="flex items-center justify-between py-1.5 border-b border-gray-900">
                  <span className="text-xs text-gray-400">Gain (RGB)</span>
                  <span className="text-xs font-mono text-gray-500">
                    <span className="text-red-400">{preset.grade.gainRGB.r.toFixed(2)}</span> /
                    <span className="text-green-400">{preset.grade.gainRGB.g.toFixed(2)}</span> /
                    <span className="text-blue-400">{preset.grade.gainRGB.b.toFixed(2)}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 bg-gray-900 border border-gray-800 rounded-lg p-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                These values are <strong className="text-gray-400">educational example settings</strong>, not claims that there is one correct recipe for this look. Every scene will require different adjustments.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-1">
              {preset.tags.map(tag => (
                <span key={tag} className="text-[10px] text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">{tag}</span>
              ))}
            </div>

            <button
              onClick={() => setActiveSection('playground')}
              className="mt-5 w-full text-xs bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-colors"
            >
              Open in Playground
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 text-center">
            <div>
              <div className="text-3xl mb-3">🎨</div>
              <p className="text-gray-500 text-sm">Select a look to see its grade breakdown</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
