import React, { useEffect, useState } from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionClick }) => {
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

  const suggestions = [
    "Does this support Wi-Fi 6?",
    "What's the warranty?",
    "Is it energy efficient?"
  ];

  return (
    <div className="flex-1 p-lg flex flex-col items-center justify-center text-center bg-[#fdfaff] overflow-y-auto">
      <div 
        className="mb-lg opacity-20"
        style={{ transform: `translateY(${offsetY}px) scale(1.5)` }}
      >
        <Icon name="forum" className="w-20 h-20 fill-primary" />
      </div>
      <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Ask anything about this product</h3>
      <p className="text-body-md text-on-surface-variant px-md leading-relaxed">
        The assistant understands the current page and can point you directly to the relevant information.
      </p>
      
      <div className="mt-xl w-full flex flex-wrap justify-center gap-sm">
        {suggestions.map((sug, idx) => (
          <button 
            key={idx}
            onClick={() => onSuggestionClick(sug)}
            className="bg-white border border-outline-variant hover:border-primary-container hover:text-primary px-md py-sm rounded-full text-label-sm font-label-sm transition-all shadow-sm cursor-pointer"
          >
            {sug}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;
