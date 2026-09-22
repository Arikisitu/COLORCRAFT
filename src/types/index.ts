export interface Vector3 {
  r: number;
  g: number;
  b: number;
}

export interface GradeState {
  exposure: number;
  contrast: number;
  pivot: number;
  gamma: number;
  gain: number;
  lift: number;
  offset: number;
  temperature: number;
  tint: number;
  saturation: number;
  vibrance: number;
  hue: number;
  highlights: number;
  shadows: number;
  midtones: number;
  whites: number;
  blacks: number;
  midtoneDetail: number;
  colorBoost: number;
  liftRGB: Vector3;
  gammaRGB: Vector3;
  gainRGB: Vector3;
  offsetRGB: Vector3;
  curvePoints: CurvePoints;
}

export interface CurvePoint {
  x: number;
  y: number;
}

export interface CurvePoints {
  master: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export interface GradePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  grade: Partial<GradeState>;
  tags: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  category: string;
  duration: number; // minutes
  completed?: boolean;
  tags: string[];
  slug: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  simpleDefinition: string;
  technicalDefinition: string;
  example: string;
  relatedTools: string[];
  category: string;
}

export interface Shortcut {
  id: string;
  action: string;
  shortcut: string;
  description: string;
  category: string;
  version?: string;
  tier?: 'free' | 'studio';
}

export interface SampleMedia {
  id: string;
  title: string;
  type: 'image' | 'video';
  category: string;
  src: string;
  thumbnail?: string;
  source: string;
  license: string;
  author: string;
  attribution: string;
}

export interface NodeData {
  id: string;
  label: string;
  type: 'serial' | 'parallel' | 'layer' | 'key' | 'outside' | 'splitter' | 'combiner';
  bypassed: boolean;
  grade?: Partial<GradeState>;
  x: number;
  y: number;
}

export interface NodeConnection {
  from: string;
  to: string;
}

export interface NodeGraph {
  nodes: NodeData[];
  connections: NodeConnection[];
}

export type ViewMode = 'split' | 'slider' | 'toggle';
export type MediaMode = 'photo' | 'video';
export type PerformanceMode = 'low' | 'balanced' | 'high';
export type AppMode = 'explanation' | 'experiment';
