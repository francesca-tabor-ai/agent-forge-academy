import { redirect } from 'next/navigation';
import { createUserSupabaseClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createUserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, redirect to /app
  if (user) {
    redirect('/app');
  }

  // If not logged in, show homepage with login/signup links
  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>AgentForge Academy</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Multi-agent systems learning and talent platform
      </p>
      
      <div style={{ marginBottom: '2rem' }}>
        <p>
          AgentForge Academy is a production-grade learning platform focused on multi-agent systems, 
          AI infrastructure, and agent operations.
        </p>
        <p>
          It combines technical learning, student portfolios, tutor-led support, and demo days 
          to bridge learning and production.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link 
          href="/auth/login" 
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Sign In
        </Link>
        <Link 
          href="/auth/signup" 
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: '#0070f3',
            textDecoration: 'none',
            border: '1px solid #0070f3',
            borderRadius: '4px',
            display: 'inline-block'
          }}
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
