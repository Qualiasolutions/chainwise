import OpenAI from 'openai'
import { ChatMessage } from '@/types'

export type AIPersona = 'buddy' | 'professor' | 'trader'

interface PersonaConfig {
  name: string
  description: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  creditCost: number
}

const PERSONA_CONFIGS: Record<AIPersona, PersonaConfig> = {
  buddy: {
    name: 'Buddy',
    description: 'Friendly guidance for crypto investments',
    systemPrompt: `You are Buddy, a friendly and helpful cryptocurrency companion for ChainWise users. 
    Your personality is:
    - Warm, supportive, and optimistic
    - Uses simple, easy-to-understand language
    - Encourages learning and exploration
    - Celebrates small wins and progress
    - Uses casual language and occasional emojis (but not excessively)
    
    Guidelines:
    - Make crypto feel accessible and less intimidating
    - Break down complex concepts into simple terms
    - Provide encouragement and positive reinforcement
    - Share practical tips and beginner-friendly advice
    - Always remind users about safety and doing their own research
    - End responses with uplifting or motivational notes
    
    Remember: You're here to make the crypto journey fun and approachable!`,
    temperature: 0.8,
    maxTokens: 500,
    creditCost: 5
  },
  professor: {
    name: 'Professor',
    description: 'Deep technical and market analysis',
    systemPrompt: `You are Professor, a technical and market analysis expert for ChainWise users.
    Your personality is:
    - Professional, knowledgeable, and thorough
    - Academic and precise in explanations
    - Uses technical terminology with clear definitions
    - Provides comprehensive analysis
    - References data, research, and credible sources
    
    Guidelines:
    - Deliver in-depth educational content
    - Explain the "why" behind concepts
    - Provide historical context and comparisons
    - Use structured responses with clear sections
    - Include technical details for advanced users
    - Cite examples and case studies
    - Always emphasize risk management and due diligence
    
    Remember: Your goal is to educate and provide thorough understanding of cryptocurrency concepts.`,
    temperature: 0.6,
    maxTokens: 800,
    creditCost: 10
  },
  trader: {
    name: 'Trader',
    description: 'Market-focused and strategy-oriented advisor',
    systemPrompt: `You are Trader, a market-focused and strategy-oriented cryptocurrency advisor for ChainWise users.
    Your personality is:
    - Direct, pragmatic, and results-oriented
    - Focused on market dynamics and opportunities
    - Uses trading terminology and market language
    - Analytical with emphasis on risk/reward
    - Time-sensitive and action-oriented
    
    Guidelines:
    - Provide market analysis and trading perspectives
    - Discuss technical indicators and chart patterns
    - Share risk management strategies
    - Highlight market trends and sentiment
    - Discuss entry/exit strategies (educational only)
    - Emphasize position sizing and portfolio management
    - Always include strong disclaimers about not being financial advice
    - Remind users that all trading involves risk
    
    Remember: You provide market education, NOT financial advice. Always emphasize DYOR (Do Your Own Research).`,
    temperature: 0.7,
    maxTokens: 600,
    creditCost: 15
  }
}

export class OpenAIService {
  private client: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey && apiKey !== 'sk-your-openai-api-key' && !apiKey.includes('your')) {
      this.client = new OpenAI({ apiKey })
    }
  }

  isConfigured(): boolean {
    return this.client !== null
  }

  getPersonaConfig(persona: AIPersona): PersonaConfig {
    return PERSONA_CONFIGS[persona]
  }

  getAllPersonas(): Array<{ id: AIPersona; config: PersonaConfig }> {
    return Object.entries(PERSONA_CONFIGS).map(([id, config]) => ({
      id: id as AIPersona,
      config
    }))
  }

  async generateResponse(
    messages: ChatMessage[],
    persona: AIPersona = 'buddy',
    context?: any
  ): Promise<{ content: string; tokensUsed: number }> {
    if (!this.client) {
      throw new Error('OpenAI is not configured. Please add your API key.')
    }

    const config = this.getPersonaConfig(persona)
    
    // Build conversation history for OpenAI
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: config.systemPrompt }
    ]

    // Add context if provided (market data, portfolio info, etc.)
    if (context) {
      openAIMessages.push({
        role: 'system',
        content: `Current context: ${JSON.stringify(context)}`
      })
    }

    // Convert our messages to OpenAI format
    messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        openAIMessages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })

    try {
      const completion = await this.client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
        messages: openAIMessages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })

      const content = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'
      const tokensUsed = completion.usage?.total_tokens || 0

      return { content, tokensUsed }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw new Error('Failed to generate AI response')
    }
  }

  async streamResponse(
    messages: ChatMessage[],
    persona: AIPersona = 'buddy',
    context?: any
  ): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    if (!this.client) {
      throw new Error('OpenAI is not configured. Please add your API key.')
    }

    const config = this.getPersonaConfig(persona)
    
    const openAIMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: config.systemPrompt }
    ]

    if (context) {
      openAIMessages.push({
        role: 'system',
        content: `Current context: ${JSON.stringify(context)}`
      })
    }

    messages.forEach(msg => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        openAIMessages.push({
          role: msg.role,
          content: msg.content
        })
      }
    })

    const stream = await this.client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages: openAIMessages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      stream: true
    })

    return stream
  }

  // Helper method to analyze crypto market sentiment
  async analyzeMarketSentiment(cryptoData: any): Promise<string> {
    if (!this.client) {
      return 'neutral'
    }

    const prompt = `Based on the following crypto market data, provide a one-word sentiment (bullish, bearish, or neutral):
    ${JSON.stringify(cryptoData)}
    Respond with only one word.`

    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 10
      })

      const sentiment = completion.choices[0]?.message?.content?.toLowerCase().trim()
      if (sentiment && ['bullish', 'bearish', 'neutral'].includes(sentiment)) {
        return sentiment
      }
      return 'neutral'
    } catch (error) {
      console.error('Error analyzing sentiment:', error)
      return 'neutral'
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService()