import React, { useState } from 'react';
import WidgetHeader from './WidgetHeader';
import WidgetInput from './WidgetInput';
import EmptyState from './EmptyState';
import ActiveChatState from './ActiveChatState';
import ErrorState from './ErrorState';
import { useChat } from '../context/ChatContext';
import Icon from './Icon';

const WidgetShell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isThinking, error, suggestions, setError, sendMessage } = useChat();

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <div className="fixed bottom-0 right-0 md:bottom-lg md:right-lg z-50 flex flex-col items-end gap-md pointer-events-none w-full md:max-w-[380px]">

      {/* Widget Window */}
      <div
        className={`pointer-events-auto transition-all duration-300 transform w-full md:max-w-[380px] h-[85vh] md:h-[580px] flex flex-col bg-surface-container-lowest md:shadow-2xl rounded-t-2xl md:rounded-xl border-t md:border border-outline-variant overflow-hidden ${isOpen ? 'translate-y-0 opacity-100 md:scale-100' : 'translate-y-full opacity-0 md:translate-y-0 md:scale-0 pointer-events-none'}`}
        style={{ transformOrigin: 'bottom right' }}
      >
        {error ? (
          <ErrorState
            onRetry={() => { setError(null); sendMessage('Retry'); }}
            onClose={handleClose}
          />
        ) : (
          <>
            <WidgetHeader onClose={handleClose} />

            {messages.length === 0 ? (
              <EmptyState onSuggestionClick={handleSuggestionClick} suggestions={suggestions} />
            ) : (
              <ActiveChatState messages={messages} isThinking={isThinking} />
            )}

            <WidgetInput
              onSendMessage={sendMessage}
              disabled={isThinking}
              suggestions={messages.length > 0 ? suggestions : []}
            />
          </>
        )}
      </div>

      {/* FAB */}
      <div className={`mr-md mb-md md:mr-0 md:mb-0 relative ${isOpen ? 'hidden' : 'flex'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="pointer-events-auto w-14 h-14 bg-primary-container rounded-full flex items-center justify-center shadow-lg cursor-pointer active:scale-95 transition-transform hover:bg-[#316bf3]"
        >
          <Icon name="chat_bubble" className="w-6 h-6 fill-on-primary-container" />
        </button>
        {error && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-error border-2 border-surface-container-lowest rounded-full pointer-events-none"></div>
        )}
      </div>

    </div>
  );
};

export default WidgetShell;
