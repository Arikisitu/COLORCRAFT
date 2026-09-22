import React, { useState } from 'react';
import { Search, Menu, Undo2, Redo2, Film, RotateCcw } from 'lucide-react';
import { useStore } from '../lib/store';

interface TopBarProps {
  onMenuClick: () => void;
  onSearchClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick, onSearchClick }) => {
  const { undo, redo, historyIndex, history, resetAll, searchQuery, setSearchQuery } = useStore();
  const [resetConfirm, setResetConfirm] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleReset = () => {
    if (resetConfirm) {
      resetAll();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 2500);
    }
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-gray-950 border-b border-gray-800 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Film size={10} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white tracking-tight">COLORCRAFT</span>
          <span className="text-xs text-gray-600">DaVinci Resolve Color Grading Lab</span>
        </div>
      </div>

      {/* Center — Search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder='Search color tools, lessons, terminology...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => onSearchClick?.()}
            className="w-full text-xs bg-gray-900 border border-gray-800 rounded-md pl-8 pr-3 py-1.5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-700 transition-colors cursor-pointer"
            readOnly
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-600 bg-gray-800 px-1 py-0.5 rounded">/</kbd>
        </div>
      </div>

      {/* Right — History controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Shift+Z)"
          aria-label="Redo"
        >
          <Redo2 size={14} />
        </button>
        <div className="w-px h-4 bg-gray-800 mx-1" />
        <button
          onClick={handleReset}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            resetConfirm
              ? 'bg-red-900 text-red-300 border border-red-800'
              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
          title="Reset all grade settings"
        >
          <RotateCcw size={12} />
          <span className="hidden sm:inline">{resetConfirm ? 'Confirm?' : 'Reset'}</span>
        </button>
      </div>
    </header>
  );
};
