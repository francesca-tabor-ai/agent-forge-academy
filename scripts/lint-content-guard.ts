#!/usr/bin/env tsx

/**
 * Content Guard: Detects code blocks containing Markdown headings
 * 
 * Rule: A code block may not contain Markdown headings (#, ##, ###)
 * 
 * This catches cases where content that should be rendered as markdown
 * is incorrectly placed in code blocks.
 */

import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  line: number;
  codeBlockContent: string;
  heading: string;
}

const COURSE_DIR = path.join(process.cwd(), 'course');

/**
 * Find all markdown files recursively
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract code blocks from markdown content
 */
function extractCodeBlocks(content: string): Array<{ language: string | null; content: string; startLine: number }> {
  const codeBlocks: Array<{ language: string | null; content: string; startLine: number }> = [];
  
  // Match code blocks: ```lang\ncontent``` or ```\ncontent```
  const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
  
  const lines = content.split('\n');
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || null;
    const codeContent = match[2];
    const matchStart = match.index;
    
    // Calculate line number
    const linesBeforeMatch = content.substring(0, matchStart).split('\n');
    const startLine = linesBeforeMatch.length;
    
    codeBlocks.push({
      language,
      content: codeContent,
      startLine,
    });
  }
  
  return codeBlocks;
}

/**
 * Check if code block content contains Markdown headings
 */
function containsMarkdownHeadings(content: string): Array<{ line: number; heading: string }> {
  const violations: Array<{ line: number; heading: string }> = [];
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Match markdown headings: #, ##, ###, etc.
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      violations.push({
        line: i + 1,
        heading: line.trim(),
      });
    }
  }
  
  return violations;
}

/**
 * Lint a single markdown file
 */
function lintFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const codeBlocks = extractCodeBlocks(content);
    
    for (const block of codeBlocks) {
      const headingViolations = containsMarkdownHeadings(block.content);
      
      for (const violation of headingViolations) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: block.startLine + violation.line - 1,
          codeBlockContent: block.content.substring(0, 100) + (block.content.length > 100 ? '...' : ''),
          heading: violation.heading,
        });
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  
  return violations;
}

/**
 * Main linting function
 */
function lintContent(): { violations: Violation[]; exitCode: number } {
  const markdownFiles = findMarkdownFiles(COURSE_DIR);
  const allViolations: Violation[] = [];
  
  console.log(`🔍 Scanning ${markdownFiles.length} markdown files for code blocks with Markdown headings...\n`);
  
  for (const file of markdownFiles) {
    const violations = lintFile(file);
    allViolations.push(...violations);
  }
  
  if (allViolations.length === 0) {
    console.log('✅ No violations found! All code blocks are clean.\n');
    return { violations: [], exitCode: 0 };
  }
  
  console.error(`❌ Found ${allViolations.length} violation(s):\n`);
  
  // Group violations by file
  const violationsByFile = new Map<string, Violation[]>();
  for (const violation of allViolations) {
    if (!violationsByFile.has(violation.file)) {
      violationsByFile.set(violation.file, []);
    }
    violationsByFile.get(violation.file)!.push(violation);
  }
  
  // Report violations
  for (const [file, violations] of violationsByFile.entries()) {
    console.error(`📄 ${file}:`);
    for (const violation of violations) {
      console.error(`   Line ${violation.line}: Contains heading "${violation.heading}"`);
      console.error(`   Code block preview: ${violation.codeBlockContent.split('\n')[0]}...`);
    }
    console.error('');
  }
  
  console.error('💡 Fix: Remove code fences (```) from content that contains Markdown headings.');
  console.error('   These should render as normal markdown, not as code blocks.\n');
  
  return { violations: allViolations, exitCode: 1 };
}

// Run if executed directly
if (require.main === module) {
  const { exitCode } = lintContent();
  process.exit(exitCode);
}

export { lintContent, Violation };
