import { db } from '@/lib/db';
import { verifyTransaction } from '@/lib/flutterwave';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const txRef = searchParams.get('tx_ref');
  const transactionId = searchParams.get('transaction_id');

  if (!txRef) {
    redirect('/');
  }

  if ((status === 'successful' || status === 'completed') && transactionId) {
    try {
      const verification = await verifyTransaction(transactionId);

      if (verification.status === 'success' && verification.data.status === 'successful') {
        const order = await db.order.findUnique({ where: { txRef } });

        if (order && order.status === 'pending' && order.amountKobo === Math.round(verification.data.amount * 100)) {
          await db.$transaction([
            db.order.update({
              where: { txRef },
              data: { status: 'paid' },
            }),
            db.payment.create({
              data: {
                orderId: order.id,
                gatewayReference: String(transactionId),
                status: 'successful',
              },
            }),
          ]);
        }
      }
    } catch (err) {
      logger.error('payment.verify.failed', { txRef, error: err });
    }

    redirect(`/p/success?txRef=${txRef}`);
  }

  redirect(`/p/failed?txRef=${txRef}`);
}
