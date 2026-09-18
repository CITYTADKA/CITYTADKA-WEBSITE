import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'City Tadka — Surat Starts Here',
  description: 'People · Places · Stories. Surat coverage, events, and City Tadka Club — all in one place.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-page text-ink">{children}</body>
    </html>
  );
}
