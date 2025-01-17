import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="border rounded-md p-4">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        className="prose dark:prose-invert prose-sm max-w-none"
        components={{
          // Style adjustments for markdown elements
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2">{children}</h3>,
          a: ({ children, href }) => (
            <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm">{children}</code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
} 