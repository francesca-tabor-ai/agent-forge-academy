import { GrantRecruiterAccess } from '@/components/admin/GrantRecruiterAccess';

export default function AdminRecruiterAccessPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Grant CV Access</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Grant recruiters access to view student CVs. Search for a recruiter and student,
          then create an access grant with optional expiration date.
        </p>
        <GrantRecruiterAccess />
      </div>
    </div>
  );
}
