import { useState, useEffect, useRef, useCallback } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as MonacoType from 'monaco-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { useAppStore } from '../../store/appStore'
import type { MarkdownTab as MarkdownTabType } from '../../types/tabs'

type SaveStatus = 'saved' | 'unsaved' | 'saving'

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-400">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
        Saving…
      </span>
    )
  }
  if (status === 'unsaved') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-400">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        Unsaved
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-neutral-500">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-neutral-500" />
      Saved
    </span>
  )
}

const AUTOSAVE_DELAY = 1500

interface Props {
  tab: MarkdownTabType
}

export function MarkdownTab({ tab }: Props) {
  const saveFile = useAppStore((s) => s.saveFile)
  const setMarkdownViewMode = useAppStore((s) => s.setMarkdownViewMode)
  const theme = useAppStore((s) => s.theme)
  const setTabDirty = useAppStore((s) => s.setTabDirty)

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')

  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const filePathRef = useRef(tab.filePath)
  useEffect(() => { filePathRef.current = tab.filePath }, [tab.filePath])

  // Load file content on mount / path change; reset save status
  useEffect(() => {
    setLoading(true)
    setError(null)
    setSaveStatus('saved')
    setTabDirty(tab.id, false)
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    readTextFile(tab.filePath)
      .then((text) => { setContent(text); setLoading(false) })
      .catch((err: unknown) => { setError(String(err)); setLoading(false) })
  }, [tab.filePath, tab.id, setTabDirty])

  const doSave = useCallback(async (value?: string) => {
    const path = filePathRef.current
    const toSave = value ?? editorRef.current?.getValue() ?? content
    if (autosaveTimer.current) { clearTimeout(autosaveTimer.current); autosaveTimer.current = null }
    setSaveStatus('saving')
    try {
      await saveFile(path, toSave)
      setSaveStatus('saved')
      setTabDirty(tab.id, false)
    } catch {
      setSaveStatus('unsaved')
    }
  }, [content, saveFile, tab.id, setTabDirty])

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => doSave())
    },
    [doSave],
  )

  const handleChange = useCallback((v: string | undefined) => {
    const value = v ?? ''
    setContent(value)
    setSaveStatus('unsaved')
    setTabDirty(tab.id, true)
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => doSave(value), AUTOSAVE_DELAY)
  }, [tab.id, setTabDirty, doSave])

  // Flush on unmount
  useEffect(() => () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }, [])

  if (loading) {
    return <div className="flex h-full items-center justify-center text-sm text-neutral-400">Loading…</div>
  }
  if (error) {
    return <div className="flex h-full items-center justify-center p-4 text-sm text-red-400">Error: {error}</div>
  }

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-700 bg-neutral-800 px-3 py-1.5">
        {/* Source / Preview toggle */}
        <div className="flex">
          <button
            onClick={() => setMarkdownViewMode(tab.id, 'source')}
            className={`rounded-l border border-neutral-600 px-3 py-0.5 text-xs ${
              tab.viewMode === 'source'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Source
          </button>
          <button
            onClick={() => setMarkdownViewMode(tab.id, 'preview')}
            className={`rounded-r border border-l-0 border-neutral-600 px-3 py-0.5 text-xs ${
              tab.viewMode === 'preview'
                ? 'bg-blue-600 text-white'
                : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
            }`}
          >
            Preview
          </button>
        </div>

        <div className="flex-1" />
        <SaveIndicator status={saveStatus} />
        <button
          onClick={() => doSave()}
          disabled={saveStatus === 'saved'}
          className="rounded bg-neutral-700 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-600 disabled:opacity-40"
        >
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab.viewMode === 'source' ? (
          <Editor
            height="100%"
            language="markdown"
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            value={content}
            onChange={handleChange}
            onMount={handleMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        ) : (
          <div className="h-full overflow-auto bg-neutral-900 p-6">
            <div className={`prose max-w-none prose-a:text-blue-500 ${theme === 'dark' ? 'prose-invert prose-headings:text-neutral-100 prose-p:text-neutral-300 prose-code:text-neutral-200 prose-strong:text-neutral-100' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
