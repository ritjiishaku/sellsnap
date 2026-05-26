import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function NewProductPage() {
  const session = await getSession();
  if (!session) redirect('/auth');
  redirect('/dashboard/products');
}
