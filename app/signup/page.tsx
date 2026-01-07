import Link from 'next/link';

export default function SignUpPage() {
  return (
    <main style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Sign Up</h1>
      <p style={{ marginBottom: '2rem' }}>
        Create an account to join AgentForge Academy
      </p>

      <div style={{ 
        padding: '1.5rem', 
        border: '1px solid #e0e0e0', 
        borderRadius: '8px',
        marginBottom: '1rem'
      }}>
        <p style={{ marginBottom: '1rem' }}>
          Sign up functionality will be implemented with Supabase authentication.
        </p>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          For now, please contact an administrator to create an account, or use the sign in page if you already have an account.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link 
          href="/login" 
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Sign In Instead
        </Link>
        <Link 
          href="/" 
          style={{
            color: '#0070f3',
            textDecoration: 'none'
          }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}

