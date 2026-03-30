import type { Node, Edge } from '@xyflow/react'

export interface MindMapNodeData extends Record<string, unknown> {
  label: string
  content?: string
  link?: string
  nodeStyle?: {
    color?: string
    shape?: 'rectangle' | 'pill' | 'diamond'
  }
  isCollapsed: boolean
  hasChildren: boolean
}

export type MindMapFlowNode = Node<MindMapNodeData, 'mindmap'>
export type MindMapFlowEdge = Edge
