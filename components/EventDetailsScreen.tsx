import React, { useState } from 'react';
import { Event } from '../types';
import { Icon } from './Icon';

type EventDetailsScreenProps = {
  event: Event;
  isSaved: boolean;
  onBack: () => void;
  onSave: (eventId: number) => void;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const EventDetailsScreen: React.FC<EventDetailsScreenProps> = ({ event, isSaved, onBack, onSave }) => {
  const [shareFeedback, setShareFeedback] = useState('');

  const handleShare = async () => {
    const eventUrl = `https://furahiday.app/event/${event.id}`;
    // Unified and detailed share text for both Web Share and clipboard
    const shareContent = `${event.title}\n\n${event.description}\n\nFind out more: ${eventUrl}`;

    const shareData = {
      title: event.title,
      text: shareContent,
      url: eventUrl,
    };
    
    let feedbackMessage = '';

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        feedbackMessage = 'Shared!';
      } catch (err) {
        // Ignore if user cancels the share sheet
        if ((err as Error).name !== 'AbortError') {
          console.error("Couldn't share content", err);
          feedbackMessage = 'Share failed.';
        }
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareContent);
        feedbackMessage = 'Copied!';
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        feedbackMessage = 'Copy failed.';
        // Final fallback if clipboard fails as well
        alert(`Could not copy automatically. Please copy the text below:\n\n${shareContent}`);
      }
    }

    if (feedbackMessage) {
        setShareFeedback(feedbackMessage);
        setTimeout(() => setShareFeedback(''), 2500); // Reset feedback after 2.5 seconds
    }
  };

  const isSuccess = shareFeedback === 'Shared!' || shareFeedback === 'Copied!';
  const isFailure = shareFeedback.includes('failed');

  return (
    <div className="pb-24">
      <div className="relative">
        <img className="w-full h-80 object-cover" src={event.flyerImageUrl} alt={event.title} />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-dark-bg to-transparent"></div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black bg-opacity-50 text-white rounded-full p-2"
        >
          <Icon name="back" className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 -mt-16 relative z-10">
        <div className="bg-card-bg p-4 rounded-2xl">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-light-text">{event.title}</h1>
                <span className="text-lg font-bold text-brand-green bg-gray-800 px-3 py-1 rounded-lg">{event.cost}</span>
            </div>
            <div className="flex items-center text-medium-text space-x-2 mb-4">
                <span className="bg-brand-orange text-black text-xs font-bold px-2 py-1 rounded">{event.genre}</span>
                <span>&bull;</span>
                <span>{event.city}</span>
            </div>
        </div>

        <div className="my-4 space-y-4 text-light-text">
            <div className="flex items-center space-x-3">
                <Icon name="calendar" className="w-6 h-6 text-brand-green"/>
                <div>
                    <p className="font-semibold">{formatDate(event.date)}</p>
                    <p className="text-sm text-medium-text">Tuesday, 7:00 PM - 11:00 PM</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <Icon name="location" className="w-6 h-6 text-brand-green"/>
                <div>
                    <p className="font-semibold">{event.venue}</p>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-orange hover:underline">View on map</a>
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-lg font-bold text-light-text mb-2">About this event</h2>
            <p className="text-medium-text leading-relaxed">
                {event.description}
            </p>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={() => onSave(event.id)}
            className={`flex-1 flex items-center justify-center font-semibold py-3 px-4 rounded-xl transition-colors ${
              isSaved ? 'bg-brand-orange text-black' : 'bg-gray-700 text-white'
            }`}
          >
            <Icon name="saved" className="w-5 h-5 mr-2" />
            <span>{isSaved ? 'Saved' : 'Save Event'}</span>
          </button>
          <button
            onClick={handleShare}
            className={`flex-1 flex items-center justify-center font-semibold py-3 px-4 rounded-xl transition-colors ${
              isSuccess ? 'bg-brand-green text-black' :
              isFailure ? 'bg-red-600 text-white' :
              'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            disabled={!!shareFeedback}
          >
            {shareFeedback ? (
                <>
                    {isSuccess && <Icon name="check" className="w-5 h-5 mr-2" />}
                    <span>{shareFeedback}</span>
                </>
            ) : (
                <>
                    <Icon name="share" className="w-5 h-5 mr-2" />
                    <span>Share</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};