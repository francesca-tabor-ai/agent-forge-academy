#!/usr/bin/env python3
"""
Standardize bullet points across all course markdown files.

Rules:
1. Format: **Bold Label**: Clear, complete description
2. Parallel structure within lists
3. Expand shorthand into clear meaning
4. Avoid single-word or vague bullets
5. Keep length balanced (1 sentence, max 2 short clauses)
6. Use `-` for bullets (not `*`)
7. One blank line before and after bullet lists
"""

import re
import os
from pathlib import Path
from typing import List, Tuple, Optional

# Sections to process (headings)
TARGET_SECTION_HEADINGS = [
    r'^##?\s+Learning Objectives',
    r'^##?\s+Key Takeaways',
    r'^##?\s+Module Summary',
    r'^##?\s+What You\'ll Master',
    r'^##?\s+You\'ll Learn',
    r'^##?\s+You\'ll Build',
    r'^##?\s+Best For',
    r'^##?\s+Course Objective',
    r'^##?\s+Outcome',
    r'^##?\s+Outcomes',
    r'^##?\s+Next Steps',
]

# Sections to process (bold text on same line)
# Handle both **Section:** and **Section**:
TARGET_SECTION_BOLD = [
    r'\*\*Learning Objectives\*\*:?',
    r'\*\*Learning Objectives:\*\*',
    r'\*\*Key Takeaways\*\*:?',
    r'\*\*Key Takeaways:\*\*',
    r'\*\*What You\'ll Master\*\*:?',
    r'\*\*What You\'ll Master:\*\*',
    r'\*\*You\'ll Learn\*\*:?',
    r'\*\*You\'ll Learn:\*\*',
    r'\*\*You\'ll Build\*\*:?',
    r'\*\*You\'ll Build:\*\*',
    r'\*\*Best For\*\*:?',
    r'\*\*Best For:\*\*',
    r'\*\*Course Objective\*\*:?',
    r'\*\*Course Objective:\*\*',
    r'\*\*Outcome\*\*:?',
    r'\*\*Outcome:\*\*',
    r'\*\*Outcomes\*\*:?',
    r'\*\*Outcomes:\*\*',
    r'\*\*Next Steps\*\*:?',
    r'\*\*Next Steps:\*\*',
]

def is_target_section_heading(line: str) -> bool:
    """Check if line is a target section header (heading)."""
    return any(re.match(pattern, line, re.IGNORECASE) for pattern in TARGET_SECTION_HEADINGS)

def is_target_section_bold(line: str) -> bool:
    """Check if line contains a target section in bold text."""
    return any(re.search(pattern, line, re.IGNORECASE) for pattern in TARGET_SECTION_BOLD)

def extract_bold_label(text: str) -> Optional[str]:
    """Extract bold label from text if present."""
    match = re.match(r'\*\*([^*]+)\*\*', text)
    return match.group(1) if match else None

def is_single_word_or_vague(text: str) -> bool:
    """Check if bullet is too vague or single-word."""
    # Remove markdown formatting
    clean = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    clean = re.sub(r'[^\w\s]', '', clean).strip()
    words = clean.split()
    return len(words) <= 2 and not any(len(w) > 10 for w in words)

def needs_expansion(text: str) -> bool:
    """Check if bullet needs expansion (shorthand, note-like)."""
    # Check for common shorthand patterns
    shorthand_patterns = [
        r'^[A-Z][a-z]+\s+[a-z]+$',  # "Version control" (two words)
        r'^[A-Z][a-z]+$',  # Single capitalized word
        r'^[a-z]+\s+[a-z]+$',  # Two lowercase words
    ]
    clean = re.sub(r'\*\*([^*]+)\*\*', '', text).strip()
    clean = re.sub(r'^-\s*', '', clean).strip()
    return any(re.match(pattern, clean) for pattern in shorthand_patterns) and len(clean.split()) <= 3

