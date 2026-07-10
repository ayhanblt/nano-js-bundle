import React, { useState } from 'react';
import Icon from './Icon';

interface WidgetInputProps {
  onSendMessage: (msg: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

const WidgetInput: React.FC<WidgetInputProps> = ({ onSendMessage, disabled = false, suggestions = [] }) => {
  const [value, setValue] = useState('');
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0 && e.shiftKey) {
        // Horizontal scroll via Shift + Wheel is natively handled by the browser in most OS,
        // but we can enforce it if needed. However native is best.
      } else if (e.deltaY !== 0 && !e.shiftKey) {
        // If they just scroll vertically over the chips, maybe we translate it to horizontal?
        // Actually, just let native behavior handle Shift+Wheel and trackpad swipes.
      }
    }
  };

  return (
    <div className="p-md bg-surface-container-lowest border-t border-outline-variant">
      {suggestions.length > 0 && (
        <div 
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex gap-sm mb-sm overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-xs -mx-md px-md"
        >
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(sug)}
              className="snap-start flex-none w-[calc(85%)] sm:w-[calc(65%)] md:w-[calc(50%-4px)] p-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl text-left transition-colors border border-outline-variant/30 cursor-pointer shadow-sm active:scale-95"
            >
              <span className="line-clamp-2 font-label-md text-label-md leading-snug">{sug}</span>
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
          className="w-full h-12 pl-md pr-12 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md placeholder:text-label-md placeholder:text-on-surface-variant/70 disabled:opacity-50"
          placeholder="Asistan'a soru sorun..."
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
        <p className="font-label-sm text-label-sm text-on-surface-variant/50">Nano AI Assistant</p>
      </div>
    </div>
  );
};

export default WidgetInput;
