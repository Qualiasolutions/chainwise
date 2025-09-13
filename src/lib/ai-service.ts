import { ChatMessage } from '@/types';
import { AIPersona } from './openai-service';

export interface AIResponse {
  message: string;
  sessionId?: string;
  tokensUsed?: number;
  creditsUsed?: number;
  newBalance?: number;
  persona?: string;
  isDemo?: boolean;
  error?: string;
}

export class AIService {
  static async generateResponse(
    messages: ChatMessage[],
    persona: AIPersona = 'buddy',
    sessionId?: string,
    cryptoContext?: any
  ): Promise<AIResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          persona,
          sessionId,
          context: cryptoContext,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 402) {
          throw new Error(data.message || 'Insufficient credits');
        }
        throw new Error(data.error || 'Failed to generate response');
      }

      return data;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async fetchChatHistory(sessionId?: string): Promise<any> {
    try {
      const url = sessionId 
        ? `/api/chat?sessionId=${sessionId}`
        : '/api/chat';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return null;
    }
  }

  static formatCryptoContext(cryptoData: any): string {
    if (!cryptoData) return '';
    
    return `Current Market Context:
    - Bitcoin Price: $${cryptoData.btcPrice?.toLocaleString() || 'N/A'}
    - Market Sentiment: ${cryptoData.sentiment || 'Neutral'}
    - 24h Market Change: ${cryptoData.marketChange24h || 'N/A'}%
    - Top Trending: ${cryptoData.trending?.join(', ') || 'N/A'}`;
  }

  static getPersonaInfo(persona: AIPersona) {
    const personas = {
      buddy: {
        name: 'Crypto Buddy',
        icon: '👋',
        description: 'Friendly and encouraging',
        color: 'from-blue-500 to-cyan-500'
      },
      professor: {
        name: 'Crypto Professor',
        icon: '🎓',
        description: 'Analytical and educational',
        color: 'from-purple-500 to-pink-500'
      },
      trader: {
        name: 'Crypto Trader',
        icon: '📈',
        description: 'Market-focused strategies',
        color: 'from-green-500 to-emerald-500'
      }
    };
    
    return personas[persona];
  }
}