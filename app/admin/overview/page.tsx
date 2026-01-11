import { HealthChecks } from '@/components/admin/HealthChecks';
import { DiagnosticsRunner } from '@/components/admin/DiagnosticsRunner';

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
        <p className="text-gray-600">
          Monitor system health and run diagnostics to identify issues quickly.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <HealthChecks />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <DiagnosticsRunner />
      </div>
    </div>
  );
}
