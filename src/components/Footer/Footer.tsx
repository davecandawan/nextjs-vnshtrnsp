import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import FooterModal from './FooterModal';

interface FooterColumnProps {
  imgUrl: string;
  title: string;
  text: string;
  imgWidth?: string;
  isSmaller?: boolean;
}

const FooterColumn: React.FC<FooterColumnProps> = ({ imgUrl, title, text, isSmaller = false }) => {
  return (
    <div className="flex-1 min-w-[250px] max-w-[350px] p-4 text-center flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-between">
        <div
          className="w-full flex justify-center"
          style={{ minHeight: '160px', alignItems: 'center' }}
        >
          <div
            className={`relative ${isSmaller ? 'w-[200px]' : 'w-[250px]'}`}
            style={{ aspectRatio: '250/160' }}
          >
            <Image
              src={imgUrl}
              alt={title}
              width={isSmaller ? 200 : 250}
              height={isSmaller ? 128 : 160}
              className="w-full h-full object-contain"
              quality={100}
              priority
              unoptimized={process.env.NODE_ENV !== 'production'}
              sizes={
                isSmaller ? '(max-width: 768px) 120px, 150px' : '(max-width: 768px) 180px, 250px'
              }
            />
          </div>
        </div>
        <div className="w-full mt-4">
          <h3 className="text-lg font-extrabold mb-2 text-black whitespace-nowrap">{title}</h3>
          <p className="text-black text-base leading-tight">{text}</p>
        </div>
      </div>
    </div>
  );
};

interface FooterLinkProps {
  label: string;
  id: string;
  onClick: (id: string) => void;
}

const FooterLink: React.FC<FooterLinkProps> = ({ label, id, onClick }) => (
  <a
    className="text-black cursor-pointer hover:text-black transition-colors duration-300 mx-2"
    onClick={e => {
      e.preventDefault();
      onClick(id);
    }}
  >
    {label}
  </a>
);

const FooterLinks: React.FC<{ loadInfo: (id: string) => void }> = ({ loadInfo }) => (
  <div className="w-full text-lg text-center flex flex-wrap justify-center items-center space-x-4">
    <FooterLink label="Terms & Disclaimer" id="terms-pop-modal" onClick={loadInfo} />
    <FooterLink label="Privacy Policy" id="privacy-policy-modal" onClick={loadInfo} />
  </div>
);

interface FooterProps {
  showContent?: boolean;
}

const Footer: React.FC<FooterProps> = ({ showContent = false }) => {
  const [modalId, setModalId] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showModal) {
      // Small delay to ensure the modal is in the DOM before starting animation
      timeout = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
    }
    return () => clearTimeout(timeout);
  }, [showModal]);

  const loadInfo = (id: string) => {
    setModalId(id);
    setShowModal(true);
  };

  const closeModal = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowModal(false);
      setModalId('');
    }, 300); // Match this with the transition duration
  };

  return (
    <footer className="w-full mt-2 bg-white">
      <div className="pt-1 pb-8 text-black bg-white">
        {/* Three columns section - hidden initially */}
        <div
          className={`pt-1 pb-4 transition-all duration-500 ${showContent ? 'block' : 'hidden'}`}
        >
          <div className="box-border min-w-[250px] max-w-6xl mx-auto px-4 flex flex-wrap justify-around gap-6">
            <FooterColumn
              imgUrl="/contentimages/vnsh_money_back_guarantee_footer.webp"
              title="Cancel Anytime"
              text="Cancel anytime with our hassle-free one-click cancellation if you wish to cancel your membership for any reason."
            />
            <FooterColumn
              imgUrl="/contentimages/vnsh_small_business_footer.webp"
              title="Thank You!"
              text="Your purchase supports the second amendment community and increases our ability to defend ourselves and remain free."
            />
            <FooterColumn
              imgUrl="/contentimages/vnsh_secure_payment_footer.webp"
              title="100% Secure Payment"
              text="All orders are AES-256 Bit encrypted through a HTTPS secure network. We respect your privacy..."
              isSmaller
            />
          </div>
        </div>

        {/* Copyright and links section - always visible */}
        <div className="flex flex-col items-center">
          <div className="text-center text-black">
            © <b>{new Date().getFullYear()} VNSH.com</b> All Rights Reserved.
          </div>
          <FooterLinks loadInfo={loadInfo} />
        </div>
      </div>

      {showModal && (
        <div
          className={`fixed inset-0 z-50 p-4 pt-20 flex items-start justify-center transition-opacity duration-200 ease-out ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-lg max-w-4xl w-full max-h-[100vh] overflow-y-auto relative p-6 mx-auto transform transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-black hover:text-black bg-transparent border-none hover:bg-transparent"
              onClick={closeModal}
              aria-label="Close modal"
            >
              &times;
            </button>
            <FooterModal modalId={modalId} closeModal={closeModal} />
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
