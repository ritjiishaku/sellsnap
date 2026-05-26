'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { LayoutDashboard, Package, ListOrdered, Settings, LogOut, User, ChevronUp } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/(auth)/actions';

const links = [
  { href: '/dashboard', tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard?tab=products', tab: 'products', label: 'Products', icon: Package },
  { href: '/dashboard?tab=orders', tab: 'orders', label: 'Orders', icon: ListOrdered },
];

export function SidebarNav({ name, email, avatarUrl, businessName }: { name?: string | null; email?: string | null; avatarUrl?: string | null; businessName?: string | null }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const isSettings = pathname === '/dashboard/settings';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-64 border-r border-border bg-surface hidden md:flex flex-col sticky top-0 h-screen">
      <Link href="/" className="block text-center p-6 hover:opacity-80 transition-opacity">
        <img src="/logo.svg" alt="SellSnap" className="h-9 w-auto mx-auto" />
      </Link>

      {businessName && (
        <div className="px-6 pb-4 -mt-2">
          <p className="text-body-sm font-medium text-ink-muted text-center truncate">{businessName}</p>
        </div>
      )}

      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map(({ href, tab, label, icon: Icon }) => {
          const isActive = !isSettings && activeTab === tab;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-sm text-body font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'hover:bg-surface text-ink'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="relative border-t border-border" ref={profileRef}>
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 w-full px-6 py-4 hover:bg-surface-variant/50 transition-colors cursor-pointer"
        >
          <div className="h-10 w-10 rounded-full bg-brand flex items-center justify-center shrink-0 ring-2 ring-brand/20 overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="" width={40} height={40} className="h-full w-full object-cover" />
            ) : name ? (
              <span className="text-body-sm font-bold text-white">
                {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            ) : (
              <User className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-body-sm font-semibold text-ink truncate">{name || 'Seller'}</p>
            {email && <p className="text-label-sm text-ink-muted truncate">{email}</p>}
          </div>
          <ChevronUp className={cn('h-4 w-4 text-ink-muted shrink-0 transition-transform duration-200', profileOpen ? 'rotate-0' : 'rotate-180')} />
        </button>

        {profileOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-surface border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-body-sm font-semibold text-ink truncate">{name || 'Seller'}</p>
              {email && <p className="text-label-sm text-ink-muted truncate">{email}</p>}
            </div>

            <div className="p-1.5 space-y-0.5">
              <Link
                href="/dashboard/settings"
                onClick={() => setProfileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium transition-colors',
                  isSettings
                    ? 'bg-primary/10 text-primary'
                    : 'text-ink hover:bg-surface-variant'
                )}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <form action={logout}>
                <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm font-medium text-error hover:bg-error/10 transition-colors cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
