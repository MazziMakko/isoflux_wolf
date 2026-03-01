/**
 * Wolf Shield Database Migration Runner
 * Run this with: node run-migration.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const SUPABASE_URL = 'https://qmctxtmmzeutlgegjrnb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtY3R4dG1temV1dGxnZWdqcm5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5NjE3NiwiZXhwIjoyMDg0MzcyMTc2fQ.QQ28BFtmZGSqnw5cQFKCmoP5N_60gqd73M6q-t9dtwI';
const MIGRATION_FILE = path.join(__dirname, 'supabase', 'migrations', '20260228200000_wolf_shield_complete_migration.sql');

console.log('========================================');
console.log('WOLF SHIELD - DATABASE MIGRATION');
console.log('========================================\n');

// Read migration file
console.log('[1/3] Reading migration file...');
let migrationSQL;
try {
  migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');
  console.log('✅ Migration file loaded (' + migrationSQL.length + ' bytes)\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  process.exit(1);
}

// Execute migration via Supabase REST API
console.log('[2/3] Connecting to Supabase...');
console.log('URL:', SUPABASE_URL);

const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
const postData = JSON.stringify({
  query: migrationSQL
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('[3/3] Executing migration...\n');

const req = https.request(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('========================================');
      console.log('✅ MIGRATION COMPLETE');
      console.log('========================================\n');
      console.log('Response:', data);
      console.log('\nNext steps:');
      console.log('1. Test the application: npm run dev');
      console.log('2. Verify tables in Supabase Dashboard');
      console.log('3. Run CSV import test\n');
    } else {
      console.log('========================================');
      console.log('❌ MIGRATION FAILED');
      console.log('========================================\n');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
      console.log('\nAlternative: Use Supabase SQL Editor');
      console.log('https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql\n');
      console.log('Copy and paste the contents of:');
      console.log(MIGRATION_FILE + '\n');
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('========================================');
  console.error('❌ CONNECTION ERROR');
  console.error('========================================\n');
  console.error('Error:', error.message);
  console.error('\nPlease use Supabase SQL Editor instead:');
  console.error('https://supabase.com/dashboard/project/qmctxtmmzeutlgegjrnb/sql\n');
  console.error('Copy and paste the contents of:');
  console.error(MIGRATION_FILE + '\n');
  process.exit(1);
});

req.write(postData);
req.end();
