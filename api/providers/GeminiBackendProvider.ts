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
    history?: { toolCalls: any[]; toolResponses: any[]; modelParts?: any[] }
  ) {
    try {
      const toolDeclarations: FunctionDeclaration[] = [
        {
          name: 'listVisibleProducts',
          description: 'Detects and lists all product cards visible on the screen, returning heuristic confidence, title, price, and ID.',
          parameters: { type: Type.OBJECT, properties: {} }
        },
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
          description: 'Highlights one or more sections on the screen. Call this ONLY when you want to show the user exactly where the information is. Use sectionIds to highlight multiple items.',
          parameters: {
            type: Type.OBJECT,
            properties: { 
              sectionIds: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: 'Array of section IDs to highlight' 
              },
              sectionId: { type: Type.STRING, description: 'Legacy single section ID' }
            }
          }
        }
      ];

      const contents: any[] = [];

      // 1. Initial User Message
      contents.push({
        role: 'user',
        parts: [{ text: `System Context: ${context.systemPrompt}\n\nPage Content: ${context.pageContext}\n\nUser Message: ${message}` }]
      });

      // 2. Append conversation history (from previous tool loops)
      if (history && Array.isArray(history) && history.length > 0) {
        contents.push(...history);
      } else if (history && (history as any).toolCalls && (history as any).toolResponses) {
        // Legacy fallback just in case
        const legacyHistory = history as any;
        contents.push({
          role: 'model',
          parts: legacyHistory.modelParts || legacyHistory.toolCalls.map((call: any) => ({
            functionCall: { name: call.name, args: call.args }
          }))
        });

        contents.push({
          role: 'user',
          parts: legacyHistory.toolResponses.map((res: any) => ({
            functionResponse: { name: res.tool, response: { status: res.status, result: res.result, error: res.error } }
          }))
        });
      }

      const response = await this.ai.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite',
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
          toolCalls: response.functionCalls.map((fc: any) => ({ name: fc.name, args: fc.args })),
          modelParts: response.candidates?.[0]?.content?.parts || [] // PRESERVE ENTIRE PARTS (includes thought_signature)
        };
      }

      return {
        message: response.text || '',
        confidence: 0.9 // Placeholder
      };
    } catch (error: any) {
      console.error(error);
      throw new Error('Failed to generate content from Gemini.');
    }
  }
}
