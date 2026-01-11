'use client';

import { useState, useEffect } from 'react';

interface HealthCheck {
  name: string;
  status: 'pass' | 'fail';
  message: string;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  checks: HealthCheck[];
}

export function HealthChecks() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/health');

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Unauthorized. Admin access required.');
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to fetch health checks');
        }
        setLoading(false);
        return;
      }

      const data: HealthResponse = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch health checks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-ca-neutral-500">Loading health checks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">System Health Checks</h2>
        <button
          onClick={fetchHealth}
          className="btn-secondary"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {healthData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className={`p-4 border-b ${
            healthData.status === 'healthy' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${
                healthData.status === 'healthy' ? 'text-green-800' : 'text-red-800'
              }`}>
                {healthData.status === 'healthy' ? '✓' : '✗'}
              </span>
              <span className={`text-lg font-semibold ${
                healthData.status === 'healthy' ? 'text-green-800' : 'text-red-800'
              }`}>
                System {healthData.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
              </span>
            </div>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--ca-neutral-300)' }}>
            {healthData.checks.map((check, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-lg ${
                        check.status === 'pass' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {check.status === 'pass' ? '✓' : '✗'}
                      </span>
                      <span className="font-medium text-ca-text">{check.name}</span>
                    </div>
                    <p className={`text-sm ml-7 ${
                      check.status === 'pass' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {check.message}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    check.status === 'pass' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-red-600 bg-red-50'
                  }`}>
                    {check.status === 'pass' ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
