'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { generateUniqueSlug } from '@/lib/slug';
import { uploadFile } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { productSchema } from '@/lib/validators/product';

export async function createProduct(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const priceInput = formData.get('price') as string;
  const priceNaira = parseFloat(priceInput);

  if (isNaN(priceNaira)) {
    return { error: 'Invalid price' };
  }

  const priceKobo = Math.round(priceNaira * 100);

  const validated = productSchema.safeParse({ name, description, priceKobo });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  let imageUrl: string | null = null;
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await uploadFile(imageFile);
      imageUrl = result.url;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Invalid image file' };
    }
  }

  const slug = await generateUniqueSlug(name);

  try {
    await db.product.create({
      data: {
        name,
        description,
        priceKobo,
        imageUrl,
        slug,
        userId: session.userId,
      },
    });
  } catch (err) {
    console.error('Failed to create product:', err);
    return { error: 'Failed to create product. Try again.' };
  }

  revalidatePath('/dashboard');
  return { success: true, slug };
}

export async function updateProduct(prevState: unknown, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const priceInput = formData.get('price') as string;
  const priceNaira = parseFloat(priceInput);

  if (!id) return { error: 'Missing product ID' };
  if (isNaN(priceNaira)) return { error: 'Invalid price' };

  const priceKobo = Math.round(priceNaira * 100);

  const validated = productSchema.safeParse({ name, description, priceKobo });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.userId) {
    return { error: 'Product not found' };
  }

  let imageUrl = existing.imageUrl;
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    try {
      const result = await uploadFile(imageFile);
      imageUrl = result.url;
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Invalid image file' };
    }
  }

  let slug = existing.slug;
  if (name !== existing.name) {
    slug = await generateUniqueSlug(name);
  }

  try {
    await db.product.update({
      where: { id },
      data: { name, description, priceKobo, imageUrl, slug },
    });
  } catch (err) {
    console.error('Failed to update product:', err);
    return { error: 'Failed to update product. Try again.' };
  }

  revalidatePath('/dashboard');
  return { success: true, slug };
}

export async function deleteProduct(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing product ID' };

  const product = await db.product.findUnique({ where: { id } });
  if (!product || product.userId !== session.userId) {
    return { error: 'Product not found' };
  }

  try {
    await db.$transaction(async (tx) => {
      const orders = await tx.order.findMany({
        where: { productId: id },
        select: { id: true },
      });
      if (orders.length > 0) {
        await tx.payment.deleteMany({
          where: { orderId: { in: orders.map((o) => o.id) } },
        });
        await tx.order.deleteMany({ where: { productId: id } });
      }
      await tx.product.delete({ where: { id } });
    });
  } catch (err) {
    console.error('Failed to delete product:', err);
    return { error: 'Failed to delete product. Try again.' };
  }

  revalidatePath('/dashboard');
  return { success: true };
}
