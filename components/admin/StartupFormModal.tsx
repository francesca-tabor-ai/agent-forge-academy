'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Founder {
  id: string;
  name: string;
}

interface Startup {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  status: string;
  revenue_range?: string;
  vibe_score?: number;
  launch_year?: number;
  pricing_model?: string;
  target_customer?: string;
  logo_url?: string;
  website_url?: string;
  is_featured?: boolean;
  founder_id?: string;
}

interface StartupFormModalProps {
  startup: Startup | null;
  founders: Founder[];
  onClose: () => void;
}

export function StartupFormModal({ startup, founders, onClose }: StartupFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    founderId: startup?.founder_id || '',
    name: startup?.name || '',
    tagline: startup?.tagline || '',
    description: startup?.description || '',
    status: startup?.status || 'active',
    revenueRange: startup?.revenue_range || 'pre_revenue',
    vibeScore: startup?.vibe_score?.toString() || '',
    launchYear: startup?.launch_year?.toString() || '',
    pricingModel: startup?.pricing_model || '',
    targetCustomer: startup?.target_customer || '',
    logoUrl: startup?.logo_url || '',
    websiteUrl: startup?.website_url || '',
    isFeatured: startup?.is_featured || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = startup
        ? `/api/admin/startups/${startup.id}`
        : '/api/admin/startups';
      const method = startup ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vibeScore: formData.vibeScore ? parseInt(formData.vibeScore) : null,
          launchYear: formData.launchYear ? parseInt(formData.launchYear) : null,
        }),
      });

      if (response.ok) {
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to ${startup ? 'update' : 'create'} startup: ${error.error}`);
      }
    } catch (err) {
      alert(`Failed to ${startup ? 'update' : 'create'} startup`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {startup ? 'Edit Startup' : 'Create Startup'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Founder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Founder *
              </label>
              <select
                value={formData.founderId}
                onChange={(e) => setFormData({ ...formData, founderId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="">Select Founder</option>
                {founders.map((founder) => (
                  <option key={founder.id} value={founder.id}>
                    {founder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="active">Active</option>
                <option value="acquired">Acquired</option>
                <option value="shut_down">Shut Down</option>
              </select>
            </div>

            {/* Revenue Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revenue Range
              </label>
              <select
                value={formData.revenueRange}
                onChange={(e) => setFormData({ ...formData, revenueRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="pre_revenue">Pre-revenue</option>
                <option value="$1_10k">$1K-$10K MRR</option>
                <option value="$10_50k">$10K-$50K MRR</option>
                <option value="$50k_plus">$50K+ MRR</option>
              </select>
            </div>

            {/* Vibe Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vibe Score (1-10)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.vibeScore}
                onChange={(e) => setFormData({ ...formData, vibeScore: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Launch Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Launch Year
              </label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                value={formData.launchYear}
                onChange={(e) => setFormData({ ...formData, launchYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Pricing Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Model
              </label>
              <select
                value={formData.pricingModel}
                onChange={(e) => setFormData({ ...formData, pricingModel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="">Select Model</option>
                <option value="subscription">Subscription</option>
                <option value="one_time">One-time</option>
                <option value="freemium">Freemium</option>
                <option value="usage_based">Usage-based</option>
                <option value="marketplace">Marketplace</option>
              </select>
            </div>

            {/* Target Customer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Customer / Niche
              </label>
              <input
                type="text"
                value={formData.targetCustomer}
                onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                placeholder="e.g., Small business owners, Developers"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-brand-light border-gray-300 rounded focus:ring-brand-light"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
              Featured Startup
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {startup ? 'Update' : 'Create'} Startup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
