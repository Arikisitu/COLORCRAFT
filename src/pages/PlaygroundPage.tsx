import React, { useState, useCallback, useRef } from 'react';
import {
  Image, Video, Upload, SplitSquareHorizontal, Eye,
  Sliders, CircleDot, TrendingUp, GitFork, Copy, RotateCcw,
  ChevronDown, ChevronUp, Info
} from 'lucide-react';
import { useStore } from '../lib/store';
import { ImagePreview } from '../components/ImagePreview';
import { ColorSlider } from '../components/ColorSlider';
import { ColorWheel } from '../components/ColorWheel';
import { CurveEditor } from '../components/CurveEditor';
import { ScopePanel } from '../components/ScopePanel';
import { NodeGraph } from '../components/NodeGraph';
import { SAMPLE_IMAGES } from '../data/samples';
import { PARAMETER_DESCRIPTIONS } from '../data/samples';
import { ViewMode } from '../types';
import { cn } from '../utils/cn';

type ToolSection = 'primary' | 'wheels' | 'curves' | 'hsl';

export const PlaygroundPage: React.FC = () => {
  const {
    grade, setGrade, resetGrade, nodeGraph, setNodeGraph,
    viewMode, setViewMode, mediaMode, setMediaMode,
    selectedSample, setSelectedSample, appMode, setAppMode,
  } = useStore();

  const [scopePixels, setScopePixels] = useState<Uint8Array | null>(null);
  const [scopeW, setScopeW] = useState(200);
  const [scopeH, setScopeH] = useState(150);
  const [activeSection, setActiveSection] = useState<ToolSection>('primary');
  const [showScopes, setShowScopes] = useState(true);
  const [showNodes, setShowNodes] = useState(false);
  const [customSrc, setCustomSrc] = useState<string | null>(null);
  const [infoPanelKey, setInfoPanelKey] = useState<string | null>(null);
  const [activeCurve, setActiveCurve] = useState<'master' | 'red' | 'green' | 'blue'>('master');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePixels = useCallback((pixels: Uint8Array, w: number, h: number) => {
    setScopePixels(pixels);
    setScopeW(w);
    setScopeH(h);
  }, []);

  const currentSample = SAMPLE_IMAGES.find(s => s.id === selectedSample) || SAMPLE_IMAGES[0];
  const imageSrc = customSrc || currentSample.src;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomSrc(url);
    setMediaMode('photo');
  };

  const copyGrade = () => {
    const json = JSON.stringify({
      exposure: grade.exposure,
      contrast: grade.contrast,
      pivot: grade.pivot,
      temperature: grade.temperature,
      tint: grade.tint,
      saturation: grade.saturation,
      highlights: grade.highlights,
      shadows: grade.shadows,
      vibrance: grade.vibrance,
      hue: grade.hue,
    }, null, 2);
    navigator.clipboard.writeText(json).catch(() => {});
    const encoded = btoa(json);
    window.history.replaceState(null, '', `#grade=${encoded}`);
  };

  const viewModes: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'slider', label: 'Slider', icon: <SplitSquareHorizontal size={13} /> },
    { id: 'split', label: 'Split', icon: <SplitSquareHorizontal size={13} /> },
    { id: 'toggle', label: 'Toggle', icon: <Eye size={13} /> },
  ];

  const infoParam = infoPanelKey ? PARAMETER_DESCRIPTIONS[infoPanelKey] : null;

  const toolSections: { id: ToolSection; label: string; icon: React.ReactNode }[] = [
    { id: 'primary', label: 'Primary', icon: <Sliders size={13} /> },
    { id: 'wheels', label: 'Wheels', icon: <CircleDot size={13} /> },
    { id: 'curves', label: 'Curves', icon: <TrendingUp size={13} /> },
    { id: 'hsl', label: 'Channel', icon: <Sliders size={13} /> },
  ];

  const curveColors = { master: '#60a5fa', red: '#f87171', green: '#4ade80', blue: '#818cf8' };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Info panel overlay */}
      {infoParam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setInfoPanelKey(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-3">{infoParam.name}</h3>
            <div className="space-y-3 text-xs">
              <div><span className="text-gray-500">What it does: </span><span className="text-gray-300">{infoParam.description}</span></div>
              <div><span className="text-gray-500">When to use: </span><span className="text-gray-300">{infoParam.whenToUse}</span></div>
              <div><span className="text-red-400">Too high: </span><span className="text-gray-300">{infoParam.tooHigh}</span></div>
              <div><span className="text-blue-400">Too low: </span><span className="text-gray-300">{infoParam.tooLow}</span></div>
              <div><span className="text-yellow-400">Common mistake: </span><span className="text-gray-300">{infoParam.commonMistake}</span></div>
              <div><span className="text-gray-500">Watch scope: </span><span className="text-gray-300">{infoParam.watchScope}</span></div>
            </div>
            <button onClick={() => setInfoPanelKey(null)} className="mt-4 text-xs text-gray-500 hover:text-gray-300">Close</button>
          </div>
        </div>
      )}

      {/* Main 3-column layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left panel — Tool selection */}
        <div className="w-52 flex-shrink-0 border-r border-gray-800 bg-gray-950 flex flex-col overflow-y-auto">
          {/* Mode tabs */}
          <div className="p-3 border-b border-gray-800">
            <div className="flex rounded bg-gray-900 border border-gray-800 overflow-hidden">
              <button onClick={() => setMediaMode('photo')} className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 text-xs transition-colors', mediaMode === 'photo' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300')}>
                <Image size={12} /> Photo
              </button>
              <button onClick={() => setMediaMode('video')} className={cn('flex-1 flex items-center justify-center gap-1 py-1.5 text-xs transition-colors', mediaMode === 'video' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300')}>
                <Video size={12} /> Video
              </button>
            </div>
          </div>

          {/* Sample images */}
          <div className="p-3 border-b border-gray-800">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Sample Images</p>
            <div className="space-y-1">
              {SAMPLE_IMAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedSample(s.id); setCustomSrc(null); }}
                  className={cn(
                    'w-full text-left text-xs px-2 py-1.5 rounded transition-colors',
                    selectedSample === s.id && !customSrc
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                  )}
                >
                  <span className="text-[10px] text-gray-600 block">{s.category}</span>
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="p-3 border-b border-gray-800">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 bg-gray-900 border border-gray-800 hover:border-gray-700 px-3 py-2 rounded transition-colors"
            >
              <Upload size={12} />
              Import Image
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileUpload} className="hidden" />
            {customSrc && <p className="text-[10px] text-emerald-500 mt-1.5">✓ Custom file loaded</p>}
            <p className="text-[10px] text-gray-600 mt-1.5">Your file stays in your browser.</p>
          </div>

          {/* Tool sections */}
          <div className="p-3 flex-1">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Tools</p>
            <div className="space-y-1">
              {toolSections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    'w-full text-left flex items-center gap-2 text-xs px-2 py-1.5 rounded transition-colors',
                    activeSection === s.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                  )}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* App mode */}
          <div className="p-3 border-t border-gray-800">
            <p className="text-[10px] text-gray-600 mb-1.5 uppercase tracking-wide">Mode</p>
            <div className="flex rounded bg-gray-900 border border-gray-800 overflow-hidden text-[10px]">
              <button onClick={() => setAppMode('explanation')} className={cn('flex-1 py-1.5 transition-colors', appMode === 'explanation' ? 'bg-gray-700 text-white' : 'text-gray-500')}>
                Explain
              </button>
              <button onClick={() => setAppMode('experiment')} className={cn('flex-1 py-1.5 transition-colors', appMode === 'experiment' ? 'bg-gray-700 text-white' : 'text-gray-500')}>
                Experiment
              </button>
            </div>
          </div>
        </div>

        {/* Center — Viewer + Scopes */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Viewer toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950 flex-shrink-0">
            <div className="flex gap-1">
              {viewModes.map(vm => (
                <button
                  key={vm.id}
                  onClick={() => setViewMode(vm.id)}
                  className={cn('flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors', viewMode === vm.id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800')}
                >
                  {vm.icon} {vm.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowScopes(s => !s)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                {showScopes ? <ChevronDown size={12} /> : <ChevronUp size={12} />} Scopes
              </button>
              <button onClick={() => setShowNodes(s => !s)} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                <GitFork size={12} /> Nodes
              </button>
              <div className="w-px h-4 bg-gray-800" />
              <button onClick={copyGrade} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                <Copy size={12} /> Copy
              </button>
              <button onClick={resetGrade} className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 transition-colors">
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Image viewer */}
          <div className="flex-1 min-h-0 p-3 bg-gray-950">
            <ImagePreview
              src={imageSrc}
              grade={grade}
              viewMode={viewMode}
              onPixelsReady={handlePixels}
              className="w-full h-full"
            />
          </div>

          {/* Grade summary */}
          {appMode === 'explanation' && (
            <div className="px-4 py-2 border-t border-gray-800 bg-gray-950 flex-shrink-0">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { k: 'exposure', l: 'Exp' },
                  { k: 'contrast', l: 'Con' },
                  { k: 'temperature', l: 'Temp' },
                  { k: 'saturation', l: 'Sat' },
                  { k: 'highlights', l: 'HL' },
                  { k: 'shadows', l: 'Sh' },
                ].map(({ k, l }) => {
                  const val = grade[k as keyof typeof grade] as number;
                  const nonDefault = Math.abs(val) > 0.01;
                  const display = k === 'temperature' ? `${Math.round(val)}K` : val.toFixed(2);
                  return (
                    <button
                      key={k}
                      onClick={() => setInfoPanelKey(k)}
                      title={`Click for ${l} info`}
                      className={cn(
                        'text-[10px] font-mono px-1.5 py-0.5 rounded border cursor-pointer transition-colors',
                        nonDefault
                          ? 'bg-blue-950 border-blue-800 text-blue-300'
                          : 'bg-gray-900 border-gray-800 text-gray-600'
                      )}
                    >
                      {l}: {nonDefault ? (val > 0 ? `+${display}` : display) : '—'}
                    </button>
                  );
                })}
                <button onClick={() => setInfoPanelKey('exposure')} className="text-[10px] text-gray-600 hover:text-gray-400">
                  <Info size={10} />
                </button>
              </div>
            </div>
          )}

          {/* Scopes */}
          {showScopes && (
            <div className="border-t border-gray-800 bg-gray-950 flex-shrink-0 px-3 py-2">
              {scopePixels ? (
                <div className="grid grid-cols-4 gap-3">
                  <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="histogram" />
                  <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="waveform" />
                  <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="parade" />
                  <ScopePanel pixels={scopePixels} width={scopeW} height={scopeH} type="vectorscope" />
                </div>
              ) : (
                <div className="h-16 flex items-center justify-center text-xs text-gray-600">Loading scopes...</div>
              )}
            </div>
          )}

          {/* Node graph */}
          {showNodes && (
            <div className="border-t border-gray-800 bg-gray-950 flex-shrink-0 px-3 py-2">
              <NodeGraph graph={nodeGraph} onChange={setNodeGraph} compact />
            </div>
          )}
        </div>

        {/* Right panel — Controls */}
        <div className="w-64 flex-shrink-0 border-l border-gray-800 bg-gray-950 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* Primary Controls */}
            {activeSection === 'primary' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Primary</h3>
                  <button onClick={() => setInfoPanelKey('exposure')} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <Info size={12} />
                  </button>
                </div>

                {[
                  { key: 'exposure', label: 'Exposure', min: -2, max: 2 },
                  { key: 'contrast', label: 'Contrast', min: -1, max: 1 },
                  { key: 'pivot', label: 'Pivot', min: 0, max: 1, defaultVal: 0.5 },
                  { key: 'highlights', label: 'Highlights', min: -1, max: 1 },
                  { key: 'shadows', label: 'Shadows', min: -1, max: 1 },
                  { key: 'whites', label: 'Whites', min: -1, max: 1 },
                  { key: 'blacks', label: 'Blacks', min: -1, max: 1 },
                ].map(({ key, label, min, max, defaultVal = 0 }) => (
                  <ColorSlider
                    key={key}
                    label={label}
                    value={grade[key as keyof typeof grade] as number}
                    min={min}
                    max={max}
                    defaultValue={defaultVal}
                    onChange={v => setGrade({ [key]: v })}
                    onReset={() => setGrade({ [key]: defaultVal })}
                    info={PARAMETER_DESCRIPTIONS[key]?.description}
                    showTooltip={false}
                  />
                ))}

                <div className="pt-2 border-t border-gray-800">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-3">Color</h4>
                  <div className="space-y-4">
                    <ColorSlider label="Temperature" value={grade.temperature} min={-2000} max={2000} step={10} unit="K" onChange={v => setGrade({ temperature: v })} onReset={() => setGrade({ temperature: 0 })} accentColor="#f97316" showTooltip={false} />
                    <ColorSlider label="Tint" value={grade.tint} min={-100} max={100} step={1} onChange={v => setGrade({ tint: v })} onReset={() => setGrade({ tint: 0 })} accentColor="#a855f7" showTooltip={false} />
                    <ColorSlider label="Saturation" value={grade.saturation} min={-1} max={1} onChange={v => setGrade({ saturation: v })} onReset={() => setGrade({ saturation: 0 })} accentColor="#ec4899" showTooltip={false} />
                    <ColorSlider label="Vibrance" value={grade.vibrance} min={-1} max={1} onChange={v => setGrade({ vibrance: v })} onReset={() => setGrade({ vibrance: 0 })} accentColor="#8b5cf6" showTooltip={false} />
                    <ColorSlider label="Hue" value={grade.hue} min={-180} max={180} step={1} unit="°" onChange={v => setGrade({ hue: v })} onReset={() => setGrade({ hue: 0 })} accentColor="#eab308" showTooltip={false} />
                    <ColorSlider label="Color Boost" value={grade.colorBoost} min={-1} max={1} onChange={v => setGrade({ colorBoost: v })} onReset={() => setGrade({ colorBoost: 0 })} accentColor="#f43f5e" showTooltip={false} />
                    <ColorSlider label="Midtone Detail" value={grade.midtoneDetail} min={-1} max={1} onChange={v => setGrade({ midtoneDetail: v })} onReset={() => setGrade({ midtoneDetail: 0 })} accentColor="#06b6d4" showTooltip={false} />
                  </div>
                </div>
              </div>
            )}

            {/* Color Wheels */}
            {activeSection === 'wheels' && (
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Color Wheels</h3>
                {appMode === 'explanation' && (
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Drag toward a color to tint that tonal region. Lift = shadows, Gamma = midtones, Gain = highlights.
                  </p>
                )}
                <ColorWheel label="Lift" value={grade.liftRGB} onChange={v => setGrade({ liftRGB: v })} size={100} description="Adds color to shadow regions" />
                <ColorWheel label="Gamma" value={grade.gammaRGB} onChange={v => setGrade({ gammaRGB: v })} size={100} description="Adds color to midtone regions" />
                <ColorWheel label="Gain" value={grade.gainRGB} onChange={v => setGrade({ gainRGB: v })} size={100} description="Adds color to highlight regions" />
                <ColorWheel label="Offset" value={grade.offsetRGB} onChange={v => setGrade({ offsetRGB: v })} size={100} description="Global color offset" />
              </div>
            )}

            {/* Curves */}
            {activeSection === 'curves' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Curves</h3>
                <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded p-0.5">
                  {(['master', 'red', 'green', 'blue'] as const).map(ch => (
                    <button
                      key={ch}
                      onClick={() => setActiveCurve(ch)}
                      className={cn('flex-1 text-xs py-1 rounded transition-colors', activeCurve === ch ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300')}
                      style={{ color: activeCurve === ch ? curveColors[ch] : undefined }}
                    >
                      {ch === 'master' ? 'Y' : ch[0].toUpperCase()}
                    </button>
                  ))}
                </div>
                <CurveEditor
                  key={activeCurve}
                  points={grade.curvePoints[activeCurve]}
                  onChange={pts => setGrade({ curvePoints: { ...grade.curvePoints, [activeCurve]: pts } })}
                  color={curveColors[activeCurve]}
                  label={activeCurve === 'master' ? 'Y (Luma)' : activeCurve.charAt(0).toUpperCase() + activeCurve.slice(1)}
                  width={220}
                  height={180}
                />
              </div>
            )}

            {/* Channel/HSL */}
            {activeSection === 'hsl' && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest">Channel Balance</h3>
                <div className="space-y-3">
                  {(['r', 'g', 'b'] as const).map((ch, i) => {
                    const colors = ['#ef4444', '#22c55e', '#3b82f6'];
                    return (
                      <div key={ch}>
                        <ColorSlider
                          label={`Gain ${ch.toUpperCase()}`}
                          value={grade.gainRGB[ch]}
                          min={-0.3}
                          max={0.3}
                          step={0.005}
                          onChange={v => setGrade({ gainRGB: { ...grade.gainRGB, [ch]: v } })}
                          onReset={() => setGrade({ gainRGB: { ...grade.gainRGB, [ch]: 0 } })}
                          accentColor={colors[i]}
                          showTooltip={false}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="pt-3 border-t border-gray-800 space-y-3">
                  <h4 className="text-xs text-gray-500 uppercase tracking-wide">Tonal Zones</h4>
                  <ColorSlider label="Midtones" value={grade.midtones} min={-1} max={1} onChange={v => setGrade({ midtones: v })} onReset={() => setGrade({ midtones: 0 })} showTooltip={false} />
                </div>
              </div>
            )}
          </div>

          {/* Reset */}
          <div className="p-3 border-t border-gray-800 flex-shrink-0">
            <button onClick={resetGrade} className="w-full text-xs text-gray-500 hover:text-gray-300 bg-gray-900 hover:bg-gray-800 border border-gray-800 px-3 py-1.5 rounded transition-colors">
              Reset All Controls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
