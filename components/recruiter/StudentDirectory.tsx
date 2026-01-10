'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface StudentProfile {
  id: string;
  visibility: 'private' | 'recruiters_only' | 'public';
  bio: string | null;
  profiles: Array<{
    id: string;
    user_id: string;
  }>;
}

interface StudentDirectoryProps {
  students: StudentProfile[];
  initialSearch: string;
  initialVisibility: string;
}

export function StudentDirectory({
  students,
  initialSearch,
  initialVisibility,
}: StudentDirectoryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(initialSearch);
  const [visibility, setVisibility] = useState(initialVisibility);

  const handleSearch = (value: string) => {
    setSearch(value);
    updateFilters(value, visibility);
  };

  const handleVisibilityChange = (value: string) => {
    setVisibility(value);
    updateFilters(search, value);
  };

  const updateFilters = (newSearch: string, newVisibility: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newSearch) {
        params.set('search', newSearch);
      } else {
        params.delete('search');
      }

      if (newVisibility !== 'all') {
        params.set('visibility', newVisibility);
      } else {
        params.delete('visibility');
      }

      router.push(`/recruiter/directory?${params.toString()}`);
    });
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by bio, skills..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isPending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
          />
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            disabled={isPending}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ca-gold focus:border-transparent"
          >
            <option value="all">All Visible</option>
            <option value="recruiters_only">Recruiters Only</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="text-sm text-gray-500 mb-4">Loading...</div>
      )}

      <div className="space-y-4">
        {students.length > 0 ? (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-medium text-gray-900">Student Profile</h3>
                    <span className="text-xs text-gray-500 capitalize">
                      {student.visibility.replace('_', ' ')}
                    </span>
                  </div>
                  {student.bio && (
                    <p className="text-sm text-gray-700 leading-relaxed">{student.bio}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Link
                  href={`/portfolio/${student.id}`}
                  className="text-sm font-medium text-brand-light hover:text-brand-light/90"
                >
                  View Portfolio →
                </Link>
                <Link
                  href={`/recruiter/contact/${student.id}`}
                  className="btn-primary text-sm"
                >
                  Request Contact
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600">No students found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

