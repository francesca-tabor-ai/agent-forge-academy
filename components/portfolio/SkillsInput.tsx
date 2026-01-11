'use client';

import { useState, KeyboardEvent } from 'react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  minSkills?: number;
}

export function SkillsInput({ value, onChange, placeholder = 'Type a skill and press Enter', minSkills }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const skill = inputValue.trim();
      if (!value.includes(skill)) {
        onChange([...value, skill]);
      }
      setInputValue('');
      setSuggestions([]);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim()) {
      const filtered = commonSkills
        .filter(skill => 
          skill.toLowerCase().includes(val.toLowerCase()) && 
          !value.includes(skill)
        )
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (skill: string) => {
    if (!value.includes(skill)) {
      onChange([...value, skill]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const showWarning = minSkills !== undefined && value.length < minSkills;

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-brand-light focus-within:border-transparent bg-white">
          {value.map((skill, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded border border-blue-200"
            >
              {skill}
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
      {showWarning && (
        <p className="text-xs text-orange-600">
          Recommended: Add at least {minSkills} skills
        </p>
      )}
      <p className="text-xs text-gray-500">
        Type a skill and press Enter to add. Click × to remove.
      </p>
    </div>
  );
}
