'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
}

export function GrantRecruiterAccess() {
  const [recruiterSearch, setRecruiterSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedRecruiter, setSelectedRecruiter] = useState<Profile | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Profile | null>(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [reason, setReason] = useState('');
  const [recruiterResults, setRecruiterResults] = useState<Profile[]>([]);
  const [studentResults, setStudentResults] = useState<Profile[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const searchRecruiters = async (query: string) => {
    if (query.length < 2) {
      setRecruiterResults([]);
      return;
    }

    try {
      // Search profiles with recruiter role
      // Note: We need to join with auth.users to get email, but that's not directly accessible
      // So we'll search by profile and get user_id, then fetch from auth if needed
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('role', 'recruiter')
        .or(`id.ilike.%${query}%,user_id.ilike.%${query}%`)
        .limit(10);

      if (searchError) {
        console.error('Error searching recruiters:', searchError);
        return;
      }

      // Try to get email from recruiter_profiles if available
      const profileIds = data?.map((p) => p.id) || [];
      if (profileIds.length > 0) {
        const { data: recruiterProfiles } = await supabase
          .from('recruiter_profiles')
          .select('profile_id, company_name')
          .in('profile_id', profileIds);

        // Map results with company name
        const results = (data || []).map((profile) => {
          const recruiterProfile = recruiterProfiles?.find(
            (rp) => rp.profile_id === profile.id
          );
          return {
            ...profile,
            email: profile.user_id, // Use user_id as identifier for now
            full_name: recruiterProfile?.company_name || `Recruiter ${profile.id.slice(0, 8)}`,
          };
        });

        setRecruiterResults(results);
      } else {
        setRecruiterResults(data || []);
      }
    } catch (err) {
      console.error('Error searching recruiters:', err);
    }
  };

  const searchStudents = async (query: string) => {
    if (query.length < 2) {
      setStudentResults([]);
      return;
    }

    try {
      // Search profiles with student role
      const { data, error: searchError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          student_profiles (
            id,
            bio,
            full_name
          )
        `)
        .eq('role', 'student')
        .or(`id.ilike.%${query}%,user_id.ilike.%${query}%`)
        .limit(10);

      if (searchError) {
        console.error('Error searching students:', searchError);
        return;
      }

      // Map results with student profile info
      const results = (data || []).map((profile) => {
        const studentProfile = Array.isArray(profile.student_profiles)
          ? profile.student_profiles[0]
          : profile.student_profiles;
        return {
          ...profile,
          email: profile.user_id, // Use user_id as identifier for now
          full_name: studentProfile?.full_name || `Student ${profile.id.slice(0, 8)}`,
        };
      });

      setStudentResults(results);
    } catch (err) {
      console.error('Error searching students:', err);
    }
  };

  const handleRecruiterSearch = (value: string) => {
    setRecruiterSearch(value);
    setSelectedRecruiter(null);
    startTransition(() => {
      searchRecruiters(value);
    });
  };

  const handleStudentSearch = (value: string) => {
    setStudentSearch(value);
    setSelectedStudent(null);
    startTransition(() => {
      searchStudents(value);
    });
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRecruiter || !selectedStudent) {
      setError('Please select both a recruiter and a student');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/recruiter-access/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recruiterId: selectedRecruiter.id,
          studentId: selectedStudent.id,
          expiresAt: expiresAt || null,
          reason: reason || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to grant access');
      }

      setSuccess(`Access granted successfully! Recruiter can now view ${selectedStudent.full_name || 'student'}'s CV.`);
      
      // Reset form
      setSelectedRecruiter(null);
      setSelectedStudent(null);
      setRecruiterSearch('');
      setStudentSearch('');
      setExpiresAt('');
      setReason('');
      setRecruiterResults([]);
      setStudentResults([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant access');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleGrantAccess} className="space-y-6">
        {/* Recruiter Search */}
        <div>
          <label htmlFor="recruiter" className="block text-sm font-medium text-gray-700 mb-2">
            Recruiter *
          </label>
          <div className="relative">
            <input
              type="text"
              id="recruiter"
              value={selectedRecruiter ? `${selectedRecruiter.full_name} (${selectedRecruiter.id.slice(0, 8)}...)` : recruiterSearch}
              onChange={(e) => handleRecruiterSearch(e.target.value)}
              onFocus={() => {
                if (recruiterSearch.length >= 2) {
                  searchRecruiters(recruiterSearch);
                }
              }}
              placeholder="Search by recruiter ID or user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!selectedRecruiter || loading}
            />
            {selectedRecruiter && (
              <button
                type="button"
                onClick={() => {
                  setSelectedRecruiter(null);
                  setRecruiterSearch('');
                }}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          {!selectedRecruiter && recruiterResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
              {recruiterResults.map((recruiter) => (
                <button
                  key={recruiter.id}
                  type="button"
                  onClick={() => {
                    setSelectedRecruiter(recruiter);
                    setRecruiterSearch('');
                    setRecruiterResults([]);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{recruiter.full_name}</div>
                  <div className="text-sm text-gray-500">ID: {recruiter.id.slice(0, 8)}...</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Student Search */}
        <div>
          <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
            Student *
          </label>
          <div className="relative">
            <input
              type="text"
              id="student"
              value={selectedStudent ? `${selectedStudent.full_name} (${selectedStudent.id.slice(0, 8)}...)` : studentSearch}
              onChange={(e) => handleStudentSearch(e.target.value)}
              onFocus={() => {
                if (studentSearch.length >= 2) {
                  searchStudents(studentSearch);
                }
              }}
              placeholder="Search by student ID or user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!!selectedStudent || loading}
            />
            {selectedStudent && (
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setStudentSearch('');
                }}
                className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          {!selectedStudent && studentResults.length > 0 && (
            <div className="mt-2 border border-gray-200 rounded-md bg-white shadow-lg max-h-60 overflow-y-auto">
              {studentResults.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(student);
                    setStudentSearch('');
                    setStudentResults([]);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{student.full_name}</div>
                  <div className="text-sm text-gray-500">ID: {student.id.slice(0, 8)}...</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expiration Date (Optional) */}
        <div>
          <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="expiresAt"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty for permanent access. Set a date to create time-limited access.
          </p>
        </div>

        {/* Reason (Optional) */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional note about why access is being granted..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={!selectedRecruiter || !selectedStudent || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Granting Access...' : 'Grant Access'}
          </button>
        </div>
      </form>
    </div>
  );
}
