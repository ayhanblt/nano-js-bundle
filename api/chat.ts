import { GeminiBackendProvider } from './providers/GeminiBackendProvider';

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, context, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const provider = new GeminiBackendProvider();
    
    // Call the provider which encapsulates the Gemini SDK
    const response = await provider.sendMessage(
      message, 
      context || { systemPrompt: '', pageContext: '' },
      history
    );

    // Return the formatted response to the frontend
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('[Vercel API Error] /api/chat:', error);
    
    // Send a user-friendly error to the frontend if something goes wrong
    return res.status(500).json({ 
      error: true,
      message: error.message || 'Şu an LLM servisi ile bağlantı kurulamadı. Lütfen tekrar deneyin.'
    });
  }
}
