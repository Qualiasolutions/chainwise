// Payment Method Management API Route
// POST /api/settings/payment-method - Create Stripe checkout session for payment method update
// PUT /api/settings/payment-method - Update payment method details

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if Stripe is configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to environment variables.',
          action: 'configure_stripe'
        },
        { status: 503 }
      )
    }

    // Initialize Stripe (lazy import to avoid loading if not configured)
    const stripe = require('stripe')(stripeSecretKey)

    // Get or create Stripe customer
    let stripeCustomerId = profile.stripe_customer_id

    if (!stripeCustomerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: profile.full_name || undefined,
        metadata: {
          user_id: profile.id,
          auth_id: session.user.id
        }
      })

      stripeCustomerId = customer.id

      // Update profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', profile.id)
    }

    // Create checkout session for payment method setup
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: stripeCustomerId,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/billing?payment_method_updated=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/settings/billing?payment_method_cancelled=true`,
      payment_method_types: ['card'],
    })

    return NextResponse.json({
      success: true,
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id
    })

  } catch (error: any) {
    console.error('Payment method setup error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment method setup session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { payment_method_id, set_as_default } = await request.json()

    if (!payment_method_id) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    // Update payment method in database
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({
        is_default: set_as_default || false,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_method_id', payment_method_id)
      .eq('user_id', profile.id)

    if (updateError) {
      throw updateError
    }

    // If setting as default, unset other payment methods
    if (set_as_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', profile.id)
        .neq('stripe_payment_method_id', payment_method_id)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method updated successfully'
    })

  } catch (error: any) {
    console.error('Payment method update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update payment method' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { payment_method_id } = await request.json()

    if (!payment_method_id) {
      return NextResponse.json({ error: 'Payment method ID is required' }, { status: 400 })
    }

    // Delete payment method from database
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('stripe_payment_method_id', payment_method_id)
      .eq('user_id', profile.id)

    if (deleteError) {
      throw deleteError
    }

    // If Stripe is configured, also detach from Stripe
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
        await stripe.paymentMethods.detach(payment_method_id)
      } catch (stripeError) {
        console.error('Stripe detach error:', stripeError)
        // Continue even if Stripe detach fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method removed successfully'
    })

  } catch (error: any) {
    console.error('Payment method delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove payment method' },
      { status: 500 }
    )
  }
}
