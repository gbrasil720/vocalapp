import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownViewerProps {
  content: string
  className?: string
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  return (
    <div
      className={clsx(
        'prose prose-invert max-w-none prose-p:text-gray-200 prose-li:text-gray-200 prose-strong:text-white prose-h2:text-white prose-h3:text-white prose-a:text-[#03b3c3] hover:prose-a:text-[#d856bf]',
        'prose-headings:font-semibold prose-headings:tracking-tight prose-pre:bg-black/60 prose-pre:border prose-pre:border-white/10 prose-code:text-[#03b3c3]',
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

export default MarkdownViewer

