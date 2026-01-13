'use client';

import { useState, useRef } from 'react';

interface CVUploadProps {
  onUploadSuccess?: () => void;
}

interface UploadSuccessState {
  fileName: string;
  uploadedAt: string;
  url: string;
}

export function CVUpload({ onUploadSuccess }: CVUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UploadSuccessState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setProgress(0);

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError(`File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);
    setSuccess(null);
    setProgress(0);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('cv', file); // Use "cv" field name as specified

      // Use XMLHttpRequest for progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setProgress(percentComplete);
          }
        });

        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);

              // Success - extract data from response
              if (data.ok && data.resume) {
                setSuccess({
                  fileName: data.resume.fileName,
                  uploadedAt: data.resume.uploadedAt,
                  url: data.resume.url,
                });
                
                // Reset file input
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }

                // Trigger refresh callback
                onUploadSuccess?.();
                resolve();
              } else {
                reject(new Error('Invalid response format'));
              }
            } catch (parseError) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              // Use the error message from the server (which includes helpful dev info)
              reject(new Error(errorData.error || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        // Handle errors
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        // POST to /api/portfolio/cv
        xhr.open('POST', '/api/portfolio/cv');
        xhr.send(formData);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      // Reset file input on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Format uploaded date
  const formatUploadedDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      {/* File input - NOT controlled (no value prop) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
        // DO NOT set value prop - it should remain uncontrolled
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Success state */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm font-medium text-green-800 mb-2">
            CV uploaded: {formatUploadedDate(success.uploadedAt)}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={success.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-green-700 hover:text-green-800 underline"
            >
              View/Download
            </a>
          </div>
        </div>
      )}

      {/* Uploading state */}
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

      {/* Upload button - Idle state */}
      {!uploading && !success && (
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={uploading}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Upload CV
        </button>
      )}

      {/* Help text */}
      {!success && (
        <p className="text-xs text-gray-500">
          Allowed formats: PDF, DOCX. Max size: 10MB
        </p>
      )}
    </div>
  );
}
