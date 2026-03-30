import type { YamlNode } from '../types/yaml'
import type { MindMapFlowNode, MindMapFlowEdge } from '../types/graph'

interface BuildResult {
  nodes: MindMapFlowNode[]
  edges: MindMapFlowEdge[]
  /** Map from nodeId → array of child nodeIds, for collapse BFS */
  childMap: Record<string, string[]>
}

/**
 * Stable deterministic ID: encode the full ancestor-path so that two nodes with
 * the same title but different parents get different IDs.
 */
function makeId(parentId: string, title: string): string {
  const raw = `${parentId}/${title}`
  // Simple djb2-like hash, kept URL-safe
  let hash = 5381
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i)
    hash = hash >>> 0 // keep 32-bit unsigned
  }
  return `n${hash.toString(36)}`
}

function walk(
  node: YamlNode,
  parentId: string | null,
  projectRoot: string,
  nodes: MindMapFlowNode[],
  edges: MindMapFlowEdge[],
  childMap: Record<string, string[]>,
): string {
  const id = makeId(parentId ?? '', node.title)

  // Resolve link relative to project root (done here as a simple join;
  // the store will handle async path resolution via Tauri for actual file reads)
  const resolvedLink = node.link
    ? `${projectRoot}/${node.link.replace(/^\.\//, '')}`
    : undefined

  nodes.push({
    id,
    type: 'mindmap',
    position: { x: 0, y: 0 },
    data: {
      label: node.title,
      content: node.content,
      link: resolvedLink,
      nodeStyle: node.style
        ? { color: node.style.color, shape: node.style.shape }
        : undefined,
      isCollapsed: false,
      hasChildren: (node.children?.length ?? 0) > 0,
    },
  })

  if (parentId !== null) {
    edges.push({
      id: `e-${parentId}-${id}`,
      source: parentId,
      target: id,
      type: 'smoothstep',
    })
    childMap[parentId] ??= []
    childMap[parentId]!.push(id)
  }

  for (const child of node.children ?? []) {
    walk(child, id, projectRoot, nodes, edges, childMap)
  }

  return id
}

export function buildGraph(nodes: YamlNode[], projectRoot: string): BuildResult {
  const resultNodes: MindMapFlowNode[] = []
  const resultEdges: MindMapFlowEdge[] = []
  const childMap: Record<string, string[]> = {}

  for (const rootNode of nodes) {
    walk(rootNode, null, projectRoot, resultNodes, resultEdges, childMap)
  }

  return { nodes: resultNodes, edges: resultEdges, childMap }
}

/** BFS: collect all descendant IDs of every collapsed node */
export function computeHiddenIds(
  collapsedIds: Set<string>,
  childMap: Record<string, string[]>,
): Set<string> {
  const hidden = new Set<string>()
  const queue = [...collapsedIds]

  while (queue.length > 0) {
    const current = queue.shift()!
    for (const child of childMap[current] ?? []) {
      if (!hidden.has(child)) {
        hidden.add(child)
        queue.push(child)
      }
    }
  }

  return hidden
}
