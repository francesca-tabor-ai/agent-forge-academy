import { NewProjectForm } from '@/components/portfolio/NewProjectForm';

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Add New Project</h1>
      <NewProjectForm />
    </div>
  );
}

