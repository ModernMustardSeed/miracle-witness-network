import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Masthead } from '@/components/Masthead';

import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://miraclewitness.network'),
  title: {
    default: 'Miracle Witness Network — the world’s good news, gathered every hour',
    template: '%s | Miracle Witness Network',
  },
  description:
    'A newsroom that reports only the good: rescues, recoveries, revivals, reunions, generosity and justice done. Every story carries the outlet that reported it and a link you can check.',
  keywords: [
    'good news',
    'rescue stories',
    'revival',
    'miracles',
    'positive news',
    'hopeful news',
    'faith news',
  ],
  openGraph: {
    type: 'website',
    url: 'https://miraclewitness.network',
    siteName: 'Miracle Witness Network',
    title: 'Miracle Witness Network',
    description:
      'The world’s good news, gathered every hour. Real stories, named sources, every one you can check.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miracle Witness Network',
    description: 'The world’s good news, gathered every hour.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#FBF7EF',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="grain min-h-screen bg-paper font-sans text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to the front page
        </a>
        <div className="relative z-10 flex min-h-screen flex-col">
          <Masthead />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
