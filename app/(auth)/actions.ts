'use server';

import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/email';
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/lib/validators/auth';

export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function flattenZodErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }
  return fieldErrors;
}

export async function signup(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = formData.get('_ip') as string || 'unknown';
  const rl = await rateLimit(`signup:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const data = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    businessName: formData.get('businessName') as string,
    password: formData.get('password') as string,
  };

  const validated = signupSchema.safeParse(data);
  if (!validated.success) {
    return { fieldErrors: flattenZodErrors(validated.error) };
  }

  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { fieldErrors: { email: 'An account with this email already exists' } };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await db.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      businessName: data.businessName,
    },
  });

  await createSession(user.id);
  redirect('/dashboard');
}

export async function login(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const ip = formData.get('_ip') as string || 'unknown';
  const rl = await rateLimit(`login:${ip}`, 5, 60_000);
  if (!rl.ok) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validated = loginSchema.safeParse({ email, password });
  if (!validated.success) {
    return { fieldErrors: flattenZodErrors(validated.error) };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: 'Invalid email or password' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function requestPasswordReset(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;

  const ip = formData.get('_ip') as string || 'unknown';
  const rl = await rateLimit(`reset:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return { error: 'Too many attempts. Please try again later.' };
  }

  const parsed = forgotPasswordSchema.safeParse({ email });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: { resetToken: hashedToken, resetTokenExpires: expires },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${rawToken}`;

    try {
      await sendPasswordResetEmail(email, resetLink);
    } catch {
      // Log but don't expose to user — prevents email enumeration
      console.error('Failed to send password reset email to:', email);
    }
  }

  return { success: true };
}

export async function resetPassword(prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const rawToken = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const parsed = resetPasswordSchema.safeParse({ token: rawToken, password, confirmPassword });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await db.user.findUnique({
    where: { resetToken: hashedToken, resetTokenExpires: { gt: new Date() } },
  });

  if (!user) {
    return { error: 'This reset link is invalid or has expired' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  redirect('/auth');
}

export async function logout() {
  await deleteSession();
  redirect('/auth');
}
