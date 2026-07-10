import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../components/MessageBubble';
import { GeminiProvider } from '../api/GeminiProvider';
import { AIService } from '../api/AIService';
import { ToolOrchestrator } from '../engine/ToolOrchestrator';
import { SuggestionEngine } from '../engine/SuggestionEngine';
import { parseMarkdown } from '../utils/markdown';
import { t } from '../i18n';

interface ChatContextProps {
  messages: Message[];
  isThinking: boolean;
  isReady: boolean;
  error: string | null;
  suggestions: string[];
  sendMessage: (text: string) => Promise<void>;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  setError: (err: string | null) => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const { aiService, suggestionEngine } = useMemo(() => {
    const orchestrator = new ToolOrchestrator();
    const provider = new GeminiProvider();
    const aiService = new AIService(provider, orchestrator);
    const suggestionEngine = new SuggestionEngine(orchestrator.analyzer);
    return { aiService, suggestionEngine };
  }, []);

  // Update suggestions whenever messages change
  useEffect(() => {
    // Generate new suggestions non-blocking
    const timer = setTimeout(() => {
      const newSuggestions = suggestionEngine.generateSuggestions(messages);
      setSuggestions(newSuggestions);
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, suggestionEngine]);

  useEffect(() => {
    aiService.initialize().then(() => {
      setIsReady(true);
    });
  }, [aiService]);

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  };

  const clearMessages = () => setMessages([]);

  const sendMessage = async (text: string) => {
    if (!isReady) return; // Prevent sending before DOM is ready
    
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
      
      const parsedHtml = response.text ? parseMarkdown(response.text) : undefined;
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.text,
        html: parsedHtml,
        actions: response.action ? [response.action] : undefined
      };
      
      if (response.error) {
        addMessage({
          ...aiMsg,
          error: true
        });
        setError(t('msg.error.occurred'));
      } else {
        addMessage(aiMsg);
      }
      
    } catch (err) {
      setError(t('msg.connection.error'));
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <ChatContext.Provider value={{ messages, isThinking, isReady, error, suggestions, sendMessage, addMessage, clearMessages, setError }}>
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
