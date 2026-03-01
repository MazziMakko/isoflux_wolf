#!/usr/bin/env node
/**
 * 🔍 Wolf Shield - Database Inspector (Read-Only)
 * Sovereign Architect: Schema Discovery Protocol
 * 
 * This script performs read-only inspection of the Supabase database
 * following the Safe Write Protocol from SUPABASE_MCP_INSTRUCTIONS.md
 */

const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('🔍 SOVEREIGN ARCHITECT - DATABASE INSPECTION');
console.log('========================================\n');

// Load pg library
let Client;
try {
  const { Client: PgClient } = require('pg');
  Client = PgClient;
} catch (error) {
  console.log('⚠️  Installing PostgreSQL client (pg)...\n');
  const { execSync } = require('child_process');
  try {
    execSync('npm install --no-save pg', { stdio: 'inherit' });
    const { Client: PgClient } = require('pg');
    Client = PgClient;
  } catch (installError) {
    console.error('\n❌ Failed to install pg library');
    console.error('Please run: npm install pg\n');
    process.exit(1);
  }
}

// Database connection (Direct link with URL-encoded password)
// Password: IsoFlux@856$ → URL encoded: IsoFlux%40856%24
const client = new Client({
  connectionString: 'postgresql://postgres:IsoFlux%40856%24@db.qmctxtmmzeutlgegjrnb.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function inspectDatabase() {
  try {
    console.log('[1/5] Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // ========================================
    // INSPECTION 1: List all tables
    // ========================================
    console.log('[2/5] Listing all tables in public schema...');
    const tablesQuery = `
      SELECT 
        table_name,
        (SELECT COUNT(*) 
         FROM information_schema.columns 
         WHERE columns.table_schema = 'public' 
         AND columns.table_name = tables.table_name) as column_count
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log(`\n📊 Found ${tablesResult.rows.length} tables:\n`);
    
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name.padEnd(30)} (${row.column_count} columns)`);
    });

    // ========================================
    // INSPECTION 2: hud_append_ledger schema
    // ========================================
    console.log('\n[3/5] Inspecting hud_append_ledger table schema...');
    const ledgerSchemaQuery = `
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
        AND table_name = 'hud_append_ledger'
      ORDER BY ordinal_position;
    `;
    
    const ledgerSchemaResult = await client.query(ledgerSchemaQuery);
    
    if (ledgerSchemaResult.rows.length > 0) {
      console.log('\n📋 hud_append_ledger schema:\n');
      ledgerSchemaResult.rows.forEach((col) => {
        const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const defaultVal = col.column_default ? `DEFAULT: ${col.column_default}` : '';
        console.log(`   • ${col.column_name.padEnd(25)} ${col.data_type}${maxLength.padEnd(10)} ${nullable.padEnd(12)} ${defaultVal}`);
      });
    } else {
      console.log('\n⚠️  hud_append_ledger table does NOT exist');
    }

    // ========================================
    // INSPECTION 3: RLS status
    // ========================================
    console.log('\n[4/5] Checking Row Level Security (RLS) status...');
    const rlsQuery = `
      SELECT 
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename = 'hud_append_ledger';
    `;
    
    const rlsResult = await client.query(rlsQuery);
    
    if (rlsResult.rows.length > 0) {
      const rlsEnabled = rlsResult.rows[0].rowsecurity;
      console.log(`\n🔒 RLS Status: ${rlsEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);
      
      // Get RLS policies
      const policiesQuery = `
        SELECT 
          policyname,
          cmd,
          qual,
          with_check
        FROM pg_policies
        WHERE tablename = 'hud_append_ledger';
      `;
      
      const policiesResult = await client.query(policiesQuery);
      
      if (policiesResult.rows.length > 0) {
        console.log(`\n📜 RLS Policies (${policiesResult.rows.length}):\n`);
        policiesResult.rows.forEach((policy, index) => {
          console.log(`   ${index + 1}. ${policy.policyname}`);
          console.log(`      Command: ${policy.cmd || 'ALL'}`);
          console.log(`      Using: ${policy.qual || 'No condition'}`);
          if (policy.with_check) {
            console.log(`      With Check: ${policy.with_check}`);
          }
          console.log('');
        });
      } else {
        console.log('\n⚠️  No RLS policies found for hud_append_ledger');
      }
    } else {
      console.log('\n⚠️  Could not determine RLS status (table may not exist)');
    }

    // ========================================
    // INSPECTION 4: Foreign keys and constraints
    // ========================================
    console.log('[5/5] Checking foreign keys and constraints...');
    const constraintsQuery = `
      SELECT
        tc.constraint_name,
        tc.constraint_type,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      LEFT JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'hud_append_ledger'
      ORDER BY tc.constraint_type, tc.constraint_name;
    `;
    
    const constraintsResult = await client.query(constraintsQuery);
    
    if (constraintsResult.rows.length > 0) {
      console.log(`\n🔗 Constraints (${constraintsResult.rows.length}):\n`);
      
      const grouped = {};
      constraintsResult.rows.forEach(row => {
        if (!grouped[row.constraint_type]) {
          grouped[row.constraint_type] = [];
        }
        grouped[row.constraint_type].push(row);
      });
      
      Object.keys(grouped).forEach(type => {
        console.log(`   ${type}:`);
        grouped[type].forEach(constraint => {
          if (type === 'FOREIGN KEY') {
            console.log(`      • ${constraint.column_name} → ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
          } else if (type === 'PRIMARY KEY') {
            console.log(`      • ${constraint.column_name}`);
          } else {
            console.log(`      • ${constraint.constraint_name} (${constraint.column_name})`);
          }
        });
        console.log('');
      });
    } else {
      console.log('\n⚠️  No constraints found for hud_append_ledger');
    }

    // ========================================
    // SUMMARY REPORT
    // ========================================
    console.log('\n========================================');
    console.log('✅ INSPECTION COMPLETE');
    console.log('========================================\n');
    
    console.log('📊 SUMMARY REPORT:\n');
    console.log(`   Total Tables: ${tablesResult.rows.length}`);
    console.log(`   hud_append_ledger Exists: ${ledgerSchemaResult.rows.length > 0 ? '✅ YES' : '❌ NO'}`);
    if (ledgerSchemaResult.rows.length > 0) {
      console.log(`   hud_append_ledger Columns: ${ledgerSchemaResult.rows.length}`);
      console.log(`   RLS Enabled: ${rlsResult.rows[0]?.rowsecurity ? '✅ YES' : '❌ NO'}`);
      console.log(`   RLS Policies: ${policiesResult.rows.length}`);
      console.log(`   Constraints: ${constraintsResult.rows.length}`);
    }
    console.log('');
    
    console.log('🔍 Sovereign Architect: Schema discovery complete.');
    console.log('   All findings reported. No writes executed.\n');

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ INSPECTION FAILED');
    console.error('========================================\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('\n⚠️  Authentication failed. Please verify:');
      console.error('   1. Database password in .env is correct: IsoFlux@856$');
      console.error('   2. Supabase project is accessible');
      console.error('   3. Database is not paused\n');
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the inspection
inspectDatabase();
