import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
  suggestions?: string[];
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick, suggestions = [] }) => {
  const [offsetY, setOffsetY] = useState(0);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Floating animation
  useEffect(() => {
    let angle = 0;
    let animationFrameId: number;

    const animate = () => {
      angle += 0.05;
      setOffsetY(Math.sin(angle) * 10);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      if (e.deltaY !== 0 && e.shiftKey) {
        // Native horizontal scroll
      }
    }
  };

  return (
    <div className="flex-1 p-lg flex flex-col items-center justify-center text-center bg-[#fdfaff] overflow-y-auto">
      <div 
        className="mb-lg opacity-20"
        style={{ transform: `translateY(${offsetY}px) scale(1.5)` }}
      >
        <Icon name="forum" className="w-20 h-20 fill-primary" />
      </div>
      <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Bana herhangi bir şey sor</h3>
      <p className="text-body-md text-on-surface-variant px-md leading-relaxed mb-xl">
        Bu sayfadaki ürünleri anlıyor ve size yardımcı olabiliyorum.
      </p>
      
      {suggestions.length > 0 && (
        <div 
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="w-full flex gap-sm overflow-x-auto scrollbar-hide snap-x snap-mandatory px-md -mx-md pb-xs"
        >
          {suggestions.map((sug, idx) => (
            <button 
              key={idx}
              onClick={() => onSuggestionClick(sug)}
              className="snap-start flex-none w-[calc(85%)] sm:w-[calc(65%)] md:w-[calc(50%-4px)] p-md bg-white border border-outline-variant hover:border-primary hover:text-primary rounded-xl text-left transition-colors shadow-sm cursor-pointer active:scale-95"
            >
              <span className="line-clamp-2 text-label-md font-label-md leading-snug">{sug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
