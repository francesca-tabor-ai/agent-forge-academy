import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}

