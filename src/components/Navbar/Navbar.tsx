import React from 'react';
import Image from 'next/image';

const Navbar: React.FC = () => {
  return (
    <nav
      className="w-full bg-[#0a0a0a] shadow-md relative py-2 sm:py-2"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center py-2 sm:py-0 sm:min-h-[55px] w-full">
          <div className="flex items-center sm:pl-16">
            <Image
              src="/White-VNSH-Logo.webp"
              alt="VNSH Logo"
              className="w-[90px] sm:w-[100px] h-auto hover:opacity-90"
              width={100}
              height={28}
              priority
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
