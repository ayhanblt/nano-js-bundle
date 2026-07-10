import type { AIProvider, AIResponse, ToolCall, ToolResponse } from './types';
import { logger } from '../utils/logger';
import { config } from '../config';

export class GeminiProvider implements AIProvider {
  private _endpointUrl = config.apiEndpoint;

  async initialize(): Promise<void> {
    logger.log('GeminiProvider initialized.');
    return Promise.resolve();
  }

  async sendMessageWithTools(
    message: string, 
    _context: { systemPrompt: string; pageContext: string },
    history?: any[] | { toolCalls: ToolCall[]; toolResponses: ToolResponse[]; modelParts?: any[] }
  ): Promise<AIResponse> {
    logger.log('GeminiProvider preparing request to backend...', { message, _endpointUrl: this._endpointUrl });
    
    try {
      const response = await fetch(this._endpointUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, context: _context, history })
      });

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Backend API error');
      }

      return data as AIResponse;
    } catch (err: any) {
      logger.error('GeminiProvider fetch error:', err);
      return {
        message: 'Sunucuyla bağlantı kurulurken bir hata oluştu. Lütfen tekrar deneyin.',
        error: true
      } as unknown as AIResponse; // AIService will catch this error boolean
    }
  }
}
