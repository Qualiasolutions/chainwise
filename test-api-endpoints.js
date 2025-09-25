#!/usr/bin/env node

/**
 * Comprehensive API Endpoint Testing Script for ChainWise
 * Tests all API endpoints to ensure production readiness
 */

const BASE_URL = 'http://localhost:3002'

// Test data and configurations
const testData = {
  // Premium Tools Test Data
  whaleTracker: {
    walletAddresses: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '3FupnQyRkckQcyFMN9zzh5yKWr4JGFDTq5'],
    timePeriod: '24h',
    reportType: 'standard'
  },

  smartAlerts: {
    cryptocurrency: 'bitcoin',
    conditions: [
      {
        type: 'price_above',
        value: 50000,
        currency: 'usd'
      }
    ],
    alertName: 'BTC Price Alert Test'
  },

  // Portfolio test data
  portfolio: {
    name: 'Test Portfolio',
    description: 'API Testing Portfolio',
    isPublic: false
  },

  // Chat test data
  chat: {
    message: 'What is the current market trend for Bitcoin?',
    persona: 'buddy'
  }
}

// Test results storage
const testResults = []

// Helper function to log test results
function logTest(endpoint, method, status, success, details = {}) {
  const result = {
    endpoint,
    method,
    status,
    success,
    timestamp: new Date().toISOString(),
    ...details
  }
  testResults.push(result)

  const statusIcon = success ? '✅' : '❌'
  console.log(`${statusIcon} ${method} ${endpoint} - Status: ${status} ${details.error ? `- ${details.error}` : ''}`)
}

// Helper function to make HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    return {
      status: response.status,
      success: response.ok,
      data,
      headers: response.headers
    }
  } catch (error) {
    return {
      status: 0,
      success: false,
      error: error.message,
      data: null
    }
  }
}

// Test Categories

async function testPremiumToolsAPIs() {
  console.log('\n🔧 Testing Premium Tools APIs')
  console.log('=' .repeat(50))

  const premiumTools = [
    {
      name: 'Whale Tracker',
      endpoint: '/api/tools/whale-tracker',
      postData: testData.whaleTracker
    },
    {
      name: 'AI Reports',
      endpoint: '/api/tools/ai-reports',
      postData: {
        reportType: 'market_analysis',
        cryptocurrencies: ['bitcoin', 'ethereum'],
        timePeriod: '7d'
      }
    },
    {
      name: 'Smart Alerts',
      endpoint: '/api/tools/smart-alerts',
      postData: testData.smartAlerts
    },
    {
      name: 'Narrative Scanner',
      endpoint: '/api/tools/narrative-scanner',
      postData: {
        keywords: ['DeFi', 'NFT', 'Web3'],
        sources: ['twitter', 'reddit'],
        timePeriod: '24h'
      }
    },
    {
      name: 'Altcoin Detector',
      endpoint: '/api/tools/altcoin-detector',
      postData: {
        marketCap: 'small',
        sectors: ['gaming', 'defi'],
        riskLevel: 'medium'
      }
    },
    {
      name: 'Signals Pack',
      endpoint: '/api/tools/signals-pack',
      postData: {
        signalTypes: ['technical', 'fundamental'],
        cryptocurrencies: ['bitcoin']
      }
    },
    {
      name: 'Whale Copy',
      endpoint: '/api/tools/whale-copy',
      postData: {
        whaleWallets: ['1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'],
        copyType: 'transactions'
      }
    }
  ]

  for (const tool of premiumTools) {
    // Test GET endpoint (list/history)
    const getResult = await makeRequest(tool.endpoint, { method: 'GET' })
    logTest(tool.endpoint, 'GET', getResult.status, getResult.success, {
      error: getResult.error || (getResult.data?.error),
      responseType: typeof getResult.data
    })

    // Test POST endpoint (create/generate)
    const postResult = await makeRequest(tool.endpoint, {
      method: 'POST',
      body: tool.postData
    })
    logTest(tool.endpoint, 'POST', postResult.status, postResult.success, {
      error: postResult.error || (postResult.data?.error),
      responseType: typeof postResult.data,
      hasData: !!postResult.data?.report || !!postResult.data?.result
    })
  }
}

async function testCoreAPIs() {
  console.log('\n💼 Testing Core APIs')
  console.log('=' .repeat(50))

  const coreAPIs = [
    {
      name: 'Portfolio List',
      endpoint: '/api/portfolio',
      method: 'GET'
    },
    {
      name: 'Portfolio Create',
      endpoint: '/api/portfolio',
      method: 'POST',
      body: testData.portfolio
    },
    {
      name: 'Chat',
      endpoint: '/api/chat',
      method: 'POST',
      body: testData.chat
    },
    {
      name: 'Alerts List',
      endpoint: '/api/alerts',
      method: 'GET'
    },
    {
      name: 'Alerts Create',
      endpoint: '/api/alerts',
      method: 'POST',
      body: {
        cryptocurrency: 'bitcoin',
        condition: 'price_above',
        value: 50000,
        currency: 'usd'
      }
    },
    {
      name: 'Profile Get',
      endpoint: '/api/profile',
      method: 'GET'
    },
    {
      name: 'Crypto Search',
      endpoint: '/api/crypto/search?q=bitcoin',
      method: 'GET'
    },
    {
      name: 'Notifications',
      endpoint: '/api/notifications',
      method: 'GET'
    }
  ]

  for (const api of coreAPIs) {
    const result = await makeRequest(api.endpoint, {
      method: api.method,
      body: api.body
    })

    logTest(api.endpoint, api.method, result.status, result.success, {
      error: result.error || (result.data?.error),
      responseType: typeof result.data,
      hasData: !!result.data && Object.keys(result.data).length > 0
    })
  }
}

