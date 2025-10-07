import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sherehe Logo"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#39FF14' }} />
          <stop offset="100%" style={{ stopColor: '#FF7A00' }} />
        </linearGradient>
      </defs>
      {/* Outline of the location pin */}
      <path
        d="M12 21.35C7.5 16.85 5 12.35 5 9.5C5 5.36 8.36 2 12 2C15.64 2 19 5.36 19 9.5C19 12.35 16.5 16.85 12 21.35Z"
        stroke="url(#logoGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gradient-filled star */}
      <path
        d="M12 5.5 L13.5 8.5 L17 8.5 L14.5 10.5 L15.5 13.5 L12 11.5 L8.5 13.5 L9.5 10.5 L7 8.5 L10.5 8.5 Z"
        fill="url(#logoGradient)"
      />
    </svg>
  );
};