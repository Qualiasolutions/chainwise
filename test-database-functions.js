#!/usr/bin/env node

/**
 * Database Function Testing Script for ChainWise
 * Tests the database functions that power the premium tools APIs
 */

const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase with service role key for testing
const supabaseUrl = 'https://vmnuzwoocympormyizsc.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbnV6d29vY3ltcG9ybXlpenNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODI2NjY5MCwiZXhwIjoyMDczODQyNjkwfQ.lmxQyPN_A6iCXuty9-5Koak6zwS3EwUtFxQmaXTfmg8'

const supabase = createClient(supabaseUrl, serviceRoleKey)

// Test results storage
const testResults = []

// Helper function to log test results
function logTest(functionName, success, result = null, error = null) {
  const testResult = {
    function: functionName,
    success,
    timestamp: new Date().toISOString(),
    result,
    error: error?.message || error
  }
  testResults.push(testResult)

  const statusIcon = success ? '✅' : '❌'
  console.log(`${statusIcon} ${functionName} - ${success ? 'SUCCESS' : 'FAILED'}${error ? ` - ${error}` : ''}`)
}

// Test data
const testUserId = 'a8221b35-0cd8-4f03-82b8-82037bf6e7a9' // Existing auth user

async function setupTestUser() {
  console.log('🔧 Setting up test user...')

  // Ensure test user exists in users table with elite tier
  const { data, error } = await supabase
    .from('users')
    .upsert([
      {
        id: testUserId,
        auth_id: testUserId,
        email: 'fawzi.ygoussous@gmail.com',
        tier: 'elite',
        credits: 125,
        monthly_credits: 100
      }
    ], { onConflict: 'auth_id' })

  if (error) {
    console.error('❌ Failed to setup test user:', error)
    return false
  }

  console.log('✅ Test user setup complete')
  return true
}

async function testPremiumToolFunctions() {
  console.log('\n🔧 Testing Premium Tool Database Functions')
  console.log('=' .repeat(50))

  const premiumTests = [
    {
      name: 'generate_whale_tracker_report',
      params: {
        p_user_id: testUserId,
        p_whale_wallets: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '3FupnQyRkckQcyFMN9zzh5yKWr4JGFDTq5'],
        p_time_period: '24h',
        p_report_type: 'standard'
      }
    },
    {
      name: 'generate_ai_report',
      params: {
        p_user_id: testUserId,
        p_report_type: 'market_analysis',
        p_cryptocurrencies: ['bitcoin', 'ethereum'],
        p_time_period: '7d'
      }
    },
    {
      name: 'create_smart_alert',
      params: {
        p_user_id: testUserId,
        p_cryptocurrency: 'bitcoin',
        p_alert_name: 'BTC Alert Test',
        p_conditions: [{ type: 'price_above', value: 50000, currency: 'usd' }]
      }
    },
    {
      name: 'generate_narrative_scan',
      params: {
        p_user_id: testUserId,
        p_keywords: ['DeFi', 'NFT', 'Web3'],
        p_sources: ['twitter', 'reddit'],
        p_time_period: '24h'
      }
    },
    {
      name: 'detect_altcoins',
      params: {
        p_user_id: testUserId,
        p_market_cap: 'small',
        p_sectors: ['gaming', 'defi'],
        p_risk_level: 'medium'
      }
    },
    {
      name: 'generate_signals_pack',
      params: {
        p_user_id: testUserId,
        p_signal_types: ['technical', 'fundamental'],
        p_cryptocurrencies: ['bitcoin']
      }
    },
    {
      name: 'generate_whale_copy_signals',
      params: {
        p_user_id: testUserId,
        p_whale_wallets: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
        p_copy_type: 'transactions'
      }
    }
  ]

  for (const test of premiumTests) {
    try {
      const { data, error } = await supabase.rpc(test.name, test.params)

      if (error) {
        logTest(test.name, false, null, error.message)
      } else {
        const hasValidData = data && data.length > 0 && data[0]
        logTest(test.name, hasValidData, data?.[0], hasValidData ? null : 'No data returned')
      }
    } catch (err) {
      logTest(test.name, false, null, err.message)
    }
  }
}

async function testCoreApplicationFunctions() {
  console.log('\n💼 Testing Core Application Functions')
  console.log('=' .repeat(50))

  // Test user-related functions
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', testUserId)
      .single()

    logTest('fetch_user_profile', !userError, userData, userError)
  } catch (err) {
    logTest('fetch_user_profile', false, null, err.message)
  }

  // Test credit operations
  try {
    const { data, error } = await supabase.rpc('record_credit_usage', {
      p_user_id: testUserId,
      p_credits_used: 5,
      p_description: 'Test credit usage',
      p_feature_type: 'test',
      p_reference_id: 'test-123'
    })

    logTest('record_credit_usage', !error, data, error)
  } catch (err) {
    logTest('record_credit_usage', false, null, err.message)
  }

  // Test portfolio functions
  try {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', testUserId)
      .limit(5)

    logTest('fetch_portfolios', !error, data, error)
  } catch (err) {
    logTest('fetch_portfolios', false, null, err.message)
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️ Testing Database Schema Integrity')
  console.log('=' .repeat(50))

  const tables = [
    'users',
    'portfolios',
    'portfolio_holdings',
    'ai_chat_sessions',
    'credit_transactions',
    'whale_tracker_reports',
    'ai_reports',
    'smart_alerts',
    'narrative_scans',
    'altcoin_detections',
    'signals_packs',
    'whale_copy_signals'
  ]

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      logTest(`table_${table}`, !error, { recordCount: data?.length || 0 }, error)
    } catch (err) {
      logTest(`table_${table}`, false, null, err.message)
    }
  }
}

