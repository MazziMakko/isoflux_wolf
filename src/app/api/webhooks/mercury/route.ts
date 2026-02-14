// =====================================================
// MERCURY WEBHOOK HANDLER
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';
import { verifyHmacSignature } from '@/lib/core/crypto';

const mercuryWebhookSecret = process.env.MERCURY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    const body = await req.text();
    const signature = req.headers.get('mercury-signature');

    // Verify webhook signature
    if (!signature || !verifyHmacSignature(body, signature, mercuryWebhookSecret)) {
      console.error('Invalid Mercury webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Log webhook event
    const webhookEvent = await dataGateway.createWebhookEvent({
      source: 'mercury',
      event_type: payload.type || 'unknown',
      payload: payload as any,
      signature,
      status: 'processing',
    });

    if (!webhookEvent) {
      return NextResponse.json(
        { error: 'Failed to create webhook event' },
        { status: 500 }
      );
    }

    try {
      await processMercuryEvent(payload, dataGateway, auditLogger);

      await dataGateway.updateWebhookStatus(webhookEvent.id, 'succeeded');

      return NextResponse.json({ status: 'success', eventId: webhookEvent.id });
    } catch (error: any) {
      console.error('Mercury webhook processing error:', error);

      await dataGateway.updateWebhookStatus(
        webhookEvent.id,
        'failed',
        error.message
      );

      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Mercury webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processMercuryEvent(
  payload: any,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const eventType = payload.type;
  const data = payload.data;

  switch (eventType) {
    case 'transaction.updated':
      await handleTransactionUpdated(data, dataGateway, auditLogger);
      break;

    case 'account.updated':
      await handleAccountUpdated(data, dataGateway);
      break;

    default:
      console.log(`Unhandled Mercury event: ${eventType}`);
  }
}

async function handleTransactionUpdated(
  data: any,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const organizationId = data.metadata?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in Mercury webhook metadata');
    return;
  }

  const status = data.status === 'completed' ? 'succeeded' : 
                 data.status === 'failed' ? 'failed' : 'pending';

  await dataGateway.createTransaction({
    organization_id: organizationId,
    amount_cents: Math.abs(Math.round(data.amount * 100)),
    currency: 'USD',
    status: status as any,
    description: data.description || 'Mercury transaction',
    metadata: {
      mercury_transaction_id: data.id,
      mercury_account_id: data.accountId,
      counterparty: data.counterpartyName,
    } as any,
  });

  if (status === 'succeeded') {
    await auditLogger.logPaymentEvent(organizationId, 'PAYMENT_SUCCESS', {
      amount: data.amount,
      currency: 'USD',
      provider: 'mercury',
    });
  }
}

async function handleAccountUpdated(data: any, dataGateway: DataGateway) {
  console.log('Mercury account updated:', data.id);
}
