import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import type { FileNode } from '../../types/files'

// ── Icons ─────────────────────────────────────────────────────────────────────

function MapFileIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-yellow-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    </svg>
  )
}

function DocFileIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}

function FolderIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
    </svg>
  ) : (
    <svg className="h-3.5 w-3.5 shrink-0 text-neutral-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v8.25A2.25 2.25 0 0 0 4.5 16.5h15a2.25 2.25 0 0 0 2.25-2.25V9A2.25 2.25 0 0 0 19.5 6.75h-9.69Z" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
}

// ── Tree node ─────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: FileNode
  depth: number
  expandedDirs: Set<string>
  onToggleDir: (path: string) => void
}

function TreeNode({ node, depth, expandedDirs, onToggleDir }: TreeNodeProps) {
  const mapYamlPath = useAppStore((s) => s.mapYamlPath)
  const loadMapFile = useAppStore((s) => s.loadMapFile)
  const openMarkdownTab = useAppStore((s) => s.openMarkdownTab)

  const indent = depth * 12 + 8

  if (node.isDirectory) {
    const isOpen = expandedDirs.has(node.path)
    return (
      <div>
        <button
          onClick={() => onToggleDir(node.path)}
          className="flex w-full items-center gap-1.5 py-0.5 text-xs text-neutral-400 hover:text-neutral-200"
          style={{ paddingLeft: `${indent}px`, paddingRight: '8px' }}
        >
          <FolderIcon open={isOpen} />
          <span className="truncate">{node.name}</span>
        </button>
        {isOpen && node.children?.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={depth + 1}
            expandedDirs={expandedDirs}
            onToggleDir={onToggleDir}
          />
        ))}
      </div>
    )
  }

  const isYaml = node.name.endsWith('.yaml') || node.name.endsWith('.yml')
  const isMd = node.name.endsWith('.md')
  const isActive = node.path === mapYamlPath

  const handleClick = () => {
    if (isYaml) loadMapFile(node.path)
    else if (isMd) openMarkdownTab(node.path)
  }

  return (
    <button
      onClick={handleClick}
      title={node.name}
      className={`flex w-full items-center gap-1.5 py-0.5 text-xs text-left transition-colors ${
        isActive
          ? 'bg-blue-600/25 text-blue-300'
          : 'text-neutral-400 hover:bg-neutral-700/50 hover:text-neutral-200'
      }`}
      style={{ paddingLeft: `${indent}px`, paddingRight: '8px' }}
    >
      {isYaml ? <MapFileIcon /> : <DocFileIcon />}
      <span className="truncate">{node.name}</span>
    </button>
  )
}

// ── File Navigator ────────────────────────────────────────────────────────────

export function FileNavigator() {
  const projectRoot = useAppStore((s) => s.projectRoot)
  const projectFiles = useAppStore((s) => s.projectFiles)
  const refreshProjectFiles = useAppStore((s) => s.refreshProjectFiles)

  // All top-level directories start expanded
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    for (const node of projectFiles) {
      if (node.isDirectory) initial.add(node.path)
    }
    return initial
  })

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  const folderName = projectRoot
    ? projectRoot.replace(/\\/g, '/').split('/').pop() ?? projectRoot
    : ''

  return (
    <div className="flex h-full w-52 shrink-0 flex-col border-r border-neutral-700 bg-neutral-900">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-1 border-b border-neutral-700 px-2 py-1.5">
        <span className="flex-1 truncate text-xs font-medium text-neutral-300" title={projectRoot ?? ''}>
          {folderName}
        </span>
        <button
          onClick={refreshProjectFiles}
          title="Refresh files"
          className="rounded p-1 text-neutral-500 hover:text-neutral-300"
        >
          <RefreshIcon />
        </button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {projectFiles.length === 0 ? (
          <p className="px-3 py-2 text-xs text-neutral-600">No files found.</p>
        ) : (
          projectFiles.map((node) => (
            <TreeNode
              key={node.path}
              node={node}
              depth={0}
              expandedDirs={expandedDirs}
              onToggleDir={toggleDir}
            />
          ))
        )}
      </div>
    </div>
  )
}
