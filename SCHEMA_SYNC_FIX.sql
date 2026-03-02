-- =====================================================
-- ISOFLUX WOLF SHIELD: CRITICAL SCHEMA FIX
-- Run this in Supabase SQL Editor to sync the schema
-- =====================================================

-- This script ensures all columns exist in the users table
-- that are required by the Prisma schema and application

-- 1. Add missing columns to users table if they don't exist
DO $$
BEGIN
    -- Add role column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN role text NOT NULL DEFAULT 'customer';
        
        RAISE NOTICE 'Added role column to users table';
    END IF;

    -- Add email_verified column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email_verified'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
        
        RAISE NOTICE 'Added email_verified column to users table';
    END IF;

    -- Add password_hash column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN password_hash text NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Added password_hash column to users table';
    END IF;

    -- Add full_name column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN full_name varchar(255);
        
        RAISE NOTICE 'Added full_name column to users table';
    END IF;

    -- Add avatar_url column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN avatar_url text;
        
        RAISE NOTICE 'Added avatar_url column to users table';
    END IF;

    -- Add metadata column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
        
        RAISE NOTICE 'Added metadata column to users table';
    END IF;

    -- Add last_login_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'last_login_at'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN last_login_at timestamptz;
        
        RAISE NOTICE 'Added last_login_at column to users table';
    END IF;

    -- Add deleted_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN deleted_at timestamptz;
        
        RAISE NOTICE 'Added deleted_at column to users table';
    END IF;
END $$;

-- 2. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- 3. Set up Super Admin user
-- Replace 'admin@isoflux.app' with your actual Super Admin email
DO $$
DECLARE
    v_user_id uuid;
    v_org_id uuid;
    v_sub_id uuid;
BEGIN
    -- Get or create user in public.users
    SELECT id INTO v_user_id
    FROM public.users
    WHERE email = 'admin@isoflux.app';

    -- Update the user to Super Admin
    IF v_user_id IS NOT NULL THEN
        UPDATE public.users
        SET 
            role = 'super_admin',
            email_verified = true,
            full_name = 'IsoFlux Super Admin',
            updated_at = now()
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Updated existing user % to Super Admin', v_user_id;
    ELSE
        -- If user doesn't exist in public.users, try to find in auth.users
        SELECT id INTO v_user_id
        FROM auth.users
        WHERE email = 'admin@isoflux.app';

        IF v_user_id IS NOT NULL THEN
            -- Create profile in public.users
            INSERT INTO public.users (
                id,
                email,
                email_verified,
                password_hash,
                full_name,
                role,
                metadata,
                created_at,
                updated_at
            ) VALUES (
                v_user_id,
                'admin@isoflux.app',
                true,
                '',  -- Will use Supabase Auth password
                'IsoFlux Super Admin',
                'super_admin',
                '{}'::jsonb,
                now(),
                now()
            );
            
            RAISE NOTICE 'Created public.users profile for auth user %', v_user_id;
        ELSE
            RAISE EXCEPTION 'No user found with email admin@isoflux.app in auth.users. Please create the user first via password reset.';
        END IF;
    END IF;

    -- Ensure Super Admin has an organization
    SELECT id INTO v_org_id
    FROM public.organizations
    WHERE owner_id = v_user_id;

    IF v_org_id IS NULL THEN
        INSERT INTO public.organizations (
            id,
            owner_id,
            name,
            slug,
            settings,
            metadata,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            v_user_id,
            'IsoFlux Platform Administration',
            'isoflux-admin',
            '{}'::jsonb,
            '{}'::jsonb,
            now(),
            now()
        )
        RETURNING id INTO v_org_id;
        
        RAISE NOTICE 'Created organization % for Super Admin', v_org_id;
    END IF;

    -- Ensure organization membership
    INSERT INTO public.organization_members (
        id,
        organization_id,
        user_id,
        role,
        invited_by_id,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_org_id,
        v_user_id,
        'admin',
        v_user_id,
        now(),
        now()
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET role = 'admin', updated_at = now();

    -- Ensure active subscription
    INSERT INTO public.subscriptions (
        id,
        organization_id,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        status,
        tier,
        seats,
        current_period_start,
        current_period_end,
        cancel_at_period_end,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        v_org_id,
        'super_admin_lifetime',
        'super_admin_customer',
        'super_admin_price',
        'active',
        'enterprise',
        999,
        now(),
        now() + interval '100 years',
        false,
        now(),
        now()
    )
    ON CONFLICT (organization_id) DO UPDATE
    SET 
        status = 'active',
        current_period_end = now() + interval '100 years',
        updated_at = now();

    RAISE NOTICE '✅ Super Admin setup complete!';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Organization ID: %', v_org_id;
END $$;

-- 4. Verification Query
SELECT 
    u.id,
    u.email,
    u.role,
    u.email_verified,
    o.name as organization_name,
    s.status as subscription_status,
    s.tier as subscription_tier
FROM public.users u
LEFT JOIN public.organizations o ON o.owner_id = u.id
LEFT JOIN public.subscriptions s ON s.organization_id = o.id
WHERE u.email = 'admin@isoflux.app';

-- Expected result: Should show the Super Admin user with 'super_admin' role,
-- an organization, and an 'active' subscription with 'enterprise' tier.
