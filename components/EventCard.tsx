import React from 'react';
import { Event } from '../types';
import { Icon } from './Icon';

type EventCardProps = {
  event: Event;
  isSaved: boolean;
  onViewDetails: (event: Event) => void;
  onSave: (eventId: number) => void;
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const EventCard: React.FC<EventCardProps> = ({ event, isSaved, onViewDetails, onSave }) => {
  return (
    <div className="bg-card-bg rounded-2xl overflow-hidden shadow-lg w-full transform transition-transform hover:scale-[1.02]">
      <div className="relative cursor-pointer" onClick={() => onViewDetails(event)}>
        {event.isPromoted && (
            <div className="absolute top-3 left-3 bg-brand-orange text-black text-xs font-bold px-2 py-1 rounded-md z-10">
                PROMOTED
            </div>
        )}
        <img className="w-full h-64 object-cover" src={event.flyerImageUrl} alt={event.title} />
        <div 
          className="absolute top-3 right-3 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); onSave(event.id); }}
        >
          <svg className={`w-6 h-6 ${isSaved ? 'text-brand-orange' : 'text-white'}`} xmlns="http://www.w3.org/2000/svg" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg text-light-text mb-1 truncate pr-2 cursor-pointer" onClick={() => onViewDetails(event)}>{event.title}</h3>
            <span className="flex-shrink-0 text-sm font-semibold bg-brand-green text-black px-2 py-1 rounded-md">{event.cost}</span>
        </div>
        <p className="text-medium-text text-sm mb-3">{formatDate(event.date)} &bull; {event.venue}</p>
        <div className="flex space-x-2">
            <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex-1 flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <Icon name="location" className="w-5 h-5 mr-2" />
                <span>Directions</span>
            </a>
        </div>
      </div>
    </div>
  );
};