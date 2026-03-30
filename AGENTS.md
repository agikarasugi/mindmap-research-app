# Agent Guide

This document covers the architecture, data flow, and conventions an agent needs to understand before making changes to this codebase.

---

## Architecture overview

```
┌──────────────────────────────────────────────────────────┐
│  Tauri 2 shell  (src-tauri/)                             │
│  ┌────────────────────────────────────────────────────┐  │
│  │  React + TypeScript frontend  (src/)               │  │
│  │                                                    │  │
│  │  ┌─────────────────┐  ┌──────────────────────┐    │  │
│  │  │  Left pane       │  │  Right pane           │    │  │
│  │  │  TabBar          │  │  MapHeader (export)   │    │  │
│  │  │  YamlTab         │  │  MindMapCanvas        │    │  │
│  │  │  MarkdownTab     │  │  └─ ReactFlow          │    │  │
│  │  └────────┬─────────┘  │     └─ MindMapNode    │    │  │
│  │           │            └──────────────────────┘    │  │
│  │           └──── Zustand store (appStore.ts) ────── │  │
│  │                  │                                  │  │
│  │           ┌──────┴───────┐                         │  │
│  │           │  lib/         │                        │  │
│  │           │  yamlParser   │                        │  │
│  │           │  graphBuilder │                        │  │
│  │           │  dagreLayout  │                        │  │
│  │           │  exporter     │                        │  │
│  │           └───────────────┘                        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  Tauri plugins: tauri-plugin-fs, tauri-plugin-dialog     │
└──────────────────────────────────────────────────────────┘
```

The frontend is a pure React SPA. All file system access goes through Tauri plugins via `@tauri-apps/plugin-fs` and `@tauri-apps/plugin-dialog`. There are no custom Rust commands — the Rust side only registers the two plugins.

---

## Source layout

```
src/
  types/
    yaml.ts          YamlNode, YamlNodeStyle — the raw YAML schema shape
    graph.ts         MindMapFlowNode, MindMapFlowEdge — React Flow node/edge types
    tabs.ts          TabDescriptor union (YamlTab | MarkdownTab)

  lib/               Pure functions, no React, no Tauri, unit-testable
    yamlParser.ts    string → YamlNode[]  (wraps js-yaml)
    graphBuilder.ts  YamlNode[] → {nodes, edges, childMap}
    dagreLayout.ts   nodes+edges → nodes with x,y positions
    exporter.ts      HTMLElement → data URL (png/jpg/svg via html-to-image)

  store/
    appStore.ts      Single Zustand store; all mutable state lives here

  hooks/
    useTauriFs.ts    Thin wrappers around Tauri FS and dialog APIs

  components/
    layout/          AppShell (title bar + split body), SplitPane (draggable divider)
    leftPane/        LeftPane, TabBar, YamlTab, MarkdownTab
    rightPane/       RightPane, MapHeader, MindMapCanvas
    nodes/           MindMapNode (custom React Flow node), CollapseButton
    common/          OpenFolderPrompt, ErrorBanner

src-tauri/
  src/lib.rs         Registers tauri-plugin-fs and tauri-plugin-dialog; no custom commands
  capabilities/default.json  Tauri permission grants (fs read/write + dialog open/save)
  tauri.conf.json    App name, window size, bundle targets, icon paths
```

---

## Data flow: YAML → rendered graph

This is the critical path. Every call to `store.renderMap()` runs the full pipeline synchronously:

```
store.rawYaml  (string)
  │
  ▼  lib/yamlParser.ts — parseYaml()
YamlNode[]  (typed tree)
  │
  ▼  lib/graphBuilder.ts — buildGraph()
{ nodes: MindMapFlowNode[], edges: MindMapFlowEdge[], childMap: Record<string,string[]> }
  │   nodes have position {x:0, y:0} at this point
  │
  ▼  lib/dagreLayout.ts — applyDagreLayout()
MindMapFlowNode[]  (positions injected by dagre)
  │
  ▼  store.allNodes / allEdges / visibleNodes / visibleEdges
  │
  ▼  MindMapCanvas → <ReactFlow nodes={visibleNodes} edges={visibleEdges}>
```

`allNodes` / `allEdges` are the complete unfiltered graph. `visibleNodes` / `visibleEdges` are the collapse-filtered subset fed to React Flow. On fresh render, all four are equal.

### Collapse filtering

`store.toggleCollapse(nodeId)` does **not** re-run the full pipeline. Instead:

1. Toggle `nodeId` in `collapsedNodeIds` (a `Set<string>`).
2. Call `computeHiddenIds(collapsedNodeIds, childMap)` — BFS from every collapsed node to collect all descendant IDs.
3. Filter `allNodes` / `allEdges` to produce new `visibleNodes` / `visibleEdges`.
4. Re-run `applyDagreLayout` on the visible subset only (so the graph reflows without gaps).
5. Update `isCollapsed` on each node in the visible set.

`childMap` is built once per render by `graphBuilder` and cached in the store. It maps `nodeId → [childId, ...]`.

---

## Zustand store (`src/store/appStore.ts`)

The store is the single mutable source of truth. Components read slices via `useAppStore(s => s.field)` and call actions. No component holds meaningful local state except:

- `MarkdownTab` holds file content in local `useState` (loaded once per mount).
- `SplitPane` holds the divider position in local `useState`.
- `MapHeader` holds the export dropdown open/closed state.

### State fields

