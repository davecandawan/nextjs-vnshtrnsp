import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Image from 'next/image';

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

const STATE_NAMES: { [key: string]: string } = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

interface StateSelectionProps {
  onStateSelect?: (state: string) => void;
  selectedState?: string | null;
  id?: string;
}

interface StateSelectionRef {
  resetSelection: (state?: string | null) => void;
}

const StateSelection = forwardRef<StateSelectionRef, StateSelectionProps>(
  ({ onStateSelect, selectedState: externalSelectedState, id }, ref) => {
    const [selectedState, setSelectedState] = useState<string>(externalSelectedState || '');
    const [showUnsupported, setShowUnsupported] = useState<boolean>(false);
    const [showSupported, setShowSupported] = useState<boolean>(false);

    // Sync with external state when it changes
    useEffect(() => {
      if (externalSelectedState !== undefined) {
        setSelectedState(externalSelectedState || '');
        updateStateUI(externalSelectedState);
      }
    }, [externalSelectedState]);

    // Get the full state name
    const getStateName = (stateCode: string) => {
      if (!stateCode) return 'your state';
      const stateName = STATE_NAMES[stateCode];
      return stateName || stateCode;
    };

    const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const stateCode = e.target.value || null;
      if (onStateSelect) {
        onStateSelect(stateCode || '');
      }
    };

    const updateStateUI = (stateCode: string | null) => {
      if (!stateCode) {
        setShowUnsupported(false);
        setShowSupported(false);
      } else if (UNSUPPORTED_STATES.includes(stateCode)) {
        setShowUnsupported(true);
        setShowSupported(false);
      } else {
        setShowUnsupported(false);
        setShowSupported(true);
      }
    };

    const resetSelection = (state: string | null = null) => {
      const newState = state === null || state === undefined ? '' : state;
      setSelectedState(newState);
      updateStateUI(newState);
      if (onStateSelect) {
        onStateSelect(newState);
      }
    };

    const handleGoBack = () => {
      resetSelection();
      setSelectedState(prev => (prev === '' ? ' ' : ''));
    };

    // Expose the resetSelection method via ref
    useImperativeHandle(ref, () => ({
      resetSelection,
    }));

    return (
      <div className="w-full bg-white py-1">
        {!showUnsupported && !showSupported ? (
          <>
            <p
              id={id || 'state-selection-header'}
              className="text-[19px] md:text-4xl font-bold text-center mb-8 leading-tight md:leading-[1.2] max-w-3xl mx-auto px-4"
            >
              Protect Yourself and Your Family Today. Simply Select Your State and Desired Tier
              Below (takes less than one minute):
            </p>
            <div className="max-w-[51rem] mx-auto p-8 bg-[#f5f5dc] rounded-2xl">
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="text-xl md:text-2xl font-medium whitespace-nowrap md:mr-6">
                      <span className="font-bold text-[#ff0000]">Step 1:</span>{' '}
                      <span className="text-black font-bold">Select Your State</span>
                    </div>
                    <select
                      className="w-[70%] sm:w-auto min-w-[280px] p-3 border border-[#008000] rounded-md focus:ring-2 focus:ring-[#008000] focus:border-transparent bg-[#008000] text-white text-lg"
                      name="states"
                      id="stateDropdown1"
                      value={selectedState}
                      onChange={handleStateChange}
                    >
                      <option value="" className="text-lg">
                        Select State
                      </option>
                      <option
                        value="AL"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Alabama
                      </option>
                      <option
                        value="AK"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Alaska
                      </option>
                      <option
                        value="AZ"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Arizona
                      </option>
                      <option
                        value="AR"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Arkansas
                      </option>
                      <option
                        value="CA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        California
                      </option>
                      <option
                        value="CO"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Colorado
                      </option>
                      <option
                        value="CT"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Connecticut
                      </option>
                      <option
                        value="DE"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Delaware
                      </option>
                      <option
                        value="FL"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Florida
                      </option>
                      <option
                        value="GA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Georgia
                      </option>
                      <option
                        value="HI"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Hawaii
                      </option>
                      <option
                        value="ID"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Idaho
                      </option>
                      <option
                        value="IL"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Illinois
                      </option>
                      <option
                        value="IN"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Indiana
                      </option>
                      <option
                        value="IA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Iowa
                      </option>
                      <option
                        value="KS"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Kansas
                      </option>
                      <option
                        value="KY"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Kentucky
                      </option>
                      <option
                        value="LA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Louisiana
                      </option>
                      <option
                        value="ME"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Maine
                      </option>
                      <option
                        value="MD"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Maryland
                      </option>
                      <option
                        value="MA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Massachusetts
                      </option>
                      <option
                        value="MI"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Michigan
                      </option>
                      <option
                        value="MN"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Minnesota
                      </option>
                      <option
                        value="MS"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Mississippi
                      </option>
                      <option
                        value="MO"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Missouri
                      </option>
                      <option
                        value="MT"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Montana
                      </option>
                      <option
                        value="NE"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Nebraska
                      </option>
                      <option
                        value="NV"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Nevada
                      </option>
                      <option
                        value="NH"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        New Hampshire
                      </option>
                      <option
                        value="NJ"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        New Jersey
                      </option>
                      <option
                        value="NM"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        New Mexico
                      </option>
                      <option
                        value="NY"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        New York
                      </option>
                      <option
                        value="NC"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        North Carolina
                      </option>
                      <option
                        value="ND"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        North Dakota
                      </option>
                      <option
                        value="OH"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Ohio
                      </option>
                      <option
                        value="OK"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Oklahoma
                      </option>
                      <option
                        value="OR"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Oregon
                      </option>
                      <option
                        value="PA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Pennsylvania
                      </option>
                      <option
                        value="RI"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Rhode Island
                      </option>
                      <option
                        value="SC"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        South Carolina
                      </option>
                      <option
                        value="SD"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        South Dakota
                      </option>
                      <option
                        value="TN"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Tennessee
                      </option>
                      <option
                        value="TX"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Texas
                      </option>
                      <option
                        value="UT"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Utah
                      </option>
                      <option
                        value="VT"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Vermont
                      </option>
                      <option
                        value="VA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Virginia
                      </option>
                      <option
                        value="WA"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Washington
                      </option>
                      <option
                        value="WV"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        West Virginia
                      </option>
                      <option
                        value="WI"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Wisconsin
                      </option>
                      <option
                        value="WY"
                        className="text-lg bg-[#008000] text-white hover:bg-[#006600]"
                      >
                        Wyoming
                      </option>
                    </select>
                  </div>
                </div>

                <div className="text-[19px] md:text-2xl text-center font-medium pt-4 mt-4 leading-tight">
                  <span className="font-bold text-[#ff0000]">Step 2:</span>{' '}
                  <span className="text-black font-bold">
                    Select Your Tier Below. All Tiers Come with Access to Our Advanced Ready Network
                    Video Training Series and $25 in FREE Ammo.
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : showUnsupported ? (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:mt-1 text-center">
            <p
              id="state-selection-header"
              className="text-[19px] md:text-4xl font-bold text-center mb-8 leading-tight md:leading-[1.2] max-w-3xl mx-auto px-4 text-[#ff0000]"
            >
              We're sorry our services don't currently include the state of{' '}
              {getStateName(selectedState)}.
            </p>
            <button
              onClick={handleGoBack}
              className="bg-[#008000] hover:bg-[#006600] text-white font-bold py-2 px-6 rounded-lg text-lg transition-colors"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 sm:p-6 -mt-4 sm:mt-1 text-center">
            <h2 className="text-[28px] md:text-4xl font-bold text-center mb-6 leading-tight text-black">
              Good News! We Offer Legal Protection in {getStateName(selectedState)}
            </h2>

            <p className="text-xl md:text-4xl font-bold mb-4 leading-tight">
              Please Select Your Desired Tier Below:
            </p>

            {/* Debug: Show selected state */}
            <div className="hidden">
              Selected State: {selectedState}, Name: {getStateName(selectedState)}
            </div>

            <p className="mt-2 text-black">
              Not a resident of {getStateName(selectedState)}?{' '}
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  resetSelection();
                }}
                className="underline text-black hover:text-black"
              >
                <span className="font-bold">Click here</span>
              </a>{' '}
              to go back and select another state.
            </p>
          </div>
        )}

        {!showUnsupported && !showSupported && (
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
      </div>
    );
  }
);

export default StateSelection;
