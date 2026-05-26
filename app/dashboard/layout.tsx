import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { logout } from '../(auth)/actions';
import { OnboardingGate } from '@/components/onboarding/OnboardingGate';
import { MobileNav } from '@/components/dashboard/MobileNav';
import { SidebarNav } from '@/components/dashboard/SidebarNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect('/auth');
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { hasSeenOnboarding: true, name: true, businessName: true, email: true, avatarUrl: true },
  });

  return (
    <>
      <OnboardingGate hasSeenOnboarding={user?.hasSeenOnboarding ?? false} name={user?.name ?? null} />

      <div className="flex min-h-screen bg-bg">
        <SidebarNav name={user?.name ?? null} email={user?.email ?? null} avatarUrl={user?.avatarUrl ?? null} businessName={user?.businessName} />

        <main className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 h-16 border-b border-border bg-surface px-6 flex items-center justify-center md:hidden">
             <Link href="/" className="hover:opacity-80 transition-opacity">
              <img src="/logo.svg" alt="SellSnap" className="h-9 w-auto" />
            </Link>
            <form action={logout} className="absolute right-6">
              <button className="p-2 text-error cursor-pointer">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </header>
          <div className="flex-1 p-6 md:p-10 pb-20 md:pb-10 w-full">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </>
  );
}
