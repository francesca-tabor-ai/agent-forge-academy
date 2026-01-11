export default function AdminLogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Logs</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          View system logs and audit trails.
        </p>
        <div className="border rounded-lg p-8 text-center" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <p className="text-ca-neutral-500">Log viewer interface coming soon</p>
        </div>
      </div>
    </div>
  );
}
