export type FontSize = 'sm' | 'base' | 'lg'
export type NodePadding = 'compact' | 'normal' | 'relaxed'
export type NodeSpacing = 'compact' | 'normal' | 'relaxed'

export interface MapSettings {
  fontSize: FontSize
  padding: NodePadding
  spacing: NodeSpacing
}

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  fontSize: 'base',
  padding: 'normal',
  spacing: 'normal',
}

// CSS classes applied to node label
export const FONT_SIZE_CLASS: Record<FontSize, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
}

// CSS classes applied to node inner div
export const PADDING_CLASS: Record<NodePadding, string> = {
  compact: 'px-2 py-1',
  normal: 'px-3 py-2',
  relaxed: 'px-4 py-3',
}

// Dagre layout dimensions derived from padding + spacing
export const NODE_HEIGHT: Record<NodePadding, number> = {
  compact: 44,
  normal: 60,
  relaxed: 76,
}

export const SPACING_CONFIG: Record<NodeSpacing, { ranksep: number; nodesep: number; nodeWidth: number }> = {
  compact: { ranksep: 50, nodesep: 20, nodeWidth: 180 },
  normal:  { ranksep: 80, nodesep: 40, nodeWidth: 200 },
  relaxed: { ranksep: 120, nodesep: 60, nodeWidth: 240 },
}
