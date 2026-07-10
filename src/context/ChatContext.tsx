import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../components/MessageBubble';
import { GeminiProvider } from '../api/GeminiProvider';
import { AIService } from '../api/AIService';
import { ToolOrchestrator } from '../engine/ToolOrchestrator';

interface ChatContextProps {
  messages: Message[];
  isThinking: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  setError: (err: string | null) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const aiService = useMemo(() => {
    const orchestrator = new ToolOrchestrator();
    const provider = new GeminiProvider();
    return new AIService(provider, orchestrator);
  }, []);

  useEffect(() => {
    aiService.initialize();
  }, [aiService]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const clearMessages = () => setMessages([]);

  const sendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text
    };
    addMessage(userMsg);
    setIsThinking(true);
    setError(null);

    try {
      const response = await aiService.processUserMessage(text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        actions: response.action ? [response.action] : undefined
      };
      
      if (response.error) {
        // We can either set the error state, or just let the friendly message flow into the chat
        // To be safe, we add the message to the chat so the user can see what happened
        addMessage({
          ...aiMsg,
          error: true // optional extension if we want to style it differently
        });
        setError('Hata oluştu'); // Triggering the error state UI if desired by design
      } else {
        addMessage(aiMsg);
      }
      
    } catch (err) {
      // In case something completely broke outside of AIService
      setError('Bağlantı kurulamadı.');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isThinking, error, sendMessage, addMessage, clearMessages, setError }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
