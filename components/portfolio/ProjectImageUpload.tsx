'use client';

import { useState, useRef } from 'react';

interface ProjectImageUploadProps {
  projectId: string;
  coverImageUrl?: string | null;
  images?: string[];
  onImagesChange: (coverImageUrl: string | null, images: string[]) => void;
}

export function ProjectImageUpload({
  projectId,
  coverImageUrl,
  images = [],
  onImagesChange,
}: ProjectImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_GALLERY_IMAGES = 10;

  const handleImageUpload = async (file: File, isCover: boolean) => {
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

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('isCover', isCover.toString());

      const response = await fetch('/api/portfolio/projects/images/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { imageUrl } = await response.json();

      if (isCover) {
        onImagesChange(imageUrl, images);
      } else {
        if (images.length >= MAX_GALLERY_IMAGES) {
          setError(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`);
          setUploading(false);
          return;
        }
        onImagesChange(coverImageUrl, [...images, imageUrl]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, true);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (images.length < MAX_GALLERY_IMAGES) {
        handleImageUpload(file, false);
      }
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(coverImageUrl, newImages);
  };

  const setAsCover = (imageUrl: string) => {
    const newImages = images.filter((url) => url !== imageUrl);
    onImagesChange(imageUrl, newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(coverImageUrl, newImages);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cover Image
        </label>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleCoverSelect}
          className="hidden"
          disabled={uploading}
        />
        {coverImageUrl ? (
          <div className="space-y-2">
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onImagesChange(null, images)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                disabled={uploading}
              >
                Remove
              </button>
            </div>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
              className="btn-secondary text-sm"
            >
              Replace Cover
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+ Upload Cover Image'}
          </button>
        )}
      </div>

      {/* Gallery Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images ({images.length}/{MAX_GALLERY_IMAGES})
        </label>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleGallerySelect}
          className="hidden"
          disabled={uploading || images.length >= MAX_GALLERY_IMAGES}
        />
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAsCover(imageUrl)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      title="Set as cover"
                    >
                      Set Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="absolute -left-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 text-xs hover:bg-gray-50"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full p-1 text-xs hover:bg-gray-50"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {images.length < MAX_GALLERY_IMAGES && (
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary text-sm"
          >
            {uploading ? 'Uploading...' : '+ Add Gallery Images'}
          </button>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Allowed formats: JPG, PNG, WEBP. Max size: 5MB per image. Drag to reorder.
        </p>
      </div>
    </div>
  );
}
