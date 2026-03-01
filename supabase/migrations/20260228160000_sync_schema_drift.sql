-- Enable pgcrypto if not already enabled (usually is for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 0. Ensure enum values exist
ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'customer';

-- 1. Fix 'users' table
ALTER TABLE "public"."users" 
ADD COLUMN IF NOT EXISTS "role" "user_role" NOT NULL DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS "password_hash" TEXT,
ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;

-- 2. Fix 'organizations' table
-- First add owner_id as nullable to avoid errors with existing data
ALTER TABLE "public"."organizations" 
ADD COLUMN IF NOT EXISTS "owner_id" UUID,
ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}';

-- Fix existing organizations (assign to known admin/user)
-- Using the user ID found earlier: 5fc9402b-8944-4328-ac98-7926d29ab090 (Commander Bowick)
UPDATE "public"."organizations" 
SET "owner_id" = '5fc9402b-8944-4328-ac98-7926d29ab090' 
WHERE "owner_id" IS NULL;

-- Now enforce NOT NULL and Foreign Key
ALTER TABLE "public"."organizations" 
ALTER COLUMN "owner_id" SET NOT NULL;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organizations_owner_id_fkey') THEN
        ALTER TABLE "public"."organizations" 
        ADD CONSTRAINT "organizations_owner_id_fkey" 
        FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Fix 'organization_members' table
ALTER TABLE "public"."organization_members" 
ADD COLUMN IF NOT EXISTS "permissions" JSONB NOT NULL DEFAULT '[]';

-- 4. Create 'api_keys' table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "key_hash" TEXT NOT NULL,
    "key_prefix" VARCHAR(20) NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "last_used_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "api_keys_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
    CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS "api_keys_organization_id_idx" ON "public"."api_keys"("organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_key" ON "public"."api_keys"("key_hash");

-- 5. Add RLS Policies for new table 'api_keys'
ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;

-- Policy: Organization admins can view their organization's API keys
CREATE POLICY "Admins can view org api keys" ON "public"."api_keys"
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "public"."organization_members" om
        WHERE om.organization_id = "api_keys".organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner', 'super_admin')
    )
);

-- Policy: Organization admins can create API keys
CREATE POLICY "Admins can create org api keys" ON "public"."api_keys"
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM "public"."organization_members" om
        WHERE om.organization_id = "api_keys".organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner', 'super_admin')
    )
);

-- Policy: Organization admins can delete/revoke API keys
CREATE POLICY "Admins can delete org api keys" ON "public"."api_keys"
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM "public"."organization_members" om
        WHERE om.organization_id = "api_keys".organization_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner', 'super_admin')
    )
);
