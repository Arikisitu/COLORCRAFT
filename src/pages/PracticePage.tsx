import React, { useState, useCallback } from 'react';
import { Target, CheckCircle, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';
import { SAMPLE_IMAGES } from '../data/samples';
import { ImagePreview } from '../components/ImagePreview';
import { ColorSlider } from '../components/ColorSlider';
import { GradeState } from '../types';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  imageIdx: number;
  hint: string;
  target: Partial<GradeState>;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'c1',
    title: 'Fix Underexposed Shot',
    description: 'This portrait is underexposed. Raise the exposure to get proper brightness without blowing highlights.',
    difficulty: 'easy',
    imageIdx: 0,
    hint: 'Start with Exposure, then check if highlights are clipping using the Waveform. Keep the top of the waveform below 100.',
    target: { exposure: 0.6, contrast: 0.05, shadows: 0.1 },
  },
  {
    id: 'c2',
    title: 'Add Cinematic Contrast',
    description: 'Create a pleasing cinematic contrast without clipping highlights or crushing all shadow detail.',
    difficulty: 'medium',
    imageIdx: 2,
    hint: 'Set contrast around 0.15–0.25. Adjust pivot so the operation favors shadows. You may need to slightly raise shadows after.',
    target: { contrast: 0.2, pivot: 0.45, shadows: -0.05, highlights: -0.08 },
  },
  {
    id: 'c3',
    title: 'Correct White Balance',
    description: 'The image has a cool color cast. Warm it up to a natural daylight look.',
    difficulty: 'medium',
    imageIdx: 3,
    hint: 'Temperature moves along the blue-orange axis. Raise it to warm the image. Fine-tune with Tint.',
    target: { temperature: 350, tint: 4, exposure: 0.05 },
  },
  {
    id: 'c4',
    title: 'Create Teal & Orange',
    description: 'Apply the classic Hollywood complementary color split — warm highlights, cool shadows.',
    difficulty: 'hard',
    imageIdx: 0,
    hint: 'Use the color wheels. Push Lift toward teal (cyan-green). Push Gain slightly toward warm (orange-red). Keep it subtle.',
    target: {
      liftRGB: { r: -0.02, g: 0.01, b: 0.04 },
      gainRGB: { r: 0.03, g: 0, b: -0.03 },
      contrast: 0.1,
      saturation: 0.05,
    },
  },
];

function gradeDiff(userGrade: GradeState, target: Partial<GradeState>): { key: string; diff: number; userVal: number; targetVal: number }[] {
  const results: { key: string; diff: number; userVal: number; targetVal: number }[] = [];
  const numericKeys = ['exposure', 'contrast', 'temperature', 'tint', 'saturation', 'highlights', 'shadows', 'pivot'];
  numericKeys.forEach(key => {
    const targetVal = (target as Record<string, number>)[key];
    if (targetVal !== undefined) {
      const userVal = (userGrade as unknown as Record<string, number>)[key] ?? 0;
      results.push({ key, diff: Math.abs(userVal - targetVal), userVal, targetVal });
    }
  });
  return results;
}

