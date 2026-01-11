'use client';

import { useState, useEffect, useCallback } from 'react';

interface Subscription {
  tier: string | null;
  status: string | null;
  current_period_end: string | null;
  plan_id: string | null;
}

interface User {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  subscription: Subscription | null;
  has_subscription_mismatch: boolean;
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

  // Debounce search - reset offset when search changes
  useEffect(() => {
    if (search !== '') {
      setOffset(0);
    }
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
                    Subscription Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Renewal Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ca-neutral-700 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-ca-neutral-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const hasMismatch = user.has_subscription_mismatch;
                    const subscription = user.subscription;
                    
                    // Determine status badge color
                    const getStatusColor = (status: string | null) => {
                      if (!status) return 'bg-gray-100 text-gray-600';
                      switch (status) {
                        case 'active':
                          return 'bg-green-100 text-green-800';
                        case 'past_due':
                          return 'bg-yellow-100 text-yellow-800';
                        case 'canceled':
                          return 'bg-red-100 text-red-800';
                        default:
                          return 'bg-gray-100 text-gray-600';
                      }
                    };

                    return (
                      <tr 
                        key={user.user_id} 
                        className={`hover:bg-gray-50 ${hasMismatch ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                      >
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          {subscription?.tier ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {subscription.tier}
                            </span>
                          ) : (
                            <span className="text-ca-neutral-500 text-sm">—</span>
                          )}
                          {hasMismatch && subscription?.status === 'active' && !subscription?.tier && (
                            <span className="ml-2 text-xs text-yellow-600" title="Active subscription but tier missing">
                              ⚠️
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {subscription?.status ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}>
                              {subscription.status}
                            </span>
                          ) : (
                            <span className="text-ca-neutral-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500">
                          {subscription?.current_period_end ? (
                            formatDate(subscription.current_period_end)
                          ) : (
                            <span className="text-ca-neutral-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-ca-neutral-500">
                          {formatDate(user.created_at)}
                        </td>
                      </tr>
                    );
                  })
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
