'use client';

import { useState } from 'react';
import { updatePassword } from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function PasswordForm() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = new FormData();
    form.set('currentPassword', currentPassword);
    form.set('newPassword', newPassword);

    const result = await updatePassword(form) as { error?: string; success?: boolean };

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Password updated.' });
    }

    setSaving(false);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          revealable
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          disabled={saving}
        />
        <Input
          label="New Password"
          type="password"
          revealable
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={saving}
        />

        {message && (
          <p className={`text-body-sm p-3 rounded-lg ${message.type === 'success' ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
