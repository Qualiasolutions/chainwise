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
import { PermissionChecker } from '@/lib/permissions'

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
    const supabase = await createClient()
    
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

    // Check if user can use this persona
    const canUsePersona = await PermissionChecker.canUseAIPersona(user.id, persona)
    if (!canUsePersona) {
      return createErrorResponse(
        `${persona.charAt(0).toUpperCase() + persona.slice(1)} persona requires a higher subscription tier`,
        'INSUFFICIENT_PERMISSIONS'
      )
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
      // Premium experience - no demo responses, require proper API configuration
      return NextResponse.json(
        { error: 'AI service is currently unavailable. Please contact support for assistance.' },
        { status: 503 }
      )
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

// No demo responses - ChainWise is a premium product requiring proper API configuration

// GET endpoint to fetch chat history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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