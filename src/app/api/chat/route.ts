import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  persona: z.enum(['buddy', 'professor', 'trader']).default('buddy'),
})

// AI Personas with professional configurations
const PERSONA_CONFIGS = {
  buddy: {
    name: 'ChainWise Assistant',
    systemPrompt: `You are ChainWise Assistant, a professional and knowledgeable cryptocurrency advisor. 
    Your role is to provide clear, educational guidance to users learning about cryptocurrency and blockchain technology.
    
    Guidelines:
    - Provide accurate, up-to-date information about cryptocurrencies and blockchain
    - Explain complex concepts in accessible terms
    - Always emphasize the importance of research and risk management
    - Maintain a professional, helpful tone
    - Focus on education rather than specific investment advice
    - Encourage responsible investing and never guarantee returns`,
    temperature: 0.7,
    maxTokens: 500,
    creditCost: 5
  },
  professor: {
    name: 'Market Analyst',
    systemPrompt: `You are Market Analyst, a technical analysis expert specializing in cryptocurrency markets.
    You provide in-depth market analysis, technical insights, and educational content.
    
    Guidelines:
    - Analyze market trends using technical analysis principles
    - Explain chart patterns, indicators, and market dynamics
    - Provide educational content about trading and market analysis
    - Use professional financial terminology with clear explanations
    - Always include risk warnings and disclaimers
    - Focus on analysis methodology rather than predictions`,
    temperature: 0.6,
    maxTokens: 750,
    creditCost: 10
  },
  trader: {
    name: 'Strategy Advisor',
    systemPrompt: `You are Strategy Advisor, an advanced cryptocurrency trading strategist for experienced users.
    You provide sophisticated trading insights and portfolio strategy guidance.
    
    Guidelines:
    - Discuss advanced trading strategies and risk management
    - Analyze portfolio composition and diversification
    - Provide insights on market timing and entry/exit strategies
    - Use professional trading terminology
    - Emphasize risk management and position sizing
    - Focus on strategy education rather than specific trade recommendations`,
    temperature: 0.5,
    maxTokens: 1000,
    creditCost: 15
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Parse and validate request
    const body = await request.json()
    const { messages, persona } = chatRequestSchema.parse(body)

    // Get user credit information
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('credits_balance, subscription_tier')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const personaConfig = PERSONA_CONFIGS[persona]
    
    // Check if user has enough credits
    if (userData.credits_balance < personaConfig.creditCost) {
      return new Response(JSON.stringify({ 
        error: `Insufficient credits. Need ${personaConfig.creditCost} credits for ${personaConfig.name}` 
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Convert messages to AI SDK format
    const coreMessages = convertToCoreMessages(messages)

    // Add system prompt
    const messagesWithSystem = [
      { role: 'system' as const, content: personaConfig.systemPrompt },
      ...coreMessages
    ]

    // Stream the response
    const result = await streamText({
      model: openai(process.env.OPENAI_MODEL || 'gpt-4o-mini'),
      messages: messagesWithSystem,
      temperature: personaConfig.temperature,
      maxTokens: personaConfig.maxTokens,
      async onFinish({ usage }) {
        // Deduct credits after successful response
        await supabase
          .from('users')
          .update({ 
            credits_balance: userData.credits_balance - personaConfig.creditCost 
          })
          .eq('id', user.id)

        // Log credit transaction
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: user.id,
            transaction_type: 'spent',
            amount: -personaConfig.creditCost,
            feature_used: `ai_chat_${persona}`,
            description: `AI Chat with ${personaConfig.name}`,
            metadata: {
              persona,
              tokens_used: usage.totalTokens,
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
            }
          })
      }
    })

    return result.toDataStreamResponse()

  } catch (error) {
    console.error('Error in chat API:', error)
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data',
        details: error.errors 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}