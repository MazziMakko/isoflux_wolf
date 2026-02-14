// =====================================================
// FLUTTERWAVE WEBHOOK HANDLER
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import DataGateway from '@/lib/core/data-gateway';
import { AuditLogger } from '@/lib/core/audit';
import { createHmacSignature } from '@/lib/core/crypto';

const flutterwaveSecretHash = process.env.FLUTTERWAVE_SECRET_HASH!;

export async function POST(req: NextRequest) {
  const dataGateway = new DataGateway(true);
  const auditLogger = new AuditLogger();

  try {
    const body = await req.json();
    const verifHash = req.headers.get('verif-hash');

    // Verify webhook authenticity
    if (verifHash !== flutterwaveSecretHash) {
      console.error('Invalid Flutterwave webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Log webhook event
    const webhookEvent = await dataGateway.createWebhookEvent({
      source: 'flutterwave',
      event_type: body.event || 'unknown',
      payload: body as any,
      signature: verifHash,
      status: 'processing',
    });

    if (!webhookEvent) {
      return NextResponse.json(
        { error: 'Failed to create webhook event' },
        { status: 500 }
      );
    }

    try {
      await processFlutterwaveEvent(body, dataGateway, auditLogger);

      await dataGateway.updateWebhookStatus(webhookEvent.id, 'succeeded');

      return NextResponse.json({ status: 'success', eventId: webhookEvent.id });
    } catch (error: any) {
      console.error('Flutterwave webhook processing error:', error);

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
    console.error('Flutterwave webhook handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processFlutterwaveEvent(
  body: any,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const eventType = body.event;
  const data = body.data;

  switch (eventType) {
    case 'charge.completed':
      if (data.status === 'successful') {
        await handleSuccessfulCharge(data, dataGateway, auditLogger);
      }
      break;

    case 'charge.failed':
      await handleFailedCharge(data, dataGateway, auditLogger);
      break;

    case 'transfer.completed':
      await handleTransferCompleted(data, dataGateway);
      break;

    default:
      console.log(`Unhandled Flutterwave event: ${eventType}`);
  }
}

async function handleSuccessfulCharge(
  data: any,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const organizationId = data.meta?.organization_id;

  if (!organizationId) {
    console.error('No organization_id in Flutterwave webhook metadata');
    return;
  }

  await dataGateway.createTransaction({
    organization_id: organizationId,
    amount_cents: Math.round(data.amount * 100),
    currency: data.currency,
    status: 'succeeded',
    description: data.narration || 'Flutterwave payment',
    metadata: {
      flutterwave_tx_ref: data.tx_ref,
      flutterwave_id: data.id,
      customer_email: data.customer.email,
    } as any,
  });

  await auditLogger.logPaymentEvent(organizationId, 'PAYMENT_SUCCESS', {
    amount: data.amount,
    currency: data.currency,
    provider: 'flutterwave',
  });
}

async function handleFailedCharge(
  data: any,
  dataGateway: DataGateway,
  auditLogger: AuditLogger
) {
  const organizationId = data.meta?.organization_id;

  if (!organizationId) return;

  await auditLogger.logPaymentEvent(organizationId, 'PAYMENT_FAILED', {
    amount: data.amount,
    currency: data.currency,
    provider: 'flutterwave',
    reason: data.processor_response,
  });
}

async function handleTransferCompleted(data: any, dataGateway: DataGateway) {
  console.log('Transfer completed:', data.id);
}
