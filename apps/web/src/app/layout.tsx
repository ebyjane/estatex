import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/AppProviders';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'EstateX.ai | AI Real Estate Investment Platform',
    template: '%s | EstateX.ai',
  },
  description:
    'Discover undervalued global properties using AI. Compare, analyze, and invest smarter across India, UAE, and US.',
  keywords: [
    'real estate AI',
    'property investment',
    'India UAE US property',
    'EstateX',
    'global real estate',
    'yield projection',
  ],
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/favicon.svg' }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-brand-bg text-slate-100">
        <AppProviders>{children}</AppProviders>
        <Footer />
      </body>
    </html>
  );
}
