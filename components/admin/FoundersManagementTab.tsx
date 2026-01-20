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
      }
    } catch (err) {
      console.error('Failed to load founders:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {founders.map((founder) => (
              <tr key={founder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {founder.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                  {founder.bio || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(founder)}
                      className="text-brand-light hover:text-brand-dark"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(founder.id)}
                      className="text-red-600 hover:text-red-800"
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
          <p className="text-gray-500">No founders found</p>
        </div>
      )}
    </div>
  );
}
