import dagre from 'dagre'
import type { MindMapFlowNode, MindMapFlowEdge } from '../types/graph'

const NODE_WIDTH = 200
const NODE_HEIGHT = 60

export function applyDagreLayout(
  nodes: MindMapFlowNode[],
  edges: MindMapFlowEdge[],
  direction: 'LR' | 'TB' = 'LR',
): MindMapFlowNode[] {
  if (nodes.length === 0) return nodes

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((n) => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
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
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
    }
  })
}
