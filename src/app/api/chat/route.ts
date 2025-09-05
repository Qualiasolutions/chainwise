import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openAIService, type AIPersona } from '@/lib/openai-service'
import { ChatMessage } from '@/types'
import { z } from 'zod'

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
    timestamp: z.string().or(z.date()).transform(val => new Date(val))
  })),
  persona: z.enum(['buddy', 'professor', 'trader']).default('buddy'),
  sessionId: z.string().optional(),
  context: z.any().optional()
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request
    const body = await request.json()
    const validatedData = chatRequestSchema.parse(body)
    const { messages, persona, sessionId, context } = validatedData

    // Get user with credit balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, credits_balance, subscription_tier')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get persona configuration for credit cost
    const personaConfig = openAIService.getPersonaConfig(persona)
    const creditCost = personaConfig.creditCost

    // Check if user has enough credits
    if (userData.credits_balance < creditCost) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditCost,
        balance: userData.credits_balance,
        message: `You need ${creditCost} credits to use ${personaConfig.name}. Please upgrade your subscription or purchase more credits.`
      }, { status: 402 })
    }

    // Check if OpenAI is configured
    if (!openAIService.isConfigured()) {
      // Return demo response if OpenAI is not configured
      return NextResponse.json({ 
        message: getDemoResponse(messages[messages.length - 1].content, persona),
        tokensUsed: 0,
        creditsUsed: 0,
        isDemo: true
      })
    }

    // Create or get chat session
    let chatSession
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('ai_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      
      chatSession = existingSession
    }

    if (!chatSession) {
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: user.id,
          persona,
          title: messages[0]?.content.substring(0, 100) || 'New Chat',
          is_active: true
        })
        .select()
        .single()

      if (sessionError) {
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }
      
      chatSession = newSession
    }

    // Save user message to database
    const lastUserMessage = messages[messages.length - 1]
    await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: chatSession.id,
        role: 'user',
        content: lastUserMessage.content,
        metadata: {}
      })

    // Generate AI response
    const { content, tokensUsed } = await openAIService.generateResponse(
      messages,
      persona,
      context
    )

    // Save AI response to database
    await supabase
      .from('ai_chat_messages')
      .insert({
        session_id: chatSession.id,
        role: 'assistant',
        content,
        metadata: {
          persona,
          tokensUsed,
          creditCost
        }
      })

    // Deduct credits
    const newBalance = userData.credits_balance - creditCost
    const { error: updateError } = await supabase
      .from('users')
      .update({ credits_balance: newBalance })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    // Log the credit transaction
    await supabase
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'spent',
        amount: -creditCost,
        feature_used: `ai_chat_${persona}`,
        description: `AI Chat with ${personaConfig.name}`,
        metadata: {
          session_id: chatSession.id,
          tokens_used: tokensUsed,
          persona
        }
      })

    const result = {
      message: content,
      sessionId: chatSession.id,
      tokensUsed,
      creditsUsed: creditCost,
      newBalance,
      persona: personaConfig.name
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 })
    }

    if (error instanceof Error) {
      // Check for specific OpenAI errors
      if (error.message.includes('OpenAI')) {
        return NextResponse.json({ 
          error: 'AI service temporarily unavailable',
          message: 'Please try again in a moment'
        }, { status: 503 })
      }
    }

    return NextResponse.json({ 
      error: 'An unexpected error occurred',
      message: 'Please try again later'
    }, { status: 500 })
  }
}

// Demo responses for when OpenAI is not configured
function getDemoResponse(message: string, persona: AIPersona): string {
  const lowerMessage = message.toLowerCase()
  
  const demoResponses: Record<AIPersona, string> = {
    buddy: `Hey there! 👋 I'm Crypto Buddy, and I'm here to help make your crypto journey fun and easy! 

While I'm in demo mode right now, once fully configured, I'll be able to:
- Answer all your crypto questions in simple terms
- Help you understand market trends
- Celebrate your wins (big and small!)
- Keep you motivated on your investment journey

For now, feel free to explore the app and check out all the awesome features ChainWise has to offer. Remember, we're in this together! 🚀`,

    professor: `Greetings. I am Crypto Professor, your analytical guide to the cryptocurrency ecosystem.

In demonstration mode, I can provide you with a preview of my capabilities:
- Comprehensive technical analysis and market insights
- In-depth explanations of blockchain technology
- Historical context and comparative analysis
- Academic-level education on DeFi, NFTs, and emerging protocols

Once operational with full API integration, I will provide data-driven insights backed by real-time market analysis and scholarly research. The intersection of technology and finance awaits your exploration.`,

    trader: `Trader here. Let's talk markets.

Demo mode active. When fully operational, expect:
- Real-time market analysis and trends
- Risk/reward assessments
- Technical indicator interpretations
- Entry/exit strategy education (NOT financial advice)
- Portfolio optimization insights

Markets don't wait. Neither should you. Get your API configured to unlock full trading intelligence. Remember: DYOR, manage risk, stay liquid.`
  }

  if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
    return `[Demo Response - ${persona}]\n\n${demoResponses[persona]}\n\nP.S. Bitcoin is currently the topic of discussion - once configured, I'll provide real-time BTC analysis tailored to your needs!`
  }

  return demoResponses[persona]
}

// GET endpoint to fetch chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (sessionId) {
      // Get specific session with messages
      const { data: chatSession, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          messages:ai_chat_messages(*)
        `)
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'ai_chat_messages', ascending: true })
        .limit(limit, { foreignTable: 'ai_chat_messages' })
        .single()

      if (sessionError || !chatSession) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 })
      }

      return NextResponse.json(chatSession)
    } else {
      // Get all sessions for user with latest message
      const { data: sessions, error: sessionsError } = await supabase
        .from('ai_chat_sessions')
        .select(`
          *,
          messages:ai_chat_messages!ai_chat_messages_session_id_fkey(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .order('created_at', { foreignTable: 'ai_chat_messages', ascending: false })
        .limit(20)
        .limit(1, { foreignTable: 'ai_chat_messages' })

      if (sessionsError) {
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
      }

      return NextResponse.json(sessions || [])
    }
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch chat history' 
    }, { status: 500 })
  }
}