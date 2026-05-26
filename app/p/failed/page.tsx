import { Button } from '@/components/ui/Button';
import { XCircle } from 'lucide-react';
import Link from 'next/link';

export default function FailedPage() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-error/10 p-4 rounded-full">
            <XCircle className="h-12 w-12 text-error" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-h1 font-bold text-ink">Payment Failed</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            We couldn&apos;t process your payment. Please try again.
          </p>
        </div>
        <Link href="/">
          <Button variant="primary" className="w-full">Return Home</Button>
        </Link>
      </div>
    </main>
  );
}
