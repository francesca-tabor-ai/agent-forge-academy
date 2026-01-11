'use client';

import { useState, useEffect, useCallback } from 'react';

interface User {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  offset: number;
  limit: number;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) {
        params.set('search', search);
      }
      params.set('offset', offset.toString());
      params.set('limit', limit.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch users');
        }
        setLoading(false);
        return;
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [search, offset, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0); // Reset to first page when search changes
      fetchUsers();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePreviousPage = () => {
    if (offset >= limit) {
      setOffset(offset - limit);
    }
  };

  const handleNextPage = () => {
    if (offset + limit < total) {
      setOffset(offset + limit);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search by email or user ID..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 px-4 py-2 border rounded-lg"
          style={{ borderColor: 'var(--ca-neutral-300)' }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-ca-neutral-500">Loading users...</p>
        </div>
      )}

      {/* Users table */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
              <thead style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-ca-neutral-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-ca-text">
                        {user.user_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-text">
                        {user.email || <span className="text-ca-neutral-500">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-text">
                        {user.full_name || <span className="text-ca-neutral-500">—</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-ca-gold/20 text-ca-neutral-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-ca-neutral-500">
              Showing {users.length > 0 ? offset + 1 : 0} to {Math.min(offset + limit, total)} of {total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePreviousPage}
                disabled={offset === 0 || loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-ca-neutral-500">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={offset + limit >= total || loading}
                className="px-4 py-2 text-sm font-medium rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderColor: 'var(--ca-neutral-300)' }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
