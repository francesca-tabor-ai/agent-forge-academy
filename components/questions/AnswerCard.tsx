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
    <div className={`${isAccepted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4`}>
      {isAccepted && (
        <div className="text-xs text-green-700 font-medium mb-2">Accepted Answer</div>
      )}
      <div className="text-sm text-gray-700 leading-relaxed mb-3">
        <p>{answer.body}</p>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span className="capitalize">
          {answer.profiles[0]?.role === 'tutor' || answer.profiles[0]?.role === 'instructor' ? 'Instructor' : 'Student'}
        </span>
        <span>•</span>
        <span>{new Date(answer.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

