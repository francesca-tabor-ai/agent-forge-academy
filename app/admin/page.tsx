export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Overview</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome to the admin dashboard. This page provides an overview of the platform.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            <h3 className="font-semibold mb-2">Users</h3>
            <p className="text-sm text-ca-neutral-500">Manage user accounts and roles</p>
          </div>
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            <h3 className="font-semibold mb-2">Subscriptions</h3>
            <p className="text-sm text-ca-neutral-500">Monitor subscription status</p>
          </div>
          <div className="p-4 border rounded-lg" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            <h3 className="font-semibold mb-2">System</h3>
            <p className="text-sm text-ca-neutral-500">Platform health and logs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
