import { create } from 'zustand';
import { GradeState, NodeGraph, NodeData, ViewMode, MediaMode, AppMode } from '../types';
import { DEFAULT_GRADE } from '../data/grades';

interface HistoryEntry {
  grade: GradeState;
  timestamp: number;
}

interface Progress {
  completedLessons: string[];
  favoritedShortcuts: string[];
  recentLessons: string[];
  customGrades: { name: string; grade: GradeState }[];
}

interface AppStore {
  // Grade state
  grade: GradeState;
  setGrade: (partial: Partial<GradeState>) => void;
  resetGrade: () => void;
  resetAll: () => void;

  // History
  history: HistoryEntry[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  pushHistory: (grade: GradeState) => void;

  // Node graph
  nodeGraph: NodeGraph;
  setNodeGraph: (graph: NodeGraph) => void;
  addNode: (node: NodeData) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, updates: Partial<NodeData>) => void;

  // UI state
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  mediaMode: MediaMode;
  setMediaMode: (mode: MediaMode) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  selectedSample: string;
  setSelectedSample: (id: string) => void;
  selectedPreset: string | null;
  setSelectedPreset: (id: string | null) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Progress tracking
  progress: Progress;
  completeLesson: (id: string) => void;
  toggleFavoriteShortcut: (id: string) => void;
  addRecentLesson: (id: string) => void;
  saveCustomGrade: (name: string, grade: GradeState) => void;
  getProgressPercent: () => number;

  // WebGL readiness
  webGLAvailable: boolean;
  setWebGLAvailable: (v: boolean) => void;
}

const MAX_HISTORY = 50;

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem('colorcraft-progress');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    completedLessons: [],
    favoritedShortcuts: [],
    recentLessons: [],
    customGrades: [],
  };
}

function saveProgress(progress: Progress) {
  try {
    localStorage.setItem('colorcraft-progress', JSON.stringify(progress));
  } catch {}
}

const DEFAULT_NODE_GRAPH: NodeGraph = {
  nodes: [
    { id: 'n1', label: 'Balance', type: 'serial', bypassed: false, x: 80, y: 160 },
    { id: 'n2', label: 'Contrast', type: 'serial', bypassed: false, x: 220, y: 160 },
    { id: 'n3', label: 'Creative Look', type: 'serial', bypassed: false, x: 360, y: 160 },
  ],
  connections: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3' },
  ],
};

export const useStore = create<AppStore>((set, get) => ({
  grade: { ...DEFAULT_GRADE },
  setGrade: (partial) => {
    const newGrade = { ...get().grade, ...partial };
    get().pushHistory(newGrade);
    set({ grade: newGrade });
  },
  resetGrade: () => {
    const g = { ...DEFAULT_GRADE };
    get().pushHistory(g);
    set({ grade: g });
  },
  resetAll: () => {
    const g = { ...DEFAULT_GRADE };
    set({ grade: g, history: [{ grade: g, timestamp: Date.now() }], historyIndex: 0 });
  },

  history: [{ grade: { ...DEFAULT_GRADE }, timestamp: Date.now() }],
  historyIndex: 0,
  pushHistory: (grade) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ grade: { ...grade }, timestamp: Date.now() });
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ grade: { ...history[newIndex].grade }, historyIndex: newIndex });
    }
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ grade: { ...history[newIndex].grade }, historyIndex: newIndex });
    }
  },

  nodeGraph: DEFAULT_NODE_GRAPH,
  setNodeGraph: (graph) => set({ nodeGraph: graph }),
  addNode: (node) => {
    const { nodeGraph } = get();
    set({ nodeGraph: { ...nodeGraph, nodes: [...nodeGraph.nodes, node] } });
  },
  removeNode: (id) => {
    const { nodeGraph } = get();
    set({
      nodeGraph: {
        nodes: nodeGraph.nodes.filter(n => n.id !== id),
        connections: nodeGraph.connections.filter(c => c.from !== id && c.to !== id),
      },
    });
  },
  updateNode: (id, updates) => {
    const { nodeGraph } = get();
    set({
      nodeGraph: {
        ...nodeGraph,
        nodes: nodeGraph.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      },
    });
  },

  viewMode: 'slider',
  setViewMode: (mode) => set({ viewMode: mode }),
  mediaMode: 'photo',
  setMediaMode: (mode) => set({ mediaMode: mode }),
  appMode: 'explanation',
  setAppMode: (mode) => set({ appMode: mode }),
  selectedSample: 'portrait-01',
  setSelectedSample: (id) => set({ selectedSample: id }),
  selectedPreset: null,
  setSelectedPreset: (id) => set({ selectedPreset: id }),
  activeSection: 'home',
  setActiveSection: (section) => set({ activeSection: section }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  progress: loadProgress(),
  completeLesson: (id) => {
    const { progress } = get();
    const updated = {
      ...progress,
      completedLessons: [...new Set([...progress.completedLessons, id])],
    };
    saveProgress(updated);
    set({ progress: updated });
  },
  toggleFavoriteShortcut: (id) => {
    const { progress } = get();
    const favs = progress.favoritedShortcuts.includes(id)
      ? progress.favoritedShortcuts.filter(s => s !== id)
      : [...progress.favoritedShortcuts, id];
    const updated = { ...progress, favoritedShortcuts: favs };
    saveProgress(updated);
    set({ progress: updated });
  },
  addRecentLesson: (id) => {
    const { progress } = get();
    const recent = [id, ...progress.recentLessons.filter(r => r !== id)].slice(0, 5);
    const updated = { ...progress, recentLessons: recent };
    saveProgress(updated);
    set({ progress: updated });
  },
  saveCustomGrade: (name, grade) => {
    const { progress } = get();
    const updated = {
      ...progress,
      customGrades: [...progress.customGrades, { name, grade }],
    };
    saveProgress(updated);
    set({ progress: updated });
  },
  getProgressPercent: () => {
    const { progress } = get();
    const total = 24; // total lessons
    return Math.round((progress.completedLessons.length / total) * 100);
  },

  webGLAvailable: true,
  setWebGLAvailable: (v) => set({ webGLAvailable: v }),
}));
