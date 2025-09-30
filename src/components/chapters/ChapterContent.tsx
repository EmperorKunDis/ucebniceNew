'use client';

import { useState, useEffect } from 'react';
import { Box } from '@/components/ui';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChapterContentProps {
  content: string;
  type: 'text' | 'lecture';
  chapterId: string;
}

export function ChapterContent({ content, type, chapterId }: ChapterContentProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Konstruovat cestu k souboru
        const basePath = type === 'text' ? '/texty/' : '/prednasky/';
        const response = await fetch(basePath + content);
        
        if (!response.ok) {
          throw new Error(`Nepodařilo se načíst obsah: ${response.status}`);
        }
        
        const text = await response.text();
        setMarkdownContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neznámá chyba');
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [content, type]);

  if (loading) {
    return (
      <Box className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="text-red-400 py-8 text-center">
        <p>Chyba při načítání obsahu: {error}</p>
      </Box>
    );
  }

  return (
    <Box className="prose prose-invert max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-gray-100 mb-6">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold text-gray-100 mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-medium text-gray-200 mt-6 mb-3">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-300">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="ml-4">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="text-gray-100 font-semibold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-gray-200 italic">{children}</em>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-gray-800/50 rounded-r">
              {children}
            </blockquote>
          ),
          code: ({ inline, children }) => {
            return inline ? (
              <code className="bg-gray-800 text-blue-300 px-1 py-0.5 rounded text-sm font-mono">
                {children}
              </code>
            ) : (
              <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                <code className="text-gray-300 font-mono text-sm">{children}</code>
              </pre>
            );
          },
          hr: () => <hr className="border-gray-700 my-8" />,
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),
        }}
      >
        {markdownContent}
      </ReactMarkdown>
    </Box>
  );
}