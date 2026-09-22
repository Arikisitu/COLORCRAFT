import React from 'react';
import {
  Home, BookOpen, FlaskConical, Wrench, Activity, GitFork,
  Palette, Workflow, Target, BookMarked, Keyboard, ExternalLink,
  ChevronRight, Search, X, Film, TrendingUp
} from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../utils/cn';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home size={16} /> },
  { id: 'learn', label: 'Learn', icon: <BookOpen size={16} /> },
  { id: 'playground', label: 'Playground', icon: <FlaskConical size={16} />, badge: 'LIVE' },
  { id: 'tools', label: 'Color Tools', icon: <Wrench size={16} /> },
  { id: 'scopes', label: 'Scopes', icon: <Activity size={16} /> },
  { id: 'nodes', label: 'Nodes', icon: <GitFork size={16} /> },
  { id: 'looks', label: 'Looks', icon: <Palette size={16} /> },
  { id: 'workflows', label: 'Workflows', icon: <Workflow size={16} /> },
  { id: 'practice', label: 'Practice', icon: <Target size={16} /> },
  { id: 'glossary', label: 'Glossary', icon: <BookMarked size={16} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <Keyboard size={16} /> },
  { id: 'resources', label: 'Resources', icon: <ExternalLink size={16} /> },
];

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobile, onClose }) => {
  const { activeSection, setActiveSection, getProgressPercent, searchQuery, setSearchQuery } = useStore();
  const progress = getProgressPercent();

  const handleNav = (id: string) => {
    setActiveSection(id);
    if (onClose) onClose();
  };

  return (
    <nav className={cn(
      'flex flex-col bg-gray-950 border-r border-gray-800 h-full',
      mobile ? 'w-72' : 'w-56 hidden lg:flex'
    )}>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Film size={12} className="text-white" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">COLORCRAFT</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 ml-8">DaVinci Resolve Color Lab</p>
          </div>
          {mobile && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Version selector */}
      <div className="px-3 py-2 border-b border-gray-800">
        <select className="w-full text-xs bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-gray-600">
          <option value="21">Resolve 21</option>
          <option value="20">Resolve 20</option>
        </select>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-gray-800">
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search tools, lessons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-gray-900 border border-gray-700 rounded pl-7 pr-3 py-1.5 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600"
          />
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors group',
              activeSection === item.id
                ? 'bg-gray-800 text-white'
                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={cn(
                'transition-colors',
                activeSection === item.id ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'
              )}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-1">
              {item.badge && (
                <span className="text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
              {activeSection === item.id && (
                <ChevronRight size={12} className="text-gray-500" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="px-3 py-3 border-t border-gray-800">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} className="text-gray-500" />
            <span className="text-xs text-gray-500">Course Progress</span>
          </div>
          <span className="text-xs font-mono text-gray-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </nav>
  );
};
