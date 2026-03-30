import { create } from 'zustand'
import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile, writeFile, exists } from '@tauri-apps/plugin-fs'
import { join, resolve, dirname } from '@tauri-apps/api/path'
import { parseYaml } from '../lib/yamlParser'
import { buildGraph, computeHiddenIds } from '../lib/graphBuilder'
import { applyDagreLayout } from '../lib/dagreLayout'
import type { MindMapFlowNode, MindMapFlowEdge } from '../types/graph'
import type { TabDescriptor, MarkdownTab } from '../types/tabs'

interface AppState {
  // Project
  projectRoot: string | null
  mapYamlPath: string | null
  rawYaml: string
  yamlError: string | null

  // Graph
  allNodes: MindMapFlowNode[]
  allEdges: MindMapFlowEdge[]
  visibleNodes: MindMapFlowNode[]
  visibleEdges: MindMapFlowEdge[]
  collapsedNodeIds: Set<string>
  /** parentId → childIds mapping, used for collapse BFS */
  childMap: Record<string, string[]>

  // Tabs
  tabs: TabDescriptor[]
  activeTabId: string

  // Actions
  openProject: () => Promise<void>
  updateRawYaml: (yaml: string) => void
  renderMap: () => void
  toggleCollapse: (nodeId: string) => void
  openMarkdownTab: (filePath: string) => Promise<void>
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  setMarkdownViewMode: (tabId: string, mode: 'source' | 'preview') => void
  saveFile: (filePath: string, content: string) => Promise<void>
  saveBinaryFile: (filePath: string, data: Uint8Array) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  projectRoot: null,
  mapYamlPath: null,
  rawYaml: '',
  yamlError: null,
  allNodes: [],
  allEdges: [],
  visibleNodes: [],
  visibleEdges: [],
  collapsedNodeIds: new Set(),
  childMap: {},
  tabs: [],
  activeTabId: 'yaml',

  openProject: async () => {
    const selected = await open({ directory: true, multiple: false })
    if (!selected || typeof selected !== 'string') return

    const mapYamlPath = await join(selected, 'map.yaml')
    const yamlExists = await exists(mapYamlPath)
    if (!yamlExists) {
      set({ yamlError: 'No map.yaml found in the selected folder.' })
      return
    }

    const rawYaml = await readTextFile(mapYamlPath)

    set({
      projectRoot: selected,
      mapYamlPath,
      rawYaml,
      yamlError: null,
      collapsedNodeIds: new Set(),
      tabs: [{ kind: 'yaml', id: 'yaml', label: 'map.yaml', filePath: mapYamlPath }],
      activeTabId: 'yaml',
    })

    // Auto-render on open
    get().renderMap()
  },

  updateRawYaml: (yaml) => set({ rawYaml: yaml }),

  renderMap: () => {
    const { rawYaml, projectRoot } = get()
    if (!projectRoot) return

    try {
      const yamlNodes = parseYaml(rawYaml)
      const { nodes, edges, childMap } = buildGraph(yamlNodes, projectRoot)
      const positionedNodes = applyDagreLayout(nodes, edges)

      set({
        allNodes: positionedNodes,
        allEdges: edges,
        visibleNodes: positionedNodes,
        visibleEdges: edges,
        collapsedNodeIds: new Set(),
        childMap,
        yamlError: null,
      })
    } catch (err) {
      set({ yamlError: err instanceof Error ? err.message : String(err) })
    }
  },

  toggleCollapse: (nodeId) => {
    const { collapsedNodeIds, allNodes, allEdges, childMap } = get()

    const next = new Set(collapsedNodeIds)
    if (next.has(nodeId)) {
      next.delete(nodeId)
    } else {
      next.add(nodeId)
    }

    const hiddenIds = computeHiddenIds(next, childMap)

    const visibleNodes = allNodes.filter((n) => !hiddenIds.has(n.id))
    const visibleEdges = allEdges.filter(
      (e) => !hiddenIds.has(e.source) && !hiddenIds.has(e.target),
    )

    // Update isCollapsed flag on nodes
    const updatedNodes = visibleNodes.map((n) => ({
      ...n,
      data: { ...n.data, isCollapsed: next.has(n.id) },
    }))

    const laid = applyDagreLayout(updatedNodes, visibleEdges)

    set({ collapsedNodeIds: next, visibleNodes: laid, visibleEdges })
  },

  openMarkdownTab: async (filePath) => {
    const { tabs } = get()

    // Deduplicate by filePath
    const existing = tabs.find((t) => t.kind === 'markdown' && t.filePath === filePath)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }

    // Derive label from filename
    const parts = filePath.replace(/\\/g, '/').split('/')
    const label = parts[parts.length - 1] ?? 'file.md'

    const newTab: MarkdownTab = {
      kind: 'markdown',
      id: filePath, // use absolute path as stable id
      label,
      filePath,
      viewMode: 'preview',
    }

    set((s) => ({
      tabs: [...s.tabs, newTab],
      activeTabId: newTab.id,
    }))
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get()
    if (tabId === 'yaml') return // YAML tab is permanent

    const idx = tabs.findIndex((t) => t.id === tabId)
    const next = tabs.filter((t) => t.id !== tabId)

    let nextActive = activeTabId
    if (activeTabId === tabId) {
      // Activate the tab to the left, or the YAML tab
      nextActive = next[Math.max(0, idx - 1)]?.id ?? 'yaml'
    }

    set({ tabs: next, activeTabId: nextActive })
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  setMarkdownViewMode: (tabId, mode) => {
    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.kind === 'markdown' && t.id === tabId ? { ...t, viewMode: mode } : t,
      ),
    }))
  },

  saveFile: async (filePath, content) => {
    await writeTextFile(filePath, content)
  },

  saveBinaryFile: async (filePath, data) => {
    await writeFile(filePath, data)
  },
}))

// Re-export resolve/dirname for use in components that need path ops
export { resolve, dirname }
