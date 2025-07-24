import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Ready Network - VNSH',
  description:
    'The Ready Network is a membership program that offers protection and empowerment to its members.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'The Ready Network - VNSH',
    description:
      'The Ready Network is a membership program that offers protection and empowerment to its members.',
    type: 'website',
    images: [
      {
        url: '/favicon.png',
        width: 512,
        height: 512,
        alt: 'The Ready Network Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Ready Network - VNSH',
    description:
      'Th  e Ready Network is a membership program that offers protection and empowerment to its members.',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
