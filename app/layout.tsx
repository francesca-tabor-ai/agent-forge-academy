import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { Suspense } from 'react';
import { ReferralTracking } from '@/components/analytics/ReferralTracking';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

export const metadata: Metadata = {
  title: 'AI Growth Hub',
  description: 'Multi-agent systems learning and talent platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <ReferralTracking />
        </Suspense>
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}

