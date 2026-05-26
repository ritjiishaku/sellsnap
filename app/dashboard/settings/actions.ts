'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { uploadFile } from '@/lib/storage';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const businessName = formData.get('businessName') as string;

  const validated = profileSchema.safeParse({ name, businessName });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  let avatarUrl: string | null = null;
  const imageFile = formData.get('avatar') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await uploadFile(imageFile);
      avatarUrl = result.url;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Invalid image file' };
    }
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { name, businessName, ...(avatarUrl && { avatarUrl }) },
    });
  } catch {
    return { error: 'Failed to update profile. Try again.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/settings');
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  const validated = passwordSchema.safeParse({ currentPassword, newPassword });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) return { error: 'User not found' };

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: 'Current password is incorrect' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { password: hashedPassword },
    });
  } catch {
    return { error: 'Failed to update password. Try again.' };
  }

  return { success: true };
}
