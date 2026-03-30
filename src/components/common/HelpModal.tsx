import { useEffect, useRef } from 'react'

interface Props {
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-7">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
        {title}
      </h2>
      {children}
    </section>
  )
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1.5 border-b border-neutral-800">
      <span className="w-36 shrink-0 text-xs text-neutral-400">{label}</span>
      <span className="text-xs text-neutral-200">{children}</span>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-blue-300">
      {children}
    </code>
  )
}

function ShapePreview({
  shape,
  color,
  label,
}: {
  shape: 'rectangle' | 'pill' | 'diamond'
  color: string
  label: string
}) {
  const shapeStyle: React.CSSProperties =
    shape === 'pill'
      ? { borderRadius: '9999px' }
      : shape === 'diamond'
        ? { transform: 'rotate(45deg)', borderRadius: '4px' }
        : { borderRadius: '8px' }

  const labelStyle: React.CSSProperties =
    shape === 'diamond' ? { transform: 'rotate(-45deg)' } : {}

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-10 w-24 items-center justify-center text-xs font-medium text-white shadow"
        style={{ backgroundColor: color, ...shapeStyle }}
      >
        <span style={labelStyle}>{label}</span>
      </div>
      <span className="text-[11px] text-neutral-400">
        <Code>{shape}</Code>
      </span>
    </div>
  )
}

export function HelpModal({ onClose }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onMouseDown={(e) => {
        if (e.target === backdropRef.current) onClose()
      }}
    >
      <div className="relative flex max-h-[85vh] w-[680px] flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-900 shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center border-b border-neutral-700 bg-neutral-800 px-5 py-3">
          <h1 className="flex-1 text-sm font-semibold text-neutral-100">Mind Map — Reference</h1>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
            title="Close (Esc)"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto p-6">

          {/* ── YAML Schema ── */}
          <Section title="YAML schema">
            <p className="mb-3 text-xs text-neutral-400">
              A map file is a YAML list of root nodes. Each node can have children to any depth.
            </p>
            <pre className="overflow-x-auto rounded bg-neutral-800 p-4 font-mono text-[11px] leading-relaxed text-neutral-200">{`- title: Node label          # required
  content: "Tooltip text"   # optional — shown on hover
  link: ./docs/page.md      # optional — opens a Markdown tab
  style:
    color: "#3b82f6"         # optional — hex background colour
    shape: pill              # optional — rectangle | pill | diamond
  children:
    - title: Child node
      children:
        - title: Grandchild`}</pre>
          </Section>

          {/* ── Shapes ── */}
          <Section title="Node shapes">
            <div className="flex gap-8 py-2">
              <ShapePreview shape="rectangle" color="#334155" label="Node" />
              <ShapePreview shape="pill" color="#2563eb" label="Node" />
              <ShapePreview shape="diamond" color="#7e22ce" label="Node" />
            </div>
            <div className="mt-3 space-y-0">
              <KV label="rectangle (default)">Rounded rectangle. Used when <Code>shape</Code> is omitted.</KV>
              <KV label="pill">Fully rounded capsule. Good for top-level category nodes.</KV>
              <KV label="diamond">45° rotated square. Good for key concepts or decision points.</KV>
            </div>
          </Section>

          {/* ── Colours ── */}
          <Section title="Colours">
            <p className="mb-2 text-xs text-neutral-400">
              Set <Code>style.color</Code> to any CSS hex colour. When omitted, the node falls back to <Code>#334155</Code> (slate).
            </p>
            <div className="flex flex-wrap gap-2 py-1">
              {[
                ['Blue', '#2563eb'],
                ['Purple', '#7e22ce'],
                ['Green', '#15803d'],
                ['Amber', '#b45309'],
                ['Red', '#b91c1c'],
                ['Teal', '#0f766e'],
                ['Slate', '#334155'],
              ].map(([name, hex]) => (
                <div key={hex} className="flex items-center gap-1.5">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: hex }}
                  />
                  <span className="text-xs text-neutral-300">{name}</span>
                  <Code>{hex}</Code>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Node icons ── */}
          <Section title="Node icons">
            <KV label="Document icon">
              Appears top-right when a node has a <Code>link:</Code> field. Click to open the
              linked <Code>.md</Code> file in a new editor tab.
            </KV>
            <KV label="Collapse badge (＋/−)">
              Appears bottom-right on any node that has children. Click to hide or show the
              entire subtree. Layout reflows automatically.
            </KV>
          </Section>

          {/* ── Editor tabs ── */}
          <Section title="Editor tabs">
            <KV label="YAML tab">Always present. Edits the active map file. Click Render (or save) to update the canvas.</KV>
            <KV label="Markdown tabs">Opened by clicking a document icon on a node or a <Code>.md</Code> file in the navigator. Each tab has Source and Preview modes.</KV>
            <KV label="Close tab">Click × on any Markdown tab to close it. The YAML tab cannot be closed.</KV>
          </Section>

          {/* ── File navigator ── */}
          <Section title="File navigator">
            <KV label="Yellow map icon"><Code>.yaml</Code> files — click to load as the active mind map.</KV>
            <KV label="Document icon"><Code>.md</Code> files — click to open in an editor tab.</KV>
            <KV label="Folders">Click to expand or collapse. Nested up to 3 levels deep.</KV>
            <KV label="Refresh button">Picks up files added or deleted outside the app without reopening the folder.</KV>
            <KV label="Auto-create">Opening a folder with no <Code>.yaml</Code> files creates <Code>map.yaml</Code> with starter content automatically.</KV>
          </Section>

          {/* ── Export ── */}
          <Section title="Export">
            <KV label="PNG / JPG">Raster image of the current canvas. A system save dialog selects the output path.</KV>
            <KV label="SVG">Vector image — scales without loss. Suitable for embedding in documents.</KV>
            <p className="mt-2 text-xs text-neutral-500">
              React Flow controls (zoom buttons, attribution) are excluded from the export automatically.
            </p>
          </Section>

          {/* ── Keyboard shortcuts ── */}
          <Section title="Keyboard shortcuts">
            <KV label="Ctrl+S / Cmd+S">Save the active file (YAML or Markdown source).</KV>
            <KV label="Scroll wheel">Zoom the map canvas in or out.</KV>
            <KV label="Click + drag">Pan the map canvas.</KV>
            <KV label="Esc">Close this help panel.</KV>
          </Section>

          {/* ── Tips ── */}
          <Section title="Tips">
            <ul className="space-y-1.5 text-xs text-neutral-400">
              <li>• The canvas is <span className="text-neutral-300">read-only</span> — all edits happen in the YAML. This keeps the source file and the visual in sync.</li>
              <li>• Use <Code>link:</Code> paths relative to the map file (e.g. <Code>./notes/design.md</Code>). Links resolve correctly even for maps in subdirectories.</li>
              <li>• You can have multiple <Code>.yaml</Code> files in one project — each is an independent map. Switch between them from the file navigator.</li>
              <li>• For very wide maps, collapse high-level nodes to focus on one branch at a time.</li>
            </ul>
          </Section>

        </div>
      </div>
    </div>
  )
}
