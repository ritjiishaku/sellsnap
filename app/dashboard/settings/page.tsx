import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ProfileForm } from './ProfileForm';
import { PasswordForm } from './PasswordForm';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/auth');

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { name: true, businessName: true, email: true, avatarUrl: true },
  });

  if (!user) redirect('/auth');

  return (
    <div>
      <div>
        <h1 className="text-h1 font-bold text-ink">Settings</h1>
        <p className="text-body text-ink-muted mt-1">Manage your profile and account.</p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-h2 font-bold text-ink">Profile</h2>
          <ProfileForm user={{ name: user.name ?? '', businessName: user.businessName ?? '', email: user.email, avatarUrl: user.avatarUrl }} />
        </div>

        <div className="space-y-3">
          <h2 className="text-h2 font-bold text-ink">Password</h2>
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
