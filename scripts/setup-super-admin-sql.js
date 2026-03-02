/**
 * SUPER ADMIN SETUP WITH SUPABASE AUTH (SQL VERSION)
 * 
 * This script creates/updates the Super Admin account using direct SQL
 * Run with: node scripts/setup-super-admin-sql.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const SUPER_ADMIN_EMAIL = 'thenationofmazzi@gmail.com';
const SUPER_ADMIN_PASSWORD = 'Isoflux@856$'; // Change this to a secure password
const SUPER_ADMIN_NAME = 'Mazzi Makko';

async function setupSuperAdmin() {
  console.log('🐺 Wolf Shield - Super Admin Setup (SQL Version)\n');

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

    // Update profile using raw SQL
    console.log('\nStep 3: Updating profile in public.users (SQL)...');
    
    const { error: sqlError } = await supabase.rpc('exec_sql', {
      query: `
        INSERT INTO public.users (id, email, full_name, role, password_hash, email_verified, created_at, updated_at)
        VALUES (
          '${authUser.id}'::uuid,
          '${SUPER_ADMIN_EMAIL}',
          '${SUPER_ADMIN_NAME}',
          'SUPER_ADMIN',
          'managed_by_supabase_auth',
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) 
        DO UPDATE SET
          full_name = '${SUPER_ADMIN_NAME}',
          role = 'SUPER_ADMIN',
          updated_at = NOW();
      `
    });

    if (sqlError) {
      // If RPC doesn't exist, try direct query
      console.log('   Note: RPC method not available, checking if profile exists...');
      
      // Just verify the user exists
      const { data: userCheck } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', SUPER_ADMIN_EMAIL)
        .single();

      if (userCheck) {
        console.log('✅ Profile exists in public.users');
        console.log('   Current role:', userCheck.role);
        
        if (userCheck.role !== 'SUPER_ADMIN') {
          console.log('⚠️  Role is not SUPER_ADMIN. You may need to update it manually via Supabase SQL Editor:');
          console.log(`\n   UPDATE public.users SET role = 'SUPER_ADMIN' WHERE email = '${SUPER_ADMIN_EMAIL}';\n`);
        }
      } else {
        console.log('⚠️  Profile does not exist in public.users');
        console.log('   You need to run this SQL in Supabase SQL Editor:');
        console.log(`\n   INSERT INTO public.users (id, email, full_name, role, password_hash, email_verified)
   VALUES (
     '${authUser.id}'::uuid,
     '${SUPER_ADMIN_EMAIL}',
     '${SUPER_ADMIN_NAME}',
     'SUPER_ADMIN',
     'managed_by_supabase_auth',
     true
   );\n`);
      }
    } else {
      console.log('✅ Profile updated in public.users');
    }

    // Create organization if it doesn't exist
    console.log('\nStep 4: Ensuring organization exists...');
    
    const { data: existingOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', authUser.id)
      .maybeSingle();

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
        console.log('⚠️  Could not create organization via API:', orgError.message);
        console.log('   You may need to create it manually or via signup flow');
        organization = null;
      } else {
        organization = newOrg;
        console.log('✅ Organization created');
      }
    } else {
      console.log('✅ Organization already exists');
    }

    if (organization) {
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
        console.log('⚠️  Could not create membership:', memberError.message);
      } else {
        console.log('✅ Organization membership confirmed');
      }

      // Ensure active subscription
      console.log('\nStep 6: Ensuring active subscription...');
      
      const { error: subError } = await supabase
        .from('subscriptions')
        .upsert({
          organization_id: organization.id,
          tier: 'enterprise',
          status: 'ACTIVE',
          metadata: { super_admin: true },
        }, {
          onConflict: 'organization_id'
        });

      if (subError) {
        console.log('⚠️  Could not create subscription:', subError.message);
      } else {
        console.log('✅ Subscription confirmed as active');
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUPER ADMIN AUTH SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📋 Super Admin Credentials:');
    console.log('   Email:    ', SUPER_ADMIN_EMAIL);
    console.log('   Password: ', SUPER_ADMIN_PASSWORD);
    console.log('   User ID:  ', authUser.id);
    if (organization) {
      console.log('   Org ID:   ', organization.id);
    }
    console.log('\n🔐 Login URL:');
    console.log('   ', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000', '/login');
    console.log('\n✅ Password is set in Supabase Auth - you can now login!');
    console.log('\n⚠️  If login still fails with "Invalid credentials":');
    console.log('   1. Check the role in public.users is SUPER_ADMIN (case-sensitive)');
    console.log('   2. Use the password reset flow at /forgot-password');
    console.log('   3. Check Supabase Dashboard → Authentication → Users');
    console.log('');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupSuperAdmin();
