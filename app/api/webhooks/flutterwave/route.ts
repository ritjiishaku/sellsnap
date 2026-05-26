import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';

const FLUTTERWAVE_VERIFY_URL = (id: string) =>
  `https://api.flutterwave.com/v3/transactions/${id}/verify`;

type FlutterwaveWebhookPayload = {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
    customer?: { email?: string };
    meta?: Record<string, string>;
  };
};

type FlutterwaveVerifyResponse = {
  status: string;
  message: string;
  data: {
    id: number;
    tx_ref: string;
    status: string;
    amount: number;
    currency: string;
  };
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get('verif-hash');
  if (!signature || signature !== env.FLUTTERWAVE_SECRET_HASH) {
    logger.warn('flutterwave.webhook.bad_signature');
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: FlutterwaveWebhookPayload;
  try {
    payload = (await req.json()) as FlutterwaveWebhookPayload;
  } catch {
    logger.error('flutterwave.webhook.parse_failed');
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { data } = payload;
  if (!data?.id || !data.tx_ref) {
    logger.warn('flutterwave.webhook.missing_fields', { payload });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  let verified: FlutterwaveVerifyResponse;
  try {
    const res = await fetch(FLUTTERWAVE_VERIFY_URL(String(data.id)), {
      headers: { Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}` },
    });
    verified = (await res.json()) as FlutterwaveVerifyResponse;
  } catch (error) {
    logger.error('flutterwave.webhook.verify_failed', { error, id: data.id });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (verified.status !== 'success' || verified.data.status !== 'successful') {
    logger.info('flutterwave.webhook.not_successful', {
      id: data.id,
      status: verified.data?.status,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const order = await db.order.findUnique({
    where: { txRef: verified.data.tx_ref },
  });

  if (!order) {
    logger.warn('flutterwave.webhook.order_not_found', {
      tx_ref: verified.data.tx_ref,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const expectedMajorAmount = order.amountKobo / 100;
  if (
    verified.data.amount !== expectedMajorAmount ||
    verified.data.currency !== order.currency
  ) {
    logger.warn('flutterwave.webhook.amount_or_currency_mismatch', {
      orderId: order.id,
      expected: { amount: expectedMajorAmount, currency: order.currency },
      actual: { amount: verified.data.amount, currency: verified.data.currency },
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          orderId: order.id,
          gatewayReference: String(verified.data.id),
          status: 'paid',
          paidAt: new Date(),
        },
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'paid' },
      });
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      logger.info('flutterwave.webhook.duplicate_ignored', {
        id: verified.data.id,
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    logger.error('flutterwave.webhook.persist_failed', { error });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
