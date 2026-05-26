import { Suspense } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';

export default async function DashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const tab = typeof searchParams?.tab === 'string' ? searchParams.tab : 'dashboard';

  return (
    <Suspense fallback={<div className="py-20 text-center text-ink-muted animate-pulse">Loading...</div>}>
      <DashboardShell tab={tab} />
    </Suspense>
  );
}
