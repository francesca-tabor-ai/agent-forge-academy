'use client';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { ComponentPropsWithoutRef } from 'react';

interface LessonContentProps {
  content: string;
}

/**
 * Determines if a code block contains real executable code vs conceptual content.
 * 
 * A code block is considered "real code" if it contains:
 * - Executable code (TypeScript, JavaScript, Python, SQL, Bash, etc.)
 * - Structured machine-readable data (JSON, YAML)
 * - CLI commands
 * 
 * A code block is NOT real code if it contains:
 * - Documentation examples
 * - Spec templates
 * - Planning outlines
 * - Checklists
 * - Conceptual models or prose
 * - Workflow diagrams (arrows, flowcharts)
 * - Conversational examples
 */
function isRealCode(content: string, language?: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;

  // FIRST: Check for conceptual content patterns (NOT real code)
  // These patterns override language tags - if it looks like conceptual content, it's not code
  const conceptualPatterns = [
    // Workflow diagrams with arrows
    /→|↓|↑|←/,
    // Conversational patterns
    /^(Developer|User|AI|System|Marketing|Analytics|Data Science):\s*["']?/m,
    // Question-answer patterns
    /^(Question|Answer|Q|A):\s*/m,
    // Simple numbered outlines (not code)
    /^\s*\d+\.\s+[A-Z][^:]*$/m,
    // Simple text with colons that looks like prose (not YAML/config)
    /^[A-Z][a-z]+ [^:]+:\s*[^:\n]+$/m,
  ];

  const hasConceptualPattern = conceptualPatterns.some(pattern => pattern.test(trimmed));
  if (hasConceptualPattern) {
    return false;
  }

  // If language is explicitly specified and is a real programming language, trust it
  // BUT only if it's not markdown (markdown examples should be checked more carefully)
  const realCodeLanguages = [
    'typescript', 'ts', 'javascript', 'js', 'jsx', 'tsx',
    'python', 'py', 'sql', 'bash', 'sh', 'shell', 'zsh',
    'json', 'yaml', 'yml', 'xml', 'html', 'css', 'scss',
    'go', 'rust', 'java', 'cpp', 'c', 'csharp', 'cs',
    'php', 'ruby', 'rb', 'swift', 'kotlin', 'dart',
    'r', 'matlab', 'perl', 'lua', 'scala', 'clojure',
    'dockerfile', 'makefile', 'ini', 'toml', 'graphql',
  ];
  
  // For markdown, check if it's actually showing markdown syntax vs just content
  if (language && (language.toLowerCase() === 'markdown' || language.toLowerCase() === 'md')) {
    // If it contains markdown syntax markers (```, **, #, [], etc.), it's showing syntax
    const hasMarkdownSyntax = /```|^\s*#{1,6}\s+|^\s*[-*+]\s+|^\s*\d+\.\s+|\[.*\]\(.*\)|\*\*.*\*\*|`[^`]+`/.test(trimmed);
    if (hasMarkdownSyntax) {
      return true; // It's showing markdown syntax, keep as code
    }
    // Otherwise it's just content in a markdown block, render as content
    return false;
  }
  
  if (language && realCodeLanguages.includes(language.toLowerCase())) {
    return true;
  }

  // Check for JSON structure
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      // Not valid JSON, continue checking
    }
  }

  // Check for YAML-like structure (key: value patterns)
  if (trimmed.includes(':') && trimmed.split('\n').filter(l => l.includes(':')).length > 2) {
    const yamlPattern = /^\s*[\w\-]+\s*:\s*.+$/m;
    if (yamlPattern.test(trimmed)) {
      return true;
    }
  }

  // Check for code-like patterns
  const codePatterns = [
    // Function definitions
    /\b(function|def|class|interface|type|const|let|var|export|import|from|require)\s+\w+/,
    // Operators and expressions
    /[=<>!+\-*/%&|]+\s*\w+|\w+\s*[=<>!+\-*/%&|]+/,
    // Control structures
    /\b(if|else|for|while|switch|case|try|catch|async|await|return|break|continue)\b/,
    // SQL keywords
    /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|INNER|OUTER)\b/i,
    // Shell commands
    /^\s*\$|^\s*#|^\s*>\s*\w+/,
    // Type annotations
    /:\s*(string|number|boolean|object|array|void|any|unknown)/,
    // Method calls
    /\w+\([^)]*\)/,
    // Array/object access
    /\[.*\]|\.\w+/,
  ];

  const hasCodePattern = codePatterns.some(pattern => pattern.test(trimmed));
  if (hasCodePattern) {
    return true;
  }

  // If content is very short and doesn't look like code, it's probably not code
  if (trimmed.length < 20 && !trimmed.includes('{') && !trimmed.includes('(')) {
    return false;
  }

  // Default: if we can't determine, assume it's NOT real code (safer to render as content)
  return false;
}

