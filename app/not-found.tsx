import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-surface p-4 rounded-full">
            <SearchX className="h-12 w-12 text-ink-muted" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-h1 font-bold text-ink">Page not found</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            The link you followed doesn&apos;t exist or has been removed.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" className="w-full">Go Home</Button>
        </Link>
      </div>
    </main>
  );
}
