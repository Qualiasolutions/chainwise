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

async function createTestUser() {
  console.log('🚀 Creating test user for development...\n');
  
  try {
    // Create a test user
    const testEmail = 'test@chainwise.com';
    const testPassword = 'Test@123456';
    
    // First check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(testEmail);
    
    if (existingUser?.user) {
      console.log('✅ Test user already exists:', testEmail);
      console.log('   User ID:', existingUser.user.id);
      
      // Ensure user record exists in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', existingUser.user.id)
        .single();
      
      if (userError && userError.code === 'PGRST116') {
        // User doesn't exist in users table, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: existingUser.user.id,
            email: testEmail,
            credits_balance: 100,
            subscription_tier: 'free',
            total_points: 0
          });
        
        if (insertError) {
          console.error('❌ Error creating user record:', insertError.message);
        } else {
          console.log('✅ Created user record in database');
        }
      } else if (userData) {
        console.log('✅ User record exists in database');
        console.log('   Credits:', userData.credits_balance);
        console.log('   Tier:', userData.subscription_tier);
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Error creating user:', createError.message);
        return;
      }
      
      console.log('✅ Created test user:', testEmail);
      console.log('   User ID:', newUser.user.id);
      console.log('   Password:', testPassword);
      
      // Create user record in users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email: testEmail,
          credits_balance: 100,
          subscription_tier: 'free',
          total_points: 0
        });
      
      if (insertError) {
        console.error('❌ Error creating user record:', insertError.message);
      } else {
        console.log('✅ Created user record in database');
      }
    }
    
    console.log('\n📋 Test Credentials:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    console.log('\n✨ You can now sign in with these credentials!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Create another test user for portfolio testing
async function createPortfolioTestUser() {
  try {
    const testEmail = 'portfolio@chainwise.com';
    const testPassword = 'Portfolio@123456';
    
    // First check if user exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(testEmail);
    
    if (existingUser?.user) {
      console.log('✅ Portfolio test user already exists:', testEmail);
      
      // Create a sample portfolio
      const { data: portfolios } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', existingUser.user.id);
      
      if (!portfolios || portfolios.length === 0) {
        const { data: portfolio, error: portfolioError } = await supabase
          .from('portfolios')
          .insert({
            user_id: existingUser.user.id,
            name: 'Main Portfolio',
            description: 'My primary crypto portfolio',
            is_default: true,
            total_value_usd: 10000,
            total_cost_usd: 8500
          })
          .select()
          .single();
        
        if (portfolioError) {
          console.error('❌ Error creating portfolio:', portfolioError.message);
        } else {
          console.log('✅ Created sample portfolio');
          
          // Add sample holdings
          const holdings = [
            {
              portfolio_id: portfolio.id,
              symbol: 'BTC',
              name: 'Bitcoin',
              amount: 0.5,
              average_price: 40000,
              current_price: 45000,
              total_cost: 20000,
              current_value: 22500
            },
            {
              portfolio_id: portfolio.id,
              symbol: 'ETH',
              name: 'Ethereum',
              amount: 5,
              average_price: 2500,
              current_price: 2800,
              total_cost: 12500,
              current_value: 14000
            }
          ];
          
          const { error: holdingsError } = await supabase
            .from('portfolio_holdings')
            .insert(holdings);
          
          if (holdingsError) {
            console.error('❌ Error creating holdings:', holdingsError.message);
          } else {
            console.log('✅ Created sample holdings');
          }
        }
      }
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true
      });
      
      if (createError) {
        console.error('❌ Error creating portfolio user:', createError.message);
        return;
      }
      
      console.log('✅ Created portfolio test user:', testEmail);
      
      // Create user record
      await supabase
        .from('users')
        .insert({
          id: newUser.user.id,
          email: testEmail,
          credits_balance: 200,
          subscription_tier: 'pro',
          total_points: 500
        });
    }
    
    console.log('\n📋 Portfolio Test Credentials:');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  await createTestUser();
  await createPortfolioTestUser();
  
  console.log('\n✨ Authentication setup complete!');
  console.log('   You can now sign in and test the application.\n');
}

main().catch(console.error);
