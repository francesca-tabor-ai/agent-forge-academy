import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Manage user accounts, roles, and permissions.
        </p>
        <UsersTable />
      </div>
    </div>
  );
}
