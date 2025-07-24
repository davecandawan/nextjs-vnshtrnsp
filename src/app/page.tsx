'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import critical components directly
import Navbar from '@/components/Navbar/Navbar';
import Content, { ContentProps } from '@/components/Content/Content';

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
  const [showContent, setShowContent] = useState(false);

  return (
    <>
      <Navbar />
      <BackgroundWrapper>
        <main className="min-h-screen">
          <Content 
            onShowContent={() => setShowContent(true)} 
            showContent={showContent} 
          />
          <Footer showContent={showContent} />
        </main>
      </BackgroundWrapper>
    </>
  );
}
