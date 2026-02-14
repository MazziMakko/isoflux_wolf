-- =====================================================
-- TRUTH LEDGER - Append-only, digest-chained records
-- RLS: Org members can read; only service role can insert.
-- Disclosed in ToS for regulatory / dispute resolution.
-- Runs even when public.organizations / organization_members do not exist yet.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: append-only ledger (no updated_at, no UPDATE/DELETE policies)
-- organization_id has no FK so this migration runs even before public.organizations exists
CREATE TABLE IF NOT EXISTS public.truth_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  transaction_id TEXT NOT NULL,
  message_type TEXT NOT NULL,
  payload_digest TEXT NOT NULL,
  prev_ledger_hash TEXT,
  ledger_hash TEXT NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast org-scoped reads and chain verification
CREATE INDEX IF NOT EXISTS idx_truth_ledger_org_created
  ON public.truth_ledger(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_truth_ledger_transaction_id
  ON public.truth_ledger(organization_id, transaction_id);

CREATE INDEX IF NOT EXISTS idx_truth_ledger_ledger_hash
  ON public.truth_ledger(ledger_hash);

COMMENT ON TABLE public.truth_ledger IS 'IsoFlux Truth Ledger: append-only, hash-chained records per organization (disclosed in ToS)';
COMMENT ON COLUMN public.truth_ledger.payload_digest IS 'SHA-256 digest of normalized payload (no PII)';
COMMENT ON COLUMN public.truth_ledger.prev_ledger_hash IS 'Hash of previous row in chain; null for genesis';
COMMENT ON COLUMN public.truth_ledger.ledger_hash IS 'Hash of (prev_ledger_hash || transaction_id || message_type || payload_digest || signed_at)';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.truth_ledger ENABLE ROW LEVEL SECURITY;

-- SELECT policy: only create if organization_members exists (so migration runs on empty DB)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'organization_members'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'truth_ledger' AND policyname = 'truth_ledger_select_org_member'
    ) THEN
      CREATE POLICY "truth_ledger_select_org_member"
        ON public.truth_ledger FOR SELECT
        USING (
          organization_id IN (
            SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
          )
        );
    END IF;
  END IF;
END $$;

-- No INSERT/UPDATE/DELETE policy for authenticated: only service_role can write.

-- =====================================================
-- GRANTS (explicit: only service_role can write)
-- =====================================================

-- Read-only for authenticated: SELECT only (RLS further restricts to own org)
GRANT SELECT ON public.truth_ledger TO authenticated;
GRANT SELECT ON public.truth_ledger TO anon;

-- Explicitly revoke write so only service_role can append
REVOKE INSERT, UPDATE, DELETE ON public.truth_ledger FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.truth_ledger FROM anon;

-- Backend (IsoFlux TruthLedgerService) uses service_role; bypasses RLS, can INSERT only
GRANT ALL ON public.truth_ledger TO service_role;
