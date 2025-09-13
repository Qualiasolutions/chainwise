#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testSupabaseConnection() {
  log('\n🔍 Testing Supabase Connection...', 'cyan');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      log(`❌ Supabase connection failed: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Supabase connection successful', 'green');
    return true;
  } catch (error) {
    log(`❌ Supabase connection error: ${error.message}`, 'red');
    return false;
  }
}

async function testDatabaseTables() {
  log('\n📊 Testing Database Tables...', 'cyan');
  
  const tables = [
    'users',
    'portfolios',
    'portfolio_holdings',
    'ai_chat_sessions',
    'ai_chat_messages',
    'credit_transactions',
    'user_alerts',
    'subscriptions'
  ];
  
  let allTablesOk = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('does not exist')) {
          log(`❌ Table '${table}': Does not exist`, 'red');
          allTablesOk = false;
        } else {
          log(`⚠️  Table '${table}': ${error.message}`, 'yellow');
        }
      } else {
        log(`✅ Table '${table}': Accessible`, 'green');
      }
    } catch (err) {
      log(`❌ Table '${table}': Error - ${err.message}`, 'red');
      allTablesOk = false;
    }
  }
  
  return allTablesOk;
}

async function testAPIEndpoints() {
  log('\n🚀 Testing API Endpoints...', 'cyan');
  
  const endpoints = [
    { path: '/api/health', method: 'GET', name: 'Health Check' },
    { path: '/api/credits/balance', method: 'GET', name: 'Credits Balance' },
    { path: '/api/portfolio', method: 'GET', name: 'Portfolio List' },
    { path: '/api/premium-features', method: 'GET', name: 'Premium Features' }
  ];
  
  let allEndpointsOk = true;
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${siteUrl}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        log(`✅ ${endpoint.name} (${endpoint.path}): ${response.status} OK`, 'green');
      } else {
        log(`⚠️  ${endpoint.name} (${endpoint.path}): ${response.status} ${response.statusText}`, 'yellow');
        if (response.status >= 500) {
          allEndpointsOk = false;
        }
      }
    } catch (error) {
      log(`❌ ${endpoint.name} (${endpoint.path}): ${error.message}`, 'red');
      allEndpointsOk = false;
    }
  }
  
  return allEndpointsOk;
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'cyan');
  
  try {
    // Try to sign in with test credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@chainwise.com',
      password: 'Test@123456'
    });
    
    if (error) {
      log(`⚠️  Test user authentication: ${error.message}`, 'yellow');
      log('   You may need to create a test user first', 'yellow');
      return false;
    }
    
    if (data.user) {
      log(`✅ Authentication successful for: ${data.user.email}`, 'green');
      
      // Sign out
      await supabase.auth.signOut();
      return true;
    }
  } catch (error) {
    log(`❌ Authentication error: ${error.message}`, 'red');
    return false;
  }
  
  return false;
}

async function runAllTests() {
  log('\n' + '='.repeat(50), 'blue');
  log('🧪 ChainWise Comprehensive Test Suite', 'magenta');
  log('='.repeat(50) + '\n', 'blue');
  
  const results = {
    supabase: await testSupabaseConnection(),
    database: await testDatabaseTables(),
    api: await testAPIEndpoints(),
    auth: await testAuthentication()
  };
  
  log('\n' + '='.repeat(50), 'blue');
  log('📊 Test Results Summary', 'magenta');
  log('='.repeat(50), 'blue');
  
  let allPassed = true;
  
  for (const [test, passed] of Object.entries(results)) {
    if (passed) {
      log(`✅ ${test.charAt(0).toUpperCase() + test.slice(1)}: PASSED`, 'green');
    } else {
      log(`❌ ${test.charAt(0).toUpperCase() + test.slice(1)}: FAILED`, 'red');
      allPassed = false;
    }
  }
  
  log('\n' + '='.repeat(50), 'blue');
  
  if (allPassed) {
    log('✨ All tests passed successfully!', 'green');
    log('   Your ChainWise application is ready to use.', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
    log('\n💡 Recommendations:', 'cyan');
    
    if (!results.database) {
      log('1. Run the database schema in Supabase SQL Editor', 'yellow');
      log('   - Go to: ' + supabaseUrl.replace('.supabase.co', '.supabase.com') + '/sql', 'yellow');
      log('   - Run: scripts/create-database-schema.sql', 'yellow');
    }
    
    if (!results.auth) {
      log('2. Create test users by running: node scripts/fix-authentication.js', 'yellow');
    }
    
    if (!results.api) {
      log('3. Check that the development server is running: npm run dev', 'yellow');
    }
  }
  
  log('\n', 'reset');
}

// Run tests
runAllTests().catch(console.error);
