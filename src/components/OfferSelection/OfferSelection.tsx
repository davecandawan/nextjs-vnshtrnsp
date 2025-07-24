import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

export interface OfferSelectionProps {
  isStateSupported: boolean | null;
  onResetSelection?: () => void;
  handleGoBack?: () => void;
  scrollTargetId?: string;
  [key: string]: any; // Allow any additional props
}

const OfferSelection: React.FC<OfferSelectionProps> = ({
  isStateSupported,
  onResetSelection,
  handleGoBack,
  scrollTargetId = 'state-selection-header',
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Use refs to track button elements
  const buttonRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  // Handle button clicks to add button class to URL
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      const buttonClass = ['t1m', 't1y', 't2m', 't2y', 't3m', 't3y'].find(cls =>
        target.classList.contains(cls)
      );

      if (buttonClass && target instanceof HTMLAnchorElement) {
        // Get the current URL from the button's href
        const currentUrl = new URL(target.href);
        // Add the button class to the URL
        currentUrl.searchParams.set('buttonClass', buttonClass);
        // Navigate to the updated URL
        window.location.href = currentUrl.toString();
      }
    };

    // Get current refs
    const currentRefs = buttonRefs.current;

    // Add event listeners to all tracked buttons
    currentRefs.forEach((button, key) => {
      if (button) {
        button.addEventListener('click', handleClick as EventListener);
      }
    });

    // Cleanup function
    return () => {
      currentRefs.forEach((button, key) => {
        if (button) {
          button.removeEventListener('click', handleClick as EventListener);
        }
      });
    };
  }, [router]);

  const getCheckoutUrl = (baseUrl: string, buttonClass?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('redirect');
    if (buttonClass) {
      params.set('buttonClass', buttonClass);
    }
    const queryString = params.toString();
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`;
  };
  return (
    <div className="w-full pt-8">
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Individual Basic */}
        <div className="w-full mx-auto max-w-[450px] lg:max-w-none rounded-t-xl overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <div className="relative w-full" style={{ maxWidth: '100%', height: 'auto' }}>
              <Image
                src="/contentimages/LowerPrice.webp"
                alt="Individual Basic"
                width={400}
                height={400}
                className="tier-image w-full h-auto"
                priority
              />
            </div>
          </div>
          <div className="bg-[#241f20] p-4 rounded-b-xl">
            <div className="bg-white rounded">
              <div className="text-left font-bold text-[15px] mb-4 pt-2 px-2">
                Protection in Your State of Residence
              </div>
              <div className="h-px bg-[#241f20] my-2"></div>
              <div className="h-6 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>

              {[
                <div key="training" className="h-8 flex items-center">
                  Unlimited Access to Advanced Ready Network Video Training Series
                </div>,
                <div key="ammo" className="h-3 flex items-center">
                  $25 of FREE Ammo
                </div>,
                <div key="setup" className="h-3 flex items-center">
                  Waived Setup Fee
                </div>,
                <div key="criminal" className="h-6 flex items-center">
                  Uncapped Attorney Fees for Defense of Criminal Cases
                </div>,
                <div key="civil" className="h-6 flex items-center">
                  Uncapped Attorney Fees for Defense of Civil Cases
                </div>,
                <div key="protection" className="h-6 flex items-center">
                  Protection Extends to All Legal Weapons
                </div>,
                <div key="redflag" className="h-6 flex items-center">
                  Defense of Extreme Risk-Protection Orders (Red Flag Laws)
                </div>,
                <div key="hotline" className="h-6 flex items-center">
                  Access to 24/7 Emergency Attorney-answered Hotline
                </div>,
                <div key="expungement" className="h-6 flex items-center">
                  Expungement of Criminal Record on Non-convictions
                </div>,
                <div key="discounts" className="h-6 flex items-center">
                  Exclusive 25% Discounts on ALL Our Partner Sites
                </div>,
                <div key="perks" className="h-3 flex items-center">
                  Enrolled in USA Perks Program
                </div>,
                <div key="giveaways" className="h-3 flex items-center">
                  Automatically Entered to Win All Giveaways
                </div>,
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center text-sm py-2 text-black px-2">{item}</div>
                  <div className="h-px bg-[#241f20] my-2"></div>
                </React.Fragment>
              ))}

              <div className="text-left text-sm font-bold text-black mt-4 pl-2 px-2">
                Just $34.97 Monthly or $349.70 Yearly
                <br />
                <span className="pb-2 inline-block">(2 Months FREE)</span>
              </div>
            </div>

            {isStateSupported !== null && (
              <div className="flex gap-2 mt-4">
                {isStateSupported ? (
                  <>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t1m', el);
                        else buttonRefs.current.delete('t1m');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't1m')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Monthly
                    </a>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t1y', el);
                        else buttonRefs.current.delete('t1y');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't1y')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Yearly
                    </a>
                  </>
                ) : (
                  <div className="w-full bg-[#241f20] text-gray-600 text-center py-2 px-4 rounded font-medium text-sm">
                    Not available in your state
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Individual Premium */}
        <div className="w-full mx-auto max-w-[450px] lg:max-w-none rounded-t-xl overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <div className="relative w-full" style={{ maxWidth: '100%', height: 'auto' }}>
              <Image
                src="/contentimages/MostPopular.webp"
                alt="Individual Premium"
                width={400}
                height={400}
                className="tier-image w-full h-auto"
                priority
              />
            </div>
          </div>
          <div className="bg-[#241f20] p-4 rounded-b-xl">
            <div className="bg-white rounded">
              <div className="text-left font-bold text-[15px] mb-4 pt-2 px-2">
                Protection in all 50 states
              </div>
              <div className="h-px bg-[#241f20] my-2"></div>
              <div className="h-6 flex items-center text-sm py-2 text-black px-2">
                <span className="text-[#00ade6] font-extrabold text-lg mr-1">+</span>
                <span className="text-[#00ade6]">
                  All the benefits of <span className="font-bold text-black">INDIVIDUAL BASIC</span>
                </span>
              </div>
              <div className="h-px bg-[#241f20] my-2"></div>

              {[
                <div key="training2" className="h-8 flex items-center">
                  Unlimited Access to Advanced Ready Network Video Training Series
                </div>,
                <div key="ammo2" className="h-3 flex items-center">
                  $25 of FREE Ammo
                </div>,
                <div key="setup2" className="h-3 flex items-center">
                  Waived Setup Fee
                </div>,
                <div key="witness" className="h-6 flex items-center">
                  Payment of Expert Witness Fees
                </div>,
                <div key="investigator" className="h-6 flex items-center">
                  Payment of Private Investigator Fees
                </div>,
                <div key="counseling" className="h-6 flex items-center">
                  Coordination of Counselling Support
                </div>,
                <div key="wages" className="h-6 flex items-center">
                  Payment of Lost Wages During Trial
                </div>,
                <div key="cleanup" className="h-6 flex items-center">
                  Incident Scene Clean-up Provided
                </div>,
                <div key="firearm" className="h-6 flex items-center">
                  Payment for Incident-related Firearm Confiscation
                </div>,
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center text-sm py-2 text-black px-2">{item}</div>
                  <div className="h-px bg-[#241f20] my-2"></div>
                </React.Fragment>
              ))}

              <div className="h-10 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-8 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-6 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>

              <div className="text-left text-sm font-bold text-black mt-4 pl-2 px-2">
                Just $39.97 Monthly or $399.70 Yearly
                <br />
                <span className="pb-2 inline-block">(2 Months FREE)</span>
              </div>
            </div>

            {isStateSupported !== null && (
              <div className="flex gap-2 mt-4">
                {isStateSupported ? (
                  <>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t2m', el);
                        else buttonRefs.current.delete('t2m');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't2m')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Monthly
                    </a>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t2y', el);
                        else buttonRefs.current.delete('t2y');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't2y')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Yearly
                    </a>
                  </>
                ) : (
                  <div className="w-full bg-[#241f20] text-gray-600 text-center py-2 px-4 rounded font-medium text-sm">
                    Not available in your state
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Family Plan */}
        <div className="w-full mx-auto max-w-[450px] lg:max-w-none rounded-t-xl overflow-hidden">
          <div className="w-full flex items-center justify-center">
            <div className="relative w-full" style={{ maxWidth: '100%', height: 'auto' }}>
              <Image
                src="/contentimages/BestProtection.webp"
                alt="Family Plan"
                width={400}
                height={400}
                className="tier-image w-full h-auto"
                priority
              />
            </div>
          </div>
          <div className="bg-[#241f20] p-4 rounded-b-xl">
            <div className="bg-white rounded">
              <div className="text-left font-bold text-[15px] mb-4 pt-2 px-2">
                Protection in all 50 states
              </div>
              <div className="h-px bg-[#241f20] my-2"></div>
              <div className="h-6 flex items-center text-sm py-2 text-black px-1">
                <span className="text-[#ff9700] font-extrabold text-lg mr-1">+</span>
                <span className="text-[#ff9700]">
                  All the benefits of{' '}
                  <span className="font-bold text-black">INDIVIDUAL PREMIUM</span>
                </span>
              </div>
              <div className="h-px bg-[#241f20] my-2"></div>

              {[
                <div key="training3" className="h-8 flex items-center">
                  Unlimited Access to Advanced Ready Network Video Training Series
                </div>,
                <div key="ammo3" className="h-3 flex items-center">
                  $25 of FREE Ammo
                </div>,
                <div key="setup3" className="h-3 flex items-center">
                  Waived Setup Fee
                </div>,
                <div key="spouse" className="h-6 flex items-center">
                  Benefits for Spouse
                </div>,
                <div key="children" className="h-6 flex items-center">
                  Benefits for All Minor Children*
                </div>,
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center text-sm py-2 text-black px-2">{item}</div>
                  <div className="h-px bg-[#241f20] my-2"></div>
                </React.Fragment>
              ))}

              <div className="h-10 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-10 flex items-center text-sm text-black text-left px-2">
                *Age 17 and Younger. Certain Limitations May Apply.
              </div>

              <div className="h-px bg-[#241f20] my-2"></div>
              <div className="h-10 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-10 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-10 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-8 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>
              <div className="h-6 hidden md:block"></div>
              <div className="h-px bg-[#241f20] my-2 hidden md:block"></div>

              <div className="text-left text-sm font-bold text-black mt-4 pl-2 px-2">
                Just $69.97 Monthly or $699.70 Yearly
                <br />
                <span className="pb-2 inline-block">(2 Months FREE)</span>
              </div>
            </div>

            {isStateSupported !== null && (
              <div className="flex gap-2 mt-4">
                {isStateSupported ? (
                  <>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t3m', el);
                        else buttonRefs.current.delete('t3m');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't3m')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Monthly
                    </a>
                    <a
                      ref={el => {
                        if (el) buttonRefs.current.set('t3y', el);
                        else buttonRefs.current.delete('t3y');
                      }}
                      href={getCheckoutUrl('https://secure.vnsh.com/vnshtrnsp/checkout', 't3y')}
                      className="flex-1 bg-[#28a745] text-white hover:bg-[#24883b] hover:text-white text-center py-2 px-1 rounded font-medium transition-colors text-xs sm:text-sm whitespace-nowrap"
                    >
                      Activate Yearly
                    </a>
                  </>
                ) : (
                  <div className="w-full bg-[#241f20] text-gray-600 text-center py-2 px-4 rounded font-medium text-sm">
                    Not available in your state
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isStateSupported === true && (
        <div className="mt-4 sm:mt-4 text-center">
          <div className="relative w-full max-w-[800px] mx-auto">
            <Image
              src="/contentimages/TRN-Sales-Page-Graphics-BannerV2.webp"
              alt="Tier Selection Banner"
              width={1600}
              height={853}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      )}
      {!isStateSupported && (
        <div className="mt-12 space-y-8">
          <p className="text-lg md:text-[22px] leading-normal">
            <span className="font-bold">
              * Not available in every state. Please{' '}
              <a
                href={`#${scrollTargetId}`}
                className="text-blue-500 cursor-pointer"
                onClick={e => {
                  e.preventDefault();
                  // Call the reset handler
                  if (onResetSelection) onResetSelection();
                  if (handleGoBack) handleGoBack();

                  // Scroll to the target element after a short delay
                  // to ensure the DOM has updated
                  setTimeout(() => {
                    const element = document.getElementById(scrollTargetId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                click here
              </a>{' '}
              and select your state to see if you are eligible.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OfferSelection;
