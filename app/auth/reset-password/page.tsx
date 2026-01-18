'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <div
          style={{
            padding: '1.5rem',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ color: '#3c3', marginBottom: '1rem' }}>Check your email</h2>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            We&apos;ve sent a password reset link to {email}
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Click the link in the email to reset your password.
          </p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            href="/auth/login"
            style={{
              color: '#0070f3',
              textDecoration: 'none',
              fontWeight: '500',
            }}
          >
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
      <h1>Reset Password</h1>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            marginBottom: '1rem',
            color: '#c33',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '1rem',
          }}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <Link
          href="/auth/login"
          style={{
            color: '#0070f3',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}

