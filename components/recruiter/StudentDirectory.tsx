'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface StudentProfile {
  id: string;
  visibility: 'private' | 'recruiters_only' | 'public';
  bio: string | null;
  profiles: {
    id: string;
    user_id: string;
  };
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
    <div className="student-directory">
      <div className="directory-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by bio, skills..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="visibility-filter">
          <label htmlFor="visibility">Visibility:</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => handleVisibilityChange(e.target.value)}
            disabled={isPending}
          >
            <option value="all">All Visible</option>
            <option value="recruiters_only">Recruiters Only</option>
            <option value="public">Public</option>
          </select>
        </div>
      </div>

      {isPending && <p>Loading...</p>}

      <div className="students-grid">
        {students.length > 0 ? (
          students.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-header">
                <h3>Student Profile</h3>
                <span className="visibility-badge">{student.visibility}</span>
              </div>
              {student.bio && <p className="student-bio">{student.bio}</p>}
              <div className="student-actions">
                <Link
                  href={`/portfolio/${student.id}`}
                  className="btn-primary"
                >
                  View Portfolio
                </Link>
                <Link
                  href={`/recruiter/contact/${student.id}`}
                  className="btn-secondary"
                >
                  Request Contact
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p>No students found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}

