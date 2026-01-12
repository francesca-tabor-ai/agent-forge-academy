'use client';

import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ComponentPropsWithoutRef } from 'react';

interface LessonContentProps {
  content: string;
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
    <ul {...props} className="list-disc list-inside mb-4 space-y-2 text-gray-700 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
    <ol {...props} className="list-decimal list-inside mb-4 space-y-2 text-gray-700 ml-4">
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
  const architectureContent = topic.architecture
    .filter(l => l.trim())
    .join('\n');
  const resultsLines = topic.results
    .filter(l => l.trim() && l.startsWith('-'))
    .map(l => l.substring(1).trim());
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-5">{topic.title}</h3>
      
      {hasTwoColumns ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-base">Architecture:</h4>
            <div className="text-gray-700 text-base" style={{ lineHeight: '1.6' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {topic.otherContent.join('\n')}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LessonContent({ content }: LessonContentProps) {
  const { beforeTopics, topics, afterTopics } = parseTopics(content);
  
  return (
    <div className="space-y-8">
      {/* Content before topics */}
      {beforeTopics.trim() && (
        <div className="space-y-6">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
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
            components={markdownComponents}
          >
            {afterTopics.trim()}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
