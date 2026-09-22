import React, { useState } from 'react';
import { Search, Star } from 'lucide-react';
import { useStore } from '../lib/store';
import { SHORTCUTS } from '../data/shortcuts';
import { cn } from '../utils/cn';

export const ShortcutsPage: React.FC = () => {
  const { progress, toggleFavoriteShortcut } = useStore();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const categories = ['all', ...Array.from(new Set(SHORTCUTS.map(s => s.category)))];

  const filtered = SHORTCUTS.filter(s => {
    const q = query.toLowerCase();
    const matchesQuery = !q || s.action.toLowerCase().includes(q) || s.shortcut.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesFav = !showFavoritesOnly || progress.favoritedShortcuts.includes(s.id);
    return matchesQuery && matchesCat && matchesFav;
  });

  const grouped = filtered.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, typeof SHORTCUTS>);

  const formatKey = (key: string) => {
    return key.split('+').map(k => (
      <kbd key={k} className="inline-block bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono px-1.5 py-0.5 rounded mx-0.5">
        {k.trim()}
      </kbd>
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-1">Keyboard Shortcuts</h1>
        <p className="text-gray-500 mb-6">DaVinci Resolve Color page shortcuts reference.</p>

        <div className="bg-yellow-950/50 border border-yellow-900 rounded-lg p-3 mb-6">
          <p className="text-xs text-yellow-300">
            <strong>Note:</strong> These shortcuts are for DaVinci Resolve 20/21. Some may differ between Free and Studio versions. Always verify in Resolve's preferences.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full text-xs bg-gray-900 border border-gray-800 rounded pl-8 pr-3 py-2 text-gray-300 placeholder-gray-600 focus:outline-none"
            />
          </div>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded border capitalize transition-colors',
                  selectedCategory === cat ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-800 text-gray-500 hover:text-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowFavoritesOnly(f => !f)}
            className={cn(
              'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors',
              showFavoritesOnly ? 'bg-yellow-950 border-yellow-800 text-yellow-400' : 'border-gray-800 text-gray-500 hover:text-gray-300'
            )}
          >
            <Star size={11} /> Favorites {progress.favoritedShortcuts.length > 0 && `(${progress.favoritedShortcuts.length})`}
          </button>
        </div>

        {/* Shortcuts */}
        {Object.entries(grouped).map(([category, shortcuts]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">{category}</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-xs text-gray-500 px-4 py-2 font-medium">Action</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-2 font-medium">Shortcut</th>
                    <th className="text-left text-xs text-gray-500 px-4 py-2 font-medium hidden md:table-cell">Description</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((s, i) => {
                    const isFav = progress.favoritedShortcuts.includes(s.id);
                    return (
                      <tr
                        key={s.id}
                        className={cn(
                          'border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors',
                          i === shortcuts.length - 1 && 'border-b-0'
                        )}
                      >
                        <td className="px-4 py-2.5 text-xs text-gray-300">{s.action}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-0.5">
                            {formatKey(s.shortcut)}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 hidden md:table-cell">{s.description}</td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => toggleFavoriteShortcut(s.id)}
                            className={cn('transition-colors', isFav ? 'text-yellow-400' : 'text-gray-700 hover:text-gray-500')}
                            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No shortcuts match your search.
          </div>
        )}
      </div>
    </div>
  );
};
