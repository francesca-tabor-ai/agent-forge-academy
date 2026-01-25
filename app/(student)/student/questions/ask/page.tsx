import { AskQuestionForm } from '@/components/questions/AskQuestionForm';

export default function AskQuestionPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <AskQuestionForm />
      </div>
    </main>
  );
}

