import { APITester } from '@/components/admin/APITester';

export default function AdminAPITesterPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">API Tester</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Test internal API endpoints and verify responses. Only paths starting with <code className="bg-gray-100 px-2 py-1 rounded">/api/</code> are allowed.
        </p>
        <APITester />
      </div>
    </div>
  );
}
