// AI Chat API Routes
// POST /api/chat - Process AI conversation
// GET /api/chat - Get chat sessions

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { OpenAIService } from '@/lib/openai/service'
import { AI_PERSONAS, PersonaId } from '@/lib/openai/personas'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'
import {
  handleAPIError,
  validateAuth,
  validateProfile,
  validateRequired,
  validateCredits,
  validateTier,
  validateEnum,
  checkRateLimit
} from '@/lib/api-error-handler'

export async function POST(request: NextRequest) {
  const path = '/api/chat'
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    validateAuth(session)

    // Rate limiting - AI chat is resource-intensive
    checkRateLimit(`chat:${session!.user.id}`, 30, 60000) // 30 requests per minute

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session!.user.id)
    validateProfile(profile)

    const body = await request.json()
    const { message, persona, sessionId } = body

    // Validate required fields
    validateRequired(body, ['message', 'persona'])

    // Validate persona exists
    const personaConfig = AI_PERSONAS[persona as keyof typeof AI_PERSONAS]
    validateEnum(persona, Object.keys(AI_PERSONAS), 'persona')

    // Check tier access
    validateTier(profile!.tier, personaConfig.tier)

    // Check credits
    validateCredits(profile!.credits, personaConfig.creditCost)

    // Get conversation history for context
    let conversationHistory: any[] = []
    let existingSession: any = null
    if (sessionId) {
      // For now, use direct Supabase until session management is fully migrated to MCP
      const { data: chatSession } = await supabase
        .from('ai_chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .eq('user_id', session.user.id)
        .single()

      existingSession = chatSession
      if (chatSession?.messages) {
        conversationHistory = Array.isArray(chatSession.messages) ? chatSession.messages : []
        // Convert to OpenAI format (last 10 messages for context)
        conversationHistory = conversationHistory.slice(-10).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      }
    }

    // Generate AI response using OpenAI
    const aiResponse = await OpenAIService.generateChatResponse({
      persona: persona as PersonaId,
      message,
      conversationHistory,
      maxTokens: persona === 'trader' ? 250 : persona === 'professor' ? 300 : 400,
      temperature: persona === 'trader' ? 0.5 : 0.7
    });

    // Deduct credits and record transaction using MCP helpers
    let creditSuccess = false;
    try {
      creditSuccess = await mcpSupabase.recordCreditUsage(
        profile.id,
        personaConfig.creditCost,
        `AI chat with ${personaConfig.name} (${aiResponse.length} chars)`,
        persona,
        sessionId
      )
    } catch (error) {
      console.error('Credit usage recording error:', error)
    }

    if (!creditSuccess) {
      console.warn('Credit usage recording failed, but continuing with chat')
    }

    // Also update the profile credits directly
    try {
      await mcpSupabase.updateUser(profile.id, {
        credits: profile.credits - personaConfig.creditCost
      })
    } catch (error) {
      console.error('Failed to update user credits:', error)
      // Don't return error here - user got their AI response, credit update can be eventually consistent
      console.warn('Credit update failed but continuing with response delivery')
    }

    // Handle session management with graceful error handling
    let chatSession = null
    let updatedMessages = []

    try {
      if (sessionId && existingSession) {
        // Update existing session
        const currentMessages = Array.isArray(existingSession.messages) ? existingSession.messages : []
        updatedMessages = [
          ...currentMessages,
          {
            id: crypto.randomUUID(),
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            content: aiResponse,
            sender: 'ai',
            persona,
            timestamp: new Date().toISOString()
          }
        ]

        const { data: updatedSession, error: updateError } = await supabase
          .from('ai_chat_sessions')
          .update({
            messages: updatedMessages,
            credits_used: (existingSession.credits_used || 0) + personaConfig.creditCost,
            updated_at: new Date().toISOString()
          })
          .eq('id', sessionId)
          .select()
          .single()

        if (updateError) {
          console.error('Session update error:', updateError)
          // Continue without session update - user still gets AI response
        } else {
          chatSession = updatedSession
        }
      }

      if (!chatSession) {
        // Create new session
        updatedMessages = [
          {
            id: crypto.randomUUID(),
            content: message,
            sender: 'user',
            timestamp: new Date().toISOString()
          },
          {
            id: crypto.randomUUID(),
            content: aiResponse,
            sender: 'ai',
            persona,
            timestamp: new Date().toISOString()
          }
        ]

        const { data: newSession, error: createError } = await supabase
          .from('ai_chat_sessions')
          .insert({
            user_id: session.user.id,
            persona: persona as any,
            messages: updatedMessages as any,
            credits_used: personaConfig.creditCost
          })
          .select()
          .single()

        if (createError) {
          console.error('Session creation error:', createError)
          // Continue without session creation - user still gets AI response
        } else {
          chatSession = newSession
        }
      }
    } catch (error) {
      console.error('Session management error:', error)
      // Continue gracefully - session management failure shouldn't block AI response
    }

    return NextResponse.json({
      response: aiResponse,
      session: chatSession,
      creditsRemaining: profile.credits - personaConfig.creditCost,
      creditsUsed: personaConfig.creditCost,
      success: true
    })

  } catch (error) {
    return handleAPIError(error, path)
  }
}

export async function GET() {
  const path = '/api/chat'
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    validateAuth(session)

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session!.user.id)
      .single()

    validateProfile(profile)

    const { data: sessions, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', session!.user.id)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Chat sessions fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 })
    }

    return NextResponse.json({
      sessions: sessions || [],
      success: true
    })

  } catch (error) {
    return handleAPIError(error, path)
  }
}