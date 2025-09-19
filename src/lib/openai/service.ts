import openai from './client';
import { AI_PERSONAS, PersonaId } from './personas';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  persona: PersonaId;
  message: string;
  conversationHistory?: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIService {
  static async generateChatResponse(options: ChatOptions): Promise<string> {
    const { persona, message, conversationHistory = [], maxTokens = 500, temperature = 0.7 } = options;

    const personaConfig = AI_PERSONAS[persona];

    if (!personaConfig) {
      throw new Error(`Invalid persona: ${persona}`);
    }

    // Build conversation messages
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: personaConfig.systemPrompt
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    try {
      const completion = await openai.chat.completions.create({
        model: personaConfig.model,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        max_tokens: maxTokens,
        temperature: temperature,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        throw new Error('No response generated from OpenAI');
      }

      return response;
    } catch (error) {
      console.error('OpenAI API error:', error);

      // Fallback to persona-specific error messages
      const fallbackResponses = {
        buddy: "Hey! I'm having a bit of trouble connecting right now. Let me try again in a moment!",
        professor: "I apologize, but I'm experiencing some technical difficulties. Please try your question again shortly.",
        trader: "System temporarily unavailable. Please retry your query for the latest market analysis."
      };

      return fallbackResponses[persona] || "I'm experiencing technical difficulties. Please try again.";
    }
  }

  static async generateReport(type: 'pro' | 'elite', content: string): Promise<string> {
    const systemPrompts = {
      pro: `You are creating a ChainWise Pro Weekly Report. Focus on practical insights for retail crypto investors:
- Top 3 coins performance and risk snapshot
- Market overview with main narratives
- Simple portfolio tips
- Alerts recap
Keep it digestible and actionable for Pro users.`,

      elite: `You are creating a ChainWise Elite Deep AI Report. Provide premium, VIP-level analysis:
- Full trend and narrative detection from social media
- Advanced technical and on-chain analysis
- Whale wallet movements and key highlights
- Stress-test scenarios and risk analysis
- Sentiment heatmap and market-wide signals
- Elite-only recommendations and under-the-radar opportunities
Make it feel exclusive and deeply insightful for Elite users.`
    };

    try {
      const completion = await openai.chat.completions.create({
        model: type === 'elite' ? 'gpt-4' : 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompts[type]
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: type === 'elite' ? 1500 : 800,
        temperature: 0.6,
      });

      return completion.choices[0]?.message?.content || 'Report generation failed.';
    } catch (error) {
      console.error('Report generation error:', error);
      throw new Error('Failed to generate report');
    }
  }

  static async analyzePortfolio(portfolioData: any): Promise<string> {
    const systemPrompt = `You are ChainWise's AI Portfolio Allocator. Analyze the user's crypto portfolio and provide:
- Clear percentage-based recommendations (buy/hold/sell)
- Reasoning based on current market conditions
- Risk assessment and diversification advice
- Specific actionable steps

Be professional and data-driven in your analysis.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analyze this portfolio: ${JSON.stringify(portfolioData)}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      return completion.choices[0]?.message?.content || 'Portfolio analysis failed.';
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw new Error('Failed to analyze portfolio');
    }
  }

  static async generateTradingSignal(marketData: any): Promise<string> {
    const systemPrompt = `You are ChainWise's professional trading signal generator. Create actionable trading signals with:
- Specific entry and exit points
- Risk-reward ratios
- Stop loss levels
- Market reasoning
- Time horizon

Format as professional trading advice.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Generate trading signal based on: ${JSON.stringify(marketData)}`
          }
        ],
        max_tokens: 600,
        temperature: 0.4,
      });

      return completion.choices[0]?.message?.content || 'Signal generation failed.';
    } catch (error) {
      console.error('Trading signal error:', error);
      throw new Error('Failed to generate trading signal');
    }
  }
}