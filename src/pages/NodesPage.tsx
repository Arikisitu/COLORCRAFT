import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { NodeGraph } from '../components/NodeGraph';
import { cn } from '../utils/cn';

const NODE_RECIPES = [
  {
    id: 'basic',
    name: 'Basic Correction',
    nodes: [
      { id: 'r1', label: 'Balance', type: 'serial' as const, bypassed: false, x: 40, y: 120 },
      { id: 'r2', label: 'Contrast', type: 'serial' as const, bypassed: false, x: 180, y: 120 },
      { id: 'r3', label: 'Look', type: 'serial' as const, bypassed: false, x: 320, y: 120 },
    ],
    connections: [{ from: 'r1', to: 'r2' }, { from: 'r2', to: 'r3' }],
    description: 'The simplest useful node structure for quick corrections.',
    nodeDescriptions: {
      r1: 'Balance exposure and white balance using Lift/Gamma/Gain. This is your technical correction node.',
      r2: 'Refine contrast using curves or the contrast slider. Keep it separate from balance.',
      r3: 'Apply your creative look — color wheels, saturation, film emulation.',
    },
  },
  {
    id: 'full',
    name: 'Full Professional',
    nodes: [
      { id: 'f1', label: 'Input CST', type: 'serial' as const, bypassed: false, x: 40, y: 120 },
      { id: 'f2', label: 'Balance', type: 'serial' as const, bypassed: false, x: 180, y: 120 },
      { id: 'f3', label: 'Contrast', type: 'serial' as const, bypassed: false, x: 320, y: 120 },
      { id: 'f4', label: 'Skin', type: 'serial' as const, bypassed: false, x: 460, y: 120 },
      { id: 'f5', label: 'Creative Look', type: 'serial' as const, bypassed: false, x: 600, y: 120 },
      { id: 'f6', label: 'Output', type: 'serial' as const, bypassed: false, x: 740, y: 120 },
    ],
    connections: [
      { from: 'f1', to: 'f2' }, { from: 'f2', to: 'f3' },
      { from: 'f3', to: 'f4' }, { from: 'f4', to: 'f5' }, { from: 'f5', to: 'f6' },
    ],
    description: 'A robust professional workflow for managed color pipelines.',
    nodeDescriptions: {
      f1: 'Color Space Transform — converts camera-native Log/gamut to your working color space.',
      f2: 'Balance: Technical correction — exposure, white balance, tonal balance.',
      f3: 'Contrast: Refine the tonal curve. Keep this separate from balance for flexibility.',
      f4: 'Skin isolation using HSL qualifier. Adjust hue, saturation, and exposure of skin tones only.',
      f5: 'Creative look — this is where your artistic choices live. Isolated so you can toggle it.',
      f6: 'Final global adjustments, output LUT, or technical checks before delivery.',
    },
  },
  {
    id: 'skin',
    name: 'Skin Tone Isolation',
    nodes: [
      { id: 's1', label: 'Balance', type: 'serial' as const, bypassed: false, x: 40, y: 120 },
      { id: 's2', label: 'Global Look', type: 'serial' as const, bypassed: false, x: 180, y: 120 },
      { id: 's3', label: 'Skin Key', type: 'key' as const, bypassed: false, x: 320, y: 120 },
      { id: 's4', label: 'Output', type: 'serial' as const, bypassed: false, x: 460, y: 120 },
    ],
    connections: [
      { from: 's1', to: 's2' }, { from: 's2', to: 's3' }, { from: 's3', to: 's4' },
    ],
    description: 'Isolate and treat skin tones independently from the rest of the frame.',
    nodeDescriptions: {
      s1: 'Primary balance — fix the exposure and white balance for the overall scene.',
      s2: 'Apply the look you want for everything except the skin.',
      s3: 'Use the HSL qualifier to select skin tones. Adjust hue, saturation, and warmth here.',
      s4: 'Output node — any final global adjustment before delivery.',
    },
  },
];

const NODE_TYPES_EXPLAINED = [
  { type: 'Serial', color: '#3b82f6', desc: 'Processes the image in sequence. The output of one feeds into the next. Most common type.' },
  { type: 'Parallel', color: '#8b5cf6', desc: 'Creates a branching correction that is added to the serial stream. Useful for selective adjustments.' },
  { type: 'Layer', color: '#f59e0b', desc: 'Layers corrections using compositing blend modes — similar to layer blend modes in Photoshop.' },
  { type: 'Key', color: '#10b981', desc: 'Uses an HSL qualifier or external key source to limit corrections to selected pixels.' },
  { type: 'Outside', color: '#ef4444', desc: 'Applies corrections only to the inverse (outside) of the key selection from the previous node.' },
];

export const NodesPage: React.FC = () => {
  const { nodeGraph, setNodeGraph } = useStore();
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);


  const recipe = selectedRecipe ? NODE_RECIPES.find(r => r.id === selectedRecipe) : null;

  const loadRecipe = (r: typeof NODE_RECIPES[0]) => {
    setSelectedRecipe(r.id);
    setNodeGraph({ nodes: r.nodes, connections: r.connections });
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Node System</h1>
        <p className="text-gray-500 mb-6">
          Nodes are the foundation of DaVinci Resolve's color workflow. Each node is an independent processing stage with its own complete set of color tools.
        </p>

        {/* Node types */}
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Node Types</h2>
        <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {NODE_TYPES_EXPLAINED.map(nt => (
            <div key={nt.type} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: nt.color }} />
                <span className="text-xs font-semibold text-white">{nt.type}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{nt.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive node graph */}
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Interactive Node Editor</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-4">
          <NodeGraph graph={nodeGraph} onChange={setNodeGraph} />
        </div>

        <div className="bg-blue-950/40 border border-blue-900 rounded-lg p-4 mb-8">
          <p className="text-xs text-blue-300 leading-relaxed">
            <strong>How it works:</strong> In DaVinci Resolve, the color signal flows from left to right through nodes. Each node can contain any correction — exposure, curves, color wheels, qualifiers, power windows — and they stack in order. Bypassing a node lets you compare before/after at that stage instantly.
          </p>
        </div>

        {/* Recipes */}
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Node Recipes</h2>
        <p className="text-xs text-gray-600 mb-4">Common professional node structures. Click to load them into the editor above.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {NODE_RECIPES.map(r => (
            <button
              key={r.id}
              onClick={() => loadRecipe(r)}
              className={cn(
                'text-left bg-gray-900 border rounded-lg p-4 transition-all hover:border-gray-600',
                selectedRecipe === r.id ? 'border-blue-700 bg-blue-950/20' : 'border-gray-800'
              )}
            >
              <h3 className="text-sm font-semibold text-white mb-2">{r.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{r.description}</p>
              <div className="flex items-center gap-1">
                {r.nodes.map((n, i) => (
                  <React.Fragment key={n.id}>
                    <div className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded whitespace-nowrap">{n.label}</div>
                    {i < r.nodes.length - 1 && <span className="text-gray-700 text-xs">→</span>}
                  </React.Fragment>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Node explanations for selected recipe */}
        {recipe && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-white mb-4">{recipe.name} — Node Explanations</h3>
            <div className="space-y-3">
              {recipe.nodes.map((node, i) => (
                <div key={node.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded bg-blue-900 text-blue-300 text-xs flex items-center justify-center font-mono font-bold">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">{node.label}</span>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                      {(recipe.nodeDescriptions as unknown as Record<string, string>)[node.id]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