export const PracticePage: React.FC = () => {
  const { grade, setGrade, resetGrade } = useStore();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [diffs, setDiffs] = useState<ReturnType<typeof gradeDiff>>([]);

  const handlePixels = useCallback(() => {}, []);

  const startChallenge = (c: Challenge) => {
    resetGrade();
    setSelectedChallenge(c);
    setSubmitted(false);
    setDiffs([]);
  };

  const submit = () => {
    if (!selectedChallenge) return;
    const d = gradeDiff(grade, selectedChallenge.target);
    setDiffs(d);
    setSubmitted(true);
  };

  const reset = () => {
    resetGrade();
    setSubmitted(false);
    setDiffs([]);
  };

  const diffColor = (diff: number, range: number) => {
    const ratio = diff / range;
    if (ratio < 0.1) return 'text-emerald-400';
    if (ratio < 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (selectedChallenge) {
    const sample = SAMPLE_IMAGES[selectedChallenge.imageIdx];
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button onClick={() => setSelectedChallenge(null)} className="text-xs text-gray-500 hover:text-gray-300 mb-4">← All Challenges</button>

          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">{selectedChallenge.title}</h1>
            <span className={`text-xs px-2 py-1 rounded border ${
              selectedChallenge.difficulty === 'easy' ? 'border-emerald-800 text-emerald-400 bg-emerald-950' :
              selectedChallenge.difficulty === 'medium' ? 'border-yellow-800 text-yellow-400 bg-yellow-950' :
              'border-red-800 text-red-400 bg-red-950'
            }`}>
              {selectedChallenge.difficulty.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-400 mb-6">{selectedChallenge.description}</p>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <ImagePreview src={sample.src} grade={grade} viewMode="slider" onPixelsReady={handlePixels} className="aspect-video" />
            <div className="space-y-4">
              <ColorSlider label="Exposure" value={grade.exposure} min={-2} max={2} onChange={v => setGrade({ exposure: v })} onReset={() => setGrade({ exposure: 0 })} />
              <ColorSlider label="Contrast" value={grade.contrast} min={-1} max={1} onChange={v => setGrade({ contrast: v })} onReset={() => setGrade({ contrast: 0 })} />
              <ColorSlider label="Temperature" value={grade.temperature} min={-2000} max={2000} step={10} onChange={v => setGrade({ temperature: v })} onReset={() => setGrade({ temperature: 0 })} accentColor="#f97316" />
              <ColorSlider label="Tint" value={grade.tint} min={-100} max={100} step={1} onChange={v => setGrade({ tint: v })} onReset={() => setGrade({ tint: 0 })} accentColor="#a855f7" />
              <ColorSlider label="Saturation" value={grade.saturation} min={-1} max={1} onChange={v => setGrade({ saturation: v })} onReset={() => setGrade({ saturation: 0 })} accentColor="#ec4899" />
              <ColorSlider label="Highlights" value={grade.highlights} min={-1} max={1} onChange={v => setGrade({ highlights: v })} onReset={() => setGrade({ highlights: 0 })} />
              <ColorSlider label="Shadows" value={grade.shadows} min={-1} max={1} onChange={v => setGrade({ shadows: v })} onReset={() => setGrade({ shadows: 0 })} />
            </div>
          </div>

          {/* Hint */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500">
              <span className="text-yellow-400 font-semibold">Hint: </span>
              {selectedChallenge.hint}
            </p>
          </div>

          {/* Submit */}
          {!submitted ? (
            <div className="flex gap-3">
              <button onClick={submit} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
                <CheckCircle size={15} /> Submit Grade
              </button>
              <button onClick={reset} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 bg-gray-800 px-4 py-2 rounded-lg text-sm transition-colors">
                <RefreshCw size={14} /> Reset
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Reference Comparison</h3>
              <p className="text-xs text-gray-500">
                This is an educational measurement only. There is no single "correct" grade — these values represent one possible reference approach.
              </p>
              <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-xs text-gray-500 px-4 py-2">Parameter</th>
                      <th className="text-left text-xs text-gray-500 px-4 py-2">Your Value</th>
                      <th className="text-left text-xs text-gray-500 px-4 py-2">Reference</th>
                      <th className="text-left text-xs text-gray-500 px-4 py-2">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diffs.map(d => (
                      <tr key={d.key} className="border-b border-gray-800/50">
                        <td className="px-4 py-2 text-xs text-gray-300 capitalize">{d.key}</td>
                        <td className="px-4 py-2 text-xs font-mono text-gray-400">{d.userVal.toFixed(2)}</td>
                        <td className="px-4 py-2 text-xs font-mono text-gray-400">{d.targetVal.toFixed(2)}</td>
                        <td className={`px-4 py-2 text-xs font-mono ${diffColor(d.diff, 0.3)}`}>
                          {d.diff < 0.01 ? '✓ Match' : `±${d.diff.toFixed(2)}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <button onClick={reset} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors">
                  <RefreshCw size={14} /> Try Again
                </button>
                <button onClick={() => setSelectedChallenge(null)} className="text-gray-500 hover:text-gray-300 text-sm">
                  Other Challenges
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Practice Challenges</h1>
        <p className="text-gray-500 mb-6">Test your grading skills with guided exercises. After submitting, see how your grade compares to a reference.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="text-gray-400">Educational note:</strong> In real color grading, there is no single correct grade for any shot. The reference values below represent one possible approach for each challenge. The goal is to develop your understanding of the tools — not to hit exact numbers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {CHALLENGES.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 cursor-pointer transition-colors" onClick={() => startChallenge(c)}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-blue-400" />
                  <span className={`text-xs px-2 py-0.5 rounded border ${
                    c.difficulty === 'easy' ? 'border-emerald-800 text-emerald-400' :
                    c.difficulty === 'medium' ? 'border-yellow-800 text-yellow-400' :
                    'border-red-800 text-red-400'
                  }`}>{c.difficulty}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{c.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{c.description}</p>
              <div className="mt-4 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Start Challenge →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
