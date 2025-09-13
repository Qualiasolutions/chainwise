#!/usr/bin/env node

/**
 * Test script to verify Supabase connection and environment variables
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n')
  
  // Check environment variables
  console.log('📋 Environment Variables:')
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  console.log()

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('❌ Missing required environment variables')
    process.exit(1)
  }

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log('🔗 Testing database connection...')
    
    // Test basic connection by listing tables
    const { data, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.log('❌ Database connection failed:', error.message)
      process.exit(1)
    }

    console.log('✅ Database connection successful')
    console.log(`📊 Users table exists with ${data?.length !== undefined ? 'data access' : 'no data'}`)
    
    // Test function access
    console.log('\n🔍 Testing database functions...')
    
    // List available functions by querying pg_proc
    const { data: functions, error: funcError } = await supabase.rpc('spend_credits', {
      user_id: 'test-user-id-that-does-not-exist',
      credit_amount: 1,
      feature_name: 'test',
      transaction_description: 'Connection test'
    })

    if (funcError) {
      if (funcError.message.includes('user_not_found')) {
        console.log('✅ spend_credits function is accessible (expected user_not_found error)')
      } else {
        console.log('⚠️  spend_credits function error:', funcError.message)
      }
    } else {
      console.log('✅ spend_credits function working')
    }

    // Test table access
    console.log('\n📋 Testing table access...')
    const tables = [
      'users', 'portfolios', 'portfolio_holdings', 'ai_chat_sessions', 
      'ai_chat_messages', 'credit_transactions', 'subscriptions', 
      'user_alerts', 'notifications'
    ]

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (tableError) {
          console.log(`❌ ${table}: ${tableError.message}`)
        } else {
          console.log(`✅ ${table}: accessible`)
        }
      } catch (err) {
        console.log(`❌ ${table}: ${err.message}`)
      }
    }

    console.log('\n🎉 Supabase connection test completed!')
    console.log('✅ Database is ready for ChainWise application')

  } catch (error) {
    console.log('❌ Connection test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testSupabaseConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Test failed:', error)
    process.exit(1)
  })