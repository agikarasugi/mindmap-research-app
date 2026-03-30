import { useState, useEffect, useRef, useCallback } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as MonacoType from 'monaco-editor'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { useAppStore } from '../../store/appStore'
import type { MarkdownTab as MarkdownTabType } from '../../types/tabs'

interface Props {
  tab: MarkdownTabType
}

export function MarkdownTab({ tab }: Props) {
  const saveFile = useAppStore((s) => s.saveFile)
  const setMarkdownViewMode = useAppStore((s) => s.setMarkdownViewMode)
  const theme = useAppStore((s) => s.theme)

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const editorRef = useRef<MonacoType.editor.IStandaloneCodeEditor | null>(null)

  // Load file content on mount / path change
  useEffect(() => {
    setLoading(true)
    setError(null)
    readTextFile(tab.filePath)
      .then((text) => {
        setContent(text)
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(String(err))
        setLoading(false)
      })
  }, [tab.filePath])

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        saveFile(tab.filePath, editor.getValue())
      })
    },
    [tab.filePath, saveFile],
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Loading…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-red-400">
        Error: {error}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Segment control */}
      <div className="flex shrink-0 items-center gap-0 border-b border-neutral-700 bg-neutral-800 px-3 py-1.5">
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

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab.viewMode === 'source' ? (
          <Editor
            height="100%"
            language="markdown"
            theme={theme === 'dark' ? 'vs-dark' : 'vs'}
            value={content}
            onChange={(v) => setContent(v ?? '')}
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
