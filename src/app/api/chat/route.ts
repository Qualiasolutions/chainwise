// AI Chat API Routes
// POST /api/chat - Process AI conversation
// GET /api/chat - Get chat sessions

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'

// AI Personas configuration
const AI_PERSONAS = {
  buddy: {
    id: 'buddy',
    name: 'Buddy',
    tier: 'free',
    creditCost: 1,
    description: 'Casual crypto advice and friendly guidance'
  },
  professor: {
    id: 'professor',
    name: 'Professor',
    tier: 'pro',
    creditCost: 2,
    description: 'Educational insights and deep analysis'
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    tier: 'elite',
    creditCost: 3,
    description: 'Professional trading signals and strategies'
  }
} as const

// Mock AI responses - TODO: Replace with OpenAI API
const generateMockResponse = async (persona: string, userMessage: string): Promise<string> => {
  const responses = {
    buddy: [
      "Hey there! That's a great question about crypto. Based on what you're asking, here's my friendly take...",
      "Nice! I love talking crypto with fellow enthusiasts. Let me break this down in simple terms...",
      "Awesome question! As your crypto buddy, here's what I think you should know..."
    ],
    professor: [
      "Excellent inquiry. From an analytical perspective, we must consider several key factors...",
      "This is a sophisticated question that requires deep analysis. Let me provide educational insights...",
      "From a technical analysis standpoint, there are multiple layers to consider here..."
    ],
    trader: [
      "Based on current market conditions and technical indicators, here's my professional assessment...",
      "Looking at the charts and market dynamics, I see several trading opportunities...",
      "From a risk management perspective, here's what the data is telling us..."
    ]
  }

  const personaResponses = responses[persona as keyof typeof responses] || responses.buddy
  const randomResponse = personaResponses[Math.floor(Math.random() * personaResponses.length)]

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  return `${randomResponse} Your message about "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}" is spot on. Here's my detailed response with insights tailored to your needs.`
}

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

    // Generate AI response (mock for now)
    const aiResponse = await generateMockResponse(persona, message)

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