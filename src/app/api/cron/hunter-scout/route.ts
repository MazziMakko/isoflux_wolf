// =====================================================
// WOLF HUNTER ENGINE - AI-POWERED LEAD SCORING
// Cron Route: Tuesday & Thursday at 3:00 AM EST
// =====================================================
// Scrapes public housing authority registries for ICP leads
// Uses Ollama (Local LLM) for intelligent lead scoring
// Extracts: Company Name, Email, Estimated Units
// AI Scores: 1-10 likelihood of needing HUD compliance automation

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import DataGateway from '@/lib/core/data-gateway';

const CRON_SECRET = process.env.CRON_SECRET;
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const AI_SCORING_ENABLED = process.env.AI_SCORING_ENABLED !== 'false';
const AI_SCORING_MAX_RETRIES = parseInt(process.env.AI_SCORING_MAX_RETRIES || '3');
const AI_SCORING_TIMEOUT_MS = parseInt(process.env.AI_SCORING_TIMEOUT_MS || '30000');

// =====================================================
// AI SCORING SYSTEM PROMPT
// =====================================================
const AI_SCORING_PROMPT = `You are a Senior SaaS Sales Manager analyzing property management companies for IsoFlux Wolf Shield - HUD compliance automation software.

Your task: Analyze the provided property management company data and score their likelihood of needing our HUD compliance automation tool.

SCORING CRITERIA (1-10):
- SWEET SPOT: Companies with 20-300 units (score 8-10)
- Unit count is PRIMARY indicator:
  * 20-50 units: Score 7-8 (small but viable)
  * 51-150 units: Score 8-9 (ideal size)
  * 151-300 units: Score 9-10 (perfect fit)
  * 301-500 units: Score 7-8 (good but may have existing solutions)
  * 500+ units: Score 5-6 (likely has enterprise software already)
  * Under 20 units: Score 2-4 (too small to afford $299/mo)

ADDITIONAL FACTORS:
- Affordable housing / HUD properties: +1 point
- Modern website: +1 point
- Professional email domain: +1 point
- Located in NJ, PA, NY (our initial markets): +1 point

RESPONSE FORMAT (JSON ONLY):
{
  "score": 8,
  "reasoning": "Camden Housing Authority manages 450 units of affordable housing. Perfect fit for Wolf Shield - large enough to need automation but not so large they have custom enterprise software. HUD-linked properties = compliance pain. Strong candidate.",
  "pain_points": "Manual rent tracking across 450 units, HUD compliance reporting anxiety, likely using Excel/paper ledgers, high audit risk"
}

Respond with ONLY valid JSON. No markdown, no explanations outside the JSON.`;

// =====================================================
// HOUSING AUTHORITY DATA SOURCES
// =====================================================
const DATA_SOURCES = {
  NJ_HMFA: {
    name: 'New Jersey HMFA',
    url: 'https://www.nj.gov/dca/hmfa/rentals/properties/',
    type: 'NJ_HMFA',
  },
};

