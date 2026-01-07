'use client';

import { useState } from 'react';
import { AnswerForm } from './AnswerForm';
import { AnswerCard } from './AnswerCard';

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

interface QuestionCardProps {
  question: Question;
  showAnswerForm?: boolean;
}

export function QuestionCard({ question, showAnswerForm = false }: QuestionCardProps) {
  const [showAnswerFormState, setShowAnswerFormState] = useState(false);
  const acceptedAnswer = question.answers.find((a) => a.is_accepted);
  const otherAnswers = question.answers.filter((a) => !a.is_accepted);

  return (
    <div className="question-card">
      <div className="question-header">
        <h3>{question.title}</h3>
        <div className="question-meta">
          <span className="context-badge">
            {question.context_type}: {question.context_id}
          </span>
          <span className="question-date">
            {new Date(question.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="question-body">
        <p>{question.body}</p>
      </div>

      <div className="question-answers">
        <div className="answers-header">
          <h4>
            {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
          </h4>
          {acceptedAnswer && (
            <span className="accepted-badge">✓ Accepted Answer</span>
          )}
        </div>

        {acceptedAnswer && (
          <AnswerCard answer={acceptedAnswer} isAccepted={true} />
        )}

        {otherAnswers.map((answer) => (
          <AnswerCard key={answer.id} answer={answer} isAccepted={false} />
        ))}

        {showAnswerForm && (
          <div className="answer-form-section">
            {!showAnswerFormState ? (
              <button
                onClick={() => setShowAnswerFormState(true)}
                className="btn-primary"
              >
                Add Answer
              </button>
            ) : (
              <AnswerForm
                questionId={question.id}
                onSuccess={() => setShowAnswerFormState(false)}
                onCancel={() => setShowAnswerFormState(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

