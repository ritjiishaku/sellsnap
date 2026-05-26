'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { updateProfile } from './actions';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Upload, X } from 'lucide-react';

export function ProfileForm({ user }: { user: { name: string; businessName: string; email: string; avatarUrl?: string | null } }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [name, setName] = useState(user.name);
  const [businessName, setBusinessName] = useState(user.businessName);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = new FormData();
    form.set('name', name);
    form.set('businessName', businessName);
    if (avatarFile) form.set('avatar', avatarFile);

    const result = await updateProfile(form) as { error?: string; success?: boolean };

    if (result.error) {
      setMessage({ type: 'error', text: result.error });
    } else {
      setMessage({ type: 'success', text: 'Profile updated.' });
      setAvatarFile(null);
      setAvatarPreview(null);
    }

    setSaving(false);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="h-16 w-16 rounded-full bg-brand flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : user.avatarUrl ? (
                <Image src={user.avatarUrl} alt="" width={64} height={64} className="h-full w-full object-cover" />
              ) : (
                <span className="text-h2 font-bold text-white">
                  {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={() => { setAvatarPreview(null); setAvatarFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute -top-1 -right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-body-sm font-medium text-ink hover:bg-surface-variant transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Change Photo
            </button>
            <p className="text-label-sm text-ink-muted mt-1">JPEG, PNG, or WebP. Max 5MB.</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setAvatarFile(file);
                setAvatarPreview(URL.createObjectURL(file));
              }
            }}
          />
        </div>

        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
        />
        <Input
          label="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          disabled={saving}
        />
        <Input
          label="Email"
          value={user.email}
          disabled
        />

        {message && (
          <p className={`text-body-sm p-3 rounded-lg ${message.type === 'success' ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}>
            {message.text}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
