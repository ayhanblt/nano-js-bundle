import React, { useState } from 'react';
import Icon from './Icon';
import { t } from '../i18n';

interface ErrorStateProps {
  onRetry: () => void;
  onClose: () => void;
  errorCode?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry, onClose, errorCode = 'CON-404' }) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    // Simulate network delay for UX
    setTimeout(() => {
      onRetry();
      setIsRetrying(false);
    }, 800);
  };

  return (
    <div className="absolute inset-0 z-50 bg-surface flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="bg-surface-container-low px-lg py-md flex justify-between items-center border-b border-outline-variant shrink-0">
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-primary-fixed-dim flex items-center justify-center">
            <Icon name="main_logo" className="text-primary w-[18px] h-[18px] fill-current" />
          </div>
          <span className="font-label-md text-label-md text-on-surface font-semibold">{t('ai.assistant')}</span>
        </div>
        <button
          onClick={onClose}
          className="text-on-surface-variant hover:bg-surface-container-high p-xs rounded-full transition-colors cursor-pointer active:scale-95"
        >
          <Icon name="close" className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-lg flex flex-col items-center justify-center text-center">
        <div className="mb-md relative">
          <div className="absolute inset-0 bg-error opacity-10 rounded-full scale-150 animate-pulse"></div>
          <Icon name="cloud_off" className="w-16 h-16 text-error fill-current relative z-10" />
        </div>
        
        <h3 className="font-title-lg text-title-lg text-on-surface mb-sm mt-md">
          {t('err.unavailable')}
        </h3>
        
        <p className="text-body-md text-on-surface-variant px-sm leading-relaxed mb-xl max-w-[280px]">
          {t('err.network')}
        </p>

        {/* Actions */}
        <div className="w-full flex flex-col gap-sm">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-primary-container text-on-primary py-md px-lg rounded-lg font-label-md text-label-md font-semibold hover:bg-[#316bf3] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-sm disabled:opacity-80"
          >
            <Icon name="refresh" className={`w-[18px] h-[18px] fill-current ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? t('btn.attempting') : t('btn.retry')}</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-outline-variant bg-transparent text-on-surface-variant py-md px-lg rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-all cursor-pointer active:scale-95"
          >
            {t('btn.close')}
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
