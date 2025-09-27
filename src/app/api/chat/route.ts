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

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helpers
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

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

    // Get conversation history for context
    let conversationHistory: any[] = []
    let existingSession: any = null
    if (sessionId) {
      // For now, use direct Supabase until session management is fully migrated to MCP
      const { data: session } = await supabase
        .from('ai_chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .eq('user_id', profile.id)
        .single()

      existingSession = session
      if (session?.messages) {
        conversationHistory = Array.isArray(session.messages) ? session.messages : []
        // Convert to OpenAI format (last 10 messages for context)
        conversationHistory = conversationHistory.slice(-10).map((msg: any) => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }))
      }
    }

    // Generate AI response using OpenAI
    console.log(`Generating AI response for persona: ${persona}, message length: ${message.length}`);
    const aiResponse = await OpenAIService.generateChatResponse({
      persona: persona as PersonaId,
      message,
      conversationHistory,
      maxTokens: persona === 'trader' ? 250 : persona === 'professor' ? 300 : 400,
      temperature: persona === 'trader' ? 0.5 : 0.7
    });
    console.log(`AI response generated successfully, length: ${aiResponse.length}`);

    // Deduct credits and record transaction using MCP helpers
    const creditSuccess = await mcpSupabase.recordCreditUsage(
      profile.id,
      personaConfig.creditCost,
      `AI chat with ${personaConfig.name} (${aiResponse.length} chars)`,
      persona,
      sessionId
    )

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
      return NextResponse.json({ error: 'Failed to process credits' }, { status: 500 })
    }

    // Handle session management
    let chatSession
    let updatedMessages

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
        return NextResponse.json({ error: 'Failed to update chat session' }, { status: 500 })
      }

      chatSession = updatedSession
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
          user_id: profile.id,
          persona: persona as any,
          messages: updatedMessages as any,
          credits_used: personaConfig.creditCost
        })
        .select()
        .single()

      if (createError) {
        console.error('Session creation error:', createError)
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }

      chatSession = newSession
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

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

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

  } catch (error: any) {
    console.error('Chat sessions API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}