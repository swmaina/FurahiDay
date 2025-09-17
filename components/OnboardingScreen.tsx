
import React, { useState, useEffect } from 'react';
import { City, Genre, CityInfo } from '../types';
import { CITIES, INTERESTS } from '../constants';
import { Icon } from './Icon';

type OnboardingProps = {
  onComplete: (city: City, interests: Genre[]) => void;
};

type CityStepState = 'detecting' | 'confirming' | 'selecting';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export const OnboardingScreen: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [detectedCity, setDetectedCity] = useState<CityInfo | null>(null);
  const [cityStepState, setCityStepState] = useState<CityStepState>('detecting');
  const [selectedInterests, setSelectedInterests] = useState<Genre[]>([]);

  useEffect(() => {
    if (step === 2 && cityStepState === 'detecting') {
      if (!navigator.geolocation) {
        setCityStepState('selecting');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const sortedCities = [...CITIES].sort((a, b) => {
            const distA = getDistance(latitude, longitude, a.latitude, a.longitude);
            const distB = getDistance(latitude, longitude, b.latitude, b.longitude);
            return distA - distB;
          });
          setDetectedCity(sortedCities[0]);
          setCityStepState('confirming');
        },
        (error) => {
          console.error("Geolocation error:", error);
          setCityStepState('selecting');
        }
      );
    }
  }, [step, cityStepState]);

  const toggleInterest = (interest: Genre) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleFinish = () => {
    if (selectedCity && selectedInterests.length > 0) {
      onComplete(selectedCity, selectedInterests);
    }
  };
  
  const handleSelectCity = (city: City) => {
      setSelectedCity(city);
      setStep(3);
  }

  const renderCityStep = () => {
    switch (cityStepState) {
        case 'detecting':
            return (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Icon name="location" className="w-16 h-16 text-brand-green animate-pulse" />
                    <h2 className="text-2xl font-bold text-light-text mt-4">Finding events near you...</h2>
                    <p className="text-medium-text mt-2">Please allow location access for the best experience.</p>
                </div>
            );
        case 'confirming':
            return (
                <div className="flex flex-col h-full text-center justify-center">
                    <Icon name="location" className="w-12 h-12 text-brand-green mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-light-text mb-2">We see you're in</h2>
                    <h1 className="text-4xl font-bold text-brand-orange mb-8">{detectedCity?.name}</h1>
                    <p className="text-medium-text mb-6">Is this correct?</p>
                    <div className="space-y-4">
                        <button
                          onClick={() => handleSelectCity(detectedCity!.name)}
                          className="w-full bg-brand-green text-black font-bold py-4 px-4 rounded-xl text-lg transition-transform hover:scale-105"
                        >
                            Yes, show me events in {detectedCity?.name}
                        </button>
                        <button
                          onClick={() => setCityStepState('selecting')}
                          className="w-full bg-card-bg text-light-text font-bold py-4 px-4 rounded-xl text-lg transition-transform hover:scale-105"
                        >
                            Choose another city
                        </button>
                    </div>
                </div>
            );
        case 'selecting':
            return (
                <div className="flex flex-col h-full">
                    <h2 className="text-2xl font-bold text-light-text mb-1">Select your city</h2>
                    <p className="text-medium-text mb-6">This helps us find events near you.</p>
                    <div className="space-y-4 flex-grow overflow-y-auto pb-6">
                        {CITIES.map(city => (
                            <button
                                key={city.name}
                                onClick={() => handleSelectCity(city.name)}
                                className="w-full text-left text-light-text font-semibold p-5 bg-card-bg rounded-xl border-2 border-transparent hover:border-brand-green transition-all"
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>
                </div>
            );
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center flex flex-col justify-center items-center h-full">
            <div className="mb-8">
              <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-green to-brand-orange">
                FurahiDay
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-light-text mb-2">Discover your city’s vibe.</h1>
            <p className="text-medium-text max-w-xs">Find the best gigs, concerts, and festivals happening near you.</p>
            <button
              onClick={() => setStep(2)}
              className="mt-12 w-full bg-brand-green text-black font-bold py-4 px-4 rounded-xl text-lg transition-transform hover:scale-105"
            >
              Get Started
            </button>
          </div>
        );
      case 2:
        return renderCityStep();
      case 3:
        return (
          <div className="flex flex-col h-full">
            <h2 className="text-2xl font-bold text-light-text mb-1">What's your vibe?</h2>
            <p className="text-medium-text mb-6">Choose a few interests to personalize your feed.</p>
            <div className="grid grid-cols-2 gap-3 flex-grow overflow-y-auto pb-24">
              {INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`relative p-4 rounded-xl font-semibold text-center transition-all duration-200 ${
                      isSelected ? 'bg-brand-orange text-black' : 'bg-card-bg text-light-text'
                    }`}
                  >
                    {interest}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <Icon name="check" className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleFinish}
              disabled={selectedInterests.length === 0}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(24rem-2rem)] bg-brand-green text-black font-bold py-4 px-4 rounded-xl text-lg transition-all disabled:bg-gray-600 disabled:cursor-not-allowed hover:scale-105"
            >
              Finish
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="p-4 h-full">{renderStep()}</div>;
};