async function testAuthenticationAndAuthorization() {
  console.log('\n🔐 Testing Authentication & Authorization')
  console.log('=' .repeat(50))

  // Test endpoints without authentication (should return 401)
  const protectedEndpoints = [
    '/api/tools/whale-tracker',
    '/api/portfolio',
    '/api/chat',
    '/api/profile',
    '/api/alerts'
  ]

  for (const endpoint of protectedEndpoints) {
    const result = await makeRequest(endpoint, { method: 'GET' })
    const expectsAuth = result.status === 401

    logTest(endpoint, 'GET (no auth)', result.status, expectsAuth, {
      error: result.data?.error,
      authCheck: expectsAuth ? 'PASS - Returns 401' : 'FAIL - Should require auth'
    })
  }
}

async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling')
  console.log('=' .repeat(50))

  const errorTests = [
    {
      name: 'Invalid JSON POST',
      endpoint: '/api/tools/whale-tracker',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json'
    },
    {
      name: 'Missing Required Fields',
      endpoint: '/api/tools/whale-tracker',
      method: 'POST',
      body: {}
    },
    {
      name: 'Invalid Route',
      endpoint: '/api/nonexistent-endpoint',
      method: 'GET'
    }
  ]

  for (const test of errorTests) {
    const result = await makeRequest(test.endpoint, test)
    const hasProperError = result.status >= 400 && result.data?.error

    logTest(test.endpoint, `${test.method} (${test.name})`, result.status, hasProperError, {
      error: result.data?.error,
      errorHandling: hasProperError ? 'PASS - Returns proper error' : 'FAIL - Should return error'
    })
  }
}

async function generateReport() {
  console.log('\n📊 Test Results Summary')
  console.log('=' .repeat(50))

  const totalTests = testResults.length
  const successfulTests = testResults.filter(r => r.success).length
  const failedTests = totalTests - successfulTests

  console.log(`Total Tests: ${totalTests}`)
  console.log(`✅ Successful: ${successfulTests}`)
  console.log(`❌ Failed: ${failedTests}`)
  console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`)

  // Categorize results
  const categories = {}
  testResults.forEach(result => {
    const category = result.endpoint.includes('/tools/') ? 'Premium Tools' :
                    result.endpoint.includes('/portfolio') ? 'Portfolio' :
                    result.endpoint.includes('/chat') ? 'Chat' :
                    result.endpoint.includes('/alerts') ? 'Alerts' : 'Other'

    if (!categories[category]) categories[category] = { total: 0, success: 0 }
    categories[category].total++
    if (result.success) categories[category].success++
  })

  console.log('\n📋 Results by Category:')
  Object.entries(categories).forEach(([category, stats]) => {
    const rate = ((stats.success / stats.total) * 100).toFixed(1)
    console.log(`  ${category}: ${stats.success}/${stats.total} (${rate}%)`)
  })

  // Critical Issues
  console.log('\n🚨 Critical Issues:')
  const criticalIssues = testResults.filter(r => !r.success && r.status === 500)
  if (criticalIssues.length === 0) {
    console.log('  ✅ No 500 errors found')
  } else {
    criticalIssues.forEach(issue => {
      console.log(`  ❌ ${issue.method} ${issue.endpoint} - ${issue.error}`)
    })
  }

  // Authentication Issues
  console.log('\n🔐 Authentication Status:')
  const authTests = testResults.filter(r => r.endpoint.includes('(no auth)'))
  const properAuthCount = authTests.filter(r => r.status === 401).length
  console.log(`  Protected Endpoints: ${properAuthCount}/${authTests.length} properly secured`)

  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: (successfulTests / totalTests) * 100,
    categories,
    criticalIssues: criticalIssues.length,
    authenticationWorking: properAuthCount === authTests.length
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting ChainWise API Endpoint Testing')
  console.log('=' .repeat(60))

  try {
    // Test server availability
    const healthCheck = await makeRequest('/api/portfolio')
    if (healthCheck.status === 0) {
      console.error('❌ Cannot connect to server at', BASE_URL)
      console.error('Please ensure the development server is running with: npm run dev')
      process.exit(1)
    }

    console.log('✅ Server is responding')

    await testAuthenticationAndAuthorization()
    await testPremiumToolsAPIs()
    await testCoreAPIs()
    await testErrorHandling()

    const summary = await generateReport()

    // Write detailed results to file
    const fs = require('fs')
    const detailedReport = {
      summary,
      timestamp: new Date().toISOString(),
      testResults,
      environment: {
        baseUrl: BASE_URL,
        nodeVersion: process.version
      }
    }

    fs.writeFileSync('api-test-results.json', JSON.stringify(detailedReport, null, 2))
    console.log('\n📁 Detailed results saved to: api-test-results.json')

  } catch (error) {
    console.error('💥 Test execution failed:', error.message)
    process.exit(1)
  }
}

// Check if fetch is available (Node 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ with native fetch support')
  console.error('Or run: npm install node-fetch')
  process.exit(1)
}

// Run tests
runAllTests().then(() => {
  console.log('\n🎉 Testing completed!')
}).catch(error => {
  console.error('💥 Testing failed:', error)
  process.exit(1)
})