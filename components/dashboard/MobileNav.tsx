'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Package, ListOrdered, Settings } from 'lucide-react';
import { cn } from '@/lib/cn';

const links = [
  { href: '/dashboard', tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard?tab=products', tab: 'products', label: 'Products', icon: Package },
  { href: '/dashboard?tab=orders', tab: 'orders', label: 'Orders', icon: ListOrdered },
];

const bottomLinks = [
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const isSettings = pathname === '/dashboard/settings';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-surface border-t border-border h-16 md:hidden">
      {links.map(({ href, tab, label, icon: Icon }) => {
        const isActive = !isSettings && activeTab === tab;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
              isActive ? 'text-brand' : 'text-ink-muted hover:text-ink'
            )}
          >
            <Icon size={20} />
            <span className="text-label-sm">{label}</span>
          </Link>
        );
      })}
      {bottomLinks.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors',
            isSettings ? 'text-brand' : 'text-ink-muted hover:text-ink'
          )}
        >
          <Icon size={20} aria-hidden="true" />
          <span className="text-label-sm">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
