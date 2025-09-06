const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initializeDatabase() {
  console.log('🚀 Initializing ChainWise Database...\n');
  
  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, 'create-database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      // Extract operation type for logging
      const operationType = statement.match(/^(CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT)/i)?.[1] || 'EXECUTE';
      const targetMatch = statement.match(/(TABLE|EXTENSION|FUNCTION|TRIGGER|POLICY|INDEX)\s+(?:IF\s+(?:NOT\s+)?EXISTS\s+)?([^\s(]+)/i);
      const targetType = targetMatch?.[1] || 'STATEMENT';
      const targetName = targetMatch?.[2] || '';
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${operationType} ${targetType} ${targetName}... `);
      
      try {
        const { data, error } = await supabase.rpc('query', { query_text: statement });
        
        if (error) {
          // Check if it's a "already exists" error which is okay
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate') ||
              error.code === '42710' || // duplicate_object
              error.code === '42P07') { // duplicate_table
            console.log('⚠️  Already exists (skipping)');
            successCount++;
          } else {
            console.log(`❌ Failed: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log('✅ Success');
          successCount++;
        }
      } catch (err) {
        // Try direct SQL execution as fallback
        try {
          const { data, error } = await supabase.from('_sql').select(statement);
          if (!error || error.message.includes('already exists')) {
            console.log('✅ Success (fallback)');
            successCount++;
          } else {
            throw error;
          }
        } catch (fallbackErr) {
          console.log(`❌ Failed: ${fallbackErr.message || fallbackErr}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Database Initialization Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log('='.repeat(50) + '\n');
    
    // Test database connection and tables
    console.log('🔍 Verifying database setup...\n');
    
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
    
    for (const table of tables) {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}': ${error.message}`);
      } else {
        console.log(`✅ Table '${table}': Accessible`);
      }
    }
    
    console.log('\n✨ Database initialization complete!');
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some operations failed. You may need to:');
      console.log('1. Run the SQL directly in Supabase SQL Editor');
      console.log('2. Check Supabase Dashboard for any configuration issues');
      console.log('3. Ensure you have proper permissions\n');
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during initialization:', error.message);
    console.log('\n💡 Alternative Solution:');
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/create-database-schema.sql');
    console.log('4. Execute the SQL manually\n');
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
