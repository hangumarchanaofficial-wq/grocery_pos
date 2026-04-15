// ============================================================
// Root Layout — Dark-only, no theme switching
// ============================================================

import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono, Noto_Sans_Sinhala } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

const notoSinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '700'],
  variable: '--font-sinhala',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GroceryPOS — Retail Command System',
  description: 'AI-powered point of sale for modern grocery retail',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${notoSinhala.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '16px',
              padding: '14px 18px',
              fontSize: '13px',
              fontWeight: 500,
              background: 'rgba(15, 25, 48, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
            },
          }}
        />
      </body>
    </html>
  );
}
