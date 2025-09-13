#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupDatabase() {
  console.log('🚀 Setting up ChainWise Database Tables...\n');
  console.log('📌 Supabase URL:', supabaseUrl);
  console.log('📌 Using Service Role Key\n');
  
  try {
    // Test connection first
    console.log('🔗 Testing database connection...');
    const { data: testData, error: testError } = await supabase.auth.admin.listUsers();
    
    if (testError && !testError.message.includes('not enabled')) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      console.log('\n💡 Please verify:');
      console.log('1. Your Supabase project is active');
      console.log('2. The service role key is correct');
      console.log('3. Your project URL is correct\n');
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase\n');
    
    // Since we can't execute raw SQL through the JS client directly,
    // we'll provide instructions for manual setup
    console.log('📋 Database Setup Instructions:\n');
    console.log('Since direct SQL execution requires admin access, please follow these steps:\n');
    console.log('1. Go to your Supabase Dashboard:');
    console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com')}/project/nrjtajifvlmfgodgdciu/sql/new\n`);
    console.log('2. Copy the entire contents of: scripts/create-database-schema.sql\n');
    console.log('3. Paste it into the SQL Editor\n');
    console.log('4. Click "Run" to execute all statements\n');
    console.log('5. You should see "Success. No rows returned" for most statements\n');
    
    // Let's at least check what tables currently exist
    console.log('🔍 Checking existing tables...\n');
    
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
    
    let existingTables = 0;
    let missingTables = [];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          if (error.message.includes('does not exist')) {
            console.log(`❌ Table '${table}': Not found`);
            missingTables.push(table);
          } else {
            console.log(`⚠️  Table '${table}': ${error.message}`);
          }
        } else {
          console.log(`✅ Table '${table}': Exists`);
          existingTables++;
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Error checking`);
        missingTables.push(table);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Database Status:`);
    console.log(`   ✅ Existing tables: ${existingTables}/${tables.length}`);
    console.log(`   ❌ Missing tables: ${missingTables.length}/${tables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`\n   Missing: ${missingTables.join(', ')}`);
      console.log('\n⚠️  IMPORTANT: You need to create the missing tables!');
      console.log('   Follow the instructions above to run the SQL schema.\n');
      
      // Generate direct link to SQL editor
      const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectId) {
        console.log('🔗 Direct link to SQL Editor:');
        console.log(`   https://supabase.com/dashboard/project/${projectId}/sql/new\n`);
      }
    } else {
      console.log('\n✨ All tables exist! Your database is properly configured.\n');
    }
    
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);
