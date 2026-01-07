import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </main>
    }>
      <LoginClient />
    </Suspense>
  );
}
