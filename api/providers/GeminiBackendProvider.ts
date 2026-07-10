import { GoogleGenAI, Type, type FunctionDeclaration } from '@google/genai';

export class GeminiBackendProvider {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing.');
    }

    // Initialize the new Google GenAI SDK
    this.ai = new GoogleGenAI({ apiKey });
  }

  async sendMessage(
    message: string,
    context: { systemPrompt: string; pageContext: string },
    history?: { toolCalls: any[]; toolResponses: any[] }
  ) {
    // Temporary debug code to list available models
    try {
      const modelsResponse = await this.ai.models.list();
      console.log('[DEBUG] Available models:', JSON.stringify(modelsResponse, null, 2));
    } catch (err) {
      console.error('[DEBUG] Failed to list models:', err);
    }

    try {
      const toolDeclarations: FunctionDeclaration[] = [
        {
          name: 'listVisibleSections',
          description: 'Lists all visible sections with their IDs, titles, and summaries from the page.',
          parameters: { type: Type.OBJECT, properties: {} }
        },
        {
          name: 'readSection',
          description: 'Reads the full text content of a specific section by its ID.',
          parameters: {
            type: Type.OBJECT,
            properties: { sectionId: { type: Type.STRING, description: 'The ID of the section to read' } },
            required: ['sectionId']
          }
        },
        {
          name: 'scoreRelevance',
          description: 'Scores the relevance of visible sections against a user query.',
          parameters: {
            type: Type.OBJECT,
            properties: { query: { type: Type.STRING, description: 'The user query to score sections against' } },
            required: ['query']
          }
        },
        {
          name: 'highlightElements',
          description: 'Highlights a specific section on the screen. Call this ONLY when you want to show the user exactly where the information is on the page. Use sectionId from other tools.',
          parameters: {
            type: Type.OBJECT,
            properties: { sectionId: { type: Type.STRING, description: 'The ID of the section to highlight' } },
            required: ['sectionId']
          }
        }
      ];

      const contents: any[] = [];

      // 1. Initial User Message
      contents.push({
        role: 'user',
        parts: [{ text: `System Context: ${context.systemPrompt}\n\nPage Content: ${context.pageContext}\n\nUser Message: ${message}` }]
      });

      // 2. Append history if we are in a tool round-trip
      if (history && history.toolCalls && history.toolResponses) {
        contents.push({
          role: 'model',
          parts: history.toolCalls.map(call => ({
            functionCall: { name: call.name, args: call.args }
          }))
        });

        contents.push({
          role: 'user',
          parts: history.toolResponses.map(res => ({
            functionResponse: { name: res.tool, response: { status: res.status, result: res.result, error: res.error } }
          }))
        });
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents,
        config: {
          tools: [{ functionDeclarations: toolDeclarations }],
          temperature: 0.2, // Low temperature for factual, context-based answers
        }
      });

      // If the model decides to call tools, return them to the frontend
      if (response.functionCalls && response.functionCalls.length > 0) {
        return {
          message: '', // No final text yet
          toolCalls: response.functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args }))
        };
      }

      return {
        message: response.text || '',
        confidence: 0.9 // Placeholder
      };
    } catch (error: any) {
      console.error('[GeminiBackendProvider] Error calling Gemini API:', error);
      throw new Error('Failed to generate content from Gemini.');
    }
  }
}
