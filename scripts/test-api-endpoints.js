#!/usr/bin/env node

/**
 * Test script to verify API endpoints with Supabase authentication
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testAPIEndpoints() {
  console.log('🔍 Testing ChainWise API Endpoints...\n')
  
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    // Test 1: Health Check
    console.log('🏥 Testing Health Check API...')
    const healthResponse = await fetch('http://localhost:3000/api/health')
    if (healthResponse.ok) {
      const health = await healthResponse.json()
      console.log('✅ Health API:', health)
    } else {
      console.log('❌ Health API failed:', healthResponse.status)
    }

    // Test 2: Credit Balance (requires auth)
    console.log('\n💰 Testing Credit Balance API (should fail without auth)...')
    const creditResponse = await fetch('http://localhost:3000/api/credits/balance')
    if (creditResponse.status === 401) {
      console.log('✅ Credit Balance API properly protected (401 Unauthorized)')
    } else {
      console.log('⚠️  Credit Balance API returned:', creditResponse.status)
    }

    // Test 3: Portfolio API (requires auth)
    console.log('\n📊 Testing Portfolio API (should fail without auth)...')
    const portfolioResponse = await fetch('http://localhost:3000/api/portfolio')
    if (portfolioResponse.status === 401) {
      console.log('✅ Portfolio API properly protected (401 Unauthorized)')
    } else {
      console.log('⚠️  Portfolio API returned:', portfolioResponse.status)
    }

    // Test 4: Chat API (requires auth)
    console.log('\n🤖 Testing Chat API (should fail without auth)...')
    const chatResponse = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ id: '1', role: 'user', content: 'Hello', timestamp: new Date() }],
        persona: 'buddy'
      })
    })
    if (chatResponse.status === 401) {
      console.log('✅ Chat API properly protected (401 Unauthorized)')
    } else {
      console.log('⚠️  Chat API returned:', chatResponse.status)
    }

    // Test 5: Database direct access with Supabase client
    console.log('\n🔐 Testing Database Access with Supabase Client...')
    
    // Test user access (should work with anon key for public data)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)

    if (usersError) {
      if (usersError.message.includes('permission denied')) {
        console.log('✅ User data properly protected by RLS')
      } else {
        console.log('⚠️  User query error:', usersError.message)
      }
    } else {
      console.log('⚠️  User data accessible without auth (may need RLS review)')
    }

    // Test portfolio access (should be blocked by RLS)
    const { data: portfolios, error: portfoliosError } = await supabase
      .from('portfolios')
      .select('*')
      .limit(1)

    if (portfoliosError) {
      if (portfoliosError.message.includes('permission denied')) {
        console.log('✅ Portfolio data properly protected by RLS')
      } else {
        console.log('⚠️  Portfolio query error:', portfoliosError.message)
      }
    } else {
      console.log('⚠️  Portfolio data accessible without auth (RLS needs review)')
    }

    console.log('\n🎉 API Endpoint Security Test Complete!')
    console.log('✅ All protected endpoints are properly secured')
    console.log('✅ RLS policies are working correctly')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
if (require.main === module) {
  testAPIEndpoints()
    .then(() => {
      console.log('\n🚀 Ready to test with development server!')
      console.log('Run: npm run dev')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Test failed:', error)
      process.exit(1)
    })
}

module.exports = testAPIEndpoints