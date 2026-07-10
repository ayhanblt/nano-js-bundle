import React, { useState } from 'react';
import Icon from './Icon';
import { t } from '../i18n';

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



  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragged, setDragged] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    
    if (Math.abs(x - startX) > 5) {
      setDragged(true);
    }
    
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0 && !e.shiftKey) {
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  const handleSuggestionClick = (sug: string, e: React.MouseEvent) => {
    if (dragged) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (!disabled) {
      onSendMessage(sug);
    }
  };

  return (
    <div className="p-md bg-surface-container-lowest border-t border-outline-variant">
      {suggestions.length > 0 && (
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-sm mb-sm overflow-x-auto scrollbar-hide pb-xs px-md select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={(e) => handleSuggestionClick(sug, e)}
              className="flex-none w-[calc(85%)] sm:w-[calc(65%)] md:w-[calc(50%-4px)] p-sm bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-xl text-left transition-colors border border-outline-variant/30 shadow-sm active:scale-95"
            >
              <span className="text-center line-clamp-2 font-label-md text-label-md leading-snug pointer-events-none">{sug}</span>
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
          className="w-full h-10 pl-md pr-12 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-body-md placeholder:text-label-md placeholder:text-on-surface-variant/70 disabled:opacity-50"
          placeholder={t('input.placeholder')}
        />
        <button
          type="submit"
          disabled={!value.trim() || disabled}
          className="absolute right-sm w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Icon name="send" className="w-5 h-5 fill-white" />
        </button>
      </form>
      <div className="flex justify-end mt-sm">
        <p className="font-label-sm text-label-sm text-on-surface-variant/50">{t('footer.branding')}</p>
      </div>
    </div>
  );
};

export default WidgetInput;
