// ============================================================
// Root Layout — App shell with providers
// ============================================================

import type { Metadata } from 'next';
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'GroceryPOS — Smart Billing System',
  description: 'AI-powered point of sale system for grocery stores',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
      {children}
      <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '18px',
              padding: '14px 16px',
              fontSize: '14px',
              background: '#111827',
              color: '#f8fafc',
              border: '1px solid rgba(148, 163, 184, 0.18)',
              boxShadow: '0 24px 60px rgba(2, 6, 23, 0.38)',
            },
          }}
      />
      </body>
      </html>
  );
}
