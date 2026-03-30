# Mind Map

A local-first, cross-platform desktop knowledge management tool. You define your entire map in a plain-text YAML file; the app renders it as an interactive directed graph alongside a code and Markdown editor.

## Core idea

The map is a **read-only spatial index** generated from `map.yaml`. There is no drag-to-create, no in-canvas text editing, no WYSIWYG. All structural changes — adding nodes, reordering, changing colours — happen in the YAML file. Click **Render** and the graph updates.

## Features

- **YAML-driven graph** — define nodes, edges, colours, and shapes in plain text
- **Monaco editor** for `map.yaml` with YAML syntax highlighting and `Ctrl+S` / `Cmd+S` save
- **Interactive DAG** rendered with React Flow, auto-laid-out via dagre (left-to-right hierarchy)
- **Collapse/expand** subtrees with the `+/−` badge on any parent node
- **Linked Markdown documents** — add a `link:` field to any node, click the document icon to open the file in a side-by-side editor tab with Source / Preview toggle
- **Export** the map as PNG, JPG, or SVG via the Export dropdown
- **Split-pane layout** with a draggable divider between the editor and the map
- Runs natively on **Windows, macOS, and Linux** via Tauri

## Project format

A Mind Map project is a plain folder. The only required file is `map.yaml` at the folder root.

```
my-project/
├── map.yaml          # required
└── docs/
    ├── overview.md   # optional linked documents
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

All `link` paths are resolved relative to the `map.yaml` file.

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
2. Click **Open Folder…** and select a directory that contains `map.yaml`.
3. The map renders automatically. The YAML editor opens in the left pane.
4. Edit `map.yaml` in the editor, then click **Render** (or press `Ctrl+S` / `Cmd+S` to save and re-render manually).
5. Click the **document icon** on any node that has a `link:` field to open the Markdown file in a new tab.
6. Click `+/−` on any parent node to collapse or expand its children.
7. Use the **Export** dropdown in the top-right of the map pane to save a PNG, JPG, or SVG.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+S` / `Cmd+S` | Save the active file (YAML or Markdown) |
| Scroll | Zoom the map canvas |
| Click + drag | Pan the map canvas |

## License

MIT
