// AI Chat API Routes
// POST /api/chat - Process AI conversation
// GET /api/chat - Get chat sessions

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { OpenAIService } from '@/lib/openai/service'
import { AI_PERSONAS, PersonaId } from '@/lib/openai/personas'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, tier, credits')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { message, persona, sessionId } = body

    if (!message || !persona) {
      return NextResponse.json({
        error: 'Message and persona are required'
      }, { status: 400 })
    }

    const personaConfig = AI_PERSONAS[persona as keyof typeof AI_PERSONAS]
    if (!personaConfig) {
      return NextResponse.json({ error: 'Invalid persona' }, { status: 400 })
    }

    // Check tier access
    const tierHierarchy = { free: 0, pro: 1, elite: 2 }
    const requiredTier = personaConfig.tier
    const userTierLevel = tierHierarchy[profile.tier as keyof typeof tierHierarchy] || 0
    const requiredTierLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0

    if (userTierLevel < requiredTierLevel) {
      return NextResponse.json({
        error: `${personaConfig.name} persona requires ${requiredTier} tier or higher`
      }, { status: 403 })
    }

    // Check credits
    if (profile.credits < personaConfig.creditCost) {
      return NextResponse.json({
        error: `Insufficient credits. ${personaConfig.name} requires ${personaConfig.creditCost} credits.`
      }, { status: 402 })
    }

    // TODO: Use MCP for credit deduction
    // await mcpSupabase.recordCreditUsage(profile.id, personaConfig.creditCost, `AI chat with ${personaConfig.name}`, persona, sessionId)

    // For now, use direct supabase call - this will be replaced with MCP
    const { error: creditError } = await supabase
      .from('users')
      .update({
        credits: profile.credits - personaConfig.creditCost
      })
      .eq('id', profile.id)

    if (creditError) {
      console.error('Credit deduction error:', creditError)
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
    }

    // Get conversation history for context
    let conversationHistory: any[] = []
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from('ai_chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .eq('user_id', profile.id)
        .single()

      if (existingSession?.messages) {
        conversationHistory = Array.isArray(existingSession.messages) ? existingSession.messages : []
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
    })

    // Handle session management
    let chatSession
    let updatedMessages

    if (sessionId) {
      // Update existing session
      const { data: existingSession } = await supabase
        .from('ai_chat_sessions')
        .select('messages, credits_used')
        .eq('id', sessionId)
        .eq('user_id', profile.id)
        .single()

      if (existingSession) {
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

        const { data: updated, error } = await supabase
          .from('ai_chat_sessions')
          .update({
            messages: updatedMessages,
            credits_used: (existingSession.credits_used || 0) + personaConfig.creditCost
          })
          .eq('id', sessionId)
          .select()
          .single()

        if (error) {
          console.error('Session update error:', error)
          return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 })
        }

        chatSession = updated
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

      const { data: newSession, error } = await supabase
        .from('ai_chat_sessions')
        .insert({
          user_id: profile.id,
          persona,
          messages: updatedMessages,
          credits_used: personaConfig.creditCost
        })
        .select()
        .single()

      if (error) {
        console.error('Session creation error:', error)
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }

      chatSession = newSession
    }

    // Record credit transaction
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: profile.id,
          transaction_type: 'spend',
          amount: -personaConfig.creditCost,
          description: `AI chat with ${personaConfig.name}`,
          ai_persona: persona,
          session_id: chatSession.id
        })
    } catch (error) {
      console.warn('Credit transaction recording failed:', error)
      // Non-blocking error
    }

    return NextResponse.json({
      response: aiResponse,
      session: chatSession,
      creditsRemaining: profile.credits - personaConfig.creditCost,
      creditsUsed: personaConfig.creditCost,
      success: true
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // TODO: Replace with MCP query
    const { data: sessions, error } = await supabase
      .from('ai_chat_sessions')
      .select('*')
      .eq('user_id', profile.id)
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
    console.error('Chat sessions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}