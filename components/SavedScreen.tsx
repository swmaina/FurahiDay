import React from 'react';
import { Event } from '../types';
import { Icon } from './Icon';

type SavedScreenProps = {
    savedEvents: Event[];
    onViewDetails: (event: Event) => void;
};

const SavedEventItem: React.FC<{ event: Event, onViewDetails: (event: Event) => void }> = ({ event, onViewDetails }) => (
    <div 
        onClick={() => onViewDetails(event)}
        className="flex items-center space-x-4 bg-card-bg p-3 rounded-xl cursor-pointer transition-transform hover:scale-[1.02]"
    >
        <img src={event.flyerImageUrl} alt={event.title} className="w-20 h-24 object-cover rounded-lg" />
        <div className="flex-1">
            <p className="text-sm text-brand-orange font-semibold">{event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            <h3 className="font-bold text-light-text">{event.title}</h3>
            <p className="text-sm text-medium-text">{event.venue}</p>
        </div>
    </div>
);

export const SavedScreen: React.FC<SavedScreenProps> = ({ savedEvents, onViewDetails }) => {
    
    const formatICSDate = (date: Date, hours: number, minutes: number): string => {
        const eventDate = new Date(date);
        // Assuming event times are in local time, converting to UTC for the ICS file
        eventDate.setHours(hours, minutes, 0, 0); 
        
        const pad = (num: number) => num.toString().padStart(2, '0');

        return [
            eventDate.getUTCFullYear(),
            pad(eventDate.getUTCMonth() + 1),
            pad(eventDate.getUTCDate()),
            'T',
            pad(eventDate.getUTCHours()),
            pad(eventDate.getUTCMinutes()),
            pad(eventDate.getUTCSeconds()),
            'Z'
        ].join('');
    };
    
    const handleExportToCalendar = () => {
        if (savedEvents.length === 0) return;

        const icsEvents = savedEvents.map(event => {
            // Assuming events start at 7 PM and end at 11 PM as per mock data
            const dtstart = formatICSDate(event.date, 19, 0); 
            const dtend = formatICSDate(event.date, 23, 0);
            const dtstamp = formatICSDate(new Date(), new Date().getHours(), new Date().getMinutes());

            return [
                'BEGIN:VEVENT',
                `UID:${event.id}@furahiday.app`,
                `DTSTAMP:${dtstamp}`,
                `DTSTART:${dtstart}`,
                `DTEND:${dtend}`,
                `SUMMARY:${event.title}`,
                `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
                `LOCATION:${event.venue}`,
                'END:VEVENT'
            ].join('\r\n');
        }).join('\r\n');

        const icsFileContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//FurahiDay//Event Planner//EN',
            icsEvents,
            'END:VCALENDAR'
        ].join('\r\n');
        
        const blob = new Blob([icsFileContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'furahiday_events.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-4 pb-24">
            <h1 className="text-3xl font-bold text-light-text mb-2">My Weekend Planner</h1>
            <p className="text-medium-text mb-6">Your saved events for the upcoming days.</p>

            {savedEvents.length > 0 ? (
                <div className="space-y-4">
                    <button 
                        onClick={handleExportToCalendar}
                        className="w-full flex items-center justify-center bg-brand-green text-black font-bold py-3 px-4 rounded-xl text-lg transition-transform hover:scale-105"
                    >
                        <Icon name="calendar" className="w-6 h-6 mr-2" />
                        <span>Export to Calendar</span>
                    </button>
                    {savedEvents
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map(event => (
                            <SavedEventItem key={event.id} event={event} onViewDetails={onViewDetails} />
                        ))
                    }
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-20 h-20 bg-card-bg rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="saved" className="w-10 h-10 text-medium-text" />
                    </div>
                    <p className="text-lg font-semibold text-light-text">No saved events yet.</p>
                    <p className="text-medium-text">Tap the save icon on an event to add it here.</p>
                </div>
            )}
        </div>
    );
};