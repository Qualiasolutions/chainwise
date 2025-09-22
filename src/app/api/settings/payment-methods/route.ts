// Payment Methods API Route
// GET /api/settings/payment-methods - Get user's payment methods
// POST /api/settings/payment-methods - Add new payment method
// DELETE /api/settings/payment-methods - Remove payment method

import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/types'
import { mcpSupabase } from '@/lib/supabase/mcp-helpers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get payment methods using MCP helper
    const paymentMethods = await mcpSupabase.getUserPaymentMethods(profile.id)

    // Format payment methods for UI
    const formattedMethods = paymentMethods.map((method: any) => ({
      id: method.id,
      brand: method.brand,
      last4: method.last4,
      exp_month: method.exp_month,
      exp_year: method.exp_year,
      is_default: method.is_default,
      billing_address: method.billing_address,
      cardholder_name: method.cardholder_name,
      created_at: method.created_at,
      stripe_payment_method_id: method.stripe_payment_method_id
    }))

    return NextResponse.json({
      payment_methods: formattedMethods,
      default_method: formattedMethods.find(method => method.is_default) || null,
      total_methods: formattedMethods.length,
      success: true
    })

  } catch (error: any) {
    console.error('Payment methods GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const {
      stripe_payment_method_id,
      brand,
      last4,
      exp_month,
      exp_year,
      cardholder_name,
      billing_address,
      set_as_default
    } = await request.json()

    if (!stripe_payment_method_id || !brand || !last4) {
      return NextResponse.json(
        { error: 'Payment method details are required' },
        { status: 400 }
      )
    }

    // If setting as default, unset other default methods first
    if (set_as_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', profile.id)
    }

    // Create payment method using MCP helper
    const paymentMethodData = {
      user_id: profile.id,
      stripe_payment_method_id,
      brand: brand.toLowerCase(),
      last4,
      exp_month,
      exp_year,
      cardholder_name,
      billing_address: billing_address ? JSON.stringify(billing_address) : null,
      is_default: set_as_default || false
    }

    const newPaymentMethod = await mcpSupabase.createPaymentMethod(paymentMethodData)

    // Log the payment method addition
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'payment_method_added',
      activity_description: `Payment method added (${brand} ending in ${last4})`,
      activity_metadata: {
        brand,
        last4,
        is_default: set_as_default
      }
    })

    return NextResponse.json({
      message: 'Payment method added successfully',
      payment_method: {
        id: newPaymentMethod.id,
        brand: newPaymentMethod.brand,
        last4: newPaymentMethod.last4,
        exp_month: newPaymentMethod.exp_month,
        exp_year: newPaymentMethod.exp_year,
        is_default: newPaymentMethod.is_default,
        created_at: newPaymentMethod.created_at
      },
      success: true
    })

  } catch (error: any) {
    console.error('Payment methods POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { payment_method_id, set_as_default } = await request.json()

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Verify the payment method belongs to the user
    const { data: existingMethod, error: findError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', payment_method_id)
      .eq('user_id', profile.id)
      .single()

    if (findError || !existingMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // If setting as default, unset other default methods first
    if (set_as_default) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', profile.id)
    }

    // Update the payment method
    const { data: updatedMethod, error: updateError } = await supabase
      .from('payment_methods')
      .update({
        is_default: set_as_default,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_method_id)
      .eq('user_id', profile.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log the payment method update
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'payment_method_updated',
      activity_description: `Payment method updated (${existingMethod.brand} ending in ${existingMethod.last4})`,
      activity_metadata: {
        payment_method_id,
        set_as_default
      }
    })

    return NextResponse.json({
      message: 'Payment method updated successfully',
      payment_method: {
        id: updatedMethod.id,
        brand: updatedMethod.brand,
        last4: updatedMethod.last4,
        is_default: updatedMethod.is_default,
        updated_at: updatedMethod.updated_at
      },
      success: true
    })

  } catch (error: any) {
    console.error('Payment methods PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Get current user
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile using MCP helper
    const profile = await mcpSupabase.getUserByAuthId(session.user.id)

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    const { payment_method_id } = await request.json()

    if (!payment_method_id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      )
    }

    // Get the payment method details before deletion
    const { data: methodToDelete, error: findError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', payment_method_id)
      .eq('user_id', profile.id)
      .single()

    if (findError || !methodToDelete) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      )
    }

    // Check if this is the only payment method and if user has active subscription
    const { data: allMethods } = await supabase
      .from('payment_methods')
      .select('id')
      .eq('user_id', profile.id)

    if (allMethods?.length === 1 && profile.tier !== 'free') {
      return NextResponse.json(
        { error: 'Cannot delete the only payment method for an active subscription' },
        { status: 400 }
      )
    }

    // Delete the payment method
    const { error: deleteError } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', payment_method_id)
      .eq('user_id', profile.id)

    if (deleteError) {
      throw deleteError
    }

    // Log the payment method deletion
    await supabase.rpc('log_user_activity', {
      user_uuid: profile.id,
      activity_type: 'payment_method_removed',
      activity_description: `Payment method removed (${methodToDelete.brand} ending in ${methodToDelete.last4})`,
      activity_metadata: {
        payment_method_id,
        brand: methodToDelete.brand,
        last4: methodToDelete.last4
      }
    })

    return NextResponse.json({
      message: 'Payment method removed successfully',
      deleted_payment_method_id: payment_method_id,
      success: true
    })

  } catch (error: any) {
    console.error('Payment methods DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}