def extract_label_from_action(text: str) -> str:
    """Extract a meaningful label from an action-oriented bullet."""
    # Remove common prefixes and extract the core concept
    text_lower = text.lower()
    
    # Pattern 1: Action verb + object (most common)
    # "Connect fal.ai to n8n" -> "fal.ai Integration"
    # "Implement async patterns" -> "Asynchronous API Patterns"
    patterns = [
        (r'^(?:connect|link|integrate)\s+([^:]+?)(?:\s+to|\s+with|\s+and|$)', lambda m: f"{m.group(1).strip().title()} Integration"),
        (r'^(?:build|create|develop|design)\s+([^:]+?)(?:\s+pipeline|\s+system|\s+workflow|$)', lambda m: f"{m.group(1).strip().title()} Development"),
        (r'^(?:implement|deploy)\s+([^:]+?)(?:\s+pattern|\s+system|\s+process|$)', lambda m: f"{m.group(1).strip().title()} Implementation"),
        (r'^(?:understand|learn|master|study)\s+([^:]+?)(?:\s+\(|$)', lambda m: f"{m.group(1).strip().title()}"),
        (r'^(?:distinguish|differentiate|compare)\s+([^:]+?)(?:\s+vs|\s+and|$)', lambda m: f"{m.group(1).strip().title()} Analysis"),
        (r'^(?:consider|evaluate|assess)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Evaluation"),
        (r'^(?:analyze|examine)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Analysis"),
        (r'^(?:identify|recognize)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Identification"),
        (r'^(?:reframe|rethink|reimagine)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Reframing"),
        (r'^(?:configure|set up|establish)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Configuration"),
        (r'^(?:apply|use|utilize)\s+([^:]+?)(?:\s+and|$)', lambda m: f"{m.group(1).strip().title()} Application"),
    ]
    
    for pattern, formatter in patterns:
        match = re.match(pattern, text, re.IGNORECASE)
        if match:
            label = formatter(match)
            # Clean up: remove extra words, capitalize properly
            label = re.sub(r'\s+', ' ', label).strip()
            # Limit length
            words = label.split()
            if len(words) > 4:
                label = ' '.join(words[:4])
            return label
    
    # Fallback: extract key noun phrases (skip verbs)
    words = text.split()
    skip_verbs = {'understand', 'learn', 'master', 'build', 'create', 'implement', 
                 'connect', 'deploy', 'set', 'up', 'distinguish', 'consider', 'analyze',
                 'identify', 'reframe', 'configure', 'apply', 'use', 'utilize', 'why',
                 'how', 'what', 'when', 'where', 'the', 'a', 'an', 'and', 'or', 'to', 'from'}
    
    # Find meaningful nouns/adjectives
    meaningful = []
    for word in words[:6]:  # Look at first 6 words
        clean_word = word.lower().rstrip('.,:;()[]')
        if clean_word not in skip_verbs and len(clean_word) > 2:
            meaningful.append(word)
            if len(meaningful) >= 3:  # Get 2-3 meaningful words
                break
    
    if meaningful:
        label = ' '.join(meaningful[:3]).title()
        return label
    
    # Last resort
    if words:
        return words[0].title() if len(words[0]) > 3 else "Key Concept"
    
    return "Key Concept"

def standardize_bullet(bullet: str, context: List[str] = None) -> str:
    """
    Standardize a single bullet point.
    
    Args:
        bullet: The bullet text (with or without leading `-`)
        context: Other bullets in the same list for parallel structure
    """
    # Remove leading `-` or `*` and whitespace
    text = re.sub(r'^[-*]\s+', '', bullet).strip()
    
    # Skip if empty
    if not text:
        return bullet
    
    # Check if already in correct format with bold label and colon
    # But still process it to ensure quality (might need improvement)
    already_standardized = bool(re.match(r'^\*\*[^*]+\*\*:\s+.+', text))
    
    # If it's already standardized, extract components to check quality
    if already_standardized:
        match = re.match(r'^\*\*([^*]+)\*\*:\s+(.+)', text)
        if match:
            existing_label = match.group(1)
            existing_desc = match.group(2)
            # Check if description is redundant (repeats label)
            label_lower = existing_label.lower()
            desc_lower = existing_desc.lower()
            # If description just repeats the label, improve it
            if label_lower in desc_lower and len(existing_desc.split()) <= len(existing_label.split()) + 3:
                # Description is too similar to label, keep original for now
                # but we'll still process it below
                pass
            else:
                # Looks good, just ensure format
                return f"- {text}"
    
    # Check if it's a numbered list item (1., 2., etc.) - process it but convert to bullet
    is_numbered = bool(re.match(r'^\d+\.\s+', text))
    if is_numbered:
        text = re.sub(r'^\d+\.\s+', '', text)
    
    # Handle dash-separated format: "**Label** - Description"
    dash_match = re.match(r'^\*\*([^*]+)\*\*\s*-\s*(.+)', text)
    if dash_match:
        bold_label = dash_match.group(1).strip()
        description = dash_match.group(2).strip()
        return f"- **{bold_label}**: {description}"
    
    # Extract existing bold label if present
    bold_label = extract_bold_label(text)
    description = text
    
    # If there's already a bold label, use it
    if bold_label:
        # Remove the bold label from description
        description = re.sub(r'\*\*[^*]+\*\*', '', description).strip()
        description = re.sub(r'^[-:\s]+', '', description).strip()
        
        # If description is empty or too short after removing label, keep original text as description
        if not description or len(description.split()) <= 2:
            # Extract description from original text, removing the label
            description = text.replace(f"**{bold_label}**", "").strip()
            description = re.sub(r'^[-:\s]+', '', description).strip()
            if not description:
                description = text  # Fallback to full text
    else:
        # No existing bold label - need to create one
        # Check if it's a single word or very short
        words = text.split()
        if len(words) <= 2 and not any('(' in w or ':' in w for w in words):
            # Very short - needs expansion
            if len(words) == 1:
                bold_label = words[0].title()
                description = f"Apply {words[0].lower()} principles and best practices in practical scenarios"
            else:
                bold_label = ' '.join(words).title()
                description = f"Implement {text.lower()} effectively across relevant use cases"
        else:
            # Extract label from action or first concept
            bold_label = extract_label_from_action(text)
            
            # For description, use the full text but make it flow better
            description = text
            
            # Check if description would be redundant with label
            label_lower = bold_label.lower()
            desc_lower = description.lower()
            
            # Remove label words from description to avoid redundancy
            label_words = set(label_lower.split())
            desc_words = desc_lower.split()
            
            # Check if description is mostly just repeating the label
            overlap = sum(1 for word in desc_words[:5] if word in label_words)
            if overlap >= 2 and len(desc_words) <= len(label_words.split()) + 3:
                # Description is too similar - rewrite it to be more descriptive
                action_verbs = ['connect', 'implement', 'build', 'create', 'understand', 
                              'learn', 'master', 'deploy', 'distinguish', 'consider',
                              'analyze', 'identify', 'reframe', 'configure', 'apply']
                first_word = words[0].lower() if words else ""
                
                if first_word == 'connect':
                    description = f"Establish connections between systems and platforms"
                elif first_word == 'implement':
                    description = f"Apply and deploy {bold_label.lower()} in practical scenarios"
                elif first_word == 'build':
                    description = f"Create and develop {bold_label.lower()} solutions"
                elif first_word == 'understand':
                    description = f"Gain comprehensive knowledge of {bold_label.lower()} principles"
                elif first_word in ['learn', 'master']:
                    description = f"Acquire expertise in {bold_label.lower()} concepts and applications"
                elif first_word == 'deploy':
                    description = f"Set up and configure {bold_label.lower()} in production environments"
                else:
                    # Generic expansion
                    description = f"Apply {bold_label.lower()} principles and best practices effectively"
            else:
                # Description is good, just ensure capitalization
                if description and not description[0].isupper():
                    description = description[0].upper() + description[1:]
    
    # Clean up description
    description = description.strip()
    if description:
        # Ensure it starts with capital
        if description and not description[0].isupper():
            description = description[0].upper() + description[1:]
        # Remove trailing punctuation that might be awkward
        description = description.rstrip('.,;')
    
    # Format as: **Bold Label**: Description
    result = f"- **{bold_label}**: {description}"
    
    # Ensure we didn't create something too long (max ~150 chars for description)
    if len(description) > 150:
        # Try to shorten it
        sentences = re.split(r'[.!?]\s+', description)
        if sentences:
            description = sentences[0]
            if len(description) > 150:
                # Truncate at word boundary
                words = description.split()
                truncated = []
                for word in words:
                    if len(' '.join(truncated + [word])) <= 140:
                        truncated.append(word)
                    else:
                        break
                description = ' '.join(truncated) + '.'
        result = f"- **{bold_label}**: {description}"
    
    return result

def process_bullet_list(lines: List[str], start_idx: int) -> Tuple[List[Tuple[int, str]], int]:
    """
    Process a bullet list starting at start_idx.
    
    Returns:
        (list of (index, standardized_text) tuples, next_index)
    """
    processed = []
    bullets = []
    i = start_idx
    
    # Collect all bullets in this list
    while i < len(lines):
        line = lines[i].rstrip()
        
        # Check if it's a bullet or numbered list item
        if re.match(r'^[-*]\s+', line) or re.match(r'^\d+\.\s+', line):
            bullets.append((i, line))
            i += 1
        # Check if it's a continuation (indented line) or sub-bullet
        elif line and (line.startswith('  ') or line.startswith('\t')):
            if bullets:
                # Append to last bullet (continuation)
                last_idx, last_text = bullets[-1]
                bullets[-1] = (last_idx, last_text + ' ' + line.strip())
            i += 1
        # Empty line might be end of list, but check next line
        elif not line.strip():
            # Check if next non-empty line is also a bullet
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and re.match(r'^[-*]\s+', lines[j]):
                # More bullets coming, continue
                i += 1
            else:
                # End of list
                break
        # Check if it's a new section (starts with #)
        elif line.startswith('#'):
            # End of list
            break
        else:
            # Not a bullet, end of list
            break
    
    # Standardize all bullets
    if bullets:
        bullet_texts = [bullet[1] for bullet in bullets]
        standardized = []
        for bullet_text in bullet_texts:
            standardized.append(standardize_bullet(bullet_text, bullet_texts))
        
        # Create list of changes
        for idx, (orig_idx, _) in enumerate(bullets):
            if idx < len(standardized):
                processed.append((orig_idx, standardized[idx]))
    
    return processed, i

def process_file(file_path: Path) -> bool:
    """Process a single markdown file. Returns True if changes were made."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False
    
    if not lines:
        return False
    
    changes = []
    i = 0
    in_target_section = False
    section_depth = 0
    bold_section_active = False
    
    while i < len(lines):
        line = lines[i]
        
        # Check if we're entering a target section (heading)
        if is_target_section_heading(line):
            in_target_section = True
            bold_section_active = False
            # Determine section depth (## vs ###)
            section_depth = len(line) - len(line.lstrip('#'))
            i += 1
            continue
        
        # Check if we're entering a target section (bold text)
        if is_target_section_bold(line):
            in_target_section = True
            bold_section_active = True
            section_depth = 0  # Bold sections don't have depth
            i += 1
            continue
        
        # Check if we're leaving the target section (new section at same or higher level)
        if in_target_section and not bold_section_active and line.startswith('#'):
            current_depth = len(line) - len(line.lstrip('#'))
            if current_depth <= section_depth and line.strip() != '':
                in_target_section = False
                section_depth = 0
        
        # For bold sections, end when we hit a new heading or another bold section
        if in_target_section and bold_section_active:
            if line.startswith('#'):
                in_target_section = False
                bold_section_active = False
            elif is_target_section_bold(line) and i > 0:  # New bold section
                # Process current section first, then start new one
                pass
        
        # Process bullets in target sections (including numbered lists)
        if in_target_section and (re.match(r'^[-*]\s+', line) or re.match(r'^\d+\.\s+', line)):
            bullet_changes, next_idx = process_bullet_list(lines, i)
            for orig_idx, new_text in bullet_changes:
                original = lines[orig_idx].rstrip()
                # Always standardize bullets in target sections (even if similar)
                # Check if it's already in the correct format
                if not re.match(r'^[-*]\s+\*\*[^*]+\*\*:\s+', original):
                    # Not in standard format, add the change
                    changes.append((orig_idx, new_text))
                elif original != new_text:
                    # Already in format but might need improvement
                    changes.append((orig_idx, new_text))
            i = next_idx
            # If we're in a bold section, it might end after the bullets
            if bold_section_active:
                # Check if next non-empty line is a new section
                j = i
                while j < len(lines) and not lines[j].strip():
                    j += 1
                if j < len(lines) and (lines[j].startswith('#') or is_target_section_bold(lines[j])):
                    in_target_section = False
                    bold_section_active = False
            continue
        
        i += 1
    
    # Apply changes
    if changes:
        # Sort by index (descending) to avoid index shifting issues
        changes.sort(key=lambda x: x[0], reverse=True)
        for idx, new_text in changes:
            lines[idx] = new_text + '\n'
        
        # Write back
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
            return False
    
    return False

def main():
    """Main function to process all markdown files."""
    course_dir = Path(__file__).parent.parent / 'course'
    
    if not course_dir.exists():
        print(f"Course directory not found: {course_dir}")
        return
    
    # Find all markdown files
    md_files = list(course_dir.rglob('*.md'))
    print(f"Found {len(md_files)} markdown files")
    
    changed_count = 0
    for md_file in md_files:
        if process_file(md_file):
            print(f"Updated: {md_file.relative_to(course_dir.parent)}")
            changed_count += 1
    
    print(f"\nProcessed {len(md_files)} files, updated {changed_count} files")

if __name__ == '__main__':
    main()
