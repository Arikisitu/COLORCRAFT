import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { GLOSSARY_TERMS } from '../data/glossary';
import { cn } from '../utils/cn';

export const GlossaryPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  const categories = ['all', ...Array.from(new Set(GLOSSARY_TERMS.map(t => t.category)))];

  const filtered = GLOSSARY_TERMS.filter(t => {
    const q = query.toLowerCase();
    const matchesQuery = !q || t.term.toLowerCase().includes(q) || t.simpleDefinition.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  const selected = selectedTerm ? GLOSSARY_TERMS.find(t => t.id === selectedTerm) : null;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* List */}
      <div className="w-full lg:w-80 border-r border-gray-800 flex flex-col bg-gray-950">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white mb-3">Glossary</h1>
          <div className="relative mb-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search terms..."
              className="w-full text-xs bg-gray-900 border border-gray-800 rounded pl-8 pr-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'text-[10px] px-2 py-1 rounded border capitalize transition-colors',
                  selectedCategory === cat ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-800 text-gray-500 hover:text-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(term => (
            <button
              key={term.id}
              onClick={() => setSelectedTerm(term.id)}
              className={cn(
                'w-full text-left px-4 py-3 border-b border-gray-900 transition-colors',
                selectedTerm === term.id ? 'bg-gray-800' : 'hover:bg-gray-900'
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-medium text-white">{term.term}</span>
                <span className="text-[10px] text-gray-600 bg-gray-900 px-1.5 py-0.5 rounded">{term.category}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{term.simpleDefinition}</p>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-6 text-center text-gray-600 text-sm">No terms found</div>
          )}
        </div>
      </div>

      {/* Detail */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
        {selected ? (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-white">{selected.term}</h2>
              <span className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-2 py-1 rounded">{selected.category}</span>
            </div>

            <div className="space-y-6 mt-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Simple Definition</h3>
                <p className="text-gray-300 leading-relaxed">{selected.simpleDefinition}</p>
              </div>

              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Technical Definition</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{selected.technicalDefinition}</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-2">Example</h3>
                <p className="text-gray-300 text-sm leading-relaxed italic">{selected.example}</p>
              </div>

              {selected.relatedTools.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Related Tools</h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.relatedTools.map(tool => (
                      <span key={tool} className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">📖</div>
              <p className="text-gray-500">Select a term from the list to view its definition.</p>
              <p className="text-gray-600 text-sm mt-1">{GLOSSARY_TERMS.length} terms available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
