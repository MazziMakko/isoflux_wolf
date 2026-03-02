/**
 * SUPER ADMIN SETUP WITH SUPABASE AUTH
 * 
 * This script creates/updates the Super Admin account with proper Supabase Auth integration
 * Run with: node scripts/setup-super-admin-auth.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPER_ADMIN_EMAIL = 'thenationofmazzi@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Isoflux@856$'; // Change this to a secure password
const SUPER_ADMIN_NAME = 'Mazzi Makko';

async function setupSuperAdmin() {
  console.log('🐺 Wolf Shield - Super Admin Setup\n');

  // Validate environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    console.log('Step 1: Checking if Super Admin exists in auth.users...');
    
    // Check if user exists in Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Failed to list users:', listError.message);
      throw listError;
    }

    let authUser = users.find(u => u.email === SUPER_ADMIN_EMAIL);

    if (authUser) {
      console.log('✅ Super Admin exists in auth.users');
      console.log('   User ID:', authUser.id);
      
      // Update password
      console.log('\nStep 2: Updating Super Admin password...');
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { password: SUPER_ADMIN_PASSWORD }
      );

      if (updateError) {
        console.error('❌ Failed to update password:', updateError.message);
        throw updateError;
      }

      console.log('✅ Password updated successfully');
    } else {
      console.log('⚠️  Super Admin does not exist in auth.users');
      console.log('\nStep 2: Creating Super Admin in auth.users...');

      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: SUPER_ADMIN_EMAIL,
        password: SUPER_ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: SUPER_ADMIN_NAME,
        },
      });

      if (createError) {
        console.error('❌ Failed to create user:', createError.message);
        throw createError;
      }

      authUser = newUser.user;
      console.log('✅ Super Admin created in auth.users');
      console.log('   User ID:', authUser.id);
    }

    // Update or create profile in public.users
    console.log('\nStep 3: Updating profile in public.users...');
    
    // First check if profile exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingProfile) {
      console.log('   Profile already exists, updating role...');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: SUPER_ADMIN_NAME,
          role: 'super_admin', // lowercase as stored in DB
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('❌ Failed to update profile:', updateError.message);
        throw updateError;
      }
    } else {
      console.log('   Creating new profile...');
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: SUPER_ADMIN_EMAIL,
          full_name: SUPER_ADMIN_NAME,
          role: 'super_admin',
        });

      if (insertError) {
        console.error('❌ Failed to create profile:', insertError.message);
        throw insertError;
      }
    }

    console.log('✅ Profile updated in public.users');

    // Create organization if it doesn't exist
    console.log('\nStep 4: Ensuring organization exists...');
    
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', authUser.id)
      .single();

    let organization = existingOrg;

    if (!organization) {
      console.log('   Creating Wolf Shield Admin organization...');
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          owner_id: authUser.id,
          name: 'Wolf Shield Admin',
          slug: 'wolf-shield-admin',
          settings: {},
          metadata: {},
        })
        .select()
        .single();

      if (orgError) {
        console.error('❌ Failed to create organization:', orgError.message);
        throw orgError;
      }

      organization = newOrg;
      console.log('✅ Organization created');
    } else {
      console.log('✅ Organization already exists');
    }

    // Ensure organization membership
    console.log('\nStep 5: Ensuring organization membership...');
    
    const { error: memberError } = await supabase
      .from('organization_members')
      .upsert({
        organization_id: organization.id,
        user_id: authUser.id,
        role: 'admin',
        permissions: [],
      }, {
        onConflict: 'organization_id,user_id'
      });

    if (memberError) {
      console.error('❌ Failed to create membership:', memberError.message);
      throw memberError;
    }

    console.log('✅ Organization membership confirmed');

    // Ensure active subscription
    console.log('\nStep 6: Ensuring active subscription...');
    
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        organization_id: organization.id,
        tier: 'enterprise',
        status: 'active', // lowercase as stored in DB
        metadata: { super_admin: true },
      }, {
        onConflict: 'organization_id'
      });

    if (subError) {
      console.error('❌ Failed to create subscription:', subError.message);
      throw subError;
    }

    console.log('✅ Subscription confirmed as active');

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUPER ADMIN SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Super Admin Credentials:');
    console.log('   Email:    ', SUPER_ADMIN_EMAIL);
    console.log('   Password: ', SUPER_ADMIN_PASSWORD);
    console.log('   Role:     ', 'super_admin');
    console.log('   User ID:  ', authUser.id);
    console.log('   Org ID:   ', organization.id);
    console.log('\n🔐 Login URL:');
    console.log('   ', process.env.NEXT_PUBLIC_APP_URL + '/login');
    console.log('\n✅ You can now login with these credentials!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupSuperAdmin();