async function testFunctionsList() {
  console.log('\n📋 Checking Available Database Functions')
  console.log('=' .repeat(50))

  try {
    const { data, error } = await supabase
      .rpc('list_functions')

    if (error) {
      // Try alternative method to list functions
      const query = `
        SELECT
          routines.routine_name,
          routines.routine_type,
          routines.data_type
        FROM information_schema.routines
        WHERE routines.specific_schema='public'
        AND routines.routine_type='FUNCTION'
        ORDER BY routines.routine_name;
      `

      const { data: functionsData, error: queryError } = await supabase.rpc('execute_sql', { query })

      if (queryError) {
        logTest('list_database_functions', false, null, queryError.message)
      } else {
        logTest('list_database_functions', true, { functionCount: functionsData?.length || 0 })
        console.log(`Found ${functionsData?.length || 0} functions`)
      }
    } else {
      logTest('list_database_functions', true, data)
    }
  } catch (err) {
    logTest('list_database_functions', false, null, err.message)
  }
}

async function generateReport() {
  console.log('\n📊 Database Function Test Summary')
  console.log('=' .repeat(50))

  const totalTests = testResults.length
  const successfulTests = testResults.filter(r => r.success).length
  const failedTests = totalTests - successfulTests

  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Successful: ${successfulTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`)

  // Categorize results
  const categories = {
    'Premium Tools': testResults.filter(r => r.function.startsWith('generate_') || r.function.includes('detect_') || r.function.includes('create_smart')),
    'Core Functions': testResults.filter(r => r.function.includes('user') || r.function.includes('credit') || r.function.includes('portfolio')),
    'Database Schema': testResults.filter(r => r.function.startsWith('table_')),
    'System Functions': testResults.filter(r => r.function.includes('list_') || r.function.includes('execute_'))
  }

  console.log('\n📋 Results by Category:')
  Object.entries(categories).forEach(([category, results]) => {
    if (results.length > 0) {
      const successCount = results.filter(r => r.success).length
      const rate = ((successCount / results.length) * 100).toFixed(1)
      console.log(`  ${category}: ${successCount}/${results.length} (${rate}%)`)
    }
  })

  // Critical Issues
  console.log('\n🚨 Critical Issues:')
  const premiumToolFailures = testResults.filter(r => !r.success && r.function.startsWith('generate_'))
  if (premiumToolFailures.length === 0) {
    console.log('  ✅ All premium tools functions working')
  } else {
    console.log('  ❌ Premium tool function failures:')
    premiumToolFailures.forEach(issue => {
      console.log(`    - ${issue.function}: ${issue.error}`)
    })
  }

  // Recommendations
  console.log('\n💡 Recommendations:')
  if (failedTests > 0) {
    console.log('  - Review failed database functions and fix missing/broken functions')
    console.log('  - Ensure all premium tool functions are properly implemented')
    console.log('  - Check database schema and table structure')
  } else {
    console.log('  - All database functions are working correctly!')
    console.log('  - APIs are ready for production deployment')
  }

  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: (successfulTests / totalTests) * 100,
    premiumToolsWorking: premiumToolFailures.length === 0
  }
}

// Main execution
async function runDatabaseTests() {
  console.log('🚀 Starting ChainWise Database Function Testing')
  console.log('=' .repeat(60))

  try {
    // Setup test environment
    const setupSuccess = await setupTestUser()
    if (!setupSuccess) {
      console.error('❌ Failed to setup test environment')
      process.exit(1)
    }

    // Run all tests
    await testDatabaseSchema()
    await testCoreApplicationFunctions()
    await testPremiumToolFunctions()
    await testFunctionsList()

    // Generate report
    const summary = await generateReport()

    // Write detailed results to file
    const fs = require('fs')
    const detailedReport = {
      summary,
      timestamp: new Date().toISOString(),
      testResults,
      environment: {
        supabaseUrl,
        nodeVersion: process.version,
        testUserId
      }
    }

    fs.writeFileSync('database-test-results.json', JSON.stringify(detailedReport, null, 2))
    console.log('\n📁 Detailed results saved to: database-test-results.json')

  } catch (error) {
    console.error('💥 Database testing failed:', error.message)
    process.exit(1)
  }
}

// Check if running as main module
if (require.main === module) {
  runDatabaseTests().then(() => {
    console.log('\n🎉 Database testing completed!')
  }).catch(error => {
    console.error('💥 Database testing failed:', error)
    process.exit(1)
  })
}