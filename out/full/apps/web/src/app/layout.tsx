import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/AppProviders';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Investify — Global Property Intelligence for Smart Investors',
  description: 'Stop guessing. Start investing with AI-powered insights across India, Dubai, and the US.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-slate-950 text-slate-100">
        <AppProviders>{children}</AppProviders>
        <Footer />
      </body>
    </html>
  );
}
