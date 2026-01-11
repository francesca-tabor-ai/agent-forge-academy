'use client';

import { useState, useRef, useEffect } from 'react';

interface GalleryImage {
  id: string;
  url: string;
  sort_order: number;
}

interface ProjectImageUploadProps {
  projectId: string;
  coverImageUrl?: string | null;
  images?: GalleryImage[];
  onImagesChange: (coverImageUrl: string | null, images: GalleryImage[]) => void;
}

export function ProjectImageUpload({
  projectId,
  coverImageUrl: initialCoverImageUrl,
  images: initialImages = [],
  onImagesChange,
}: ProjectImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialCoverImageUrl || null);
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [loading, setLoading] = useState(true);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_GALLERY_IMAGES = 10;

  // Fetch images on mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/portfolio/projects/${projectId}/images`);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        if (data.cover?.url) {
          setCoverImageUrl(data.cover.url);
        }
        if (data.gallery) {
          setImages(data.gallery);
        }
      } catch (err) {
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [projectId]);

  // Notify parent when images change
  useEffect(() => {
    onImagesChange(coverImageUrl, images);
  }, [coverImageUrl, images, onImagesChange]);

  const handleCoverUpload = async (file: File) => {
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

      const response = await fetch(`/api/portfolio/projects/${projectId}/cover-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { cover_image_url } = await response.json();
      setCoverImageUrl(cover_image_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (files: File[]) => {
    setError(null);

    // Validate all files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, and WEBP images are allowed');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`Image size must be less than ${MAX_SIZE / (1024 * 1024)}MB`);
        return;
      }
    }

    if (images.length + files.length > MAX_GALLERY_IMAGES) {
      setError(`Maximum ${MAX_GALLERY_IMAGES} gallery images allowed`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/portfolio/projects/${projectId}/gallery-images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      const { images: newImages } = await response.json();
      setImages([...images, ...newImages]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleCoverUpload(file);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleGalleryUpload(files);
    }
  };

  const removeCover = async () => {
    // For now, just clear locally. In a full implementation, we'd call an API to delete
    setCoverImageUrl(null);
  };

  const removeGalleryImage = async (imageId: string) => {
    try {
      const response = await fetch(
        `/api/portfolio/projects/${projectId}/gallery-images/${imageId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete image');
      }

      setImages(images.filter((img) => img.id !== imageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  const moveImage = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);

    // Optimistically update UI
    setImages(newImages);

    // Update order on server
    try {
      const orderedImageIds = newImages.map((img) => img.id);
      const response = await fetch(
        `/api/portfolio/projects/${projectId}/gallery-images/reorder`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderedImageIds }),
        }
      );

      if (!response.ok) {
        // Revert on error
        setImages(images);
        const data = await response.json();
        throw new Error(data.error || 'Failed to reorder images');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder images');
      // Revert on error
      setImages(images);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500">Loading images...</div>
      </div>
    );
  }

  // Sort images by sort_order
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

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
                onClick={removeCover}
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
          Gallery Images ({sortedImages.length}/{MAX_GALLERY_IMAGES})
        </label>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          onChange={handleGallerySelect}
          className="hidden"
          disabled={uploading || sortedImages.length >= MAX_GALLERY_IMAGES}
        />
        {sortedImages.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-3">
            {sortedImages.map((image, index) => (
              <div key={image.id} className="relative group">
                <div className="relative w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(image.id)}
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
                {index < sortedImages.length - 1 && (
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
        {sortedImages.length < MAX_GALLERY_IMAGES && (
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
          Allowed formats: JPG, PNG, WEBP. Max size: 5MB per image. Use arrows to reorder.
        </p>
      </div>
    </div>
  );
}
