'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  showPreview?: boolean;
  maxLength?: number;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = '200px',
  showPreview = true,
  maxLength,
}: RichTextEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPreviewPane, setShowPreviewPane] = useState(true);

  const characterCount = value.length;
  const isNearLimit = maxLength && characterCount > maxLength * 0.9;

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-3 py-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewPane(!showPreviewPane)}
              className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
            >
              {showPreviewPane ? 'Hide Preview' : 'Show Preview'}
            </button>
            <span className="text-xs text-gray-500">Markdown supported</span>
          </div>
          {maxLength && (
            <span
              className={`text-xs ${
                isNearLimit ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              {characterCount} / {maxLength}
            </span>
          )}
        </div>
        <div className={`flex ${showPreviewPane ? 'divide-x divide-gray-200' : ''}`}>
          <div className={`${showPreviewPane ? 'w-1/2' : 'w-full'}`}>
            <textarea
              value={value}
              onChange={(e) => {
                if (!maxLength || e.target.value.length <= maxLength) {
                  onChange(e.target.value);
                }
              }}
              placeholder={placeholder}
              style={{ minHeight: isExpanded ? '400px' : minHeight }}
              className={`w-full px-3 py-2 border-0 focus:outline-none focus:ring-0 resize-y font-mono text-sm ${
                isExpanded ? '' : 'overflow-y-auto'
              }`}
              rows={isExpanded ? 15 : 8}
            />
          </div>
          {showPreviewPane && (
            <div className="w-1/2 p-3 overflow-y-auto bg-gray-50" style={{ minHeight }}>
              <div className="prose prose-sm max-w-none">
                {value ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 text-sm text-gray-700">{children}</p>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-gray-700">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      a: ({ href, children }) => (
                        <a href={href} className="text-brand-light hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      // Code blocks - dark theme
                      pre: ({ children, ...props }: any) => (
                        <pre {...props} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
                          {children}
                        </pre>
                      ),
                      code: ({ children, className, ...props }: any) => {
                        const isInline = !className;
                        if (isInline) {
                          return (
                            <code {...props} className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                              {children}
                            </code>
                          );
                        }
                        // Code block (inside pre)
                        return (
                          <code {...props} className={`${className || ''} bg-transparent text-gray-100`}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {value}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-400 text-sm italic">Preview will appear here...</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-600 hover:text-gray-900"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
        <div className="text-xs text-gray-500">
          Use **bold**, *italic*, `code`, - lists, and [links](url)
        </div>
      </div>
    </div>
  );
}
