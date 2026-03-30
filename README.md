# Mind Map

A local-first, cross-platform desktop knowledge management tool. You define your entire map in a plain-text YAML file; the app renders it as an interactive directed graph alongside a code and Markdown editor.

## Core idea

The map is a **read-only spatial index** generated from `map.yaml`. There is no drag-to-create, no in-canvas text editing, no WYSIWYG. All structural changes — adding nodes, reordering, changing colours — happen in the YAML file. Click **Render** and the graph updates.

## Features

- **YAML-driven graph** — define nodes, edges, colours, and shapes in plain text
- **Multiple mind maps** — any `.yaml` file in the project is a mind map; switch between them in the file navigator
- **Auto-created starter map** — opening a folder with no `.yaml` files creates `map.yaml` with sample content automatically
- **File navigator** — sidebar showing all `.yaml` and `.md` files; click a `.yaml` to load it as the active map, click a `.md` to open it in an editor tab
- **Monaco editor** with YAML/Markdown syntax highlighting and `Ctrl+S` / `Cmd+S` save
- **Interactive DAG** rendered with React Flow, auto-laid-out via dagre (left-to-right hierarchy)
- **Collapse/expand** subtrees with the `+/−` badge on any parent node
- **Linked Markdown documents** — add a `link:` field to any node, click the document icon to open the file in a side-by-side editor tab with Source / Preview toggle
- **Export** the map as PNG, JPG, or SVG via the Export dropdown
- **Three-column layout**: file navigator | tabbed editor | map canvas
- Runs natively on **Windows, macOS, and Linux** via Tauri

## Project format

A Mind Map project is any plain folder. No files are required — a starter `map.yaml` is created automatically on first open. Multiple `.yaml` files are supported; each one is an independent mind map.

```
my-project/
├── map.yaml              # auto-created if absent; loaded by default
├── roadmap.yaml          # any other .yaml file is also a mind map
└── docs/
    ├── overview.md       # linked documents (optional)
    └── marketing.md
```

### `map.yaml` schema

```yaml
- title: Launch V1.0               # required
  content: "Core launch objectives." # optional tooltip / note
  link: "./docs/overview.md"        # optional path to a .md file
  style:                            # optional visual overrides
    color: "#3b82f6"                # hex background colour
    shape: pill                     # rectangle (default) | pill | diamond
  children:
    - title: Marketing Push
      style:
        color: "#f59e0b"
        shape: pill
      link: "./docs/marketing.md"
      children:
        - title: Twitter Thread
          content: "Draft in progress."
```

All `link` paths are resolved relative to the active map file's location.

## Tech stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 (Rust + system WebView) |
| Frontend framework | React 18 + TypeScript + Vite |
| State management | Zustand |
| Code editor | Monaco Editor (`@monaco-editor/react`) |
| YAML parser | js-yaml |
| Markdown renderer | react-markdown + remark-gfm |
| Graph engine | React Flow (`@xyflow/react`) |
| Graph layout | dagre |
| Export | html-to-image |
| Styling | Tailwind CSS v4 |

## Usage

1. Launch the app. You will see the **Open Folder** prompt.
2. Click **Open Folder…** and select any directory. If no `.yaml` files exist, `map.yaml` is created with starter content.
3. The map renders automatically. The file navigator appears on the left; the YAML editor opens in the middle pane.
4. Click any `.yaml` file in the navigator to switch to that mind map.
5. Edit the YAML in the editor, then click **Render** (or press `Ctrl+S` / `Cmd+S` to save, then Render to update the map).
6. Click the **document icon** on any node that has a `link:` field to open the Markdown file in a new tab.
7. Click `+/−` on any parent node to collapse or expand its children.
8. Use the **Export** dropdown in the top-right of the map pane to save a PNG, JPG, or SVG.
9. Click the **refresh icon** in the navigator header to pick up new files added outside the app.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` / `Cmd+S` | Save the active file (YAML or Markdown) |
| Scroll | Zoom the map canvas |
| Click + drag | Pan the map canvas |

## License

MIT
