'use client';

import React, { useState, useCallback, useMemo, memo, useReducer, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import StateSelection from '../StateSelection/StateSelection';

// Simple error boundary component for dynamic imports
const ErrorBoundary: React.FC<{ children: React.ReactNode; fallback: React.ReactNode }> = ({
  children,
  fallback,
}) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) return <>{fallback}</>;
  return <>{children}</>;
};

// Dynamic imports with proper typing
interface OfferSelectionProps {
  isStateSupported: boolean | null;
  onResetSelection?: () => void;
  handleGoBack?: () => void;
  scrollTargetId?: string;
}

// Dynamic imports with loading states
const OfferSelection = dynamic<OfferSelectionProps>(
  () => import('../OfferSelection/OfferSelection'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse">Loading offers...</div>
      </div>
    ),
  }
);

import VideoEventBridge from '../VidalyticsVideo/VideoEventBridge';

const VidalyticsVideo = dynamic(() => import('../VidalyticsVideo/VidalyticsVideo'), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <div className="animate-pulse">Loading video...</div>
    </div>
  ),
});

// Constants
const UNSUPPORTED_STATES = [
  'AK',
  'HI',
  'MA',
  'NJ',
  'NY',
  'OR',
  'AL',
  'AR',
  'ME',
  'MD',
  'MT',
  'NE',
  'NV',
  'RI',
  'TN',
  'VT',
  'WI',
  'CT',
  'WA',
  'FL',
  'GA',
  'AZ',
  'MI',
  'VA',
];

export interface ContentProps {
  showContent: boolean;
  onShowContent: () => void;
}

// State reducer for better state management
type ContentState = {
  selectedState: string | null;
  isLoading: boolean;
  error: string | null;
};

