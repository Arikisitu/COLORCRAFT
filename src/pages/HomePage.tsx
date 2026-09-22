import React, { useState, useCallback } from 'react';
import { ArrowRight, Play, FlaskConical, BookOpen, Zap, Eye, Target, ChevronRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { ImagePreview } from '../components/ImagePreview';
import { ColorSlider } from '../components/ColorSlider';
import { ScopePanel } from '../components/ScopePanel';
import { LESSONS, LEARNING_PATHS } from '../data/lessons';
import { GRADE_PRESETS } from '../data/grades';
import { SAMPLE_IMAGES } from '../data/samples';
import { cn } from '../utils/cn';

export const HomePage: React.FC = () => {
  const { grade, setGrade, setActiveSection, progress } = useStore();
  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [scopeW, setScopeW] = useState(200);
  const [scopeH, setScopeH] = useState(150);

  const handlePixels = useCallback((pixels: Uint8Array, w: number, h: number) => {
    setScopePixels(pixels);
    setScopeW(w);
    setScopeH(h);
  }, []);

  const heroImage = SAMPLE_IMAGES[3]; // sunset

  const featuredLessons = LESSONS.slice(0, 3);
  const featuredPresets = GRADE_PRESETS.slice(0, 4);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero */}
      <section className="relative bg-gray-950 border-b border-gray-800 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #374151 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-gray-950" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 rounded-full px-3 py-1 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400 font-medium">Interactive Color Grading Lab</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Learn Color Grading<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                  by Seeing Every Change.
                </span>
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Understand exposure, contrast, color science, nodes, curves, qualifiers, scopes and cinematic looks through interactive examples — all in your browser.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveSection('playground')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <FlaskConical size={16} />
                  Try the Playground
                </button>
                <button
                  onClick={() => setActiveSection('learn')}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-5 py-2.5 rounded-lg font-medium transition-colors"
                >
                  <BookOpen size={16} />
                  Start Learning
                </button>
              </div>
              {/* Stats */}
              <div className="flex gap-6 mt-8 pt-6 border-t border-gray-800">
                {[
                  { v: '24', l: 'Lessons' },
                  { v: '12+', l: 'Presets' },
                  { v: '4', l: 'Scopes' },
                  { v: 'WebGL', l: 'Engine' },
                ].map(({ v, l }) => (
                  <div key={l} className="text-center">
                    <div className="text-xl font-bold text-white">{v}</div>
                    <div className="text-xs text-gray-500">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Interactive preview */}
            <div className="flex flex-col gap-3">
              <ImagePreview
                src={heroImage.src}
                grade={grade}
                viewMode="slider"
                onPixelsReady={handlePixels}
                className="aspect-video"
              />
              <div className="grid grid-cols-3 gap-3">
                <ColorSlider
                  label="Exposure"
                  value={grade.exposure}
                  min={-2}
                  max={2}
                  onChange={v => setGrade({ exposure: v })}
                  info="Controls overall brightness"
                />
                <ColorSlider
                  label="Contrast"
                  value={grade.contrast}
                  min={-1}
                  max={1}
                  onChange={v => setGrade({ contrast: v })}
                  info="Shadow/highlight separation"
                />
                <ColorSlider
                  label="Saturation"
                  value={grade.saturation}
                  min={-1}
                  max={1}
                  onChange={v => setGrade({ saturation: v })}
                  info="Color intensity"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Demo — Scopes */}
      {scopePixels && (
        <section className="bg-gray-950 border-b border-gray-800 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Live Scopes</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="histogram" />
              <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="waveform" />
              <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="parade" />
              <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="vectorscope" />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Scopes update automatically as you adjust the controls above. Move the Exposure slider and watch the Waveform respond.
            </p>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="px-6 py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">What You'll Learn</h2>
          <p className="text-gray-500 mb-8">Every concept has an explanation, a visualization, and a hands-on exercise.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Zap size={18} />, title: 'Real-Time Grading', desc: 'Move sliders and see the image change instantly. Scopes update live.' },
              { icon: <Eye size={18} />, title: 'Before / After', desc: 'Drag the comparison slider to understand exactly what each control does.' },
              { icon: <Target size={18} />, title: 'Practice Challenges', desc: 'Test your understanding with guided grading challenges and compare to reference.' },
              { icon: <BookOpen size={18} />, title: '24 Lessons', desc: 'From absolute beginner to advanced colorist, with structured learning paths.' },
              { icon: <FlaskConical size={18} />, title: 'Curve Editor', desc: 'Interactive Catmull-Rom curve editor for precision tonal control.' },
              { icon: <Play size={18} />, title: 'Node System', desc: 'Learn how to organize corrections into an efficient node-based workflow.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors">
                <div className="text-blue-400 mb-3">{icon}</div>
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="px-6 py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Learning Paths</h2>
          <p className="text-gray-500 mb-8">Choose your starting point.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {LEARNING_PATHS.map(path => {
              const completedInPath = path.lessons.filter(id => progress.completedLessons.includes(id)).length;
              const pct = Math.round((completedInPath / path.lessons.length) * 100);
              const colorMap: Record<string, string> = { emerald: 'text-emerald-400 border-emerald-800 bg-emerald-950', blue: 'text-blue-400 border-blue-800 bg-blue-950', purple: 'text-purple-400 border-purple-800 bg-purple-950' };
              return (
                <div
                  key={path.id}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors cursor-pointer"
                  onClick={() => setActiveSection('learn')}
                >
                  <div className={cn('inline-block text-xs font-medium px-2 py-1 rounded border mb-3', colorMap[path.color])}>
                    {path.name.toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{path.description}</p>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500">{completedInPath}/{path.lessons.length} lessons</span>
                    <span className="text-xs font-mono text-gray-400">{pct}%</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Lessons */}
      <section className="px-6 py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Featured Lessons</h2>
            <button onClick={() => setActiveSection('learn')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              All lessons <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {featuredLessons.map(lesson => (
              <div
                key={lesson.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 cursor-pointer transition-colors"
                onClick={() => setActiveSection('learn')}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded', {
                    'bg-emerald-950 text-emerald-400 border border-emerald-800': lesson.level === 'beginner',
                    'bg-blue-950 text-blue-400 border border-blue-800': lesson.level === 'intermediate',
                    'bg-purple-950 text-purple-400 border border-purple-800': lesson.level === 'advanced',
                  })}>
                    {lesson.level.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-600">{lesson.duration} min</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{lesson.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{lesson.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Look Presets */}
      <section className="px-6 py-12 border-b border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Sample Looks</h2>
            <button onClick={() => setActiveSection('looks')} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              All looks <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredPresets.map(preset => (
              <div
                key={preset.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 cursor-pointer transition-colors"
                onClick={() => {
                  const g = preset.grade;
                  setGrade({
                    exposure: g.exposure ?? 0,
                    contrast: g.contrast ?? 0,
                    temperature: g.temperature ?? 0,
                    tint: g.tint ?? 0,
                    saturation: g.saturation ?? 0,
                    highlights: g.highlights ?? 0,
                    shadows: g.shadows ?? 0,
                    liftRGB: g.liftRGB ?? { r: 0, g: 0, b: 0 },
                    gainRGB: g.gainRGB ?? { r: 0, g: 0, b: 0 },
                  });
                  setActiveSection('playground');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">{preset.name}</span>
                  <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{preset.category}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{preset.description}</p>
                <div className="flex flex-wrap gap-1">
                  {preset.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start grading?</h2>
          <p className="text-gray-500 mb-8">Open the Playground, load a photo, and start experimenting with real-time color grading in your browser.</p>
          <button
            onClick={() => setActiveSection('playground')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Open Playground <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
