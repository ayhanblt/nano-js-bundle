import React from 'react';
import Icon from './Icon';

export interface MessageAction {
  label: string;
  icon: string;
  onClick: () => void;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  html?: string;
  confidence?: number;
  source?: string;
  actions?: MessageAction[];
  error?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAi = message.sender === 'ai';

  if (!isAi) {
    return (
      <div className="self-end max-w-[85%] bg-primary-container text-on-primary-container p-md rounded-xl rounded-tr-xs shadow-sm">
        <p className="font-body-md text-body-md">{message.text}</p>
      </div>
    );
  }

  return (
    <div className="self-start max-w-[90%] bg-[#fdfaff] p-md rounded-xl rounded-tl-xs shadow-sm border border-[#e8dfee]">
      {/* AI message content */}
      <div className="font-body-md text-body-md text-on-surface space-y-md">
        {message.html ? (
          <div dangerouslySetInnerHTML={{ __html: message.html }} />
        ) : (
          <p>{message.text}</p>
        )}
      </div>

      {/* Footer metadata if present */}
      {(message.confidence || message.source || (message.actions && message.actions.length > 0)) && (
        <div className="mt-lg pt-md border-t border-outline-variant flex flex-col gap-md">
          {(message.confidence || message.source) && (
            <div className="flex justify-between items-center text-on-surface-variant font-label-sm text-label-sm">
              {message.confidence && (
                <div className="flex items-center gap-xs">
                  <Icon name="query_stats" className="w-3.5 h-3.5 fill-current" />
                  <span>Confidence {message.confidence}%</span>
                </div>
              )}
              {message.source && (
                <span className="italic text-primary/80">Found in {message.source}</span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {message.actions && message.actions.length > 0 && (
            <div className="flex gap-sm">
              {message.actions.map((action, idx) => (
                <button 
                  key={idx}
                  onClick={action.onClick}
                  className={`flex-1 flex items-center justify-center gap-sm h-10 px-md rounded-lg font-label-md text-label-md transition-all active:scale-95 cursor-pointer ${
                    idx === 0 
                      ? "bg-primary text-on-primary hover:bg-primary/90" 
                      : "bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <Icon name={action.icon} className="w-[18px] h-[18px] fill-current" />
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
