import React, { useState, useRef } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy } from 'lucide-react';
import { NodeData, NodeGraph as NodeGraphType, NodeConnection } from '../types';

interface NodeGraphProps {
  graph: NodeGraphType;
  onChange: (graph: NodeGraphType) => void;
  compact?: boolean;
}

const NODE_COLORS: Record<NodeData['type'], string> = {
  serial: '#3b82f6',
  parallel: '#8b5cf6',
  layer: '#f59e0b',
  key: '#10b981',
  outside: '#ef4444',
  splitter: '#6b7280',
  combiner: '#6b7280',
};

const NODE_LABELS: Record<NodeData['type'], string> = {
  serial: 'Serial',
  parallel: 'Parallel',
  layer: 'Layer',
  key: 'Key',
  outside: 'Outside',
  splitter: 'Split',
  combiner: 'Combine',
};

let nodeIdCounter = 10;

export const NodeGraph: React.FC<NodeGraphProps> = ({ graph, onChange, compact = false }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = () => {
    const lastNode = graph.nodes[graph.nodes.length - 1];
    const newNode: NodeData = {
      id: `n${++nodeIdCounter}`,
      label: `Node ${nodeIdCounter}`,
      type: 'serial',
      bypassed: false,
      x: lastNode ? lastNode.x + 140 : 80,
      y: 160,
    };
    const newConn: NodeConnection | null = lastNode ? { from: lastNode.id, to: newNode.id } : null;
    onChange({
      nodes: [...graph.nodes, newNode],
      connections: newConn ? [...graph.connections, newConn] : graph.connections,
    });
  };

  const removeNode = (id: string) => {
    onChange({
      nodes: graph.nodes.filter(n => n.id !== id),
      connections: graph.connections.filter(c => c.from !== id && c.to !== id),
    });
    if (selectedId === id) setSelectedId(null);
  };

  const toggleBypass = (id: string) => {
    onChange({
      ...graph,
      nodes: graph.nodes.map(n => n.id === id ? { ...n, bypassed: !n.bypassed } : n),
    });
  };

  const duplicateNode = (node: NodeData) => {
    const newNode: NodeData = {
      ...node,
      id: `n${++nodeIdCounter}`,
      label: `${node.label} Copy`,
      x: node.x + 10,
      y: node.y + 30,
    };
    onChange({ ...graph, nodes: [...graph.nodes, newNode] });
  };

  const startEdit = (node: NodeData) => {
    setEditingId(node.id);
    setEditLabel(node.label);
  };

  const finishEdit = (id: string) => {
    if (editLabel.trim()) {
      onChange({
        ...graph,
        nodes: graph.nodes.map(n => n.id === id ? { ...n, label: editLabel.trim() } : n),
      });
    }
    setEditingId(null);
  };

  const nodeWidth = compact ? 80 : 100;
  const nodeHeight = compact ? 44 : 56;

  // Calculate SVG paths for connections
  const getPath = (from: NodeData, to: NodeData): string => {
    const x1 = from.x + nodeWidth;
    const y1 = from.y + nodeHeight / 2;
    const x2 = to.x;
    const y2 = to.y + nodeHeight / 2;
    const cp = Math.abs(x2 - x1) / 2;
    return `M ${x1} ${y1} C ${x1 + cp} ${y1} ${x2 - cp} ${y2} ${x2} ${y2}`;
  };

  const svgW = Math.max(...graph.nodes.map(n => n.x + nodeWidth + 40), 400);
  const svgH = Math.max(...graph.nodes.map(n => n.y + nodeHeight + 40), 200);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Node Graph</span>
        <button
          onClick={addNode}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          <Plus size={12} />
          Add Node
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto bg-gray-950 rounded border border-gray-800"
        style={{ minHeight: compact ? 120 : 200 }}
      >
        <svg
          width={svgW}
          height={svgH}
          className="absolute inset-0"
          style={{ pointerEvents: 'none' }}
        >
          {/* Grid dots */}
          <pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#1f2937" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Connections */}
          {graph.connections.map((conn, i) => {
            const from = graph.nodes.find(n => n.id === conn.from);
            const to = graph.nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;
            return (
              <path
                key={i}
                d={getPath(from, to)}
                fill="none"
                stroke="#374151"
                strokeWidth={2}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const color = NODE_COLORS[node.type];
          const isSelected = selectedId === node.id;
          return (
            <div
              key={node.id}
              className="absolute select-none"
              style={{ left: node.x, top: node.y, width: nodeWidth, height: nodeHeight }}
              onClick={() => setSelectedId(isSelected ? null : node.id)}
            >
              <div
                className={`
                  relative w-full h-full rounded border-2 flex flex-col items-center justify-center gap-0.5
                  transition-all cursor-pointer
                  ${node.bypassed ? 'opacity-40' : ''}
                  ${isSelected ? 'shadow-lg shadow-blue-500/20' : ''}
                `}
                style={{
                  borderColor: isSelected ? color : `${color}60`,
                  backgroundColor: `${color}15`,
                }}
              >
                {/* Connector dots */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-1.5 h-1.5 rounded-full bg-gray-500" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-1.5 h-1.5 rounded-full bg-gray-500" />

                {editingId === node.id ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onBlur={() => finishEdit(node.id)}
                    onKeyDown={e => { if (e.key === 'Enter') finishEdit(node.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="w-full text-center text-xs bg-transparent text-white border-none outline-none px-1"
                    onClick={e => e.stopPropagation()}
                  />
                ) : (
                  <span
                    className="text-xs font-medium text-gray-200 truncate px-1 text-center"
                    onDoubleClick={(e) => { e.stopPropagation(); startEdit(node); }}
                    title="Double-click to rename"
                  >
                    {node.label}
                  </span>
                )}

                <span className="text-[9px] text-gray-500" style={{ color: `${color}aa` }}>
                  {NODE_LABELS[node.type]}
                </span>

                {isSelected && !compact && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-gray-900 border border-gray-700 rounded px-1 py-0.5 z-10">
                    <button onClick={(e) => { e.stopPropagation(); toggleBypass(node.id); }} title={node.bypassed ? 'Enable' : 'Bypass'} className="text-gray-400 hover:text-yellow-400">
                      {node.bypassed ? <Eye size={10} /> : <EyeOff size={10} />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); duplicateNode(node); }} title="Duplicate" className="text-gray-400 hover:text-blue-400">
                      <Copy size={10} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeNode(node.id); }} title="Delete" className="text-gray-400 hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-600">Click to select • Double-click label to rename</p>
    </div>
  );
};
