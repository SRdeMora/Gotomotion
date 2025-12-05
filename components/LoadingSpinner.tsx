import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`animate-spin rounded-full border-t-2 border-b-2 border-secondary ${sizeClasses[size]}`} role="status" aria-label="Cargando">
        <span className="sr-only">Cargando...</span>
      </div>
      {text && <p className="text-gray-400">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

