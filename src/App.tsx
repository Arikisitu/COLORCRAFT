import React, { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { SearchOverlay } from './components/SearchOverlay';
import { HomePage } from './pages/HomePage';
import { PlaygroundPage } from './pages/PlaygroundPage';
import { LearnPage } from './pages/LearnPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { ShortcutsPage } from './pages/ShortcutsPage';
import { LooksPage } from './pages/LooksPage';
import { ScopesPage } from './pages/ScopesPage';
import { NodesPage } from './pages/NodesPage';
import { PracticePage } from './pages/PracticePage';
import { ToolsPage } from './pages/ToolsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { ResourcesPage } from './pages/ResourcesPage';

const App: React.FC = () => {
  const { activeSection, undo, redo } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search shortcut
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          if (!['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
            e.preventDefault();
            undo();
          }
        }
        if (e.key === 'z' && e.shiftKey) {
          if (!['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) {
            e.preventDefault();
            redo();
          }
        }
      }
      // Close sidebar on Escape
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const renderPage = () => {
    switch (activeSection) {
      case 'home': return <HomePage />;
      case 'playground': return <PlaygroundPage />;
      case 'learn': return <LearnPage />;
      case 'glossary': return <GlossaryPage />;
      case 'shortcuts': return <ShortcutsPage />;
      case 'looks': return <LooksPage />;
      case 'scopes': return <ScopesPage />;
      case 'nodes': return <NodesPage />;
      case 'practice': return <PracticePage />;
      case 'tools': return <ToolsPage />;
      case 'workflows': return <WorkflowsPage />;
      case 'resources': return <ResourcesPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex-1 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <Sidebar mobile onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay onClose={() => setSearchOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onSearchClick={() => setSearchOpen(true)} />

        {/* Page content */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
