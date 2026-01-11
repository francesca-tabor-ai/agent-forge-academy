'use client';

import { useState, useRef } from 'react';

interface CVUploadProps {
  studentProfileId: string;
  onUploadSuccess?: () => void;
}

export function CVUpload({ studentProfileId, onUploadSuccess }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError(`File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentProfileId', studentProfileId);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          setProgress(100);
          setTimeout(() => {
            setUploading(false);
            setProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            onUploadSuccess?.();
          }, 500);
        } else {
          const response = JSON.parse(xhr.responseText);
          throw new Error(response.error || 'Upload failed');
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      xhr.open('POST', '/api/portfolio/cv/upload');
      xhr.send(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-light h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleReplace}
        disabled={uploading}
        className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? 'Uploading...' : 'Choose File'}
      </button>

      <p className="text-xs text-gray-500">
        Allowed formats: PDF, DOCX. Max size: 10MB
      </p>
    </div>
  );
}
