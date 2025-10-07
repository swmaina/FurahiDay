import React, { useState, useMemo } from 'react';
import { Event, City } from '../types';
import { EventCard } from './EventCard';
import { Icon } from './Icon';
import { CITIES } from '../constants';
import { Logo } from './Logo';
import { GoogleGenAI, Type } from '@google/genai';

type SearchScreenProps = {
  events: Event[];
  savedEventIds: number[];
  onViewDetails: (event: Event) => void;
  onSaveEvent: (eventId: number) => void;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ events, savedEventIds, onViewDetails, onSaveEvent }) => {
  // State for keyword search
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | 'All'>('All');
  
  // State for AI search
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearchResults, setAiSearchResults] = useState<Event[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;

    setIsAiSearching(true);
    setAiSearchResults(null);
    setAiError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const eventsForPrompt = events.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        genre: e.genre,
        city: e.city,
        venue: e.venue,
        date: e.date.toISOString().split('T')[0], // Just date part
        cost: e.cost,
        isPromoted: e.isPromoted,
      }));

      const prompt = `You are an expert event discovery agent for an app called Sherehe.
      Based on the user's request, find the most relevant events from the list provided below.
      The current date is ${new Date().toISOString().split('T')[0]}.

      User Request: "${aiQuery}"

      Available Events:
      ${JSON.stringify(eventsForPrompt)}

      Your task is to return a JSON object with a single key "eventIds" which is an array of numbers representing the IDs of the matching events.
      The events should be sorted by relevance to the user's request.
      If no events are a good match, return an empty array for "eventIds".
      Only return the JSON object. Do not add any other text or explanation.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              eventIds: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
              }
            },
            required: ['eventIds']
          }
        }
      });

      const resultJson = JSON.parse(response.text);
      const resultIds = resultJson.eventIds || [];
      
      const foundEvents = events.filter(e => resultIds.includes(e.id));
      foundEvents.sort((a, b) => resultIds.indexOf(a.id) - resultIds.indexOf(b.id));

      setAiSearchResults(foundEvents);

    } catch (error) {
      console.error("AI search failed:", error);
      setAiError("Sorry, something went wrong with the AI search. Please try again.");
    } finally {
      setIsAiSearching(false);
    }
  };


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
    <div className="pb-24">
      <div className="p-4 sticky top-0 bg-indigo-950/75 backdrop-blur-sm z-10 flex items-center space-x-4">
        <Logo className="h-8 w-auto flex-shrink-0" />
        <h1 className="text-2xl md:text-3xl font-bold text-light-text truncate">Search Events</h1>
      </div>
      <div className="p-4">
        {/* Vibe Check section */}
        <div className="bg-card-bg p-4 rounded-2xl mb-6">
            <h2 className="text-xl font-bold text-light-text mb-3 flex items-center">
                <Icon name="sparkles" className="w-6 h-6 mr-2 text-brand-orange" />
                Vibe Check
            </h2>
            <p className="text-medium-text mb-4">
                Describe the kind of event you're looking for, and our AI will find the perfect match.
                e.g., "A chill outdoor concert for this weekend"
            </p>
            <textarea
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="I'm looking for..."
                className="w-full bg-dark-bg text-light-text placeholder-medium-text rounded-xl py-3 px-4 border-2 border-transparent focus:border-brand-orange focus:outline-none mb-4 h-24 resize-none"
            />
            <button
                onClick={handleAiSearch}
                disabled={isAiSearching}
                className="w-full flex items-center justify-center bg-brand-orange text-black font-bold py-3 px-4 rounded-xl text-lg transition-transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isAiSearching ? 'Thinking...' : 'Find Events'}
            </button>
        </div>

        {/* AI Results */}
        {isAiSearching && (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto"></div>
                <p className="text-medium-text mt-4">Our AI is on the hunt...</p>
            </div>
        )}
        {aiError && (
            <div className="text-center py-10 text-red-400 bg-red-900/20 rounded-lg">
                <p>{aiError}</p>
            </div>
        )}
        {aiSearchResults && (
            <div className="mb-6">
                <h3 className="text-lg font-bold text-light-text mb-4">AI Suggestions:</h3>
                {aiSearchResults.length > 0 ? (
                    <div className="space-y-6">
                        {aiSearchResults.map(event => (
                            <EventCard key={event.id} event={event} isSaved={savedEventIds.includes(event.id)} onViewDetails={onViewDetails} onSave={onSaveEvent} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-card-bg rounded-lg">
                        <p className="text-lg text-medium-text">Our AI couldn't find a match.</p>
                        <p className="text-sm text-gray-500">Try rephrasing your request or use the keyword search below.</p>
                    </div>
                )}
            </div>
        )}

        {/* Divider */}
        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-600"></div>
            <span className="flex-shrink mx-4 text-medium-text uppercase text-sm font-semibold">Or</span>
            <div className="flex-grow border-t border-gray-600"></div>
        </div>

        {/* Keyword Search */}
        <h2 className="text-xl font-bold text-light-text mb-3">Keyword Search</h2>
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

          {!query.trim() && !aiSearchResults && !isAiSearching && (
              <div className="text-center py-20">
                  <div className="w-20 h-20 bg-card-bg rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="search" className="w-10 h-10 text-medium-text" />
                  </div>
                  <p className="text-lg font-semibold text-light-text">Find your next event</p>
                  <p className="text-medium-text">Use the Vibe Check or keyword search to begin.</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};