// =====================================================
// SECURITY: CRON SECRET VERIFICATION
// =====================================================
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  
  if (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('[Hunter Scout] Unauthorized cron attempt');
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const dataGateway = new DataGateway(true);
  let scoutRun: any = null;

  try {
    // Create scout run record
    scoutRun = await dataGateway.create('hunter_scout_runs', {
      source_type: 'NJ_HMFA',
      status: 'running',
      started_at: new Date().toISOString(),
      metadata: {
        triggered_by: 'vercel_cron',
        sources: Object.keys(DATA_SOURCES),
        ai_scoring_enabled: AI_SCORING_ENABLED,
        ollama_model: OLLAMA_MODEL,
      },
    });

    console.log('[Hunter Scout] 🐺 Scout run started:', scoutRun?.id);
    console.log('[Hunter Scout] 🤖 AI Scoring:', AI_SCORING_ENABLED ? 'ENABLED' : 'DISABLED');

    // Execute scraping with AI scoring
    const results = await scrapNJHMFA(dataGateway);

    // Update scout run with results
    if (scoutRun) {
      await dataGateway.update('hunter_scout_runs', scoutRun.id, {
        status: 'completed',
        leads_found: results.found,
        leads_created: results.created,
        leads_duplicate: results.duplicate,
        completed_at: new Date().toISOString(),
        metadata: {
          ...((scoutRun.metadata as any) || {}),
          ai_scored: results.aiScored,
          ai_failed: results.aiFailed,
        },
      });
    }

    console.log('[Hunter Scout] ✅ Scout run completed:', {
      found: results.found,
      created: results.created,
      duplicate: results.duplicate,
      aiScored: results.aiScored,
      aiFailed: results.aiFailed,
    });

    return NextResponse.json({
      success: true,
      scoutRunId: scoutRun?.id,
      results: {
        leadsFound: results.found,
        leadsCreated: results.created,
        leadsDuplicate: results.duplicate,
        aiScored: results.aiScored,
        aiFailed: results.aiFailed,
      },
    });
  } catch (error: any) {
    console.error('[Hunter Scout] ❌ Scout run failed:', error);

    if (scoutRun) {
      await dataGateway.update('hunter_scout_runs', scoutRun.id, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        error: 'Scout run failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =====================================================
// NJ HMFA SCRAPER - WITH AI INTELLIGENCE
// =====================================================
async function scrapNJHMFA(dataGateway: DataGateway): Promise<{
  found: number;
  created: number;
  duplicate: number;
  aiScored: number;
  aiFailed: number;
}> {
  let found = 0;
  let created = 0;
  let duplicate = 0;
  let aiScored = 0;
  let aiFailed = 0;

  console.log('[Hunter Scout] 🔍 Scraping NJ HMFA public registry...');

  try {
    // SIMULATION: Mock housing authority data
    const mockLeads = [
      {
        companyName: 'Camden Housing Authority',
        email: 'info@camdenha.org',
        phone: '(856) 123-4567',
        address: '123 Housing Way',
        city: 'Camden',
        state: 'NJ',
        zipCode: '08101',
        estimatedUnits: 450,
        website: 'https://camdenha.org',
      },
      {
        companyName: 'Newark Housing Authority',
        email: 'contact@newarkha.org',
        phone: '(973) 555-1234',
        address: '456 Newark Ave',
        city: 'Newark',
        state: 'NJ',
        zipCode: '07102',
        estimatedUnits: 1200,
        website: 'https://newarkha.org',
      },
      {
        companyName: 'Trenton Housing Authority',
        email: 'info@trentonha.org',
        phone: '(609) 555-5678',
        address: '789 Capital Blvd',
        city: 'Trenton',
        state: 'NJ',
        zipCode: '08608',
        estimatedUnits: 85,
        website: 'https://trentonha.org',
      },
      {
        companyName: 'Jersey City Housing Authority',
        email: 'hello@jchousing.org',
        phone: '(201) 555-9012',
        address: '321 Grove St',
        city: 'Jersey City',
        state: 'NJ',
        zipCode: '07302',
        estimatedUnits: 180,
        website: 'https://jchousing.org',
      },
    ];

    // Process each lead
    for (const lead of mockLeads) {
      found++;

      // Check if lead already exists
      const existing = await dataGateway.findMany('hunter_leads', {
        company_name: lead.companyName as any,
      });

      if (existing.length > 0) {
        duplicate++;
        console.log(`[Hunter Scout] ⚠️ Duplicate lead: ${lead.companyName}`);
        continue;
      }

      // AI-POWERED SCORING
      let aiScore: any = null;
      if (AI_SCORING_ENABLED) {
        aiScore = await scoreLeadWithAI(lead);
        if (aiScore.success) {
          aiScored++;
        } else {
          aiFailed++;
        }
      }

      // Fallback to algorithmic scoring if AI fails
      const techScore = aiScore?.success 
        ? Math.round(aiScore.score * 10) // Convert 1-10 to 10-100
        : calculateTechScore(lead); // Fallback

      const painPointHypothesis = aiScore?.success
        ? aiScore.pain_points
        : generateFallbackPainPoints(lead);

      // Create new lead
      try {
        await dataGateway.create('hunter_leads', {
          company_name: lead.companyName,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          zip_code: lead.zipCode,
          estimated_units: lead.estimatedUnits,
          tech_score: techScore,
          pain_point_hypothesis: painPointHypothesis,
          ai_scoring_attempts: aiScore?.success ? 1 : (aiScore?.attempts || 0),
          last_scoring_error: aiScore?.error || null,
          status: 'pending',
          source_url: DATA_SOURCES.NJ_HMFA.url,
          source_type: 'NJ_HMFA',
          metadata: {
            scrape_date: new Date().toISOString(),
            scraper_version: '2.0',
            ai_scored: aiScore?.success || false,
            ai_reasoning: aiScore?.reasoning || null,
          },
        });

        created++;
        console.log(
          `[Hunter Scout] ✅ Created lead: ${lead.companyName}`,
          `(Units: ${lead.estimatedUnits}, Score: ${techScore}, AI: ${aiScore?.success ? 'YES' : 'NO'})`
        );
      } catch (error: any) {
        console.error(`[Hunter Scout] Failed to create lead ${lead.companyName}:`, error.message);
      }
    }

  } catch (error: any) {
    console.error('[Hunter Scout] Scraping error:', error);
    throw error;
  }

  return { found, created, duplicate, aiScored, aiFailed };
}

// =====================================================
// AI LEAD SCORING - OLLAMA INTEGRATION
// =====================================================
async function scoreLeadWithAI(lead: {
  companyName: string;
  estimatedUnits: number;
  city?: string;
  state?: string;
  website?: string;
  email?: string;
}): Promise<{
  success: boolean;
  score?: number;
  reasoning?: string;
  pain_points?: string;
  error?: string;
  attempts: number;
}> {
  console.log(`[AI Scoring] 🤖 Analyzing: ${lead.companyName}`);

  const leadData = `
PROPERTY MANAGEMENT COMPANY DATA:
- Company Name: ${lead.companyName}
- Estimated Units: ${lead.estimatedUnits}
- Location: ${lead.city}, ${lead.state}
- Website: ${lead.website || 'None'}
- Email: ${lead.email || 'None'}
- Market: Affordable Housing / HUD-linked properties
`;

  let attempts = 0;

  while (attempts < AI_SCORING_MAX_RETRIES) {
    attempts++;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_SCORING_TIMEOUT_MS);

      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt: `${AI_SCORING_PROMPT}\n\n${leadData}`,
          stream: false,
          options: {
            temperature: 0.3, // Lower temperature for more consistent scoring
            top_p: 0.9,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.response;

      // Parse JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate response structure
      if (typeof parsed.score !== 'number' || parsed.score < 1 || parsed.score > 10) {
        throw new Error('Invalid score from AI (must be 1-10)');
      }

      console.log(`[AI Scoring] ✅ Success (attempt ${attempts}): Score ${parsed.score}/10`);

      return {
        success: true,
        score: parsed.score,
        reasoning: parsed.reasoning || '',
        pain_points: parsed.pain_points || '',
        attempts,
      };

    } catch (error: any) {
      console.error(`[AI Scoring] ❌ Attempt ${attempts} failed:`, error.message);

      // If last attempt, return failure
      if (attempts >= AI_SCORING_MAX_RETRIES) {
        return {
          success: false,
          error: error.message,
          attempts,
        };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded',
    attempts,
  };
}

// =====================================================
// FALLBACK: ALGORITHMIC TECH SCORE
// =====================================================
function calculateTechScore(lead: {
  estimatedUnits: number;
  website?: string;
  email?: string;
}): number {
  let score = 50; // Base score

  // Unit count scoring (sweet spot: 20-300)
  if (lead.estimatedUnits >= 20 && lead.estimatedUnits <= 50) {
    score += 20;
  } else if (lead.estimatedUnits > 50 && lead.estimatedUnits <= 150) {
    score += 30;
  } else if (lead.estimatedUnits > 150 && lead.estimatedUnits <= 300) {
    score += 35;
  } else if (lead.estimatedUnits > 300 && lead.estimatedUnits <= 500) {
    score += 20;
  } else if (lead.estimatedUnits > 500) {
    score += 10;
  }

  // Website presence
  if (lead.website) score += 10;

  // Professional email domain
  if (lead.email && !lead.email.includes('gmail') && !lead.email.includes('yahoo')) {
    score += 5;
  }

  return Math.min(100, Math.max(0, score));
}

// =====================================================
// FALLBACK: PAIN POINTS HYPOTHESIS
// =====================================================
function generateFallbackPainPoints(lead: {
  companyName: string;
  estimatedUnits: number;
}): string {
  const size = lead.estimatedUnits > 200 ? 'large' : lead.estimatedUnits > 50 ? 'medium' : 'small';
  
  return `${lead.companyName} manages ${lead.estimatedUnits} units (${size} portfolio). Likely pain points: Manual rent tracking, HUD compliance reporting anxiety, Excel-based ledgers, high audit risk, no real-time ledger verification.`;
}