| Field | Type | Purpose |
|---|---|---|
| `projectRoot` | `string \| null` | Absolute path to the open folder |
| `mapYamlPath` | `string \| null` | Absolute path to `map.yaml` |
| `rawYaml` | `string` | Current YAML text (bound to Monaco editor) |
| `yamlError` | `string \| null` | Parse error message shown in ErrorBanner |
| `allNodes` | `MindMapFlowNode[]` | Full node set from last render |
| `allEdges` | `MindMapFlowEdge[]` | Full edge set from last render |
| `visibleNodes` | `MindMapFlowNode[]` | Collapse-filtered nodes fed to ReactFlow |
| `visibleEdges` | `MindMapFlowEdge[]` | Collapse-filtered edges fed to ReactFlow |
| `collapsedNodeIds` | `Set<string>` | IDs of nodes whose children are hidden |
| `childMap` | `Record<string, string[]>` | parentId → childIds (for BFS) |
| `tabs` | `TabDescriptor[]` | Open left-pane tabs; `tabs[0]` is always the YAML tab |
| `activeTabId` | `string` | ID of the selected tab (`'yaml'` or absolute file path) |

### Actions

| Action | What it does |
|---|---|
| `openProject()` | Opens folder dialog → validates `map.yaml` exists → reads it → calls `renderMap()` |
| `updateRawYaml(yaml)` | Syncs Monaco editor value to `rawYaml`; does **not** trigger render |
| `renderMap()` | Full pipeline: parse → build → layout → update store |
| `toggleCollapse(nodeId)` | Collapse/expand subtree; re-layouts visible nodes |
| `openMarkdownTab(filePath)` | Opens a new tab for a `.md` file; deduplicates by absolute path |
| `closeTab(tabId)` | Removes a Markdown tab; YAML tab (`id: 'yaml'`) cannot be closed |
| `setActiveTab(tabId)` | Switches the active tab |
| `setMarkdownViewMode(tabId, mode)` | Toggles Source / Preview on a Markdown tab |
| `saveFile(path, content)` | Writes text via `writeTextFile` (Tauri) |
| `saveBinaryFile(path, data)` | Writes binary via `writeFile` (Tauri) |

---

## Node ID stability

`graphBuilder.makeId(parentId, title)` produces a deterministic djb2-style hash of the full ancestor path concatenated with the node title. This means:

- Two nodes with the same title at different positions in the tree get different IDs.
- Re-rendering after a YAML edit preserves IDs for unchanged nodes, so React Flow can animate position transitions rather than remounting.
- Adding/removing a sibling does not change a node's ID.

The ID format is `n` + base-36 hash (e.g. `n1a2b3c4`).

---

## Path handling

Never concatenate path strings directly. The codebase uses:

- `@tauri-apps/api/path` — `join()`, `resolve()`, `dirname()` — for all path operations in async contexts (store, hooks).
- `graphBuilder.ts` uses a synchronous string operation (`${projectRoot}/${link.replace(/^\.\//, '')}`) because `buildGraph` is called synchronously inside `renderMap`. This produces correct absolute paths on all platforms when `projectRoot` is itself an absolute path.
- Tab IDs for Markdown tabs are the absolute file path string. This doubles as a deduplication key.

---

## Tauri permissions

All required permissions are declared in `src-tauri/capabilities/default.json`. If you add a new Tauri API call, you must add the corresponding permission here or the call will be denied at runtime with a Tauri IPC error.

Current grants:
- `fs:allow-read-text-file` — `readTextFile()`
- `fs:allow-write-text-file` — `writeTextFile()`
- `fs:allow-write-file` — `writeFile()` (binary)
- `fs:allow-read-dir` — `readDir()`
- `fs:allow-exists` — `exists()`
- `dialog:allow-open` — folder picker
- `dialog:allow-save` — save-file dialog

---

## Adding a new node shape

1. Add the new value to `YamlNodeStyle.shape` in `src/types/yaml.ts`.
2. Add the same value to `MindMapNodeData.nodeStyle.shape` in `src/types/graph.ts`.
3. Add a `case` to `shapeStyle()` in `src/components/nodes/MindMapNode.tsx` returning the appropriate CSS.
4. If the shape distorts the label (like `diamond`), add the inverse transform to `labelStyle()` in the same file.

---

## Adding a new export format

1. Add the new format string to `ExportFormat` in `src/lib/exporter.ts`.
2. Add a branch in `exportToDataUrl()` calling the appropriate `html-to-image` function.
3. Add the format to `filterMap` in `src/components/rightPane/RightPane.tsx`.
4. Handle binary vs text encoding in the same `handleExport` callback.

---

## Testing

Unit tests live in `src/lib/__tests__/`. They use Vitest and import only the pure lib functions — no DOM, no Tauri. Run with:

```bash
npm test
```

All Tauri-dependent code (store actions, hooks, components) is not unit-tested; it requires an actual Tauri runtime. Test those flows manually with `npm run tauri dev`.

When adding logic to `yamlParser.ts` or `graphBuilder.ts`, add corresponding test cases to the existing test files before shipping.

---

## Key invariants to preserve

- **`allNodes` / `allEdges` are never mutated after render** — `toggleCollapse` derives `visibleNodes` / `visibleEdges` from them by filtering; it does not modify them.
- **The YAML tab (`id: 'yaml'`) is always `tabs[0]`** and cannot be closed (`closeTab` no-ops on it).
- **`renderMap()` resets `collapsedNodeIds` to an empty set** — collapse state is intentionally ephemeral per-render.
- **`MindMapCanvas` is read-only** — `nodesDraggable`, `nodesConnectable`, and `edgesReconnectable` are all `false`. Do not change this.
- **No custom Rust commands** — all backend functionality uses official Tauri plugin APIs. Adding custom Rust commands requires updating `src-tauri/src/lib.rs` and `src-tauri/capabilities/default.json`.
