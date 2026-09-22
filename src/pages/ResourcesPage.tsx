import React from 'react';
import { ExternalLink, BookOpen, Video, FileText } from 'lucide-react';

const RESOURCES = [
  {
    category: 'Official Documentation',
    items: [
      {
        title: 'DaVinci Resolve Reference Manual',
        url: 'https://www.blackmagicdesign.com/support/family/davinci-resolve-and-fusion',
        description: 'The complete official reference manual from Blackmagic Design.',
        type: 'doc',
      },
      {
        title: 'DaVinci Resolve Training',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve/training',
        description: 'Official training materials and certification from Blackmagic Design.',
        type: 'course',
      },
    ],
  },
  {
    category: 'Color Science',
    items: [
      {
        title: 'Rec. 709 (ITU-R BT.709)',
        url: 'https://www.itu.int/rec/R-REC-BT.709/',
        description: 'The international standard for HDTV color primaries, white point, and transfer functions.',
        type: 'standard',
      },
      {
        title: 'ACES Central',
        url: 'https://acescentral.com',
        description: 'Official resource for the Academy Color Encoding System workflow.',
        type: 'reference',
      },
      {
        title: 'ICC Color Consortium',
        url: 'https://www.color.org',
        description: 'Color management standards and ICC profile specifications.',
        type: 'standard',
      },
    ],
  },
  {
    category: 'Learning',
    items: [
      {
        title: 'Color Science by Matt Easton',
        url: 'https://www.youtube.com/c/SchoolofMotion',
        description: 'In-depth color science education for film and video professionals.',
        type: 'video',
      },
      {
        title: 'Mixing Light',
        url: 'https://mixinglight.com',
        description: 'Professional colorist training and industry insights.',
        type: 'course',
      },
    ],
  },
  {
    category: 'Tools',
    items: [
      {
        title: 'DaVinci Resolve (Free)',
        url: 'https://www.blackmagicdesign.com/products/davinciresolve',
        description: 'Download the full professional color grading software from Blackmagic Design.',
        type: 'tool',
      },
      {
        title: 'Open Color IO',
        url: 'https://opencolorio.org',
        description: 'The open-source color management framework used by major VFX and color tools.',
        type: 'tool',
      },
    ],
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  doc: <FileText size={14} />,
  course: <BookOpen size={14} />,
  video: <Video size={14} />,
  standard: <FileText size={14} />,
  reference: <BookOpen size={14} />,
  tool: <ExternalLink size={14} />,
};

const typeColors: Record<string, string> = {
  doc: 'text-blue-400 bg-blue-950',
  course: 'text-purple-400 bg-purple-950',
  video: 'text-red-400 bg-red-950',
  standard: 'text-gray-400 bg-gray-800',
  reference: 'text-emerald-400 bg-emerald-950',
  tool: 'text-orange-400 bg-orange-950',
};

export const ResourcesPage: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Resources & References</h1>
        <p className="text-gray-500 mb-2">Official documentation and trusted external resources.</p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-8">
          <p className="text-xs text-gray-500 leading-relaxed">
            The primary technical reference for all DaVinci Resolve-specific content on COLORCRAFT is the official Blackmagic Design DaVinci Resolve documentation. Where technical claims are made, they are based on the official manual and verified specifications. Educational interpretations are clearly marked.
          </p>
        </div>

        {RESOURCES.map(section => (
          <div key={section.category} className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{section.category}</h2>
            <div className="space-y-3">
              {section.items.map(item => (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg p-4 group transition-colors"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${typeColors[item.type] || 'text-gray-400 bg-gray-800'}`}>
                    {typeIcons[item.type] || <ExternalLink size={14} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{item.title}</span>
                      <ExternalLink size={12} className="text-gray-600 flex-shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Attributions */}
        <div className="mt-8 border-t border-gray-800 pt-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Media Attributions</h2>
          <p className="text-xs text-gray-500 mb-4">
            Sample images used in COLORCRAFT are sourced from Unsplash under the Unsplash License, which permits free use for educational purposes.
          </p>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-2">
            {[
              'Portrait — Natural Light: Unsplash License',
              'Night City — Neon: Unsplash License',
              'Landscape — Mountains: Unsplash License',
              'Golden Hour — Outdoor: Unsplash License',
              'Interior — Warm Light: Unsplash License',
              'Cinematic Street: Unsplash License',
            ].map(attr => (
              <div key={attr} className="text-xs text-gray-500 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                {attr}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-3">
            No copyrighted film stills or proprietary media are used. All sample media is properly licensed for educational use.
          </p>
        </div>
      </div>
    </div>
  );
};