/**
 * Preprocesses markdown content to convert non-code code blocks to regular markdown.
 * This ensures only real executable code appears in code blocks.
 */
function preprocessMarkdown(content: string): string {
  // Match code blocks with optional language identifier
  // Handles: ```lang\ncontent```, ```lang content```, ```\ncontent```, ```content```
  const codeBlockRegex = /```(\w+)?\s*\n?([\s\S]*?)```/g;
  
  return content.replace(codeBlockRegex, (match, language, codeContent) => {
    // Clean up the code content (remove leading/trailing whitespace)
    const cleanedContent = codeContent.trim();
    
    if (isRealCode(cleanedContent, language)) {
      // Keep as code block
      return match;
    } else {
      // Convert to regular markdown (remove code fence, preserve content)
      // The content will be rendered as regular markdown by ReactMarkdown
      return cleanedContent;
    }
  });
}

interface TopicSection {
  title: string;
  architecture: string[];
  results: string[];
  otherContent: string[];
}

// Parse markdown content to extract topic sections
function parseTopics(content: string): {
  beforeTopics: string;
  topics: TopicSection[];
  afterTopics: string;
} {
  const lines = content.split('\n');
  const beforeTopics: string[] = [];
  const topics: TopicSection[] = [];
  const afterTopics: string[] = [];
  
  let currentTopic: TopicSection | null = null;
  let inArchitecture = false;
  let inResults = false;
  let topicsStarted = false;
  let topicsEnded = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if line is an H3 heading with topic pattern (### 10.1 ...)
    const h3Match = line.match(/^###\s+(\d+\.\d+)\s+(.+)$/);
    
    if (h3Match) {
      topicsStarted = true;
      
      // Save previous topic if exists
      if (currentTopic) {
        topics.push(currentTopic);
      }
      
      // Start new topic
      currentTopic = {
        title: `${h3Match[1]} ${h3Match[2]}`,
        architecture: [],
        results: [],
        otherContent: [],
      };
      inArchitecture = false;
      inResults = false;
      continue;
    }
    
    // Check for Architecture: section
    if (line.match(/^\*\*Architecture:\*\*$/)) {
      if (currentTopic) {
        inArchitecture = true;
        inResults = false;
      }
      continue;
    }
    
    // Check for Results: section
    if (line.match(/^\*\*Results:\*\*$/)) {
      if (currentTopic) {
        inResults = true;
        inArchitecture = false;
      }
      continue;
    }
    
    // Check if we've moved to next H2 (end of topics section)
    if (line.match(/^##\s+/) && !line.match(/^###/)) {
      if (currentTopic) {
        topics.push(currentTopic);
        currentTopic = null;
      }
      topicsEnded = true;
      inArchitecture = false;
      inResults = false;
    }
    
    // Check if we've moved to next H3 (different topic)
    if (line.match(/^###\s+/) && currentTopic && !line.match(/^###\s+(\d+\.\d+)/)) {
      // This is an H3 but not a topic pattern - end current topic
      if (currentTopic) {
        topics.push(currentTopic);
        currentTopic = null;
      }
      inArchitecture = false;
      inResults = false;
    }
    
    // Route content to appropriate section
    if (currentTopic) {
      if (inArchitecture) {
        currentTopic.architecture.push(line);
      } else if (inResults) {
        currentTopic.results.push(line);
      } else {
        currentTopic.otherContent.push(line);
      }
    } else if (!topicsStarted) {
      beforeTopics.push(line);
    } else if (topicsEnded || !currentTopic) {
      afterTopics.push(line);
    }
  }
  
  // Don't forget the last topic
  if (currentTopic) {
    topics.push(currentTopic);
  }
  
  return {
    beforeTopics: beforeTopics.join('\n'),
    topics,
    afterTopics: afterTopics.join('\n'),
  };
}

// Custom markdown components for non-topic content
const markdownComponents: Components = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <h1 {...props} className="text-3xl font-semibold text-gray-900 mb-6 mt-8 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <h2 {...props} className="text-2xl font-semibold text-gray-900 mb-5 mt-8">
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <h3 {...props} className="text-xl font-semibold text-gray-900 mb-4 mt-6">
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: ComponentPropsWithoutRef<'h4'>) => (
    <h4 {...props} className="text-lg font-semibold text-gray-900 mb-3 mt-5">
      {children}
    </h4>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <p {...props} className="text-base text-gray-700 mb-4 leading-relaxed" style={{ lineHeight: '1.6' }}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
    <ul {...props} className="list-disc mb-4 space-y-2 text-gray-700">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} className="list-decimal mb-4 space-y-2 text-gray-700">
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<'li'>) => (
    <li {...props} className="mb-1.5 text-gray-700">
      {children}
    </li>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<'strong'>) => (
    <strong {...props} className="font-semibold text-gray-900">
      {children}
    </strong>
  ),
  code: ({ children, className, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code {...props} className="bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    // Code inside pre blocks - inherit dark theme
    return (
      <code {...props} className={`${className || ''} bg-transparent text-white`}>
        {children}
      </code>
    );
  },
  pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
    <pre {...props} className="bg-black text-white p-4 rounded-lg overflow-x-auto mb-4 font-mono text-sm">
      {children}
    </pre>
  ),
  a: ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a
      {...props}
      href={href}
      className="text-brand-light hover:text-brand-light/90 hover:underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
};

