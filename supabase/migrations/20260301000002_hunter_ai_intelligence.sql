-- =====================================================
-- HUNTER ENGINE: AI-POWERED LEAD SCORING UPDATE
-- Migration Date: March 1, 2026
-- Adds pain_point_hypothesis and AI retry tracking
-- =====================================================

-- Add new columns to hunter_leads table
ALTER TABLE public.hunter_leads 
ADD COLUMN IF NOT EXISTS pain_point_hypothesis TEXT,
ADD COLUMN IF NOT EXISTS ai_scoring_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scoring_error TEXT;

-- Add index for AI scoring retry queries
CREATE INDEX IF NOT EXISTS idx_hunter_leads_ai_scoring_attempts 
  ON public.hunter_leads(ai_scoring_attempts) 
  WHERE ai_scoring_attempts > 0 AND tech_score = 0;

-- Update comments
COMMENT ON COLUMN public.hunter_leads.pain_point_hypothesis IS 
'AI-generated analysis of likely pain points and challenges this company faces';

COMMENT ON COLUMN public.hunter_leads.ai_scoring_attempts IS 
'Number of times AI scoring was attempted (for retry logic)';

COMMENT ON COLUMN public.hunter_leads.last_scoring_error IS 
'Last error message if AI scoring failed (for debugging)';

-- Create view for leads that need AI retry
CREATE OR REPLACE VIEW public.hunter_leads_needs_ai_retry AS
SELECT 
  id,
  company_name,
  estimated_units,
  city,
  state,
  tech_score,
  ai_scoring_attempts,
  last_scoring_error,
  scouted_at
FROM public.hunter_leads
WHERE ai_scoring_attempts > 0 
  AND ai_scoring_attempts < 3
  AND tech_score < 50
  AND status = 'pending'
ORDER BY ai_scoring_attempts ASC, scouted_at DESC;

COMMENT ON VIEW public.hunter_leads_needs_ai_retry IS 
'Leads where AI scoring failed but can be retried (attempts < 3, low score)';
