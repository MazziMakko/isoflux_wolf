/**
 * FORCE ENTRY — Master Key
 * Creates Admin User + Organization + Reactor API Key directly in Supabase,
 * bypassing the signup UI. Use when the front door is stuck.
 *
 * Run: npx tsx scripts/force-entry.ts
 * (Or: node --loader tsx scripts/force-entry.ts)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

// Resolve crypto from project (relative path so tsx can find it)
import { hashPassword, generateApiKey } from '../src/lib/core/crypto';

dotenv.config({ path: '.env.local' });
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: '.env' });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env or .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'commander@isoflux.ai';
const PASSWORD = 'SovereignWolf2026!';
const NAME = 'Commander Bowick';

async function forceEntry() {
  console.log('🐺 IsoFlux: Initiating Force Entry Protocol...\n');

  // 1. Create Auth User
  console.log(`1. Creating Auth Identity for ${EMAIL}...`);
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: NAME },
  });

  if (authError) {
    if (authError.message.includes('already been registered')) {
      console.log('   ⚠️ Auth user already exists; fetching existing user...');
      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === EMAIL);
      if (!user) {
        console.error('❌ Could not find existing user.');
        return;
      }
      authData.user = user;
    } else {
      console.error('❌ Auth Failed:', authError.message);
      return;
    }
  }

  const userId = authData!.user!.id;
  console.log('   ✅ Auth ID:', userId);

  // 2. Sync Public Profile (password_hash placeholder; Auth holds real secret)
  console.log('2. Syncing Public Profile...');
  const { error: profileError } = await supabase.from('users').upsert(
    {
      id: userId,
      email: EMAIL,
      full_name: NAME,
      role: 'admin',
      password_hash: 'SECURED_BY_SUPABASE_AUTH_V2',
      email_verified: true,
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    console.error('❌ Profile Sync Failed:', profileError.message);
    return;
  }
  console.log('   ✅ Profile synced.');

  // 3. Create Organization
  console.log('3. Establishing Sovereign Organization...');
  const slug = 'makko-hq-' + randomUUID().slice(0, 8);
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      owner_id: userId,
      name: 'Makko Intelligence HQ',
      slug,
      settings: {},
      metadata: {},
    })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === '23505') {
      // Unique violation: org may already exist for this user; fetch it
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('owner_id', userId)
        .limit(1);
      const existing = existingOrgs?.[0];
      if (existing) {
        console.log('   ✅ Using existing organization:', existing.id);
        await linkMemberAndKey(supabase, userId, existing.id);
        return;
      }
    }
    console.error('❌ Org Creation Failed:', orgError.message);
    return;
  }
  console.log('   ✅ Organization ID:', org.id);

  // 4. Link Member
  const { error: memberError } = await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: userId,
    role: 'admin',
    permissions: [],
  });
  if (memberError) {
    console.error('❌ Member link failed:', memberError.message);
    return;
  }

  // 5. Subscription (free tier) so app doesn't break
  await supabase.from('subscriptions').insert({
    organization_id: org.id,
    tier: 'free',
    status: 'active',
    metadata: {},
  });

  // 6. Forge Reactor API Key (hashed; validation uses same hash)
  await linkMemberAndKey(supabase, userId, org.id);
}

async function linkMemberAndKey(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  orgId: string
) {
  console.log('4. Forging Reactor API Key...');
  const rawKey = generateApiKey('iso');
  const keyHash = await hashPassword(rawKey);
  const keyPrefix = rawKey.slice(0, 8);

  const { error: keyError } = await supabase.from('api_keys').insert({
    organization_id: orgId,
    name: 'Master Sovereign Key',
    key_hash: keyHash,
    key_prefix: keyPrefix,
    permissions: [],
  });

  if (keyError) {
    console.error('❌ API Key Failed:', keyError.message);
    return;
  }

  console.log('\n=============================================');
  console.log('🐺 SYSTEM ACCESS GRANTED');
  console.log('=============================================');
  console.log(`USER:     ${EMAIL}`);
  console.log(`PASS:     ${PASSWORD}`);
  console.log(`ORG ID:   ${orgId}`);
  console.log(`API KEY:  ${rawKey}`);
  console.log('=============================================');
  console.log('Use this API Key to test the Sovereign Switch.');
  console.log('Example:');
  console.log(`  curl -X POST http://localhost:3000/api/isoflux/sovereign-switch \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -H "X-API-Key: ${rawKey}" \\`);
  console.log(`    -d '{"sender_account":"CHASE_001","receiver_address":"0xVault","asset_ticker":"USDC","amount":50000,"unstructured_data":"Settlement"}'`);
}

forceEntry().catch((e) => {
  console.error(e);
  process.exit(1);
});
