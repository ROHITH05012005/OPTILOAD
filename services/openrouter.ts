/**
 * OpenRouter AI Service
 * Provides natural language responses for logistics, route planning, and cargo packing queries.
 * Gracefully falls back to local heuristic engines if no API key is configured.
 */

export interface ChatMessageHistory {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenRouterService {
  private static API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  private static getApiKey(): string | undefined {
    return (
      (import.meta as any).env?.VITE_OPENROUTER_API_KEY ||
      (typeof process !== 'undefined' ? process.env?.VITE_OPENROUTER_API_KEY : undefined)
    );
  }

  /**
   * Generates a chat response using OpenRouter API.
   * Returns null if API key is missing or request fails.
   */
  public static async generateResponse(
    prompt: string,
    history: ChatMessageHistory[] = []
  ): Promise<string | null> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      console.log('ℹ️ OpenRouter API Key not set. Using local fallback assistant.');
      return null;
    }

    try {
      const messages: ChatMessageHistory[] = [
        {
          role: 'system',
          content: `You are LogiLoad Assistant, an expert AI logistics advisor specializing in 3D cargo bin-packing, truck axle balance, maritime seaways, and air cargo flight trim. Keep answers clear, concise, and professional.`
        },
        ...history,
        { role: 'user', content: prompt }
      ];

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://logiload-3d.app',
          'X-Title': 'LogiLoad 3D Cargo Assistant',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        console.warn(`OpenRouter API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const choiceContent = data?.choices?.[0]?.message?.content;

      return choiceContent ? choiceContent.trim() : null;
    } catch (error) {
      console.error('Error contacting OpenRouter API:', error);
      return null;
    }
  }
}
