export interface ToolCall {
  name: string;
  args: Record<string, any>;
}

export interface ToolResponse {
  status: 'success' | 'empty' | 'error';
  tool: string;
  result: any;
  error?: string;
}

export interface AIResponse {
  message: string;
  toolCalls?: ToolCall[];
  modelParts?: any[];
  confidence?: number;
  sourceSections?: string[];
  error?: string;
}

export interface AIProvider {
  /**
   * Initializes the provider (e.g. fetching config if needed)
   */
  initialize(): Promise<void>;

  /**
   * Sends a message to the AI, potentially passing tools and system prompts.
   */
  sendMessageWithTools(
    message: string, 
    context: {
      systemPrompt: string;
      pageContext: string;
    },
    history?: any[] | {
      toolCalls: ToolCall[];
      toolResponses: ToolResponse[];
      modelParts?: any[];
    }
  ): Promise<AIResponse>;
}
