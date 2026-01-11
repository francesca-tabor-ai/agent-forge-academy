'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface HeadshotUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (imageUrl: string | null) => void;
}

export function HeadshotUpload({ currentImageUrl, onImageChange }: HeadshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Sync preview with currentImageUrl prop
  useEffect(() => {
    setPreviewUrl(currentImageUrl || null);
  }, [currentImageUrl]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG, and WEBP images are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError(`Image size must be less than ${MAX_SIZE / (1024 * 1024)}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/portfolio/profile/headshot/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { imageUrl } = await response.json();
      onImageChange(imageUrl);
      setPreviewUrl(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) {
      setPreviewUrl(null);
      onImageChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio/profile/headshot/upload', {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove headshot');
      }

      setPreviewUrl(null);
      onImageChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove headshot');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Profile Headshot
      </label>

      <div className="flex items-start gap-6">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          {previewUrl ? (
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 bg-gray-100">
                <Image
                  src={previewUrl}
                  alt="Profile headshot"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Remove image"
                >
                  ×
                </button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-1">👤</div>
                <div className="text-xs text-gray-500">No image</div>
              </div>
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageSelect}
              disabled={uploading}
              className="hidden"
              id="headshot-upload"
            />
            <label
              htmlFor="headshot-upload"
              className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium cursor-pointer transition-colors ${
                uploading
                  ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {uploading ? 'Uploading...' : previewUrl ? 'Change Photo' : 'Upload Photo'}
            </label>
          </div>

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <p className="text-xs text-gray-500">
            Recommended: Square image, at least 400x400px. Max size: 5MB. Formats: JPG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}
