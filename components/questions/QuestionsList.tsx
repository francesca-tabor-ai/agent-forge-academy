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
    <div className="questions-list">
      <div className="questions-filters">
        <div>
          <label htmlFor="context_type">Context Type:</label>
          <select
            id="context_type"
            value={contextType}
            onChange={(e) => setContextType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="lesson">Lesson</option>
            <option value="lab">Lab</option>
            <option value="project">Project</option>
          </select>
        </div>

        {contextType !== 'all' && (
          <div>
            <label htmlFor="context_id">Context ID:</label>
            <input
              id="context_id"
              type="text"
              value={contextId}
              onChange={(e) => setContextId(e.target.value)}
              placeholder="e.g., lesson-01"
            />
          </div>
        )}
      </div>

      <div className="questions-count">
        {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
      </div>

      <div className="questions-grid">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              showAnswerForm={showAnswerForm}
            />
          ))
        ) : (
          <p>No questions found.</p>
        )}
      </div>
    </div>
  );
}

