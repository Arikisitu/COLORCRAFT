import React, { useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, ChevronRight, ArrowLeft, BookOpen } from 'lucide-react';
import { useStore } from '../lib/store';
import { LESSONS, LEARNING_PATHS } from '../data/lessons';
import { SAMPLE_IMAGES, PARAMETER_DESCRIPTIONS } from '../data/samples';
import { ImagePreview } from '../components/ImagePreview';
import { ColorSlider } from '../components/ColorSlider';
import { ScopePanel } from '../components/ScopePanel';
import { CurveEditor } from '../components/CurveEditor';
import { Lesson } from '../types';
import { cn } from '../utils/cn';

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  intermediate: 'bg-blue-950 text-blue-400 border-blue-800',
  advanced: 'bg-purple-950 text-purple-400 border-purple-800',
  professional: 'bg-orange-950 text-orange-400 border-orange-800',
};

const ContrastLesson: React.FC = () => {
  const { grade, setGrade } = useStore();
  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [sw, setSw] = useState(200);
  const [sh, setSh] = useState(150);

  const handlePixels = useCallback((p: Uint8Array, w: number, h: number) => {
    setScopePixels(p); setSw(w); setSh(h);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-200 leading-relaxed">
          <strong>Contrast</strong> controls the separation between dark and bright areas of the image. 
          Increasing contrast makes shadows darker and highlights brighter simultaneously, using the <strong>pivot point</strong> as the center of the operation.
        </p>
      </div>

      <ImagePreview
        src={SAMPLE_IMAGES[2].src}
        grade={grade}
        viewMode="slider"
        onPixelsReady={handlePixels}
        className="aspect-video"
      />

      <div className="grid grid-cols-2 gap-4">
        <ColorSlider
          label="Contrast"
          value={grade.contrast}
          min={-1} max={1}
          onChange={v => setGrade({ contrast: v })}
          onReset={() => setGrade({ contrast: 0 })}
          info="Increases separation between shadows and highlights"
        />
        <ColorSlider
          label="Pivot"
          value={grade.pivot}
          min={0} max={1}
          defaultValue={0.5}
          onChange={v => setGrade({ pivot: v })}
          onReset={() => setGrade({ pivot: 0.5 })}
          info="The tonal center around which contrast operates"
        />
      </div>

      {scopePixels && (
        <div className="grid grid-cols-2 gap-4">
          <ScopePanel pixels={scopePixels} width={sw} height={sh} type="waveform" />
          <ScopePanel pixels={scopePixels} width={sw} height={sh} type="histogram" />
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-white">What to observe:</h4>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">→</span>
            Raise Contrast: the Waveform spreads apart. Shadows go lower, highlights go higher.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">→</span>
            Lower Contrast: the Waveform compresses. The image looks flat and washed out.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">→</span>
            Change the Pivot: shifts which tonal region is most affected by contrast.
          </li>
        </ul>
      </div>

      <div className="bg-yellow-950/50 border border-yellow-900 rounded-lg p-4">
        <h4 className="text-xs font-semibold text-yellow-400 uppercase mb-2">Practice Challenge</h4>
        <p className="text-sm text-yellow-200">
          Create moderate contrast without clipping highlights. Set contrast to around +0.2 and check that the waveform doesn't hit 100 at the top.
        </p>
      </div>
    </div>
  );
};

const ExposureLesson: React.FC = () => {
  const { grade, setGrade } = useStore();
  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [sw, setSw] = useState(200);
  const [sh, setSh] = useState(150);
  const handlePixels = useCallback((p: Uint8Array, w: number, h: number) => {
    setScopePixels(p); setSw(w); setSh(h);
  }, []);
  const desc = PARAMETER_DESCRIPTIONS.exposure;

  return (
    <div className="space-y-6">
      <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-200 leading-relaxed">{desc.description}</p>
      </div>
      <ImagePreview
        src={SAMPLE_IMAGES[0].src}
        grade={grade}
        viewMode="slider"
        onPixelsReady={handlePixels}
        className="aspect-video"
      />
      <ColorSlider
        label="Exposure"
        value={grade.exposure}
        min={-2} max={2}
        onChange={v => setGrade({ exposure: v })}
        onReset={() => setGrade({ exposure: 0 })}
        info={desc.description}
      />
      {scopePixels && (
        <div className="grid grid-cols-2 gap-4">
          <ScopePanel pixels={scopePixels} width={sw} height={sh} type="waveform" />
          <ScopePanel pixels={scopePixels} width={sw} height={sh} type="histogram" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-red-950/50 border border-red-900 rounded-lg p-3">
          <p className="text-red-400 font-semibold mb-1">Too High</p>
          <p className="text-red-200">{desc.tooHigh}</p>
        </div>
        <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-3">
          <p className="text-blue-400 font-semibold mb-1">Too Low</p>
          <p className="text-blue-200">{desc.tooLow}</p>
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
        <p className="text-xs font-semibold text-yellow-400 uppercase mb-1">Common Mistake</p>
        <p className="text-xs text-gray-400">{desc.commonMistake}</p>
      </div>
    </div>
  );
};

const CurvesLesson: React.FC = () => {
  const { grade, setGrade } = useStore();
  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [sw, setSw] = useState(200);
  const [sh, setSh] = useState(150);
  const handlePixels = useCallback((p: Uint8Array, w: number, h: number) => {
    setScopePixels(p); setSw(w); setSh(h);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-4">
        <p className="text-sm text-blue-200 leading-relaxed">
          Curves give you precise tonal control. The X-axis represents the input value (0 = black, 1 = white). 
          The Y-axis represents the output. An S-curve boosts contrast by lifting highlights and deepening shadows.
        </p>
      </div>
      <ImagePreview
        src={SAMPLE_IMAGES[2].src}
        grade={grade}
        viewMode="slider"
        onPixelsReady={handlePixels}
        className="aspect-video"
      />
      <CurveEditor
        points={grade.curvePoints.master}
        onChange={pts => setGrade({ curvePoints: { ...grade.curvePoints, master: pts } })}
        color="#60a5fa"
        label="Y (Luma) Curve"
      />
      {scopePixels && (
        <ScopePanel pixels={scopePixels} width={sw} height={sh} type="waveform" />
      )}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-semibold text-white">Try these shapes:</h4>
        <ul className="space-y-1.5 text-xs text-gray-400">
          <li className="flex gap-2"><span className="text-blue-400">S-curve</span> — Classic contrast. Shadows down, highlights up.</li>
          <li className="flex gap-2"><span className="text-blue-400">Lift shadows</span> — Pull the bottom-left point up slightly for a faded look.</li>
          <li className="flex gap-2"><span className="text-blue-400">Crush blacks</span> — Pull the bottom-left point down and right.</li>
        </ul>
      </div>
    </div>
  );
};

const LESSON_COMPONENTS: Record<string, React.FC> = {
  'understanding-exposure': ExposureLesson,
  'mastering-contrast': ContrastLesson,
  'curves': CurvesLesson,
};

const LessonDetailView: React.FC<{ lesson: Lesson; onBack: () => void }> = ({ lesson, onBack }) => {
  const { progress, completeLesson, addRecentLesson } = useStore();
  const isCompleted = progress.completedLessons.includes(lesson.id);

  React.useEffect(() => {
    addRecentLesson(lesson.id);
  }, [lesson.id, addRecentLesson]);

  const LessonComponent = LESSON_COMPONENTS[lesson.slug];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft size={14} /> All Lessons
      </button>

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium px-2 py-0.5 rounded border', LEVEL_COLORS[lesson.level])}>
            {lesson.level.toUpperCase()}
          </span>
          <span className="text-xs text-gray-600">{lesson.category}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Clock size={11} />
          {lesson.duration} min
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
      <p className="text-gray-400 mb-8 leading-relaxed">{lesson.description}</p>

      {LessonComponent ? (
        <LessonComponent />
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <BookOpen size={24} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Interactive lesson content for "{lesson.title}" is being developed.</p>
            <p className="text-gray-600 text-xs mt-2">Check back soon, or visit the Playground to experiment directly.</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Key Concepts</h3>
            <ul className="space-y-2">
              {lesson.tags.map(tag => (
                <li key={tag} className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-1 h-1 rounded-full bg-blue-500" />
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-800 flex items-center justify-between">
        <button
          onClick={() => completeLesson(lesson.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            isCompleted
              ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          )}
        >
          {isCompleted ? <><CheckCircle size={16} /> Completed</> : 'Mark as Complete'}
        </button>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-300">
          Back to lessons
        </button>
      </div>
    </div>
  );
};

export const LearnPage: React.FC = () => {
  const { progress } = useStore();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (selectedLesson) {
    return (
      <div className="flex-1 overflow-y-auto">
        <LessonDetailView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(LESSONS.map(l => l.category)))];
  const levels = ['all', 'beginner', 'intermediate', 'advanced', 'professional'];

  const filtered = LESSONS.filter(l => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false;
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    return true;
  });

  const groupedByCategory = filtered.reduce((acc, lesson) => {
    if (!acc[lesson.category]) acc[lesson.category] = [];
    acc[lesson.category].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Color Grading Course</h1>
        <p className="text-gray-500 mb-6">From absolute beginner to professional colorist.</p>

        {/* Progress overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {LEARNING_PATHS.map(path => {
            const completedInPath = path.lessons.filter(id => progress.completedLessons.includes(id)).length;
            const pct = Math.round((completedInPath / path.lessons.length) * 100);
            return (
              <div key={path.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-1">{path.name}</div>
                <div className="text-lg font-bold text-white">{pct}%</div>
                <div className="text-xs text-gray-600">{completedInPath}/{path.lessons.length} lessons</div>
                <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-colors capitalize',
                filterLevel === level ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-800 text-gray-500 hover:text-gray-300'
              )}
            >
              {level}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-800 mx-1" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="text-xs bg-gray-900 border border-gray-800 rounded px-2 py-1 text-gray-400"
          >
            {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
          </select>
        </div>

        {/* Lessons */}
        {Object.entries(groupedByCategory).map(([category, lessons]) => (
          <div key={category} className="mb-8">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">{category}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {lessons.map(lesson => {
                const isCompleted = progress.completedLessons.includes(lesson.id);
                const hasInteractive = !!LESSON_COMPONENTS[lesson.slug];
                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={cn(
                      'bg-gray-900 border rounded-lg p-4 cursor-pointer transition-all hover:border-gray-600 group',
                      isCompleted ? 'border-emerald-900' : 'border-gray-800'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isCompleted
                          ? <CheckCircle size={14} className="text-emerald-400 flex-shrink-0" />
                          : <Circle size={14} className="text-gray-600 flex-shrink-0" />
                        }
                        <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded border', LEVEL_COLORS[lesson.level])}>
                          {lesson.level[0].toUpperCase()}
                        </span>
                        {hasInteractive && (
                          <span className="text-[9px] font-medium text-blue-400 bg-blue-950 border border-blue-800 px-1.5 py-0.5 rounded">
                            INTERACTIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Clock size={10} />
                        {lesson.duration}m
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors mb-1">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{lesson.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-1">
                        {lesson.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[9px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                      <ChevronRight size={12} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
