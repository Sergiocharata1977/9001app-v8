import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({
  variant = 'light',
  size = 'md',
  showText = true,
  className = '',
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} relative flex items-center justify-center bg-blue-600 rounded-lg`}
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={`font-bold ${variant === 'light' ? 'text-white' : 'text-gray-900'} ${textSizeClasses[size]}`}
          >
            ISO 9001
          </span>
          <span
            className={`text-xs ${variant === 'light' ? 'text-slate-300' : 'text-gray-500'} hidden sm:block`}
          >
            Quality Management
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;
