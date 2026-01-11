import { BulkUpload } from '@/components/admin/BulkUpload';

export default function AdminBulkUploadPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bulk Upload</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-6">
          Upload CSV or JSON files to bulk update courses, subscriptions, or entitlements. 
          Use the dry-run validation to check for errors before applying changes.
        </p>
        <BulkUpload />
      </div>
    </div>
  );
}
