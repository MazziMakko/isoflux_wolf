// =====================================================
// TRIAL NOTIFICATIONS CRON API ROUTE
// Runs daily to check trial expirations
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import checkTrialExpirations from '@/lib/cron/trial-notifications';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🕐 [CRON] Trial notifications job started');

  try {
    await checkTrialExpirations();
    
    return NextResponse.json({
      success: true,
      message: 'Trial expiration check complete',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ [CRON] Trial notifications failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