type ContentAction =
  | { type: 'SELECT_STATE'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const contentReducer = (state: ContentState, action: ContentAction): ContentState => {
  switch (action.type) {
    case 'SELECT_STATE':
      return { ...state, selectedState: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

const Content: React.FC<ContentProps> = ({ showContent, onShowContent }) => {
  const [showModal, setShowModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(contentReducer, {
    selectedState: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    let hasShownModal = false;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if the mouse leaves towards the top of the page
      if (e.clientY <= 0 && !hasShownModal && !showContent) {
        setShowModal(true);
        hasShownModal = true;
        // Remove the event listener after showing the modal
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Only add the event listener if content is not already shown
    if (!showContent) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [showContent]);

  const handleShowContent = () => {
    onShowContent();
    setShowModal(false);
    // Scroll to the content after a short delay to ensure it's rendered
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const { selectedState } = state;
  const searchParams = useSearchParams();

  // Memoized state selection IDs and other constants
  const stateSelectionIds = useMemo(
    () =>
      ({
        first: 'state-selection-1',
        second: 'state-selection-2',
        third: 'state-selection-3',
        offer: 'offer-section',
      }) as const,
    []
  );

  // Handlers
  const handleStateSelect = useCallback((state: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SELECT_STATE', payload: state });
      // Scroll to the offer section when state is selected
      document.getElementById('offer-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to select state. Please try again.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const handleResetSelection = useCallback(() => {
    dispatch({ type: 'SELECT_STATE', payload: null });
  }, []);

  // Derived state
  const isStateSupported = useMemo(
    () => (selectedState ? !UNSUPPORTED_STATES.includes(selectedState) : null),
    [selectedState]
  );

  // Optimized scroll handler with intersection observer
  const scrollToStateSelection = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add focus for better accessibility
      element.setAttribute('tabIndex', '-1');
      element.focus({ preventScroll: true });
    }
  }, []);

  // Wrap components with error boundary
  const SafeOfferSelection = useMemo(
    () =>
      function SafeOfferSelectionWrapper(props: OfferSelectionProps) {
        return (
          <ErrorBoundary
            fallback={
              <div className="h-64 flex items-center justify-center text-red-500">
                Failed to load offers. Please try again.
              </div>
            }
          >
            <OfferSelection {...props} />
          </ErrorBoundary>
        );
      },
    []
  );

  const SafeVidalyticsVideo = useCallback(
    () => (
      <ErrorBoundary fallback={<div>Failed to load video player</div>}>
        <VidalyticsVideo />
      </ErrorBoundary>
    ),
    []
  );

  // Memoized render helper for "Select Your State" CTA
  const renderStateSelectionCta = useCallback(
    (id: string) => {
      const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        scrollToStateSelection(e, id);
      };

      return (
        <p className="text-xl md:text-2xl font-bold text-center !mt-6 md:!mt-8 mb-4">
          &gt;&gt;&gt;{' '}
          <a
            href={`#${id}`}
            className="cursor-pointer"
            onClick={handleClick}
            aria-label="Select your state to see if you qualify"
          >
            Select Your State
          </a>{' '}
          to See if You Qualify &lt;&lt;&lt;
        </p>
      );
    },
    [scrollToStateSelection]
  );

  // Show error state if any error occurs
  if (state.error) {
    const handleRefresh = () => {
      window.location.reload();
    };

    return (
      <div className="flex items-center justify-center min-h-[50vh]" role="alert">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-700 mb-4">{state.error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            aria-label="Refresh the page"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Modal component
  const ContentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-[35vh]">
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .pulse-button {
          animation: pulse 1.5s infinite ease-in-out;
        }
        .pulse-button:hover {
          animation: none;
        }
      `}</style>
      <button
        onClick={handleShowContent}
        className="bg-[#02781d] hover:bg-[#02781d] text-white font-bold py-5 px-10 text-xl md:text-2xl rounded-[5px] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 shadow-lg pulse-button"
      >
        Click To See Options
      </button>
    </div>
  );

  return (
    <div className="py-4" role="main" aria-label="Main content">
      {showModal && <ContentModal />}
      <div className="space-y-8">
        {/* Header Section */}
        <header className="text-center py-1">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-normal leading-snug md:leading-tight mb-4 px-2 italic">
            Attention Gun Owners:{' '}
            <span className="font-bold">
              "You DON'T Have to Be a Criminal to Get Thrown In Jail"
            </span>
          </h1>
          <span className="text-xl md:text-2xl font-semibold text-red-600 px-4 pt-1 pb-0 inline-block italic">
            <span className="bg-[#ff0] px-1 py-1 italic">
              See Where You're Exposed and How to Protect Yourself And Your Family
            </span>
          </span>
        </header>

        {/* Video Section */}
        <div className="w-full max-w-4xl mx-auto -mt-4">
          <SafeVidalyticsVideo />
            <VideoEventBridge
              onShowContent={() => {
                if (!showContent) onShowContent();
              }}
              onFiveSeconds={() => {
                if (!showModal && !showContent) setShowModal(true);
              }}
            />
        </div>

        {/* Content that should be hidden initially */}
        <div
          ref={contentRef}
          className={`transition-all duration-500 ${showContent ? 'block' : 'hidden'}`}
        >
          {/* State Selection Section */}
          <section id={stateSelectionIds.first} className="scroll-mt-20">
            <StateSelection
              id={stateSelectionIds.first}
              onStateSelect={handleStateSelect}
              selectedState={selectedState}
            />
          </section>

          {/* Offer Selection Section */}
          <section className="mt-8">
            <SafeOfferSelection
              isStateSupported={isStateSupported}
              onResetSelection={handleResetSelection}
              handleGoBack={handleResetSelection}
              scrollTargetId={stateSelectionIds.first}
            />
          </section>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Hey there I’m Adam Lantelme, the founder of VNSH.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            I’ve got a really important message for you if you own a firearm and have ever
            considered using it for self defense.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Doesn’t matter if you conceal carry or not, what I’m about to show you affects you and
            the people you love.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Sadly, even if you ever use your gun for self defense and do everything right when the
            time comes to deploy your weapon to stay alive…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Your life may still be in serious danger..
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              This Shocking Thing Happens to Law-Abiding Gun Owners All The Time
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Here’s what I mean.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            As unfair as it may seem…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            If you end up shooting someone in defense of yourself or another, even if you were fully
            justified…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The state will force you to appear in court to prove you were the good guy… plus you’ll
            face the very real possibility of a civil suit from the family of whoever you shot.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And the cost of proving your innocence can be{' '}
            <span className="font-bold">devastating.</span>
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The average amount someone pays to clear their name after a self-defense shooting is
            $40,000, but it can easily reach into the 100’s of thousands.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            I don’t know about you, but if I was hit with a $40,000 bill I’d be wiped out!
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Just like Stephen Maddox was.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              The Mistake This Gun Owner Made Ended Cost Him a Fortune - And Almost Sent Him to
              Prison For Life!
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            While it’s hard to say for sure, there’s a good chance that at some point in the past
            Stephen came across a program like the one I’m about to show you… that he decided NOT to
            get.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Back in 2015, Stephen found himself in a situation where his life was at risk.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Acting in self-defense, he used his firearm to escape.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            After the shooting Stephen expected that since he’d used his gun in a justified act of
            self defense he’d go home to his family.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Yet he was handcuffed and put into a squad car and dragged off to the police station.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            When he arrived at the police station...and with a witness telling the police exactly
            what happened…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Stephen wasn’t released…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            He was charged with first-degree murder!
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The police locked him up and threw him into jail with the most violent criminals...
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Stephen was a patriotic American who used his gun for the right reason... He was trained
            and ready. He did everything by the book.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Yet here he was, locked up with real criminals for a crime he didn't commit!
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Despite being found not guilty in the end, he still had to fight for his life in a
            years-long legal battle, which cost upwards of $300,000.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              The Mistake This Gun Owner Made Ended Cost Him a Fortune - And Almost Sent Him to
              Prison For Life!
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Sadly, stories like his are not uncommon.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Now I’m not trying to scare you into not carrying.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            In fact, the opposite is true.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Because I’m about to show you something that lets you deploy your weapon in a
            life-threatening situation with <span className="font-bold italic">zero fear</span> that
            the legal aftermath will bleed you dry.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            It’s called <span className="font-bold">The Ready Network</span>.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Had Stephen had <span className="font-bold">The Ready Network</span> not only would he
            not have gone to jail, he wouldn’t have had to pay a dime for his legal bills
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Can you imagine the stress and financial burden Stephen had to endure just to prove his
            innocence?
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Now imagine that happened to you?
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The good news is if you take action today and take advantage of the coverage offered by{' '}
            <span className="font-bold">The Ready Network</span> you’ll never have to worry about
            experiencing the BS Stephen Maddox had to go through.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> is something I created to protect
            VNSH customers (as well as anyone else who carries) from the potentially life-ruining
            cost of defending yourself after a self-defense shooting.
          </p>
          {renderStateSelectionCta(stateSelectionIds.first)}
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            When you join <span className="font-bold">The Ready Network</span>, you’ll be given
            access to a program that covers ALL of your legal fees in case you use a gun – or any
            other legal means of force – to defend yourself or another person.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              The Ready Network Pays For You To Defend Yourself Here’s How It Works
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Because you may not always have your gun with you… But your hands and feet follow you
            everywhere that you go… you need to be protected no matter what you have to use to stay
            safe..
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> does that - kind of in the same way
            insurance pays for accidents that happen to you.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold italic">But this isn’t insurance.</span>
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">It’s WAY better.</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> Legal Defense Fund - powered by
            Firearms Legal Protection (FLP) - creates a war chest of{' '}
            <span className="font-bold">prepaid</span> legal funds to use if you ever need them.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            So you PAY NOTHING for the cost to defend yourself in a criminal or civil court.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We’re talking unlimited funds paid directly to your defense, no matter how many times
            you go to trial… along with a host of other benefits like bail bond protection,
            counseling support, and 24/7 immediate access to an attorney (just to name 3)
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> Legal Defense Fund - powered by
            Firearms Legal Protection - is the best way to prevent your worst day ever from becoming
            your worst nightmare for life. It’s the protection we hope we never have to use, and the
            peace of mind we all want.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Unlike other legal defense services that try and fight claims to protect their bottom
            line.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            This pot of money is yours if you ever need it, no question asked.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And that’s a big deal because some people have spent more than $500,000 to defend
            themselves after a justified shooting.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Imagine how insane it would be to use your gun to save a life and then be forced to pay
            half a million dollars to NOT go to jail!
          </p>
          <p className="text-lg md:text-[24px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold italic">That’d be nuts, right?</span>
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">Of course.</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Fortunately, if you join <span className="font-bold">The Ready Network</span> today,
            you’ll never have to worry about that EVER happening to you.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The peace of mind that you’ll have with{' '}
            <span className="font-bold">The Ready Network</span> is something you can’t really put a
            price on.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And is reason enough to sign up today.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              The Thing a Navy Seal Did For The Ready Network Could Save Your Life
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            After all, you’re committed to defending yourself with a gun… why wouldn’t you protect
            yourself from the aftermath of being forced to use it too?
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            But I want to make sure you love <span className="font-bold">The Ready Network</span>.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Which is why you need to know it doesn’t just cover you for self-defense legal expenses…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">Let me explain.</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Your decision to trust VNSH products is a BIG deal.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            That’s because owning and carrying a gun is a BIG responsibility.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And being able to actually use a gun well can be the difference between life and death.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Which is why we’ve built <span className="font-bold">The Ready Network</span> to help
            make you more deadly, and more prepared.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            In addition to your prepaid legal protection, we’re also going to help you become a
            better shot and far more comfortable with ALL of your guns.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We do that by giving you exclusive and entirely custom training from Navy SEAL Chad
            Metcalf.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            I think you and I can both agree that Navy SEALs are the best of the best.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Chad wasn’t just a SEAL, he led the training for all the East Coast SEALs for several
            years and that’s why Chad would charge you $1,500 to be personally taught by him for an
            8-hour session.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            But instead of paying $1,500… you get access to Chad’s training bundled right into your{' '}
            <span className="font-bold">The Ready Network</span> membership.
          </p>
          {renderStateSelectionCta(stateSelectionIds.first)}
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            In fact, as soon as you join we’ll email you the course I made with him. Once you
            complete it, you’ll get a Free gift from me as a way of saying “thanks.”
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              Custom Firearms Instruction From Who?
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            On top of what you get from Chad you’ll also be getting hours worth of instruction from
            Yonty Uruttia as part of your membership.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Yonty’s a veteran of the US-Army, a former Private investigator, former police officer
            and former paramedic and currently a full-time firearms instructor in the state of
            Oregon where he’s helped train thousands of classes.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            His training acumen is so good that even top companies in the firearms industry hire him
            for in-person training.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Yonty also charges hundreds of dollars for a day of his time.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            But you’ll get access to his knowledge as well as tons of additional world-class content
            for FREE when you activate your membership today.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Yonty along with our other contributors update the member area every few days to ensure
            members are getting the best and most useful information on the planet.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            This content cannot be found anywhere else (except in their in-person classes) and
            they’re guaranteed to help make you incredibly comfortable and accurate with your
            gun…Even better is Ready Network members don’t just get these exclusive training videos
            related to firearms and firearm handling.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            You also get an entire library of all things related to preparedness and survival.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              These Secrets? <br></br>Not Available Anywhere Else
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The world we live in is chaotic, inching ever closer to WW3, or economic and societal
            collapse.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And sadly the vast majority of Americans don’t have a plan in place for when SHTF.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            You probably don’t. And even if you do,{' '}
            <span className="font-bold">you know it could be better.</span>
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Remember, your job isn’t just being protector and being reactive when the unthinkable
            happens but proactively preparing as well.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Thankfully <span className="font-bold">The Ready Network</span> is full of simple,
            easy-to-understand information you can use to build a bulletproof survival plan.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">As an example...</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            If the power goes out,{' '}
            <span className="font-bold">your fridge could still be working</span>, thanks to the
            fact that we have content that shows you how to easily build a backup power system for
            pennies on the dollar.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Or if you get stranded in a winter storm, you won’t freeze to death thanks to the{' '}
            <span className="font-bold">guide we have on winter survival</span>.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And if God forbid, you ever need to leave your home and "bug out," you'll know exactly
            where to go, what to take, and how to survive -- for as long as you need to.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Best of all, it makes it all as easy as tying your shoes…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We have a complete library of information for prepping and firearms that you can access
            at any time.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And here’s the best part, we even have survival experts on staff who can help answer
            questions for you in case you’re ever confused about how to do something we recommend.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            You’d spend hundreds of hours compiling the information we give you and thousands of
            dollars, but when you join <span className="font-bold">The Ready Network</span>… it’s
            all right there at your fingertips.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            But the benefits of <span className="font-bold">The Ready Network</span> don’t stop
            there.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              Here Are Some Extra Cool Benefits That Come With Ready Network Coverage
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The main reason I made <span className="font-bold">The Ready Network</span> was to give
            you coverage for the distinct possibility that you’d go bankrupt paying lawyers to keep
            you out of jail.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            But, I don’t want <span className="font-bold">The Ready Network</span> to come without
            added benefits.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Because even though you’d be crazy to expose yourself to the possibility of going broke
            defending yourself…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            The only reason you’re seeing this is because you’ve bought products from us here at
            VNSH and will probably buy again.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            So that’s why I made it so anyone who’s a{' '}
            <span className="font-bold">The Ready Network</span> member automatically gets discounts
            and member-only pricing to everything on our website.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And not just to VNSH products either.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            My partners and I own several brands and{' '}
            <span className="font-bold">The Ready Network</span> members get DEEP discounts to all
            of those stores too.
          </p>
          {renderStateSelectionCta(stateSelectionIds.first)}
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And one more awesome perk you get access to is a partnership we have called the United
            Savings Association powered by Abenity.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              Normally For Our EmployeesYou Get Access to This Discount Program Also
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            This perks program is something we offer to our employees and would cost you $300 a year
            if you wanted to join on your own, but it’s part of{' '}
            <span className="font-bold">The Ready Network</span> automatically.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            It’s one of the largest online discount programs in America and can help you save 10-15%
            on your grocery bill, gets you exclusive discounts on restaurants, name brand
            appliances, and more.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Here’s an example of many of the brands that partner with the United Savings
            Association.
          </p>
          <div className="mx-auto w-full md:max-w-[80%]">
            <Image
              src="/contentimages/TRNDesktop.webp"
              alt="VNSH Holster deal"
              className="w-full h-auto"
              width={1120}
              height={600}
              priority
              loading="eager"
            />
          </div>

          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            With the <span className="font-bold">The Ready Network</span> and its included perks
            program you will get
          </p>
          <ul className="space-y-4 mt-4 md:mt-5">
            {[
              'Discounts at your local grocery store',
              'Savings on car rentals',
              '15% off any hotel booking - for life…',
              'Premium health-related benefits',
              'EXTRA Savings at Amazon',
              'Discounted tickets to the MLB, NFL, NBA',
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-lg md:text-[22px] leading-normal"
              >
                <Image
                  src="/contentimages/greenCheck.png"
                  alt="Checkmark"
                  width={26}
                  height={26}
                  className="mt-1 flex-shrink-0"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">And much more…</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Beyond protecting you <span className="font-bold">The Ready Network</span> actually
            helps put money in your pocket.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Plus you’ll get early access to all of the new and limited-time offers.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Say that we come out with a new dry-fire training system… Or Modern Needs comes out with
            an awesome solar-powered generator…Or Pain Safari comes up with a cool stun gun taser.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            You’ll be the first to know about it and you’ll get exclusive savings on the products as
            well.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And <span className="font-bold">The Ready Network</span> members are automatically
            entered to win any of the contests we run through our brands.
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              Would You Like To Win This??
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We’ve already given away a $100,000 Jeep Gladiator and a custom Chevy Rocky Ridge along
            with $25k in gold.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            As a member of <span className="font-bold">The Ready Network</span> you are
            automatically entered to win ANY giveaway we have going on.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Gun, Truck, Side-by-side, it doesn’t matter…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> members get entered without having
            to do anything…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And for any giveaway where we’re offering bonus entries, you’ll get the maximum number
            of entries allowed.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            So far everyone who’s won any of our giveaways had the maximum number of entries, so
            this greatly increases your odds of winning anything we giveaway.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            With monthly giveaways of things like guns and ammo, and frequent BIG TIME sweepstakes -
            along with random giveaways of gear, this added perk is a HUGE benefit for{' '}
            <span className="font-bold">The Ready Network</span> Members.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We do this because we want you to love being a member.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Now that you’ve seen everything <span className="font-bold">The Ready Network</span> has
            to offer it’s time to decide which option works best for you.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            We offer three different Tiers of <span>The Ready Network.</span>
          </p>
          <header className="text-center py-1 px-4 md:py-6 md:px-6 lg:px-15">
            <span className="text-xl md:text-4xl font-bold leading-normal md:leading-[1.2] text-orange-500">
              Which Option Works Best For You?
            </span>
          </header>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Tier 1 gives 1 person, <span className="font-bold">that being you</span>, everything
            I’ve told you about. That’s complete protection and all the perks,{' '}
            <span className="underline">in your home state of residence.</span>
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Meaning that if you have to defend yourself within your state’s boundaries you’ll be
            covered.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Tier 2 gives you everything Tier 1 offers AND protection in all 50 states, so you’re
            free to travel all across the country without fear.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            And the biggest and baddest of all is Tier 3…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            …which covers your entire household by{' '}
            <span className="font-bold">The Ready Network</span> in all 50 states.
          </p>
          <StateSelection
            id={stateSelectionIds.second}
            onStateSelect={handleStateSelect}
            selectedState={selectedState}
          />
          <OfferSelection
            isStateSupported={!selectedState ? null : !UNSUPPORTED_STATES.includes(selectedState)}
            onResetSelection={handleResetSelection}
            handleGoBack={handleResetSelection}
            scrollTargetId={stateSelectionIds.second}
          />
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            PLUS, There Is No Contract with <span className="font-bold">The Ready Network</span>.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Stay as long as you’d like or cancel tomorrow, we’re not going to keep you locked into a
            membership you decide isn’t a good fit for you.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Cancelling is easy, too.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            You can cancel directly from your membership portal or via our customer support line and
            an agent will close down your membership on the spot.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            I hope you see the value in <span className="font-bold">The Ready Network</span>, and if
            you do I’d invite you to join today.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            If you join now, I’ll even give you $25 in Free Ammo as a way to say thanks!
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Don’t wait, protect yourself, protect your family and confidently carry wherever you go!
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Simply pick the tier you want and your coverage will begin automatically.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Imagine having the peace of mind knowing you're prepared for anything life throws your
            way with a community and resources dedicated to equipping you for the unexpected.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            <span className="font-bold">The Ready Network</span> offers not just protection, but
            empowerment—allowing you to go about your day with confidence and assurance.
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Why hesitate, when there’s nothing tying you down?
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">No contract…</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Endless discounts on products you know and trust…
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Training and information from the best-of-the-best
          </p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">And so much more.</p>
          <p className="text-lg md:text-[22px] leading-normal !mt-4 md:!mt-5">
            Join now risk-free!
          </p>
          <StateSelection
            id={stateSelectionIds.third}
            onStateSelect={handleStateSelect}
            selectedState={selectedState}
          />
          <OfferSelection
            isStateSupported={!selectedState ? null : !UNSUPPORTED_STATES.includes(selectedState)}
            onResetSelection={handleResetSelection}
            handleGoBack={handleResetSelection}
            scrollTargetId={stateSelectionIds.third}
          />
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(Content, (prevProps: ContentProps, nextProps: ContentProps) => {
  // Only re-render if showContent changes
  return prevProps.showContent === nextProps.showContent;
});
