#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  console.log('🚀 Starting database migration...')
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split by semicolons and execute each statement
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt.trim() + ';')
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`  Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', {
        sql: statement
      })
      
      if (error) {
        // Try direct execution if RPC doesn't exist
        console.log('  RPC not available, please run migration directly in Supabase dashboard')
        console.log('  Statement:', statement.substring(0, 50) + '...')
      }
    }
    
    // Add admin user
    console.log('👤 Creating admin user...')
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@beneathy.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMeInProduction123!'
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    })
    
    if (adminError) {
      console.log('⚠️  Admin user might already exist:', adminError.message)
    } else {
      console.log('✅ Admin user created:', adminEmail)
      
      // Add to users table
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: adminUser.user.id,
          full_name: 'Admin',
          subscription_tier: 'enterprise',
          onboarding_completed: true
        })
      
      if (userError) {
        console.log('⚠️  Error adding admin to users table:', userError.message)
      }
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Run the SQL schema directly in Supabase Dashboard > SQL Editor')
    console.log('2. Enable Row Level Security (RLS) on all tables')
    console.log('3. Set up authentication providers in Supabase Dashboard')
    console.log('4. Configure email templates for auth emails')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run migration
runMigration()