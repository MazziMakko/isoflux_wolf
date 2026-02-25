// =====================================================
// CREATE MAZZI MAKKO SUPER ADMIN - Node.js Script
// Run with: node scripts/create-mazzi-admin.js
// =====================================================

const { createClient } = require('@supabase/supabase-js');
const { nanoid } = require('nanoid');

const supabaseUrl = 'https://qmctxtmmzeutlgegjrnb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtY3R4dG1temV1dGxnZWdqcm5iIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5NjE3NiwiZXhwIjoyMDg0MzcyMTc2fQ.QQ28BFtmZGSqnw5cQFKCmoP5N_60gqd73M6q-t9dtwI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createMazziAdmin() {
  console.log('🐺 Creating Mazzi Makko SUPER ADMIN account...\n');

  try {
    // Step 1: Create or get existing auth user
    console.log('Step 1: Checking/creating auth user...');
    
    // First, try to get existing user
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let existingUser = existingUsers.users.find(u => u.email === 'thenationofmazzi@gmail.com');
    
    let userId;
    
    if (existingUser) {
      console.log('✅ Found existing auth user:', existingUser.id);
      userId = existingUser.id;
      
      // Update password if needed
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password: 'Isoflux@856$',
        email_confirm: true,
        user_metadata: {
          full_name: 'Mazzi Makko',
          role: 'super_admin',
        },
      });
      
      if (updateError) {
        console.log('⚠️  Could not update password:', updateError.message);
      } else {
        console.log('✅ Password updated');
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'thenationofmazzi@gmail.com',
        password: 'Isoflux@856$',
        email_confirm: true,
        user_metadata: {
          full_name: 'Mazzi Makko',
          role: 'super_admin',
        },
      });

      if (authError) {
        console.error('❌ Auth creation failed:', authError.message);
        throw authError;
      }
      
      console.log('✅ Auth user created:', authData.user.id);
      userId = authData.user.id;
    }

    // Step 2: Create/update public.users profile
    console.log('\nStep 2: Creating user profile...');
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: 'thenationofmazzi@gmail.com',
        full_name: 'Mazzi Makko',
        role: 'SUPER_ADMIN',
        password_hash: 'managed_by_supabase_auth',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      throw profileError;
    }
    console.log('✅ User profile created');

    // Step 3: Create organization
    console.log('\nStep 3: Creating organization...');
    const orgId = crypto.randomUUID();
    const { error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: orgId,
        owner_id: userId,
        name: 'Wolf Shield Admin',
        slug: 'wolf-shield-admin',
        settings: {},
        metadata: { is_platform_admin: true },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (orgError) {
      console.error('❌ Organization creation failed:', orgError.message);
      throw orgError;
    }
    console.log('✅ Organization created:', orgId);

    // Step 4: Add organization member
    console.log('\nStep 4: Adding organization membership...');
    const { error: memberError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: orgId,
        user_id: userId,
        role: 'admin',
        permissions: ['all'],
        created_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('❌ Membership creation failed:', memberError.message);
      throw memberError;
    }
    console.log('✅ Organization membership created');

    // Step 5: Create ACTIVE subscription
    console.log('\nStep 5: Creating subscription...');
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        organization_id: orgId,
        tier: 'enterprise',
        status: 'ACTIVE',
        metadata: { 
          lifetime_access: true, 
          platform_admin: true,
          created_for: 'mazzi_makko_admin'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (subError) {
      console.error('❌ Subscription creation failed:', subError.message);
      throw subError;
    }
    console.log('✅ Subscription created (ACTIVE)');

    // Step 6: Verify everything
    console.log('\n🔍 Verifying account...');
    
    const { data: verifyUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'thenationofmazzi@gmail.com')
      .single();

    const { data: verifyOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', userId)
      .single();

    const { data: verifySub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', orgId)
      .single();

    console.log('\n✅ VERIFICATION RESULTS:');
    console.log('User:', verifyUser ? '✅ Found' : '❌ Missing');
    console.log('Organization:', verifyOrg ? '✅ Found' : '❌ Missing');
    console.log('Subscription:', verifySub ? `✅ Found (${verifySub.status})` : '❌ Missing');

    console.log('\n🎉 SUCCESS! Mazzi Makko account is ready!\n');
    console.log('📧 Email: thenationofmazzi@gmail.com');
    console.log('🔑 Password: Isoflux@856$');
    console.log('👤 Role: SUPER_ADMIN');
    console.log('🏢 Organization: Wolf Shield Admin');
    console.log('💳 Subscription: ACTIVE (Lifetime)\n');
    console.log('🚀 Ready to login at: https://www.isoflux.app/login\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createMazziAdmin();
