'use client';

import { useState, useRef } from 'react';

type EntityType = 'courses' | 'subscriptions' | 'entitlements';

interface ValidationError {
  row: number;
  field?: string;
  message: string;
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
  preview?: any[];
}

interface UploadResult {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors?: ValidationError[];
}

export function BulkUpload() {
  const [entityType, setEntityType] = useState<EntityType>('courses');
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'csv' | 'json'>('csv');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Determine file type from extension
    const fileName = selectedFile.name.toLowerCase();
    if (fileName.endsWith('.json')) {
      setFileType('json');
    } else if (fileName.endsWith('.csv')) {
      setFileType('csv');
    } else {
      setError('Unsupported file type. Please upload a CSV or JSON file.');
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);
    setUploadResult(null);
    setError(null);
  };

  const handleValidate = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('fileType', fileType);

      const response = await fetch('/api/admin/bulk-upload/validate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Validation failed');
        setLoading(false);
        return;
      }

      setValidationResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate file');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!file || !validationResult || !validationResult.valid) {
      setError('Please validate the file first and ensure it has no errors');
      return;
    }

    if (!confirm(`Are you sure you want to apply ${validationResult.validRows} valid rows? This will modify the database.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('entityType', entityType);
      formData.append('fileType', fileType);

      const response = await fetch('/api/admin/bulk-upload/apply', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Upload failed');
        setLoading(false);
        return;
      }

      setUploadResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Entity Type Selector */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Upload Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Entity Type
            </label>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value as EntityType);
                handleReset();
              }}
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            >
              <option value="courses">Courses</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="entitlements">Entitlements</option>
            </select>
            <p className="text-xs text-ca-neutral-500 mt-1">
              {entityType === 'courses' && 'Upload course metadata (slug, title, description, etc.)'}
              {entityType === 'subscriptions' && 'Upload subscription updates (user_id, stripe_price_id, status, etc.)'}
              {entityType === 'entitlements' && 'Upload course access entitlements (user_id, course_id, etc.)'}
            </p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2">
              Upload File (CSV or JSON)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border rounded-lg"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
            {file && (
              <p className="text-sm text-ca-neutral-500 mt-1">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleValidate}
              disabled={!file || loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Validating...' : 'Validate (Dry Run)'}
            </button>
            {validationResult && validationResult.valid && (
              <button
                onClick={handleApply}
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Applying...' : 'Apply Changes'}
              </button>
            )}
            {(file || validationResult || uploadResult) && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Validation Results</h2>
          
          <div className="mb-4">
            <div className="flex gap-6 items-center">
              <div>
                <span className="text-sm text-ca-neutral-500">Total Rows: </span>
                <span className="text-sm font-semibold text-ca-text">{validationResult.totalRows}</span>
              </div>
              <div>
                <span className="text-sm text-ca-neutral-500">Valid Rows: </span>
                <span className={`text-sm font-semibold ${validationResult.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.validRows}
                </span>
              </div>
              <div>
                <span className="text-sm text-ca-neutral-500">Errors: </span>
                <span className={`text-sm font-semibold ${validationResult.errors.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {validationResult.errors.length}
                </span>
              </div>
            </div>
          </div>

          {validationResult.errors.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-ca-neutral-700 mb-2">Row-Level Errors</h3>
              <div className="border rounded-lg overflow-auto max-h-64" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                <table className="min-w-full divide-y text-sm">
                  <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Field</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                    {validationResult.errors.map((err, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2">{err.row}</td>
                        <td className="px-4 py-2">{err.field || '—'}</td>
                        <td className="px-4 py-2 text-red-600">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {validationResult.preview && validationResult.preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-ca-neutral-700 mb-2">Preview (First 5 Rows)</h3>
              <div className="border rounded-lg overflow-auto" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                <pre className="p-4 text-xs overflow-auto max-h-48">
                  {JSON.stringify(validationResult.preview, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Results</h2>
          
          <div className="space-y-2">
            <div className="flex gap-6 items-center">
              <div>
                <span className="text-sm text-ca-neutral-500">Inserted: </span>
                <span className="text-sm font-semibold text-green-600">{uploadResult.inserted}</span>
              </div>
              <div>
                <span className="text-sm text-ca-neutral-500">Updated: </span>
                <span className="text-sm font-semibold text-blue-600">{uploadResult.updated}</span>
              </div>
              <div>
                <span className="text-sm text-ca-neutral-500">Failed: </span>
                <span className="text-sm font-semibold text-red-600">{uploadResult.failed}</span>
              </div>
            </div>

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-ca-neutral-700 mb-2">Failed Rows</h3>
                <div className="border rounded-lg overflow-auto max-h-64" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                  <table className="min-w-full divide-y text-sm">
                    <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Field</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-ca-neutral-700">Error</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                      {uploadResult.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">{err.row}</td>
                          <td className="px-4 py-2">{err.field || '—'}</td>
                          <td className="px-4 py-2 text-red-600">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
