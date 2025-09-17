import React, { useState, useMemo } from 'react';
import { Event, Genre, City } from '../types';
import { EventCard } from './EventCard';

type HomeScreenProps = {
  events: Event[];
  savedEventIds: number[];
  userCity: City;
  userInterests: Genre[];
  onViewDetails: (event: Event) => void;
  onSaveEvent: (eventId: number) => void;
};

const FILTERS = ['Today', 'This Weekend', 'Next Week', 'All'];
const GENRES: Genre[] = [Genre.Mugithi, Genre.HipHop, Genre.LiveBand, Genre.Outdoor, Genre.WineBeer];

export const HomeScreen: React.FC<HomeScreenProps> = ({ events, savedEventIds, userCity, userInterests, onViewDetails, onSaveEvent }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeGenre, setActiveGenre] = useState<Genre | 'All'>('All');

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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfWeek.getDate() + 7);

    return events
      .filter(event => !event.isPromoted) // Exclude promoted from main list
      .filter(event => !recommendedEventIds.has(event.id)) // Exclude recommended events from main list
      .filter(event => event.city === userCity)
      .filter(event => {
        if (activeGenre === 'All') return true;
        return event.genre === activeGenre;
      })
      .filter(event => {
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
  }, [events, userCity, activeFilter, activeGenre, recommendedEventIds]);

  return (
    <div className="pb-24">
      <div className="p-4 sticky top-0 bg-indigo-950/75 backdrop-blur-sm z-10">
        <h1 className="text-3xl font-bold text-light-text">Events in <span className="text-brand-green">{userCity}</span></h1>
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
          <h2 className="text-xl font-bold text-light-text mb-3 px-4">Recommended for you</h2>
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
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isSaved={savedEventIds.includes(event.id)}
              onViewDetails={onViewDetails}
              onSave={onSaveEvent}
            />
          ))
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-medium-text">No events found for your selection.</p>
            <p className="text-sm text-gray-500">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};