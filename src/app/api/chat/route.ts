import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { openAIService, type AIPersona } from '@/lib/openai-service'
import { ChatMessage } from '@/types'
import { z } from 'zod'
import { 
  handleAPIError, 
  handleAuthError, 
  validateCredits, 
  createSuccessResponse, 
  createErrorResponse 
} from '@/lib/api-error-handler'

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
    const authErrorResponse = handleAuthError(authError, user)
    if (authErrorResponse) return authErrorResponse

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

    if (userError) {
      throw userError
    }

    if (!userData) {
      return createErrorResponse('User not found', 'NOT_FOUND')
    }

    // Get persona configuration for credit cost
    const personaConfig = openAIService.getPersonaConfig(persona)
    const creditCost = personaConfig.creditCost

    // Check if user has enough credits
    const creditsErrorResponse = validateCredits(
      userData.credits_balance, 
      creditCost, 
      personaConfig.name
    )
    if (creditsErrorResponse) return creditsErrorResponse

    // Check if OpenAI is configured
    if (!openAIService.isConfigured()) {
      // Return demo response if OpenAI is not configured
      return createSuccessResponse({ 
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
        throw sessionError
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
      throw updateError
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

    return createSuccessResponse({
      message: content,
      sessionId: chatSession.id,
      tokensUsed,
      creditsUsed: creditCost,
      newBalance,
      persona: personaConfig.name
    })

  } catch (error) {
    return handleAPIError(error, 'chat')
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
    const authErrorResponse = handleAuthError(authError, user)
    if (authErrorResponse) return authErrorResponse

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
        return createErrorResponse('Chat session not found', 'NOT_FOUND')
      }

      return createSuccessResponse(chatSession)
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
        throw sessionsError
      }

      return createSuccessResponse(sessions || [])
    }
  } catch (error) {
    return handleAPIError(error, 'chat/history')
  }
}