import { LogsTable } from '@/components/admin/LogsTable';

export default function AdminLogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Request Logs</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          View request logs for critical API endpoints. Filter by endpoint and status code to debug issues.
        </p>
        <LogsTable />
      </div>
    </div>
  );
}
