'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface FounderFormModalProps {
  onClose: () => void;
}

export function FounderFormModal({ onClose }: FounderFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    twitterUrl: '',
    youtubeUrl: '',
    website: '',
    verified: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/founders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to create founder: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to create founder');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <h2 className="text-xl font-semibold text-gray-900 font-playfair">Create Founder</h2>
          <button onClick={onClose} className="text-ca-neutral-400 hover:text-ca-neutral-600 transition-colors" aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2 font-sans">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2 font-sans">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ca-neutral-700 mb-2 font-sans">
                Twitter URL
              </label>
              <input
                type="url"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ca-neutral-700 mb-2 font-sans">
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ca-neutral-700 mb-2 font-sans">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="verified"
              checked={formData.verified}
              onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
              className="w-4 h-4 text-ca-gold border-ca-neutral-300 rounded focus:ring-ca-gold"
              style={{ borderColor: 'var(--ca-neutral-300)' }}
            />
            <label htmlFor="verified" className="text-sm font-medium text-ca-neutral-700 font-sans">
              Verified Founder
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Founder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
