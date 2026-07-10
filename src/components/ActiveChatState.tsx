import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { Message } from './MessageBubble';
import Icon from './Icon';

interface ActiveChatStateProps {
  messages: Message[];
  isThinking: boolean;
}

const ActiveChatState: React.FC<ActiveChatStateProps> = ({ messages, isThinking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrolledUp = useRef(false);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // User is considered scrolled up if they are more than 50px away from the bottom
    isScrolledUp.current = scrollHeight - scrollTop - clientHeight > 50;
  };

  useEffect(() => {
    if (containerRef.current && !isScrolledUp.current) {
      // Smooth scroll behavior might interfere with rapid message updates, so we use auto or smooth based on preference
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isThinking]);

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-md custom-scrollbar flex flex-col gap-lg bg-surface"
    >
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {isThinking && (
        <div className="flex items-start gap-md">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0">
            <Icon name="psychology" className="text-primary w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col gap-sm flex-grow">
            <div className="flex gap-1 items-center h-6">
              <div className="dot w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="dot w-1.5 h-1.5 bg-primary rounded-full"></div>
              <div className="dot w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span className="ml-2 font-label-sm text-label-sm text-on-surface-variant italic">Assistant is thinking...</span>
            </div>
            
            <div className="mt-md bg-surface-container rounded-lg p-md border border-outline-variant/30 flex flex-col gap-sm relative overflow-hidden">
              <div className="absolute inset-0 shimmer opacity-10 pointer-events-none"></div>
              <h4 className="font-label-sm text-label-sm text-outline uppercase tracking-widest mb-xs">Execution Timeline</h4>
              
              <div className="flex items-center gap-md">
                <div className="w-5 h-5 flex items-center justify-center text-primary">
                  <Icon name="check_circle" className="w-[18px] h-[18px] fill-current" />
                </div>
                <span className="font-label-md text-label-md text-on-surface">Processing request...</span>
              </div>
              
              <div className="flex items-center gap-md">
                <div className="w-5 h-5 flex items-center justify-center text-primary-container timeline-pulsate">
                  <Icon name="radio_button_checked" className="w-[18px] h-[18px] fill-current" />
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-label-md text-label-md text-primary font-bold">Analyzing product details</span>
                  <div className="w-full h-1 bg-surface-container-high rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary-container w-[65%] rounded-full"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveChatState;
