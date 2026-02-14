// =====================================================
// THE TREASURER'S CRON JOB - RETENTION TASK PROCESSOR
// Run every 15 minutes to recover abandoned revenue
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { retentionEmailService } from '@/lib/core/retention-email-service';

/**
 * THE TREASURER'S AUTOMATED REVENUE RECOVERY
 * 
 * This endpoint should be called by a cron job every 15 minutes:
 * - Vercel Cron (vercel.json)
 * - GitHub Actions
 * - External cron service (cron-job.org, EasyCron, etc.)
 * 
 * Security: Protected by cron secret to prevent unauthorized execution
 */

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.error('🔒 THE TREASURER: Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('⏰ THE TREASURER: Cron job triggered - Processing retention tasks');

    // Process all pending retention tasks
    await retentionEmailService.processPendingTasks();

    return NextResponse.json({
      success: true,
      message: 'Retention tasks processed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ THE TREASURER CRON ERROR:', error);
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

export async function POST(req: NextRequest) {
  // Support both GET and POST for different cron services
  return GET(req);
}
