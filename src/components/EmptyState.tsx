import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { t } from '../i18n';

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
  suggestions?: string[];
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick, suggestions = [] }) => {
  const [offsetY, setOffsetY] = useState(0);
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

  return (
    <div className="flex-1 p-lg flex flex-col items-center justify-center text-center bg-[#f7f9ffff] overflow-y-auto">
      <div
        className="mb-lg mt-24 opacity-20"
        style={{ transform: `translateY(${offsetY}px) scale(1.5)` }}
      >
        <Icon name="smart_toy" className="w-24 h-24 text-primary fill-current" />
      </div>
      <h3 className="font-title-lg text-title-lg text-on-surface mb-sm">
        {t('welcome.title')}
      </h3>
      <p className="text-body-md text-on-surface-variant px-md leading-relaxed mb-xl">
        {t('welcome.desc')}
      </p>

      {suggestions.length > 0 && (
        <div className="w-full flex flex-col gap-sm px-md pb-xs">
          {suggestions.slice(0, 4).map((sug, idx) => (
            <button
              key={idx}
              onClick={() => onSuggestionClick(sug)}
              className="w-full p-md bg-white border border-outline-variant hover:border-primary hover:text-primary rounded-xl text-left transition-colors shadow-sm cursor-pointer active:scale-95"
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
