export default function AdminPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome to the admin dashboard. This page is only accessible to users with the admin role.
        </p>
      </div>
    </div>
  );
}
