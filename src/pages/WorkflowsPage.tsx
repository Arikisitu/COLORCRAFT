import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: 'Evaluate the Footage',
    description: 'Before touching any control, watch the footage in context. What is the scene trying to communicate? What is the lighting situation? What are the technical issues?',
    questions: [
      'Is the exposure correct?',
      'Is there a white balance issue?',
      'What is the dynamic range situation?',
      'What mood does the scene need?',
    ],
    tools: ['Viewer', 'Scopes'],
    warning: null,
  },
  {
    id: 2,
    title: 'Set Up Color Management',
    description: 'Before grading, establish the correct input and output color space. Working in the wrong color space leads to incorrect corrections that will look wrong on delivery.',
    questions: [
      'What camera was this footage shot on?',
      'Is it Log, RAW, or Rec.709?',
      'What is the delivery format (Rec.709, P3, HDR)?',
    ],
    tools: ['Project Settings', 'CST', 'LUT', 'Color Management'],
    warning: 'Grading Log footage without a color space transform will result in a flat, washed-out image. Apply a correct input transform first.',
  },
  {
    id: 3,
    title: 'Balance Exposure',
    description: 'Get the overall luminance of the image to a workable technical starting point. This is not the final look — just a correct baseline.',
    questions: [
      'Are highlights clipping?',
      'Is shadow detail visible where it should be?',
      'Is the overall brightness appropriate for the scene?',
    ],
    tools: ['Exposure', 'Lift', 'Gain', 'Waveform', 'Histogram'],
    warning: null,
  },
  {
    id: 4,
    title: 'Balance White Balance',
    description: 'Correct any color cast so neutral areas appear neutral. Use the vectorscope and RGB parade to confirm accuracy.',
    questions: [
      'Are white or gray areas neutral (no color cast)?',
      'Does skin tone look natural for the lighting conditions?',
      'Are the three channels balanced in the parade?',
    ],
    tools: ['Temperature', 'Tint', 'Vectorscope', 'RGB Parade'],
    warning: 'Not every shot needs a perfectly neutral white balance — some scenes have intentional warm or cool sources. Correct for what serves the story.',
  },
  {
    id: 5,
    title: 'Set Contrast',
    description: 'Now that balance is correct, add depth through contrast. Use the Curves or Contrast slider. Adjust pivot to taste.',
    questions: [
      'Does the image have enough tonal separation?',
      'Are shadows too flat or too crushed?',
      'Are highlights clean or blown out?',
    ],
    tools: ['Contrast', 'Pivot', 'Curves', 'Waveform'],
    warning: null,
  },
  {
    id: 6,
    title: 'Match Shots',
    description: 'Ensure consistency between clips in the same scene. Use split-screen and scopes to compare and match.',
    questions: [
      'Do cuts feel visually consistent?',
      'Does the color temperature match between angles?',
      'Is the exposure consistent across the sequence?',
    ],
    tools: ['Split Screen', 'Scopes', 'Still Gallery', 'Shot Matching'],
    warning: null,
  },
  {
    id: 7,
    title: 'Secondary Corrections',
    description: 'Make targeted adjustments to specific areas or colors. Qualify skin tones, correct background colors, etc.',
    questions: [
      'Does skin tone need individual attention?',
      'Are there background color problems to address?',
      'Is there any specific color issue in the scene?',
    ],
    tools: ['HSL Qualifier', 'Power Windows', 'Tracker'],
    warning: null,
  },
  {
    id: 8,
    title: 'Creative Look',
    description: 'Apply the deliberate artistic style that serves the story. Keep this on a separate node so it can be toggled.',
    questions: [
      'What is the emotional tone of the scene?',
      'Should the look be warm, cool, desaturated, high contrast?',
      'Does this match other scenes in the project?',
    ],
    tools: ['Color Wheels', 'Curves', 'LUT', 'Node Graph'],
    warning: 'A creative look should serve the story, not the other way around. Avoid applying a LUT as a replacement for primary correction.',
  },
  {
    id: 9,
    title: 'Check Scopes',
    description: 'Review the full sequence against scopes. Check for technical errors, clipping, and consistency.',
    questions: [
      'Are there illegal levels (above 100 or below 0)?',
      'Is saturation consistent?',
      'Do scopes confirm what you are seeing visually?',
    ],
    tools: ['Histogram', 'Waveform', 'Vectorscope', 'RGB Parade'],
    warning: null,
  },
  {
    id: 10,
    title: 'Final Output Check',
    description: 'Watch at normal playback speed on a calibrated display. Make final adjustments. Verify against delivery specifications.',
    questions: [
      'Does the grade hold up at real-time playback?',
      'Are all legal range requirements met?',
      'Does it look correct on the intended delivery display?',
    ],
    tools: ['Viewer', 'Scopes', 'Deliver Page'],
    warning: 'Color management and display calibration significantly affect how grading decisions look. A properly calibrated monitor is essential for accurate work.',
  },
];

export const WorkflowsPage: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (id: number) => {
    setExpandedStep(expandedStep === id ? null : id);
  };

  const toggleComplete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(s =>
      s.includes(id) ? s.filter(x => x !== id) : [...s, id]
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Professional Grading Workflow</h1>
        <p className="text-gray-500 mb-2">The systematic approach professional colorists use.</p>

        <div className="bg-gray-900 border border-amber-900 rounded-lg p-4 mb-8">
          <p className="text-xs text-amber-300 leading-relaxed">
            <strong>Important:</strong> This workflow represents a common professional approach, not a fixed recipe. Every project is different. The order matters — doing creative before technical creates more work and less predictable results.
          </p>
        </div>

        <div className="space-y-2">
          {WORKFLOW_STEPS.map(step => {
            const isExpanded = expandedStep === step.id;
            const isCompleted = completedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className={`bg-gray-900 border rounded-lg overflow-hidden transition-all ${isCompleted ? 'border-emerald-900' : 'border-gray-800'}`}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs font-mono text-gray-600 w-5">{String(step.id).padStart(2, '0')}</span>
                    <span className={`text-sm font-medium ${isCompleted ? 'text-emerald-400' : 'text-white'}`}>
                      {step.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => toggleComplete(step.id, e)}
                      className={`p-1 rounded transition-colors ${isCompleted ? 'text-emerald-400' : 'text-gray-600 hover:text-gray-400'}`}
                      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      <CheckCircle size={14} />
                    </button>
                    {isExpanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-600" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-gray-800">
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{step.description}</p>

                    {step.warning && (
                      <div className="bg-yellow-950/50 border border-yellow-900 rounded-lg p-3 mb-4">
                        <p className="text-xs text-yellow-300 leading-relaxed">{step.warning}</p>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Questions</h4>
                        <ul className="space-y-1.5">
                          {step.questions.map(q => (
                            <li key={q} className="flex items-start gap-2 text-xs text-gray-400">
                              <span className="text-blue-500 mt-0.5 flex-shrink-0">?</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tools</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {step.tools.map(tool => (
                            <span key={tool} className="text-xs text-gray-500 bg-gray-800 border border-gray-700 px-2 py-0.5 rounded">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Workflow Progress</span>
            <span className="text-sm font-mono text-gray-400">{completedSteps.length}/{WORKFLOW_STEPS.length}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${(completedSteps.length / WORKFLOW_STEPS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">Check off steps as you work through a real grade.</p>
        </div>
      </div>
    </div>
  );
};
