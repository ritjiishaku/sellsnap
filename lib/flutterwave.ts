import { env } from './env';

export type PaymentInitializationResponse = {
  status: string;
  message: string;
  data: {
    link: string;
  };
};

export async function initializePayment({
  amount,
  email,
  txRef,
  productName,
  buyerName,
}: {
  amount: number;
  email: string;
  txRef: string;
  productName: string;
  buyerName?: string;
}) {
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: txRef,
      amount: amount / 100, // Flutterwave expects major currency units (Naira, not Kobo)
      currency: 'NGN',
      redirect_url: `${env.NEXT_PUBLIC_APP_URL}/api/payments/verify`,
      customer: {
        email,
        name: buyerName || 'Customer',
      },
      customizations: {
        title: 'SellSnap Payment',
        description: `Payment for ${productName}`,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Flutterwave Error:', error);
    throw new Error('Flutterwave payment initialization failed');
  }

  return (await response.json()) as PaymentInitializationResponse;
}

export async function verifyTransaction(transactionId: string) {
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error('Flutterwave transaction verification failed');
  }

  return await response.json();
}
