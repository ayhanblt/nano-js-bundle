import type { AIProvider } from './types';
import { getFullSystemPrompt } from './prompts';
import { ToolOrchestrator } from '../engine/ToolOrchestrator';
import { logger } from '../utils/logger';
import type { MessageAction } from '../components/MessageBubble';

export class AIService {
  private provider: AIProvider;
  private orchestrator: ToolOrchestrator;

  constructor(provider: AIProvider, orchestrator: ToolOrchestrator) {
    this.provider = provider;
    this.orchestrator = orchestrator;
  }

  async initialize() {
    try {
      await this.provider.initialize();
      logger.log('AIService initialized');
    } catch (err) {
      logger.error('Failed to initialize AIService', err);
    }
  }

  /**
   * Processes the user message, handles tools, and returns a safe response for the UI.
   */
  async processUserMessage(message: string): Promise<{ text: string; action?: MessageAction; error?: boolean }> {
    try {
      logger.log('AIService processing message:', message);
      
      const pageContext = this.orchestrator.getPageContext();
      const systemPrompt = getFullSystemPrompt();

      // Implement timeout logic for the provider call
      let response = await this.withTimeout(
        this.provider.sendMessageWithTools(message, { systemPrompt, pageContext }), 
        10000 // 10s timeout
      );

      let loopCount = 0;
      const MAX_TOOLS = 5;
      let finalAction: MessageAction | undefined = undefined;
      
      // Loop for multi-step tool execution (Round-Trip)
      while (response.toolCalls && response.toolCalls.length > 0 && loopCount < MAX_TOOLS) {
        loopCount++;
        logger.log(`Executing tool loop ${loopCount}`, response.toolCalls);

        const toolResponses = response.toolCalls.map(call => {
          const res = this.orchestrator.executeTool(call);
          
          // Special handling for UI actions triggered by tools
          if (call.name === 'highlightElements' && res.status === 'success') {
            finalAction = {
              label: 'İlgili alana git',
              icon: 'location_on',
              onClick: () => this.orchestrator.executeTool(call) // re-trigger highlight
            };
          }
          return res;
        });

        // Send tool results back to provider to continue conversation
        response = await this.withTimeout(
          this.provider.sendMessageWithTools(
            message, 
            { systemPrompt, pageContext },
            { toolCalls: response.toolCalls, toolResponses, modelParts: response.modelParts }
          ),
          15000 // slightly longer for continuation
        );
      }

      if (loopCount >= MAX_TOOLS) {
        logger.warn('Max tool calls reached');
        return this.getFriendlyError('Sistem güvenliği için çok fazla işlem yapmamı engelleyen limite ulaştım. Lütfen daha basit bir soru sorar mısın?');
      }

      if (response.error) {
        logger.error('Provider returned an error in AIResponse', response.error);
        return this.getFriendlyError();
      }

      if (!response.message) {
        logger.warn('Provider returned an empty message');
        return this.getFriendlyError('Aldığım cevap boştu, lütfen tekrar sorar mısın?');
      }

      return {
        text: response.message,
        action: finalAction
      };

    } catch (err) {
      logger.error('Error during message processing', err);
      return this.getFriendlyError();
    }
  }

  private getFriendlyError(customMessage?: string) {
    return { 
      text: customMessage || 'Şu an bağlantı kuramıyorum veya bir hata oluştu. Lütfen tekrar deneyin.', 
      error: true 
    };
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Timeout'));
      }, ms);
      
      promise
        .then(value => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(reason => {
          clearTimeout(timer);
          reject(reason);
        });
    });
  }
}
