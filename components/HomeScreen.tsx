import React, { useState, useMemo, useEffect } from 'react';
import { Event, Genre, City } from '../types';
import { EventCard } from './EventCard';
import { Logo } from './Logo';
import { Icon } from './Icon';

type HomeScreenProps = {
  events: Event[];
  savedEventIds: number[];
  userCity: City;
  userInterests: Genre[];
  onViewDetails: (event: Event) => void;
  onSaveEvent: (eventId: number) => void;
};

const FILTERS = ['Near Me', 'Today', 'This Weekend', 'Next Week', 'All'];
const GENRES: Genre[] = [Genre.Mugithi, Genre.HipHop, Genre.LiveBand, Genre.Outdoor, Genre.WineBeer];

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

export const HomeScreen: React.FC<HomeScreenProps> = ({ events, savedEventIds, userCity, userInterests, onViewDetails, onSaveEvent }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeGenre, setActiveGenre] = useState<Genre | 'All'>('All');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (activeFilter === 'Near Me') {
      if (userLocation) {
        setLocationStatus('success');
        return;
      }
      
      setLocationStatus('loading');
      if (!navigator.geolocation) {
        setLocationStatus('error');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationStatus('success');
        },
        () => {
          setLocationStatus('error');
        }
      );
    }
  }, [activeFilter, userLocation]);

  const promotedEvents = useMemo(() => 
    events.filter(event => event.isPromoted && event.city === userCity),
    [events, userCity]
  );

  const recommendedEvents = useMemo(() =>
    events.filter(event =>
      !event.isPromoted &&
      event.city === userCity &&
      userInterests.includes(event.genre)
    ),
    [events, userCity, userInterests]
  );
  
  const recommendedEventIds = useMemo(() => new Set(recommendedEvents.map(e => e.id)), [recommendedEvents]);

  const filteredEvents = useMemo(() => {
    let processedEvents = events
      .filter(event => !event.isPromoted)
      .filter(event => !recommendedEventIds.has(event.id));

    if (activeFilter === 'Near Me') {
      if (locationStatus === 'success' && userLocation) {
        const NEARBY_RADIUS_KM = 10;
        processedEvents = processedEvents.filter(event => {
          const distance = getDistance(
            userLocation.latitude,
            userLocation.longitude,
            event.latitude,
            event.longitude
          );
          return distance <= NEARBY_RADIUS_KM;
        });
      } else {
        return [];
      }
    } else {
      processedEvents = processedEvents.filter(event => event.city === userCity);
    }

    processedEvents = processedEvents.filter(event => {
      if (activeGenre === 'All') return true;
      return event.genre === activeGenre;
    });

    if (activeFilter !== 'Near Me') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
      const endOfNextWeek = new Date(endOfWeek);
      endOfNextWeek.setDate(endOfWeek.getDate() + 7);

      processedEvents = processedEvents.filter(event => {
        if (activeFilter === 'All') return true;
        const eventDate = new Date(event.date);
        if (activeFilter === 'Today') {
          return eventDate.toDateString() === today.toDateString();
        }
        if (activeFilter === 'This Weekend') {
          return eventDate >= today && eventDate <= endOfWeek;
        }
        if (activeFilter === 'Next Week') {
          return eventDate > endOfWeek && eventDate <= endOfNextWeek;
        }
        return true;
      });
    }

    return processedEvents;
  }, [events, userCity, activeFilter, activeGenre, recommendedEventIds, userLocation, locationStatus]);
  
  const renderContent = () => {
      if (activeFilter === 'Near Me') {
          if (locationStatus === 'error') {
              return (
                  <div className="text-center py-20">
                      <p className="text-lg text-medium-text">Could not get your location.</p>
                      <p className="text-sm text-gray-500">Please enable location services and try again.</p>
                  </div>
              );
          }
          // Don't render anything else for "Near Me" until location is successful
          if (locationStatus !== 'success') {
              return null;
          }
      }

      if (filteredEvents.length > 0) {
          return filteredEvents.map(event => (
              <EventCard
                  key={event.id}
                  event={event}
                  isSaved={savedEventIds.includes(event.id)}
                  onViewDetails={onViewDetails}
                  onSave={onSaveEvent}
              />
          ));
      }
      
      return (
          <div className="text-center py-20">
              <p className="text-lg text-medium-text">No events found for your selection.</p>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
      );
  }

  const shouldShowLocationOverlay = activeFilter === 'Near Me' && locationStatus === 'loading';

  return (
    <div className="pb-24">
      {shouldShowLocationOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative flex items-center justify-center w-32 h-32 mb-4">
                <div className="absolute w-full h-full rounded-full bg-brand-green/20 animate-ping opacity-75"></div>
                <div className="absolute w-2/3 h-2/3 rounded-full bg-brand-green/30 animate-ping opacity-75" style={{ animationDelay: '0.2s' }}></div>
                <Icon name="location" className="w-16 h-16 text-brand-green relative" />
            </div>
            <h2 className="text-2xl font-bold text-light-text mt-4">Finding events near you...</h2>
            <p className="text-medium-text mt-2 max-w-sm">Please allow location access when prompted by your browser.</p>
        </div>
      )}
      <div className="p-4 sticky top-0 bg-indigo-950/75 backdrop-blur-sm z-10 flex items-center space-x-4">
        <Logo className="h-8 w-auto flex-shrink-0" />
        <h1 className="text-2xl md:text-3xl font-bold text-light-text truncate">Events in <span className="text-brand-green">{activeFilter === 'Near Me' ? 'Your Area' : userCity}</span></h1>
      </div>
      
       {promotedEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-light-text mb-3 px-4">Featured Events</h2>
          <div className="overflow-x-auto pb-4 scrollbar-hide" style={{'WebkitOverflowScrolling': 'touch', 'scrollbarWidth': 'none'}}>
            <div className="flex space-x-4 px-4">
              {promotedEvents.map(event => (
                <div key={event.id} className="flex-shrink-0 w-80">
                  <EventCard 
                    event={event} 
                    isSaved={savedEventIds.includes(event.id)} 
                    onViewDetails={onViewDetails} 
                    onSave={onSaveEvent} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {recommendedEvents.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-light-text mb-3 px-4">For You</h2>
          <div className="overflow-x-auto pb-4 scrollbar-hide" style={{'WebkitOverflowScrolling': 'touch', 'scrollbarWidth': 'none'}}>
            <div className="flex space-x-4 px-4">
              {recommendedEvents.map(event => (
                <div key={event.id} className="flex-shrink-0 w-80">
                  <EventCard
                    event={event}
                    isSaved={savedEventIds.includes(event.id)}
                    onViewDetails={onViewDetails}
                    onSave={onSaveEvent}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            {FILTERS.map(filter => (
                <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeFilter === filter ? 'bg-brand-green text-black' : 'bg-card-bg text-light-text'
                }`}
                >
                {filter}
                </button>
            ))}
            </div>
            <div className="flex space-x-2 overflow-x-auto pt-3 pb-4">
                <button
                    onClick={() => setActiveGenre('All')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                        activeGenre === 'All' ? 'bg-brand-orange text-black' : 'bg-card-bg text-light-text'
                    }`}
                >
                    All Genres
                </button>
            {GENRES.map(genre => (
                <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeGenre === genre ? 'bg-brand-orange text-black' : 'bg-card-bg text-light-text'
                }`}
                >
                {genre}
                </button>
            ))}
            </div>
      </div>
      
      <div className="px-4 space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};
