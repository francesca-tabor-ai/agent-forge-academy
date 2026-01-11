import { EntitlementsTable } from '@/components/admin/EntitlementsTable';
import { UserAccessSimulator } from '@/components/admin/UserAccessSimulator';

export default function AdminEntitlementsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Course Entitlements</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Manage course access tiers and simulate user access to debug course locking issues.
        </p>
        <EntitlementsTable />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <UserAccessSimulator />
      </div>
    </div>
  );
}
