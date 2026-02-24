// =====================================================
// WOLF SHIELD: AUTOMATED DATABASE MIGRATION
// Executes SQL migrations via Supabase Management API
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Supabase credentials from .env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_PROJECT_REF = 'qmctxtmmzeutlgegjrnb';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Migration files in order
const migrations = [
  {
    name: '1. Cleanup Old Database',
    file: 'supabase/migrations/00000000000000_cleanup_old_database.sql',
    critical: true
  },
  {
    name: '2. Base Schema (Organizations & Users)',
    file: 'supabase/migrations/00000000000001_base_schema.sql',
    critical: true
  },
  {
    name: '3. Wolf Shield Ledger Core',
    file: 'supabase/migrations/20260223000000_wolf_shield_ledger.sql',
    critical: true
  },
  {
    name: '4. Wolf Shield Complete Schema',
    file: 'supabase/migrations/20260224000000_wolf_shield_complete.sql',
    critical: true
  },
  {
    name: '5. Bucket Security',
    file: 'supabase/BUCKET_SECURITY.sql',
    critical: false
  }
];

// Execute SQL via RPC
async function executeSQL(sql, migrationName) {
  console.log(`\n🔄 Executing: ${migrationName}...`);
  
  try {
    // Split SQL into individual statements (rough split on semicolons)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      if (!statement) continue;
      
      try {
        // Use the service role key to execute raw SQL
        const { data, error } = await supabase.rpc('exec', {
          sql: statement
        });
        
        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate')) {
            console.log(`   ⚠️  Already exists (skipping)`);
          } else {
            console.error(`   ❌ Error:`, error.message);
            errorCount++;
          }
        } else {
          successCount++;
        }
      } catch (err) {
        console.error(`   ❌ Exception:`, err.message);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Complete: ${successCount} successful, ${errorCount} errors`);
    return errorCount === 0;
    
  } catch (error) {
    console.error(`   ❌ Failed to execute ${migrationName}:`, error);
    return false;
  }
}

// Main execution
async function runMigrations() {
  console.log('🐺 WOLF SHIELD: Automated Database Migration');
  console.log('='.repeat(60));
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔑 Service Role: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
  console.log('='.repeat(60));
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const migration of migrations) {
    try {
      // Read SQL file
      const sqlPath = join(process.cwd(), migration.file);
      const sql = readFileSync(sqlPath, 'utf-8');
      
      console.log(`\n📄 Migration: ${migration.name}`);
      console.log(`   File: ${migration.file}`);
      console.log(`   Size: ${(sql.length / 1024).toFixed(2)} KB`);
      
      // Execute SQL
      const success = await executeSQL(sql, migration.name);
      
      if (success) {
        successCount++;
        console.log(`   ✅ SUCCESS\n`);
      } else {
        failureCount++;
        if (migration.critical) {
          console.error(`   ❌ CRITICAL FAILURE - Stopping migrations\n`);
          break;
        } else {
          console.warn(`   ⚠️  NON-CRITICAL FAILURE - Continuing\n`);
        }
      }
      
      // Wait 2 seconds between migrations
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      failureCount++;
      console.error(`\n❌ Error reading ${migration.file}:`, error.message);
      if (migration.critical) {
        console.error('   CRITICAL MIGRATION FAILED - Stopping');
        break;
      }
    }
  }
  
  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('🐺 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount} / ${migrations.length}`);
  console.log(`❌ Failed: ${failureCount} / ${migrations.length}`);
  
  if (failureCount === 0) {
    console.log('\n🎉 ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('\n📋 Next Steps:');
    console.log('   1. Verify tables in Supabase Dashboard');
    console.log('   2. Check Storage bucket: tenant-documents');
    console.log('   3. Deploy to Vercel');
    console.log('   4. Create Stripe products');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME MIGRATIONS FAILED');
    console.log('   Review errors above and run manually in Supabase SQL Editor');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run migrations
runMigrations();
