import { Shortcut } from '../types';

export const SHORTCUTS: Shortcut[] = [
  // Navigation
  { id: 's01', action: 'Go to Color Page', shortcut: 'Shift+6', description: 'Switch to the Color page', category: 'Navigation' },
  { id: 's02', action: 'Go to Edit Page', shortcut: 'Shift+4', description: 'Switch to the Edit page', category: 'Navigation' },
  { id: 's03', action: 'Go to Cut Page', shortcut: 'Shift+2', description: 'Switch to the Cut page', category: 'Navigation' },
  { id: 's04', action: 'Go to Deliver Page', shortcut: 'Shift+8', description: 'Switch to the Deliver page', category: 'Navigation' },
  // Playback
  { id: 's05', action: 'Play/Pause', shortcut: 'Space', description: 'Toggle playback', category: 'Playback' },
  { id: 's06', action: 'Frame Forward', shortcut: '→', description: 'Advance one frame', category: 'Playback' },
  { id: 's07', action: 'Frame Backward', shortcut: '←', description: 'Go back one frame', category: 'Playback' },
  { id: 's08', action: 'Go to Start', shortcut: 'Home', description: 'Jump to the first frame', category: 'Playback' },
  { id: 's09', action: 'Go to End', shortcut: 'End', description: 'Jump to the last frame', category: 'Playback' },
  { id: 's10', action: 'Shuttle Forward', shortcut: 'L', description: 'Increase forward playback speed', category: 'Playback' },
  { id: 's11', action: 'Shuttle Backward', shortcut: 'J', description: 'Increase backward playback speed', category: 'Playback' },
  { id: 's12', action: 'Stop', shortcut: 'K', description: 'Stop playback', category: 'Playback' },
  // Viewer
  { id: 's13', action: 'Highlight', shortcut: 'H', description: 'Show qualifier highlight overlay', category: 'Viewer' },
  { id: 's14', action: 'Bypass All Grades', shortcut: 'Shift+D', description: 'Toggle all color corrections off', category: 'Viewer' },
  { id: 's15', action: 'Grab Still', shortcut: 'Ctrl+Alt+G', description: 'Capture current frame as a still', category: 'Viewer' },
  { id: 's16', action: 'Wipe Mode', shortcut: 'W', description: 'Toggle before/after wipe in viewer', category: 'Viewer' },
  // Nodes
  { id: 's17', action: 'Add Serial Node', shortcut: 'Alt+S', description: 'Add a new serial node after current', category: 'Nodes' },
  { id: 's18', action: 'Add Parallel Node', shortcut: 'Alt+P', description: 'Add a parallel node branch', category: 'Nodes' },
  { id: 's19', action: 'Add Layer Node', shortcut: 'Alt+L', description: 'Add a layer mixer node', category: 'Nodes' },
  { id: 's20', action: 'Add Outside Node', shortcut: 'Alt+O', description: 'Add an outside node for inverse selection', category: 'Nodes' },
  { id: 's21', action: 'Bypass Node', shortcut: 'Ctrl+D', description: 'Toggle the current node on/off', category: 'Nodes' },
  { id: 's22', action: 'Delete Node', shortcut: 'Backspace', description: 'Remove the selected node', category: 'Nodes' },
  { id: 's23', action: 'Extract Node', shortcut: 'Ctrl+Backspace', description: 'Remove node and reconnect graph', category: 'Nodes' },
  // Color Page
  { id: 's24', action: 'Reset All', shortcut: 'Ctrl+Shift+Home', description: 'Reset all color corrections on current node', category: 'Color Page' },
  { id: 's25', action: 'Copy Grade', shortcut: 'Ctrl+Shift+C', description: 'Copy the grade from current clip', category: 'Color Page' },
  { id: 's26', action: 'Paste Grade', shortcut: 'Ctrl+Shift+V', description: 'Paste grade to selected clips', category: 'Color Page' },
  { id: 's27', action: 'Undo', shortcut: 'Ctrl+Z', description: 'Undo last action', category: 'Color Page' },
  { id: 's28', action: 'Redo', shortcut: 'Ctrl+Shift+Z', description: 'Redo last undone action', category: 'Color Page' },
  { id: 's29', action: 'Next Clip', shortcut: ']', description: 'Move to the next clip in timeline', category: 'Color Page' },
  { id: 's30', action: 'Previous Clip', shortcut: '[', description: 'Move to the previous clip in timeline', category: 'Color Page' },
  // Scopes
  { id: 's31', action: 'Show Histogram', shortcut: 'Ctrl+Shift+H', description: 'Display the histogram scope', category: 'Scopes' },
  { id: 's32', action: 'Show Waveform', shortcut: 'Ctrl+Shift+W', description: 'Display the waveform scope', category: 'Scopes' },
  { id: 's33', action: 'Show Vectorscope', shortcut: 'Ctrl+Shift+V', description: 'Display the vectorscope', category: 'Scopes' },
  { id: 's34', action: 'Show Parade', shortcut: 'Ctrl+Shift+P', description: 'Display the RGB parade scope', category: 'Scopes' },
];
