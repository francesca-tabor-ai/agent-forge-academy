'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './RichTextEditor';
import { SkillsInput } from './SkillsInput';
import { HeadshotUpload } from './HeadshotUpload';

interface ProfileEditFormProps {
  initialData: {
    full_name?: string;
    headline: string;
    bio: string;
    skills: string[];
    location: string;
    linkedin_url: string;
    github_url: string;
    website_url: string;
    headshot_image_url?: string | null;
  };
}

export function ProfileEditForm({ initialData }: ProfileEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [formData, setFormData] = useState({
    full_name: initialData.full_name || '',
    ...initialData,
    headshot_image_url: initialData.headshot_image_url || null,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};

    // Validate full_name (required)
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errors.full_name = 'Full name is required and must be at least 2 characters';
    } else if (formData.full_name.trim().length > 80) {
      errors.full_name = 'Full name must be 80 characters or less';
    }

    if (!formData.headline || formData.headline.trim().length < 5) {
      errors.headline = 'Professional headline must be at least 5 characters';
    }

    if (formData.bio && formData.bio.trim().length > 0 && formData.bio.trim().length < 50) {
      errors.bio = 'Bio should be at least 50 characters (recommended)';
    }

    if (formData.bio && formData.bio.trim().length > 2000) {
      errors.bio = 'Bio must be 2000 characters or less';
    }

    if (formData.skills.length < 3) {
      errors.skills = 'At least 3 skills are recommended';
    }

    if (formData.skills.length > 30) {
      errors.skills = 'Maximum 30 skills allowed';
    }

    // URL validation
    if (formData.linkedin_url && !isValidUrl(formData.linkedin_url)) {
      errors.linkedin_url = 'Please enter a valid URL';
    }
    if (formData.github_url && !isValidUrl(formData.github_url)) {
      errors.github_url = 'Please enter a valid URL';
    }
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      errors.website_url = 'Please enter a valid URL';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSaveState('saving');

    try {
      const response = await fetch('/api/portfolio/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          headline: formData.headline.trim(),
          bio: formData.bio.trim(),
          skills: formData.skills,
          location: formData.location.trim(),
          linkedin_url: formData.linkedin_url.trim() || null,
          github_url: formData.github_url.trim() || null,
          website_url: formData.website_url.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        // Handle validation errors with field-level errors
        if (data.error?.code === 'VALIDATION_ERROR' && data.error?.fieldErrors) {
          setValidationErrors(data.error.fieldErrors);
          setError(data.error.message || 'Please fix the errors below');
        } else {
          const errorMessage = data.error?.message || data.error || 'Failed to update profile';
          setError(errorMessage);
        }
        
        setSaveState('idle');
        return;
      }

      // Success - show saved state and redirect
      setSaveState('saved');
      setError(null);
      setValidationErrors({});
      
      // Check if GitHub URL was saved to trigger sync status check
      const hadGithubUrl = formData.github_url.trim() !== '';
      const queryParam = hadGithubUrl ? 'profileSaved=1&githubUrlSaved=1' : 'profileSaved=1';
      
      // Redirect with query param for toast notification
      setTimeout(() => {
        router.push(`/student/profile?${queryParam}`);
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSaveState('idle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {saveState === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-800 font-medium">Profile saved successfully</p>
        </div>
      )}

      {/* Full Name Field */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          id="full_name"
          type="text"
          required
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent ${
            validationErrors.full_name ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Francesca Tabor"
          maxLength={80}
        />
        {validationErrors.full_name && (
          <p className="mt-1 text-xs text-red-600">{validationErrors.full_name}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Shown on your public profile and to employers.</p>
      </div>

      {/* Headshot Upload */}
      <HeadshotUpload
        currentImageUrl={formData.headshot_image_url}
        onImageChange={(imageUrl) => setFormData({ ...formData, headshot_image_url: imageUrl })}
      />

      {/* Professional Headline */}
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
          Professional Headline <span className="text-red-500">*</span>
        </label>
        <input
          id="headline"
          type="text"
          required
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent ${
            validationErrors.headline ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder="e.g., Full Stack Developer | AI/ML Engineer"
        />
        {validationErrors.headline && (
          <p className="mt-1 text-xs text-red-600">{validationErrors.headline}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">A brief, professional tagline (min 5 characters)</p>
      </div>

      {/* Bio - Rich Text Editor */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <RichTextEditor
          value={formData.bio}
          onChange={(value) => setFormData({ ...formData, bio: value })}
          placeholder="Tell recruiters about your background, experience, and what you're passionate about..."
          minHeight="200px"
          maxLength={2000}
        />
        {validationErrors.bio && (
          <p className="mt-1 text-xs text-orange-600">{validationErrors.bio}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">Recommended: 50+ characters. Markdown formatting supported.</p>
      </div>

      {/* Skills */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
          Skills
        </label>
        <SkillsInput
          value={formData.skills}
          onChange={(skills) => setFormData({ ...formData, skills })}
          minSkills={3}
        />
        {validationErrors.skills && (
          <p className="mt-1 text-xs text-orange-600">{validationErrors.skills}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          placeholder="e.g., San Francisco, CA or Remote"
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-2">
            LinkedIn URL
          </label>
          <input
            id="linkedin_url"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent ${
              validationErrors.linkedin_url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://linkedin.com/in/..."
          />
          {validationErrors.linkedin_url && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.linkedin_url}</p>
          )}
        </div>

        <div>
          <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub URL
          </label>
          <input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent ${
              validationErrors.github_url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://github.com/..."
          />
          {validationErrors.github_url && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.github_url}</p>
          )}
        </div>

        <div>
          <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <input
            id="website_url"
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent ${
              validationErrors.website_url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://..."
          />
          {validationErrors.website_url && (
            <p className="mt-1 text-xs text-red-600">{validationErrors.website_url}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/student/portfolio')}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || saveState === 'saving'}
          className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved ✓' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
