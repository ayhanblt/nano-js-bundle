import React, { useState } from 'react';
import Icon from './Icon';

interface ErrorStateProps {
  onRetry: () => void;
  onClose: () => void;
  errorCode?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, onClose, errorCode = 'CON-404' }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate retry delay
    setTimeout(() => {
      onRetry();
      setIsRetrying(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Top Bar */}
      <div className="bg-surface-container-low px-lg py-md flex justify-between items-center border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center">
            <Icon name="smart_toy" className="text-primary w-[18px] h-[18px] fill-current" />
          </div>
          <span className="font-label-md text-label-md text-on-surface font-semibold">AI Assistant</span>
        </div>
        <button 
          onClick={onClose}
          className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded-full transition-colors cursor-pointer active:scale-95"
        >
          <Icon name="close" className="w-5 h-5 fill-current" />
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-lg flex flex-col items-center justify-center text-center">
        <div className="mb-md relative">
          <div className={`w-16 h-16 rounded-full bg-error-container flex items-center justify-center ${!isRetrying ? 'animate-pulse' : ''}`}>
            <Icon name="cloud_off" className="text-error w-8 h-8 fill-current" />
          </div>
        </div>
        <h2 className="font-headline-md text-headline-md mb-sm text-on-surface">Something went wrong</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
          I'm having trouble connecting right now. Please check your internet or try again in a moment.
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col gap-sm">
          <button 
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-primary-container text-on-primary py-md px-lg rounded-lg font-label-md text-label-md font-semibold hover:bg-[#6d28d9] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-sm disabled:opacity-80"
          >
            <Icon name="refresh" className={`w-[18px] h-[18px] fill-current ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Attempting...' : 'Retry connection'}</span>
          </button>
          <button 
            onClick={onClose}
            className="w-full border border-outline-variant bg-transparent text-on-surface-variant py-md px-lg rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-95"
          >
            Close for now
          </button>
        </div>
      </div>

      {/* Subtle Status Footer */}
      <div className="bg-surface-container-lowest px-lg py-sm border-t border-outline-variant/30 flex justify-center shrink-0">
        <span className="font-label-sm text-label-sm text-on-surface-variant/50">Error Code: {errorCode}</span>
      </div>
    </div>
  );
};

export default ErrorState;
