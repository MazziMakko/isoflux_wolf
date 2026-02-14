#!/usr/bin/env node
/**
 * Apply base schema migration (users, organizations, api_keys, etc.) to Supabase.
 * Requires DATABASE_URL in .env. Run this so login, dashboard, and API keys work.
 */
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL or SUPABASE_DB_URL.');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260125000000_base_schema.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function run() {
  const { Client } = require('pg');
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Base schema migration applied successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
