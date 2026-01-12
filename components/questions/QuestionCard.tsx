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
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 card-interactive">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{question.title}</h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="capitalize">{question.context_type}</span>
            <span>{new Date(question.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{question.body}</p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">
            {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
          </h4>
          {acceptedAnswer && (
            <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
              Accepted
            </span>
          )}
        </div>

        <div className="space-y-4">
          {acceptedAnswer && (
            <AnswerCard answer={acceptedAnswer} isAccepted={true} />
          )}

          {otherAnswers.map((answer) => (
            <AnswerCard key={answer.id} answer={answer} isAccepted={false} />
          ))}

          {showAnswerForm && (
            <div className="pt-4 border-t border-gray-100">
              {!showAnswerFormState ? (
                <button
                  onClick={() => setShowAnswerFormState(true)}
                  className="btn-primary text-sm"
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
    </div>
  );
}

