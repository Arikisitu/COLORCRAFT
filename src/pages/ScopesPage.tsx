import React, { useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { SAMPLE_IMAGES } from '../data/samples';
import { ImagePreview } from '../components/ImagePreview';
import { ColorSlider } from '../components/ColorSlider';
import { ScopePanel } from '../components/ScopePanel';

export const ScopesPage: React.FC = () => {
  const { grade, setGrade } = useStore();
  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [sw, setSw] = useState(200);
  const [sh, setSh] = useState(150);
  const [activeScope, setActiveScope] = useState<'all' | 'histogram' | 'waveform' | 'parade' | 'vectorscope'>('all');

  const handlePixels = useCallback((p: Uint8Array, w: number, h: number) => {
    setScopePixels(p); setSw(w); setSh(h);
  }, []);

  const scopeInfo = {
    histogram: {
      title: 'Histogram',
      description: 'Shows the distribution of tonal values (0–255) in the image. X-axis = brightness, Y-axis = number of pixels at that brightness. Useful for checking overall exposure distribution.',
      tips: [
        'Spike at left = clipped blacks (crushed)',
        'Spike at right = clipped whites (blown out)',
        'RGB separation shows color casts',
        'Centered distribution = well-exposed midtones',
      ],
    },
    waveform: {
      title: 'Waveform',
      description: 'Maps image position (left-right) to luminance (bottom-top). Each column represents one vertical slice of the image plotted at its luminance value.',
      tips: [
        'Higher trace = brighter image area at that position',
        'Flat top = highlight clipping',
        'Flat bottom = shadow clipping',
        'Good legal levels: 0 to 100 IRE',
      ],
    },
    parade: {
      title: 'RGB Parade',
      description: 'Three separate waveforms for Red, Green, and Blue channels side by side. Ideal for detecting color casts and channel clipping.',
      tips: [
        'All three aligned = neutral/balanced image',
        'One channel higher = color cast in that channel',
        'Use to set accurate white balance',
        'Unequal channels in highlights = color tint in whites',
      ],
    },
    vectorscope: {
      title: 'Vectorscope',
      description: 'Polar display of color information. Distance from center = saturation. Angle = hue. Target boxes mark the positions of pure colors.',
      tips: [
        'All data near center = low saturation / near B&W',
        'Skin tones should fall on the skin tone indicator line',
        'Data outside the boxes = very high saturation',
        'Good for checking color distribution and skin tone accuracy',
      ],
    },
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Scopes Lab</h1>
        <p className="text-gray-500 mb-2">Measurement tools for objective color decisions. Adjust the controls and watch the scopes respond.</p>
        
        <div className="bg-gray-900 border border-amber-900 rounded-lg px-4 py-2.5 mb-6">
          <p className="text-xs text-amber-300">
            <strong>Remember:</strong> Scopes are measurement tools, not substitutes for visual judgment. Use them to avoid technical errors, not to dictate every creative decision.
          </p>
        </div>

        {/* Scope type tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'histogram', 'waveform', 'parade', 'vectorscope'] as const).map(s => (
            <button
              key={s}
              onClick={() => setActiveScope(s)}
              className={`text-xs px-3 py-1.5 rounded border capitalize transition-colors ${activeScope === s ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-800 text-gray-500 hover:text-gray-300'}`}
            >
              {s === 'all' ? 'All Scopes' : s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Image */}
          <div>
            <ImagePreview
              src={SAMPLE_IMAGES[0].src}
              grade={grade}
              viewMode="slider"
              onPixelsReady={handlePixels}
              className="aspect-video"
            />
            <div className="mt-4 space-y-3">
              <ColorSlider label="Exposure" value={grade.exposure} min={-2} max={2} onChange={v => setGrade({ exposure: v })} onReset={() => setGrade({ exposure: 0 })} info="Watch Waveform and Histogram respond" />
              <ColorSlider label="Contrast" value={grade.contrast} min={-1} max={1} onChange={v => setGrade({ contrast: v })} onReset={() => setGrade({ contrast: 0 })} info="Waveform spreads or compresses" />
              <ColorSlider label="Saturation" value={grade.saturation} min={-1} max={1} onChange={v => setGrade({ saturation: v })} onReset={() => setGrade({ saturation: 0 })} info="Vectorscope expands or contracts" />
              <ColorSlider label="Temperature" value={grade.temperature} min={-2000} max={2000} step={10} onChange={v => setGrade({ temperature: v })} onReset={() => setGrade({ temperature: 0 })} info="RGB Parade channels shift" accentColor="#f97316" />
            </div>
          </div>

          {/* Scopes */}
          <div>
            {activeScope === 'all' && scopePixels && (
              <div className="grid grid-cols-2 gap-4">
                <ScopePanel pixels={scopePixels} width={sw} height={sh} type="histogram" />
                <ScopePanel pixels={scopePixels} width={sw} height={sh} type="waveform" />
                <ScopePanel pixels={scopePixels} width={sw} height={sh} type="parade" />
                <ScopePanel pixels={scopePixels} width={sw} height={sh} type="vectorscope" />
              </div>
            )}
            {activeScope !== 'all' && scopePixels && (
              <div className="space-y-4">
                <ScopePanel pixels={scopePixels} width={sw} height={sh} type={activeScope} className="h-48" />
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">{scopeInfo[activeScope].title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-3">{scopeInfo[activeScope].description}</p>
                  <ul className="space-y-1.5">
                    {scopeInfo[activeScope].tips.map(tip => (
                      <li key={tip} className="flex items-start gap-2 text-xs text-gray-500">
                        <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            {!scopePixels && (
              <div className="h-48 flex items-center justify-center bg-gray-900 rounded border border-gray-800 text-gray-600 text-sm">
                Loading scopes...
              </div>
            )}
          </div>
        </div>

        {/* Scope reference guide */}
        <div className="grid sm:grid-cols-2 gap-4">
          {Object.entries(scopeInfo).map(([key, info]) => (
            <div key={key} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">{info.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{info.description}</p>
              <ul className="space-y-1">
                {info.tips.map(tip => (
                  <li key={tip} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
