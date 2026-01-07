'use client';

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

interface AnswerCardProps {
  answer: Answer;
  isAccepted: boolean;
}

export function AnswerCard({ answer, isAccepted }: AnswerCardProps) {
  return (
    <div className={`answer-card ${isAccepted ? 'accepted' : ''}`}>
      {isAccepted && <div className="accepted-indicator">✓ Accepted</div>}
      <div className="answer-body">
        <p>{answer.body}</p>
      </div>
      <div className="answer-meta">
        <span className="answer-author">
          {answer.profiles[0]?.role === 'tutor' ? 'Tutor' : 'Student'}
        </span>
        <span className="answer-date">
          {new Date(answer.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

