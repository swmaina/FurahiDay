
import React, { useState, useMemo } from 'react';
import { Event, City } from '../types';
import { EventCard } from './EventCard';
import { Icon } from './Icon';
import { CITIES } from '../constants';

type SearchScreenProps = {
  events: Event[];
  savedEventIds: number[];
  onViewDetails: (event: Event) => void;
  onSaveEvent: (eventId: number) => void;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ events, savedEventIds, onViewDetails, onSaveEvent }) => {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    const lowercasedQuery = query.toLowerCase();
    return events
      .filter(event => {
        if (selectedCity === 'All') return true;
        return event.city === selectedCity;
      })
      .filter(event => 
        event.title.toLowerCase().includes(lowercasedQuery) ||
        event.venue.toLowerCase().includes(lowercasedQuery) ||
        event.description.toLowerCase().includes(lowercasedQuery)
      )
      .sort((a, b) => (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0)); // Prioritize promoted events
  }, [events, query, selectedCity]);

  const allCitiesOption: (City | 'All')[] = ['All', ...CITIES.map(c => c.name)];

  return (
    <div className="p-4 pb-24">
      <h1 className="text-3xl font-bold text-light-text mb-4">Search Events</h1>
      <div className="relative mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by event, venue, or keyword..."
          className="w-full bg-card-bg text-light-text placeholder-medium-text rounded-xl py-3 pl-10 pr-4 border-2 border-transparent focus:border-brand-green focus:outline-none"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-text">
            <Icon name="search" className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
            {allCitiesOption.map(city => (
                <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                    selectedCity === city ? 'bg-brand-green text-black' : 'bg-card-bg text-light-text'
                }`}
                >
                {city === 'All' ? 'All Cities' : city}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {query.trim() && searchResults.length > 0 && (
          searchResults.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isSaved={savedEventIds.includes(event.id)}
              onViewDetails={onViewDetails}
              onSave={onSaveEvent}
            />
          ))
        )}
        
        {query.trim() && searchResults.length === 0 && (
            <div className="text-center py-20">
                <p className="text-lg text-medium-text">No results found for "{query}"</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or search term.</p>
            </div>
        )}

        {!query.trim() && (
             <div className="text-center py-20">
                <div className="w-20 h-20 bg-card-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="search" className="w-10 h-10 text-medium-text" />
                </div>
                <p className="text-lg font-semibold text-light-text">Find your next event</p>
                <p className="text-medium-text">Search for concerts, festivals, and more.</p>
            </div>
        )}
      </div>
    </div>
  );
};
