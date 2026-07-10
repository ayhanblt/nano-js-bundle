export interface AIProvider {
  /**
   * Initializes the AI Provider (e.g. checking API keys, setting up models)
   */
  initialize(): Promise<void>;

  /**
   * Sends a message to the AI and receives a string response
   * @param message The user's input message
   * @param systemPrompt Optional system instructions
   */
  sendMessage(message: string, systemPrompt?: string): Promise<string>;

  /**
   * Sends a message with a list of available tools.
   * @param message The user's input message
   * @param tools Available tools definitions
   * @param systemPrompt Optional system instructions
   */
  sendMessageWithTools(message: string, tools: any[], systemPrompt?: string): Promise<any>;
}
