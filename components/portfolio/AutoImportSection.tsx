'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AutoImportSectionProps {
  studentProfileId: string;
  hasExistingData: boolean;
}

export function AutoImportSection({ studentProfileId, hasExistingData }: AutoImportSectionProps) {
  // All hooks must be called unconditionally at the top level
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');
  
  const cvFileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [githubToken, setGithubToken] = useState(''); // Optional GitHub token for private repos

  // Defensive UI guard: Check if Supabase env vars are available at runtime
  // This error will only appear in misconfigured environments
  const supabaseReady =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseReady) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            CV upload temporarily unavailable. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  const MAX_CV_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_CV_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  const handleCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!ALLOWED_CV_TYPES.includes(file.type)) {
      setError('Only PDF and DOCX files are allowed for CV');
      return;
    }

    // Validate file size
    if (file.size > MAX_CV_SIZE) {
      setError(`CV file size must be less than ${MAX_CV_SIZE / (1024 * 1024)}MB`);
      return;
    }

    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cvFile && !linkedinUrl && !githubUrl) {
      setError('Please provide at least one source (CV, LinkedIn URL, or GitHub URL)');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setProgress('Preparing import...');

    try {
      const formData = new FormData();
      
      if (cvFile) {
        formData.append('cv', cvFile);
      }
      
      if (linkedinUrl.trim()) {
        formData.append('linkedinUrl', linkedinUrl.trim());
      }
      
      if (githubUrl.trim()) {
        formData.append('githubUrl', githubUrl.trim());
      }
      
      if (githubToken.trim()) {
        formData.append('githubToken', githubToken.trim());
      }
      
      formData.append('studentProfileId', studentProfileId);

      setProgress('Processing CV...');
      const response = await fetch('/api/portfolio/auto-import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Import failed');
      }

      const data = await response.json();
      
      setSuccess(
        `Successfully imported! ` +
        `${data.profileUpdated ? 'Profile updated. ' : ''}` +
        `${data.projectsCreated ? `${data.projectsCreated} projects created. ` : ''}` +
        `${data.cvUploaded ? 'CV uploaded. ' : ''}`
      );
      
      setProgress('');
      
      // Reset form
      setCvFile(null);
      setLinkedinUrl('');
      setGithubUrl('');
      setGithubToken('');
      if (cvFileInputRef.current) {
        cvFileInputRef.current.value = '';
      }

      // Refresh page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setProgress('');
    } finally {
      setLoading(false);
    }
  };

  if (hasExistingData) {
    return (
      <section className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Auto-Import</h3>
          <p className="text-xs text-gray-600">
            Update from CV, LinkedIn, or GitHub
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-2">
              <p className="text-xs text-green-800">{success}</p>
            </div>
          )}

          {progress && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <p className="text-xs text-blue-800">{progress}</p>
            </div>
          )}

          {/* CV Upload */}
          <div>
            <label htmlFor="cv" className="block text-xs font-medium text-gray-700 mb-1">
              CV (PDF/DOCX)
            </label>
            <input
              ref={cvFileInputRef}
              id="cv"
              type="file"
              accept=".pdf,.docx"
              onChange={handleCvSelect}
              disabled={loading}
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 disabled:opacity-50"
            />
          </div>

          {/* LinkedIn URL */}
          <div>
            <label htmlFor="linkedin" className="block text-xs font-medium text-gray-700 mb-1">
              LinkedIn URL
            </label>
            <input
              id="linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={loading}
              placeholder="linkedin.com/in/..."
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-light focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* GitHub URL */}
          <div>
            <label htmlFor="github" className="block text-xs font-medium text-gray-700 mb-1">
              GitHub URL
            </label>
            <input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              disabled={loading}
              placeholder="github.com/username"
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-light focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* GitHub Token (Optional) */}
          {githubUrl && (
            <div>
              <label htmlFor="githubToken" className="block text-xs font-medium text-gray-700 mb-1">
                GitHub Token (Optional)
              </label>
              <input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                disabled={loading}
                placeholder="ghp_..."
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-light focus:border-transparent disabled:opacity-50"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!cvFile && !linkedinUrl && !githubUrl)}
            className="w-full btn-secondary text-xs py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Importing...' : 'Import'}
          </button>
        </form>
      </section>
    );
  }

  // Empty state for new users
  return (
    <section className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🚀</div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">Quick Setup</h2>
        <p className="text-sm text-gray-600 mb-6">
          Upload your CV, LinkedIn, or GitHub to automatically create your profile and portfolio
        </p>
        <button
          onClick={() => router.push('/student/portfolio/profile/edit')}
          className="btn-primary"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
