import { create } from 'zustand'
import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile, writeTextFile, writeFile, readDir, exists } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import { parseYaml } from '../lib/yamlParser'
import { buildGraph, computeHiddenIds } from '../lib/graphBuilder'
import { applyDagreLayout } from '../lib/dagreLayout'
import type { MindMapFlowNode, MindMapFlowEdge } from '../types/graph'
import type { TabDescriptor, MarkdownTab } from '../types/tabs'
import type { FileNode } from '../types/files'
import { DEFAULT_MAP_SETTINGS, NODE_HEIGHT, SPACING_CONFIG, type MapSettings } from '../types/settings'

// Shown when a new project is created with no existing YAML files
const STARTER_YAML = `\
- title: My Mind Map
  content: "Edit this file and click Render."
  children:
    - title: Topic 1
      content: "Your first topic."
    - title: Topic 2
      content: "Your second topic."
`

// Directories that are never shown in the file navigator
const SKIP_DIRS = new Set([
  '.git', 'node_modules', 'target', 'dist', '.venv', '__pycache__', '.idea', '.vscode',
])

async function readProjectTree(dirPath: string, depth = 0): Promise<FileNode[]> {
  if (depth > 3) return []

  const entries = await readDir(dirPath)
  const nodes: FileNode[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue

    const entryPath = await join(dirPath, entry.name)

    if (entry.isDirectory) {
      const children = await readProjectTree(entryPath, depth + 1)
      if (children.length > 0) {
        nodes.push({ name: entry.name, path: entryPath, isDirectory: true, children })
      }
    } else if (
      entry.name.endsWith('.yaml') ||
      entry.name.endsWith('.yml') ||
      entry.name.endsWith('.md')
    ) {
      nodes.push({ name: entry.name, path: entryPath, isDirectory: false })
    }
  }

  return nodes.sort((a, b) => {
    if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/** Collect all .yaml/.yml file paths from a tree */
function collectYamlPaths(nodes: FileNode[]): string[] {
  const result: string[] = []
  for (const node of nodes) {
    if (!node.isDirectory && (node.name.endsWith('.yaml') || node.name.endsWith('.yml'))) {
      result.push(node.path)
    } else if (node.isDirectory && node.children) {
      result.push(...collectYamlPaths(node.children))
    }
  }
  return result
}

function fileLabel(filePath: string): string {
  return filePath.replace(/\\/g, '/').split('/').pop() ?? filePath
}

interface AppState {
  // Project
  projectRoot: string | null
  projectFiles: FileNode[]
  mapYamlPath: string | null
  rawYaml: string
  yamlError: string | null

  // Graph
  allNodes: MindMapFlowNode[]
  allEdges: MindMapFlowEdge[]
  visibleNodes: MindMapFlowNode[]
  visibleEdges: MindMapFlowEdge[]
  collapsedNodeIds: Set<string>
  childMap: Record<string, string[]>

  // Tabs
  tabs: TabDescriptor[]
  activeTabId: string

  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void

  // Map display settings
  mapSettings: MapSettings
  setMapSettings: (patch: Partial<MapSettings>) => void

  // Actions
  openProject: () => Promise<void>
  loadMapFile: (filePath: string) => Promise<void>
  refreshProjectFiles: () => Promise<void>
  updateRawYaml: (yaml: string) => void
  renderMap: () => void
  toggleCollapse: (nodeId: string) => void
  openMarkdownTab: (filePath: string) => Promise<void>
  closeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  setMarkdownViewMode: (tabId: string, mode: 'source' | 'preview') => void
  saveFile: (filePath: string, content: string) => Promise<void>
  saveBinaryFile: (filePath: string, data: Uint8Array) => Promise<void>
  afterFileRenamed: (oldPath: string, newPath: string) => Promise<void>
  afterFileDeleted: (deletedPath: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  projectRoot: null,
  projectFiles: [],
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

  theme: (localStorage.getItem('theme') as 'dark' | 'light' | null) ?? 'dark',
  toggleTheme: () =>
    set((s) => {
      const next = s.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      return { theme: next }
    }),

  mapSettings: (() => {
    try {
      const saved = localStorage.getItem('mapSettings')
      return saved ? { ...DEFAULT_MAP_SETTINGS, ...JSON.parse(saved) } : DEFAULT_MAP_SETTINGS
    } catch {
      return DEFAULT_MAP_SETTINGS
    }
  })(),
  setMapSettings: (patch) => {
    set((s) => {
      const next = { ...s.mapSettings, ...patch }
      localStorage.setItem('mapSettings', JSON.stringify(next))
      return { mapSettings: next }
    })
    get().renderMap()
  },

  openProject: async () => {
    const selected = await open({ directory: true, multiple: false })
    if (!selected || typeof selected !== 'string') return

    // Build file tree (yaml + md files only)
    let projectFiles = await readProjectTree(selected)
    const yamlPaths = collectYamlPaths(projectFiles)

    let initialMapPath: string

    if (yamlPaths.length === 0) {
      // No YAML files — auto-create map.yaml with starter content
      initialMapPath = await join(selected, 'map.yaml')
      await writeTextFile(initialMapPath, STARTER_YAML)
      // Rebuild tree to include the new file
      projectFiles = await readProjectTree(selected)
    } else {
      // Prefer a root-level map.yaml; otherwise take first alphabetical yaml
      const rootMapYaml = await join(selected, 'map.yaml')
      initialMapPath = (await exists(rootMapYaml))
        ? rootMapYaml
        : yamlPaths[0]!
    }

    const rawYaml = await readTextFile(initialMapPath)

    set({
      projectRoot: selected,
      projectFiles,
      mapYamlPath: initialMapPath,
      rawYaml,
      yamlError: null,
      collapsedNodeIds: new Set(),
      tabs: [{ kind: 'yaml', id: 'yaml', label: fileLabel(initialMapPath), filePath: initialMapPath }],
      activeTabId: 'yaml',
    })

    get().renderMap()
  },

  loadMapFile: async (filePath) => {
    try {
      const rawYaml = await readTextFile(filePath)
      const label = fileLabel(filePath)

      set((s) => ({
        mapYamlPath: filePath,
        rawYaml,
        yamlError: null,
        collapsedNodeIds: new Set(),
        activeTabId: 'yaml',
        tabs: s.tabs.map((t) =>
          t.kind === 'yaml' ? { ...t, filePath, label } : t,
        ),
      }))

      get().renderMap()
    } catch (err) {
      set({ yamlError: `Failed to load ${fileLabel(filePath)}: ${err instanceof Error ? err.message : String(err)}` })
    }
  },

  refreshProjectFiles: async () => {
    const { projectRoot } = get()
    if (!projectRoot) return
    const projectFiles = await readProjectTree(projectRoot)
    set({ projectFiles })
  },

  updateRawYaml: (yaml) => set({ rawYaml: yaml }),

  renderMap: () => {
    const { rawYaml, projectRoot, mapSettings } = get()
    if (!projectRoot) return

    const { nodeWidth, ranksep, nodesep } = SPACING_CONFIG[mapSettings.spacing]
    const nodeHeight = NODE_HEIGHT[mapSettings.padding]
    const dims = { nodeWidth, nodeHeight, ranksep, nodesep }

    try {
      const yamlNodes = parseYaml(rawYaml)
      const { nodes, edges, childMap } = buildGraph(yamlNodes, projectRoot)
      const positionedNodes = applyDagreLayout(nodes, edges, 'LR', dims)

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

    const updatedNodes = visibleNodes.map((n) => ({
      ...n,
      data: { ...n.data, isCollapsed: next.has(n.id) },
    }))

    const { mapSettings } = get()
    const { nodeWidth, ranksep, nodesep } = SPACING_CONFIG[mapSettings.spacing]
    const nodeHeight = NODE_HEIGHT[mapSettings.padding]
    const laid = applyDagreLayout(updatedNodes, visibleEdges, 'LR', { nodeWidth, nodeHeight, ranksep, nodesep })
    set({ collapsedNodeIds: next, visibleNodes: laid, visibleEdges })
  },

  openMarkdownTab: async (filePath) => {
    const { tabs } = get()

    const existing = tabs.find((t) => t.kind === 'markdown' && t.filePath === filePath)
    if (existing) {
      set({ activeTabId: existing.id })
      return
    }

    const newTab: MarkdownTab = {
      kind: 'markdown',
      id: filePath,
      label: fileLabel(filePath),
      filePath,
      viewMode: 'preview',
    }

    set((s) => ({ tabs: [...s.tabs, newTab], activeTabId: newTab.id }))
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get()
    if (tabId === 'yaml') return

    const idx = tabs.findIndex((t) => t.id === tabId)
    const next = tabs.filter((t) => t.id !== tabId)

    let nextActive = activeTabId
    if (activeTabId === tabId) {
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

  afterFileRenamed: async (oldPath, newPath) => {
    const { tabs, mapYamlPath } = get()

    // Update any open markdown tab that pointed to the old path
    const updatedTabs = tabs.map((t) =>
      t.kind === 'markdown' && t.filePath === oldPath
        ? { ...t, filePath: newPath, label: fileLabel(newPath) }
        : t,
    )
    set({ tabs: updatedTabs })

    if (oldPath === mapYamlPath) {
      // Reload the active map under its new path (also updates yaml tab label)
      await get().loadMapFile(newPath)
    }

    await get().refreshProjectFiles()
  },

  afterFileDeleted: async (deletedPath) => {
    const { tabs, activeTabId, mapYamlPath, projectRoot } = get()

    // Close any markdown tab pointing to the deleted file
    const deletedTab = tabs.find((t) => t.kind === 'markdown' && t.filePath === deletedPath)
    if (deletedTab) {
      const newTabs = tabs.filter((t) => t.id !== deletedTab.id)
      set({
        tabs: newTabs,
        activeTabId: activeTabId === deletedTab.id ? 'yaml' : activeTabId,
      })
    }

    if (deletedPath === mapYamlPath && projectRoot) {
      // Re-scan the project and load another yaml, or create a starter
      const freshFiles = await readProjectTree(projectRoot)
      const yamlPaths = collectYamlPaths(freshFiles)

      if (yamlPaths.length > 0) {
        set({ projectFiles: freshFiles })
        await get().loadMapFile(yamlPaths[0]!)
      } else {
        const newMapPath = await join(projectRoot, 'map.yaml')
        await writeTextFile(newMapPath, STARTER_YAML)
        const refreshedFiles = await readProjectTree(projectRoot)
        set({ projectFiles: refreshedFiles })
        await get().loadMapFile(newMapPath)
      }
    } else {
      await get().refreshProjectFiles()
    }
  },
}))
