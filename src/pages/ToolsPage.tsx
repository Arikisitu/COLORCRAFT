import React from 'react';
import { Sliders, CircleDot, TrendingUp, Activity, GitFork, Palette, Layers, Eye } from 'lucide-react';
import { useStore } from '../lib/store';

const TOOLS = [
  {
    id: 'playground',
    name: 'Primary Wheels',
    icon: <CircleDot size={24} />,
    difficulty: 'Beginner',
    purpose: 'Adjust Lift, Gamma, and Gain color tint for shadows, midtones, and highlights.',
    description: 'The color wheels allow you to independently colorize each tonal region. Drag the center dot toward any hue to introduce it into that range.',
    color: '#3b82f6',
    page: 'playground',
  },
  {
    id: 'primary-sliders',
    name: 'Primary Sliders',
    icon: <Sliders size={24} />,
    difficulty: 'Beginner',
    purpose: 'Exposure, Contrast, Temperature, Tint, Saturation — the foundational controls.',
    description: 'Every color grade starts here. These controls provide the broadest adjustments and affect the entire image.',
    color: '#10b981',
    page: 'playground',
  },
  {
    id: 'curves',
    name: 'Curves',
    icon: <TrendingUp size={24} />,
    difficulty: 'Intermediate',
    purpose: 'Precise tonal and channel-specific adjustments using control points.',
    description: 'Curves give you surgical control. Use the luma curve for contrast, or individual R/G/B channels for creative color work.',
    color: '#8b5cf6',
    page: 'playground',
  },
  {
    id: 'scopes',
    name: 'Scopes',
    icon: <Activity size={24} />,
    difficulty: 'All levels',
    purpose: 'Objective measurement tools: Histogram, Waveform, RGB Parade, Vectorscope.',
    description: 'Scopes remove subjectivity from technical decisions. Learn to read them alongside your visual judgment.',
    color: '#f59e0b',
    page: 'scopes',
  },
  {
    id: 'nodes',
    name: 'Node System',
    icon: <GitFork size={24} />,
    difficulty: 'Intermediate',
    purpose: 'Organize corrections into independent, stackable processing stages.',
    description: 'Nodes are what makes DaVinci Resolve a professional tool. Each node is an isolated correction that can be individually bypassed, re-ordered, or deleted.',
    color: '#ef4444',
    page: 'nodes',
  },
  {
    id: 'looks',
    name: 'Looks Library',
    icon: <Palette size={24} />,
    difficulty: 'All levels',
    purpose: 'Explore cinematic grade configurations with full breakdown.',
    description: 'Each look preset shows you exactly which parameters create the aesthetic — educational, not prescriptive.',
    color: '#ec4899',
    page: 'looks',
  },
  {
    id: 'comparison',
    name: 'Before / After',
    icon: <Layers size={24} />,
    difficulty: 'All levels',
    purpose: 'Three comparison modes: Split, Slider, and Toggle.',
    description: 'See exactly what your grade changed. The slider mode lets you scan across the image to compare original and graded versions.',
    color: '#06b6d4',
    page: 'playground',
  },
  {
    id: 'practice',
    name: 'Practice Challenges',
    icon: <Eye size={24} />,
    difficulty: 'All levels',
    purpose: 'Guided grading exercises with reference comparison.',
    description: 'Apply what you have learned. Submit your grade and see how it compares to a reference — educationally, not as a judgment.',
    color: '#84cc16',
    page: 'practice',
  },
];

export const ToolsPage: React.FC = () => {
  const { setActiveSection } = useStore();

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Color Tools</h1>
        <p className="text-gray-500 mb-8">All interactive grading tools available in COLORCRAFT.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {TOOLS.map(tool => (
            <div
              key={tool.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 cursor-pointer group transition-all"
              onClick={() => setActiveSection(tool.page)}
            >
              <div className="flex items-start gap-4">
                <div
                  className="p-3 rounded-xl flex-shrink-0 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                >
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                    <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">{tool.difficulty}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2 leading-relaxed">{tool.purpose}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{tool.description}</p>
                  <div
                    className="mt-3 text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: tool.color }}
                  >
                    Open Tool →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Workflows note */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-2">Grading Workflow</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {[
              'Evaluate',
              'Color Management',
              'Balance Exposure',
              'White Balance',
              'Contrast',
              'Shot Match',
              'Secondary',
              'Creative Look',
              'Check Scopes',
              'Output',
            ].map((step, i, arr) => (
              <React.Fragment key={step}>
                <span className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded">{step}</span>
                {i < arr.length - 1 && <span className="text-gray-700 text-xs">→</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3 leading-relaxed">
            Professional color grading follows a logical order. Technical corrections first, creative decisions second. Working outside this order can make corrections harder to manage.
          </p>
        </div>
      </div>
    </div>
  );
};
