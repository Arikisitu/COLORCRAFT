import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, BookOpen, Wrench, BookMarked, Keyboard } from 'lucide-react';
import { useStore } from '../lib/store';
import { LESSONS } from '../data/lessons';
import { GLOSSARY_TERMS } from '../data/glossary';
import { SHORTCUTS } from '../data/shortcuts';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'lesson' | 'tool' | 'glossary' | 'shortcut';
  action: () => void;
}

export const SearchOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { searchQuery, setSearchQuery, setActiveSection } = useStore();
  const [query, setQuery] = useState(searchQuery);

  useEffect(() => {
    const input = document.getElementById('search-overlay-input');
    input?.focus();
  }, []);

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const out: SearchResult[] = [];

    // Lessons
    LESSONS.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.tags.some(t => t.toLowerCase().includes(q))
    ).slice(0, 4).forEach(l => {
      out.push({
        id: `lesson-${l.id}`,
        title: l.title,
        subtitle: `${l.category} · ${l.level}`,
        type: 'lesson',
        action: () => { setActiveSection('learn'); onClose(); },
      });
    });

    // Glossary
    GLOSSARY_TERMS.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.simpleDefinition.toLowerCase().includes(q)
    ).slice(0, 3).forEach(t => {
      out.push({
        id: `glossary-${t.id}`,
        title: t.term,
        subtitle: t.simpleDefinition.slice(0, 60) + '...',
        type: 'glossary',
        action: () => { setActiveSection('glossary'); onClose(); },
      });
    });

    // Shortcuts
    SHORTCUTS.filter(s =>
      s.action.toLowerCase().includes(q) ||
      s.shortcut.toLowerCase().includes(q)
    ).slice(0, 3).forEach(s => {
      out.push({
        id: `shortcut-${s.id}`,
        title: s.action,
        subtitle: s.shortcut,
        type: 'shortcut',
        action: () => { setActiveSection('shortcuts'); onClose(); },
      });
    });

    return out;
  }, [query, setActiveSection, onClose]);

  const typeIcons: Record<string, React.ReactNode> = {
    lesson: <BookOpen size={13} className="text-blue-400" />,
    tool: <Wrench size={13} className="text-emerald-400" />,
    glossary: <BookMarked size={13} className="text-purple-400" />,
    shortcut: <Keyboard size={13} className="text-orange-400" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search size={16} className="text-gray-500 flex-shrink-0" />
          <input
            id="search-overlay-input"
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSearchQuery(e.target.value); }}
            placeholder="Search color tools, lessons, terminology..."
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 focus:outline-none"
          />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-600 text-sm">No results for "{query}"</div>
          )}
          {!query && (
            <div className="px-4 py-6 text-center">
              <p className="text-gray-600 text-sm">Type to search lessons, tools, terms, and shortcuts.</p>
              <p className="text-gray-700 text-xs mt-1">Press Escape to close</p>
            </div>
          )}
          {results.map(r => (
            <button
              key={r.id}
              onClick={r.action}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800 transition-colors text-left border-b border-gray-800/50"
            >
              <div className="mt-0.5 flex-shrink-0">{typeIcons[r.type]}</div>
              <div>
                <div className="text-sm text-gray-200">{r.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{r.subtitle}</div>
              </div>
              <div className="ml-auto flex-shrink-0">
                <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded capitalize">{r.type}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-gray-800 flex gap-4 text-[10px] text-gray-600">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
};
