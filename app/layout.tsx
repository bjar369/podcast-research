import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podcast Guest Research',
  description: 'Research podcasts and episodes for guest opportunities',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}