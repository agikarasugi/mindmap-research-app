# Mind Map App

A local-first, YAML-driven mind map desktop app. Built with Tauri, React, and TypeScript.

## Motivation

I kept reaching for Miro or Obsidian Canvas to sketch out ideas, but both require online access or a subscription for the features I actually use. I want something that:
- Lives entirely on my filesystem
- Works offline
- Uses plain-text source (so I can version-control my maps with git)
- Is fast to open and navigate

## Current status

Core implementation done. Running on macOS. Needs packaging and a landing page before a proper release.

## Milestones

- [x] YAML parser and graph builder
- [x] React Flow canvas with dagre layout
- [x] Monaco editor with YAML/Markdown tabs
- [x] Collapse/expand nodes
- [x] Export PNG / JPG / SVG
- [x] File navigator sidebar
- [x] Multiple map files per project
- [ ] Auto-reload on file change (watch mode)
- [ ] Tauri app icon and bundle metadata
- [ ] macOS `.dmg` installer
- [ ] Windows `.msi` installer
- [ ] Linux `.AppImage`
- [ ] Landing page with screenshots

## Tech decisions

**Tauri over Electron:** ~10× smaller bundle, native performance, Rust backend for FS access.

**dagre for layout:** Simple, well-understood. If the layout becomes too slow for very large maps (>500 nodes), move `applyDagreLayout` to a Web Worker.

**No drag-to-edit:** Deliberate. The map is a read-only view of the YAML. Keeping editing in text prevents the map from diverging from the source.

## Lessons learned

- React Flow's `fitView` needs to run after nodes are positioned — firing it before dagre runs gives wrong results.
- Tauri v2 permissions are capability-based and must be declared explicitly; forgetting `fs:allow-exists` causes a silent IPC failure.
- Monaco needs `automaticLayout: true` inside a flex container, otherwise it doesn't resize when the split pane moves.
