# Project Specification: Text-Driven Interactive Mind Map

## 1. Product Overview
A local-first, folder-based knowledge management tool that combines a text-based structural definition (YAML) with an interactive mind map visualization and a Markdown notes editor. 

**Core Philosophy:** * **Text-First, Read-Only Map:** The mind map is a spatial index generated from code. 
* **Zero WYSIWYG Graph Editing:** Users CANNOT drag to create nodes, edit text on the canvas, or visually change colors. All structural and styling changes must happen in the YAML file.

## 2. File System Architecture
The application operates on a local folder basis.
* **Root Requirement:** A folder must contain a `map.yaml` file at its root to be recognized as a valid project.
* **Flexible Hierarchy:** Users can place linked `.md` files or assets anywhere within the root directory or its subdirectories.
* **Relative Linking:** The application resolves document links in the YAML relative to the location of the `map.yaml` file (e.g., `link: "./docs/marketing.md"`).

## 3. Data Schema (YAML)
The app parses `map.yaml` into a nested object. The parser must accept optional `style` blocks and `link` attributes.

**Schema Example:**
```yaml
- title: Launch V1.0
  content: "Core launch objectives."
  link: "./docs/launch-overview.md"
  children:
    - title: Marketing Push
      style:
        color: "#ffbb00"
        shape: pill
      content: "Finalize social media copy."
      link: "./docs/marketing-plan.md"
      children:
        - title: Twitter Thread
          content: "Draft in progress."
```

## 4. UI/UX Layout
The application features a rigid Split-Pane Layout.

### Right Pane: The Interactive Map (Locked)
* Displays the compiled Directed Acyclic Graph (DAG) using a rendering engine (e.g., React Flow).
* **Auto-Layout:** Calculates node coordinates automatically upon rendering (e.g., using `dagre`).
* **Interactions:**
  * Pan and zoom canvas.
  * Click a `+/-` badge on a node to hide/show its `children`.
  * Click the "Document Icon" on a node (if a `link` exists) to open that markdown file in the Left Pane.
* **Header Bar:** Contains an "Export" dropdown (PNG, JPG, SVG).

### Left Pane: The Workspace (Tabbed)
* **Tab 1 (Persistent):** `map.yaml`. Features a code editor with syntax highlighting. Includes a prominent "Render" (or "Compile") button at the top to update the Right Pane.
* **Dynamic Tabs:** Clicking a node's document link opens the resolved `.md` file in a new tab here.
* **Markdown Editor State:** Markdown tabs must have a segment control: `[ Source | Preview ]`.
  * **Source:** Plain text editing (no WYSIWYG).
  * **Preview:** Rendered HTML view of the markdown file.

## 5. System Data Flow
1. **Mount:** User selects a local folder. App verifies `map.yaml` exists.
2. **Read:** App reads raw string from `map.yaml`.
3. **Parse:** String is parsed into a JSON tree, then flattened into `nodes` and `edges` arrays.
4. **Layout:** A layout algorithm injects `x` and `y` coordinates into the `nodes` array.
5. **Render:** The graph engine mounts the nodes on the Right Pane.
6. **Navigate:** User clicks a node link -> App reads local `.md` file -> Opens text in a Left Pane tab.

## 6. Recommended Tech Stack
* **Framework:** React / TypeScript / Vite (Wrapped in Electron or Tauri for local file system access).
* **Code Editor:** Monaco Editor or CodeMirror (for YAML and Markdown source).
* **YAML Parser:** `js-yaml`.
* **Markdown Renderer:** `react-markdown` + `remark-gfm`.
* **Graph Engine:** React Flow (`@xyflow/react`).
* **Layout Engine:** `dagre` (to calculate coordinates for React Flow).
* **Exporting:** `html-to-image` (for PNG/JPG) and React Flow's native SVG utility patterns.

