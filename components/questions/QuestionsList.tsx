'use client';

import { useState } from 'react';
import { QuestionCard } from './QuestionCard';

interface Answer {
  id: string;
  body: string;
  is_accepted: boolean;
  created_at: string;
  profiles: Array<{
    id: string;
    role: string;
  }>;
}

interface Question {
  id: string;
  title: string;
  body: string;
  context_type: 'lesson' | 'lab' | 'project';
  context_id: string;
  created_at: string;
  updated_at: string;
  student_profiles: Array<{
    id: string;
    profiles: Array<{
      id: string;
      user_id: string;
    }>;
  }>;
  answers: Answer[];
}

interface QuestionsListProps {
  questions: Question[];
  initialContextType: string;
  initialContextId: string;
  showAnswerForm?: boolean;
}

export function QuestionsList({
  questions,
  initialContextType,
  initialContextId,
  showAnswerForm = false,
}: QuestionsListProps) {
  const [contextType, setContextType] = useState(initialContextType);
  const [contextId, setContextId] = useState(initialContextId);

  const filteredQuestions =
    contextType === 'all' || !contextId
      ? questions
      : questions.filter(
          (q) => q.context_type === contextType && q.context_id === contextId
        );

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div>
          <label htmlFor="context_type" className="sr-only">Context Type</label>
          <select
            id="context_type"
            value={contextType}
            onChange={(e) => setContextType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          >
            <option value="all">All Contexts</option>
            <option value="lesson">Lesson</option>
            <option value="lab">Lab</option>
            <option value="project">Project</option>
          </select>
        </div>

        {contextType !== 'all' && (
          <div>
            <label htmlFor="context_id" className="sr-only">Context ID</label>
            <input
              id="context_id"
              type="text"
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              placeholder="e.g., lesson-01"
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
            />
          </div>
        )}
      </div>

      <div className="mb-4 text-sm text-gray-600">
        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
      </div>

      <div>
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              showAnswerForm={showAnswerForm}
            />
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">No questions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}

