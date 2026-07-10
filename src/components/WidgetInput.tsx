import React, { useState } from 'react';
import Icon from './Icon';

interface WidgetInputProps {
  onSendMessage: (msg: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

const WidgetInput: React.FC<WidgetInputProps> = ({ onSendMessage, disabled = false, suggestions = [] }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      onSendMessage(value);
      setValue('');
    }
  };

  const handleSuggestionClick = (sug: string) => {
    if (!disabled) {
      onSendMessage(sug);
    }
  };

  return (
    <div className="p-md bg-surface-container-lowest border-t border-outline-variant">
      {suggestions.length > 0 && (
        <div className="flex gap-sm mb-sm overflow-x-auto scrollbar-hide pb-xs">
          {suggestions.map((sug, idx) => (
            <button 
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="shrink-0 px-md py-sm bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-full font-label-sm text-label-sm transition-colors border border-outline-variant/30 cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="relative flex items-center shadow-sm">
        <input 
          type="text" 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled}
          className="w-full h-12 pl-md pr-12 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md disabled:opacity-50" 
          placeholder="Ask a follow-up question..." 
        />
        <button 
          type="submit"
          disabled={!value.trim() || disabled}
          className="absolute right-sm w-10 h-10 bg-primary text-on-primary rounded-lg flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Icon name="send" className="w-5 h-5 fill-white" />
        </button>
      </form>
      <div className="flex justify-center mt-sm">
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">Powered by SecureAI Pro</p>
      </div>
    </div>
  );
};

export default WidgetInput;
