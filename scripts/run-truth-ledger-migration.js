#!/usr/bin/env node
/**
 * Apply Truth Ledger migration to Supabase.
 * Requires DATABASE_URL in .env or environment (Supabase: Settings → Database → Connection string).
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL.');
  console.error('Add to .env or run: DATABASE_URL="postgresql://..." node scripts/run-truth-ledger-migration.js');
  console.error('Get the connection string from Supabase Dashboard → Settings → Database → Connection string (URI).');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260126100000_truth_ledger_rls.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function run() {
  const { Client } = require('pg');
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Truth Ledger migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
