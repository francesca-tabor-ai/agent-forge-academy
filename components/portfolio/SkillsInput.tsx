'use client';

import { useState, KeyboardEvent } from 'react';
import { normalizeSkillAI } from '@/lib/utils/skill-normalization';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  minSkills?: number;
}

const MAX_SKILL_LENGTH = 40;
const MAX_SKILLS = 30;

export function SkillsInput({ value, onChange, placeholder = 'Type a skill and press Enter', minSkills }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Common tech skills for autocomplete
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Next.js', 'Node.js',
    'Vue.js', 'Angular', 'Express', 'Django', 'Flask', 'FastAPI', 'PostgreSQL',
    'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
    'Git', 'CI/CD', 'GraphQL', 'REST API', 'Machine Learning', 'Deep Learning',
    'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'Data Science', 'SQL',
    'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Webpack', 'Vite', 'Jest',
    'Testing', 'Agile', 'Scrum', 'DevOps', 'Linux', 'GitHub', 'GitLab'
  ];

  // Check if skill already exists (case-insensitive)
  const skillExists = (skill: string): boolean => {
    return value.some(existing => existing.toLowerCase() === skill.toLowerCase());
  };

  // Normalize skill: trim, collapse multiple spaces, capitalize first letter, normalize AI
  const normalizeSkill = (skill: string): string => {
    const normalized = skill
      .trim()
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Apply AI normalization (must be after title case to catch "Ai")
    return normalizeSkillAI(normalized);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Always prevent form submission
      
      const trimmed = inputValue.trim();
      if (!trimmed) {
        return; // Ignore empty strings
      }

      // Check max skills limit
      if (value.length >= MAX_SKILLS) {
        setError(`Maximum ${MAX_SKILLS} skills allowed`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Check skill length
      if (trimmed.length > MAX_SKILL_LENGTH) {
        setError(`Skill must be ${MAX_SKILL_LENGTH} characters or less`);
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Normalize and check for duplicates (case-insensitive)
      const normalized = normalizeSkill(trimmed);
      if (skillExists(normalized)) {
        setError('This skill is already added');
        setTimeout(() => setError(null), 2000);
        setInputValue('');
        return;
      }

      // Add the skill
      onChange([...value, normalized]);
      setInputValue('');
      setSuggestions([]);
      setError(null);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setError(null); // Clear error on input change
    
    if (val.trim()) {
      const filtered = commonSkills
        .filter(skill => 
          skill.toLowerCase().includes(val.toLowerCase()) && 
          !skillExists(skill)
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    if (value.length >= MAX_SKILLS) {
      setError(`Maximum ${MAX_SKILLS} skills allowed`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!skillExists(skill)) {
      onChange([...value, skill]);
    }
    setInputValue('');
    setSuggestions([]);
    setError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
    setError(null);
  };

  const showWarning = minSkills !== undefined && value.length < minSkills;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className={`flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-brand-light focus-within:border-transparent bg-white ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}>
          {value.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded border border-blue-200"
            >
              {normalizeSkillAI(skill)}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            placeholder={value.length === 0 ? placeholder : ''}
            maxLength={MAX_SKILL_LENGTH}
            className="flex-1 min-w-[120px] border-0 focus:outline-none focus:ring-0 text-sm"
          />
        </div>
        {suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            {suggestions.map((skill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(skill)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {showWarning && !error && (
        <p className="text-xs text-orange-600">
          Recommended: Add at least {minSkills} skills
        </p>
      )}
      <p className="text-xs text-gray-500">
        Type any skill and press Enter to add. Click × to remove. ({value.length}/{MAX_SKILLS} skills)
      </p>
    </div>
  );
}
