'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import critical components directly
import Navbar from '@/components/Navbar/Navbar';
import Content from '@/components/Content/Content';

// Lazy load non-critical components
const Footer = dynamic(() => import('@/components/Footer/Footer'), {
  loading: () => <div className="h-32 bg-gray-50"></div>,
  ssr: false,
});

const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full bg-[url('/bg.webp')] bg-cover bg-fixed bg-repeat bg-center">
    <div className="w-full max-w-[1200px] mx-auto px-5 py-1 lg:px-20 bg-white">{children}</div>
  </div>
);

export default function Home() {
  return (
    <>
      <Navbar />
      <BackgroundWrapper>
        <main className="min-h-screen">
          <Content />
          <Footer />
        </main>
      </BackgroundWrapper>
    </>
  );
}
