'use client'

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-40 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-sm text-gray-400">
      Loading editor...
    </div>
  )
})

type EditorProps = ComponentProps<typeof MDEditor>

interface MarkdownEditorProps {
  label?: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
  height?: number
  preview?: EditorProps['preview']
}

export function MarkdownEditor({
  label,
  value,
  placeholder,
  onChange,
  disabled,
  height = 320,
  preview = 'edit'
}: MarkdownEditorProps) {
  return (
    <div data-color-mode="dark" className="w-full space-y-2">
      {label ? (
        <span className="text-sm font-medium text-gray-200">{label}</span>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-lg">
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          height={height}
          preview={preview}
          visibleDragbar
          textareaProps={{
            placeholder,
            readOnly: disabled,
            'aria-disabled': disabled
          }}
          data-color-mode="dark"
        />
      </div>
    </div>
  )
}

export default MarkdownEditor
