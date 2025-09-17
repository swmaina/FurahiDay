import React, { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { EventDetailsScreen } from './components/EventDetailsScreen';
import { SavedScreen } from './components/SavedScreen';
import { SearchScreen } from './components/SearchScreen';
import { BottomNav } from './components/BottomNav';
import { MOCK_EVENTS } from './constants';
import { City, Genre, Screen, Event } from './types';

const App: React.FC = () => {
    const [isOnboarded, setIsOnboarded] = useState(false);
    const [userCity, setUserCity] = useState<City>(City.Nairobi);
    const [userInterests, setUserInterests] = useState<Genre[]>([]);
    const [currentScreen, setCurrentScreen] = useState<Screen>('home');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [savedEventIds, setSavedEventIds] = useState<number[]>([]);
    
    // Check localStorage for saved preferences on initial load
    useEffect(() => {
        try {
            const savedCity = localStorage.getItem('furahiDayUserCity');
            const savedInterestsJSON = localStorage.getItem('furahiDayUserInterests');

            if (savedCity && savedInterestsJSON) {
                const savedInterests = JSON.parse(savedInterestsJSON) as Genre[];
                setUserCity(savedCity as City);
                setUserInterests(savedInterests);
                setIsOnboarded(true);
            }
        } catch (error) {
            console.error("Failed to load user preferences from localStorage", error);
        }
    }, []);

    // Simulate push notification on Thursdays
    useEffect(() => {
        const today = new Date();
        if (today.getDay() === 4) { // Thursday
            console.log(`This weekend in ${userCity}: Mugithi, Car Fest, Wine Tasting. Tap to explore!`);
            // In a real app, this would trigger a system notification.
        }
    }, [userCity]);

    const handleOnboardingComplete = (city: City, interests: Genre[]) => {
        setUserCity(city);
        setUserInterests(interests);
        setIsOnboarded(true);
        setCurrentScreen('home');

        // Save preferences to localStorage
        try {
            localStorage.setItem('furahiDayUserCity', city);
            localStorage.setItem('furahiDayUserInterests', JSON.stringify(interests));
        } catch (error) {
            console.error("Failed to save user preferences to localStorage", error);
        }
    };

    const handleNavigate = (screen: Screen) => {
        setSelectedEvent(null);
        setCurrentScreen(screen);
    };

    const handleViewDetails = (event: Event) => {
        setSelectedEvent(event);
        setCurrentScreen('details');
    };
    
    const handleSaveEvent = (eventId: number) => {
        setSavedEventIds(prev =>
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    };

    const renderScreen = () => {
        if (!isOnboarded) {
            return <OnboardingScreen onComplete={handleOnboardingComplete} />;
        }

        if (currentScreen === 'details' && selectedEvent) {
            return (
                <EventDetailsScreen
                    event={selectedEvent}
                    isSaved={savedEventIds.includes(selectedEvent.id)}
                    onBack={() => setCurrentScreen('home')}
                    onSave={handleSaveEvent}
                />
            );
        }

        switch (currentScreen) {
            case 'home':
                return (
                    <HomeScreen
                        events={MOCK_EVENTS}
                        savedEventIds={savedEventIds}
                        userCity={userCity}
                        userInterests={userInterests}
                        onViewDetails={handleViewDetails}
                        onSaveEvent={handleSaveEvent}
                    />
                );
            case 'saved':
                const savedEvents = MOCK_EVENTS.filter(event => savedEventIds.includes(event.id));
                return <SavedScreen savedEvents={savedEvents} onViewDetails={handleViewDetails} />;
            case 'search':
                return (
                    <SearchScreen
                        events={MOCK_EVENTS}
                        savedEventIds={savedEventIds}
                        onViewDetails={handleViewDetails}
                        onSaveEvent={handleSaveEvent}
                    />
                );
            default:
                return <HomeScreen events={MOCK_EVENTS} savedEventIds={savedEventIds} userCity={userCity} userInterests={userInterests} onViewDetails={handleViewDetails} onSaveEvent={handleSaveEvent} />;
        }
    };

    return (
        <div className="bg-gradient-to-b from-indigo-950 to-dark-bg text-white font-sans min-h-screen">
            <div className="max-w-lg mx-auto bg-transparent relative h-screen overflow-y-auto">
                {renderScreen()}
                {isOnboarded && currentScreen !== 'details' && (
                    <BottomNav activeScreen={currentScreen} onNavigate={handleNavigate} />
                )}
            </div>
        </div>
    );
};

export default App;