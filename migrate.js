#!/usr/bin/env node
/**
 * Wolf Shield - Direct Database Migration Runner
 * Uses pg library to connect directly to PostgreSQL
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('WOLF SHIELD - DATABASE MIGRATION');
console.log('========================================\n');

// Check if pg is installed
let Client;
try {
  const { Client: PgClient } = require('pg');
  Client = PgClient;
} catch (error) {
  console.log('⚠️  PostgreSQL client (pg) not found.');
  console.log('Installing pg library...\n');
  
  const { execSync } = require('child_process');
  try {
    execSync('npm install --no-save pg', { stdio: 'inherit' });
    const { Client: PgClient } = require('pg');
    Client = PgClient;
  } catch (installError) {
    console.error('\n❌ Failed to install pg library');
    console.error('\nPlease run manually: npm install pg');
    console.error('\nOr use Supabase SQL Editor:');
    console.error('https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql\n');
    process.exit(1);
  }
}

// Database connection (Direct link)
const client = new Client({
  connectionString: 'postgresql://postgres:IsoFlux@856$@db.qmctxtmmzeutlgegjrnb.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Read migration file
const MIGRATION_FILE = path.join(__dirname, 'supabase', 'migrations', '20260228200000_wolf_shield_complete_migration.sql');

console.log('[1/4] Reading migration file...');
let migrationSQL;
try {
  migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log('✅ Migration file loaded (' + migrationSQL.length + ' bytes)\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  process.exit(1);
}

// Execute migration
async function runMigration() {
  try {
    console.log('[2/4] Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    console.log('[3/4] Executing migration (this may take 10-30 seconds)...');
    const result = await client.query(migrationSQL);
    console.log('✅ Migration executed\n');

    console.log('[4/4] Verifying tables...');
    const verifyQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN (
          'users', 'organizations', 'subscriptions', 
          'webhook_events', 'retention_tasks', 'admin_alerts',
          'draft_orders', 'import_jobs'
        )
      ORDER BY table_name;
    `;
    
    const verification = await client.query(verifyQuery);
    console.log('✅ Tables created:');
    verification.rows.forEach(row => {
      console.log('   ✓', row.table_name);
    });

    console.log('\n========================================');
    console.log('✅ MIGRATION COMPLETE');
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Test the application: npm run dev');
    console.log('2. Verify tables in Supabase Dashboard');
    console.log('3. Test CSV import feature');
    console.log('4. Test ledger export feature\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ MIGRATION FAILED');
    console.error('========================================\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Some tables already exist - this may be OK');
      console.log('The migration uses IF NOT EXISTS clauses to skip existing tables.\n');
    } else {
      console.error('\nPlease try using Supabase SQL Editor instead:');
      console.error('https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql\n');
      console.error('Copy and paste the contents of:');
      console.error(MIGRATION_FILE + '\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
runMigration();