// Sanitization schema that allows video and source tags
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'video', 'source'],
  attributes: {
    ...(defaultSchema.attributes || {}),
    video: ['controls', 'width', 'height', 'src', 'preload', 'poster', 'autoplay', 'loop', 'muted'],
    source: ['src', 'type'],
  },
};

// Format metrics in list items
function MetricItem({ text }: { text: string }) {
  // Match patterns like "58% faster resolution time", "84% first-call resolution", "312% ROI"
  // Handle both with and without percentage sign
  const metricMatch = text.match(/^(\d+%?)\s+(.+)$/);
  
  if (metricMatch) {
    return (
      <li className="mb-2.5 flex items-start">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-light/10 text-brand-light mr-3 flex-shrink-0">
          <strong>{metricMatch[1]}</strong>
        </span>
        <span className="text-gray-700 flex-1">{metricMatch[2]}</span>
      </li>
    );
  }
  
  return <li className="mb-2.5 text-gray-700">{text}</li>;
}

// Render a topic card
function TopicCard({ topic }: { topic: TopicSection }) {
  const hasArchitecture = topic.architecture.some(l => l.trim());
  const hasResults = topic.results.some(l => l.trim());
  const hasTwoColumns = hasArchitecture && hasResults;
  
  // Clean up architecture and results content
  const rawArchitectureContent = topic.architecture
    .filter(l => l.trim())
    .join('\n');
  const architectureContent = preprocessMarkdown(rawArchitectureContent);
  
  const resultsLines = topic.results
    .filter(l => l.trim() && l.startsWith('-'))
    .map(l => l.substring(1).trim());
  
  const rawOtherContent = topic.otherContent.join('\n');
  const otherContent = preprocessMarkdown(rawOtherContent);
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-5">{topic.title}</h3>
      
      {hasTwoColumns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-base">Architecture:</h4>
            <div className="text-gray-700 text-base" style={{ lineHeight: '1.6' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={markdownComponents}
              >
                {architectureContent}
              </ReactMarkdown>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-base">Results:</h4>
            <ul className="list-none space-y-0">
              {resultsLines.map((line, idx) => (
                <MetricItem key={idx} text={line} />
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {hasArchitecture && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-base">Architecture:</h4>
              <div className="text-gray-700 text-base" style={{ lineHeight: '1.6' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {architectureContent}
                </ReactMarkdown>
              </div>
            </div>
          )}
          {hasResults && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-base">Results:</h4>
              <ul className="list-none space-y-0">
                {resultsLines.map((line, idx) => (
                  <MetricItem key={idx} text={line} />
                ))}
              </ul>
            </div>
          )}
          {topic.otherContent.length > 0 && (
            <div className="text-gray-700 text-base" style={{ lineHeight: '1.6' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
                components={markdownComponents}
              >
                {otherContent}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonContent({ content }: LessonContentProps) {
  // Preprocess content to convert non-code code blocks to regular markdown
  const preprocessedContent = preprocessMarkdown(content);
  const { beforeTopics, topics, afterTopics } = parseTopics(preprocessedContent);
  
  return (
    <div className="lesson-content space-y-8">
      {/* Content before topics */}
      {beforeTopics.trim() && (
        <div className="space-y-6">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            components={markdownComponents}
          >
            {beforeTopics.trim()}
          </ReactMarkdown>
        </div>
      )}
      
      {/* Topic cards */}
      {topics.length > 0 && (
        <div className="space-y-6">
          {topics.map((topic, idx) => (
            <TopicCard key={idx} topic={topic} />
          ))}
        </div>
      )}
      
      {/* Content after topics */}
      {afterTopics.trim() && (
        <div className="space-y-6">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
            components={markdownComponents}
          >
            {afterTopics.trim()}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
