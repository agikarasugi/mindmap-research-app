import dagre from 'dagre'
import type { MindMapFlowNode, MindMapFlowEdge } from '../types/graph'

interface LayoutDimensions {
  nodeWidth: number
  nodeHeight: number
  ranksep: number
  nodesep: number
}

const DEFAULT_DIMS: LayoutDimensions = {
  nodeWidth: 200,
  nodeHeight: 60,
  ranksep: 80,
  nodesep: 40,
}

export function applyDagreLayout(
  nodes: MindMapFlowNode[],
  edges: MindMapFlowEdge[],
  direction: 'LR' | 'TB' = 'LR',
  dims: LayoutDimensions = DEFAULT_DIMS,
): MindMapFlowNode[] {
  if (nodes.length === 0) return nodes

  const { nodeWidth, nodeHeight, ranksep, nodesep } = dims

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: direction, ranksep, nodesep })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }))
  edges.forEach((e) => {
    if (e.source && e.target) g.setEdge(e.source, e.target)
  })

  dagre.layout(g)

  return nodes.map((n) => {
    const pos = g.node(n.id)
    if (!pos) return n
    return {
      ...n,
      position: {
        x: pos.x - nodeWidth / 2,
        y: pos.y - nodeHeight / 2,
      },
    }
  })
}
