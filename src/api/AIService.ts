import type { AIProvider } from './types';
import { getFullSystemPrompt } from './prompts';
import { ToolOrchestrator } from '../engine/ToolOrchestrator';
import { logger } from '../utils/logger';
import type { MessageAction } from '../components/MessageBubble';
import { t, getCurrentLanguage } from '../i18n';

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
      await this.orchestrator.waitUntilReady();
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
      
      const registry = this.orchestrator.analyzer.getRegistry();
      if (!registry || !registry.isValid) {
        logger.warn('AIService preflight failed: Registry is not valid or empty.');
        return this.getFriendlyError(t('msg.analyzing.page'));
      }

      const pageContext = this.orchestrator.getPageContext();
      const lang = getCurrentLanguage();
      const systemPrompt = getFullSystemPrompt(lang);

      // Implement timeout logic for the provider call
      let response = await this.withTimeout(
        this.provider.sendMessageWithTools(message, { systemPrompt, pageContext }), 
        10000 // 10s timeout
      );

      let loopCount = 0;
      const MAX_TOOLS = 3; // Reduced max tools for optimization
      let finalAction: MessageAction | undefined = undefined;
      const conversationHistory: any[] = [];
      
      // Loop for multi-step tool execution (Round-Trip)
      while (response.toolCalls && response.toolCalls.length > 0 && loopCount < MAX_TOOLS) {
        loopCount++;
        logger.log(`Executing tool loop ${loopCount}`, response.toolCalls);

        const toolResponses = response.toolCalls.map(call => {
          const res = this.orchestrator.executeTool(call);
          
          // Special handling for UI actions triggered by tools
          if (call.name === 'highlightElements' && res.status === 'success') {
            finalAction = {
              label: t('lbl.go.to.area'),
              icon: 'location_on',
              onClick: () => this.orchestrator.executeTool(call) // re-trigger highlight
            };
          }
          return res;
        });

        // Add this round to conversation history
        conversationHistory.push({
          role: 'model',
          parts: response.modelParts || response.toolCalls.map(call => ({
            functionCall: { name: call.name, args: call.args }
          }))
        });

        conversationHistory.push({
          role: 'user',
          parts: toolResponses.map(res => ({
            functionResponse: { name: res.tool, response: { status: res.status, result: res.result, error: res.error } }
          }))
        });

        // Send tool results back to provider to continue conversation using cumulative history
        response = await this.withTimeout(
          this.provider.sendMessageWithTools(
            message, 
            { systemPrompt, pageContext },
            conversationHistory
          ),
          15000 // slightly longer for continuation
        );
      }

      if (loopCount >= MAX_TOOLS) {
        logger.warn('Max tool calls reached');
        return this.getFriendlyError(t('msg.limit.reached'));
      }

      if (response.error) {
        logger.error('Provider returned an error in AIResponse', response.error);
        return this.getFriendlyError();
      }

      if (!response.message) {
        logger.warn('Provider returned an empty message');
        return this.getFriendlyError(t('msg.empty.response'));
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
      text: customMessage || t('msg.default.error'), 
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
