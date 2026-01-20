'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2 } from 'lucide-react';

interface Founder {
  id: string;
  name: string;
  bio?: string;
  twitter_url?: string;
  youtube_url?: string;
  website?: string;
  verified: boolean;
  created_at: string;
}

interface FoundersManagementTabProps {
  onEdit: (founder: Founder) => void;
  onDelete: (id: string) => Promise<void>;
}

export function FoundersManagementTab({ onEdit, onDelete }: FoundersManagementTabProps) {
  const [founders, setFounders] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFounders();
  }, []);

  const loadFounders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/founders');
      if (response.ok) {
        const data = await response.json();
        setFounders(data.founders || []);
      } else {
        console.error('Failed to load founders:', response.statusText);
      }
    } catch (err) {
      console.error('Failed to load founders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      // Reload after successful delete
      loadFounders();
    } catch (err) {
      // Error already handled by onDelete
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-ca-neutral-400 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
          <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Name</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider hidden sm:table-cell">Bio</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Verified</th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {founders.map((founder) => (
              <tr key={founder.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {founder.name}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-ca-neutral-500 max-w-md truncate hidden sm:table-cell">
                  {founder.bio || 'N/A'}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  {founder.verified ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                      Unverified
                    </span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(founder)}
                      className="text-ca-gold hover:text-ca-navy transition-colors"
                      title="Edit founder"
                      aria-label="Edit founder"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(founder.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Delete founder"
                      aria-label="Delete founder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {founders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ca-neutral-500 font-sans">No founders found</p>
        </div>
      )}
    </div>
  );
}
