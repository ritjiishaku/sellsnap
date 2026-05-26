'use server';

import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import { initializePayment } from '@/lib/flutterwave';

const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is too short'),
  productId: z.string(),
});

export async function initiateCheckout(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const productId = formData.get('productId') as string;

  const validated = checkoutSchema.safeParse({ email, name, productId });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { user: true },
  });

  if (!product) return { error: 'Product not found' };

  const txRef = `SS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    try {
      await db.order.create({
        data: {
          productId: product.id,
          buyerEmail: email,
          buyerName: name,
          amountKobo: product.priceKobo,
          txRef,
          status: 'pending',
        },
      });
    } catch (createErr) {
      if (
        createErr instanceof Prisma.PrismaClientKnownRequestError &&
        createErr.code === 'P2002'
      ) {
        return { error: 'Something went wrong. Please try again.' };
      }
      throw createErr;
    }

    const payment = await initializePayment({
      amount: product.priceKobo,
      email: email,
      txRef: txRef,
      productName: product.name,
      buyerName: name,
    });

    return {
      success: true,
      link: payment.data.link,
    };
  } catch (err) {
    logger.error('checkout.failed', { error: err });
    return { error: 'Failed to start payment. Please try again.' };
  }
}
