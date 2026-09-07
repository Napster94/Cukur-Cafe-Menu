'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useToast } from '@/components/admin/Toast';
import type { CafeSettings } from '@/types';

const DAYS: { key: string; label: string }[] = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
];

export default function AdminSettingsPage() {
  const { show } = useToast();
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [hours, setHours] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    api.get<{ settings: CafeSettings }>('/api/settings').then((d) => {
      setSettings(d.settings);
      try {
        setHours(d.settings.hours ? JSON.parse(d.settings.hours) : {});
      } catch {
        setHours({});
      }
    });
  }, []);

  if (!settings) return <div className="text-sm text-slate-400">Loading…</div>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await api.patch('/api/settings', { ...settings, hours: JSON.stringify(hours) });
      show('Changes saved successfully.');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    try {
      await api.post('/api/auth/change-password', { currentPassword, newPassword });
      show('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      show(err instanceof Error ? err.message : 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  }

  function field<K extends keyof CafeSettings>(key: K, label: string, type = 'text') {
    const current = settings;
    return (
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <input
          type={type}
          value={(current![key] as string) ?? ''}
          onChange={(e) => setSettings((s) => (s ? { ...s, [key]: e.target.value } : s))}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
      </label>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Cafe information shown across the customer site.</p>

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
          {field('name', 'Cafe name')}
          {field('tagline', 'Tagline')}
          {field('phone', 'Phone number')}
          {field('address', 'Address')}
          {field('instagram', 'Instagram URL')}
          {field('facebook', 'Facebook URL')}
          {field('currency', 'Currency symbol')}
          {field('logoUrl', 'Logo URL')}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              value={settings.description ?? ''}
              onChange={(e) => setSettings((s) => (s ? { ...s, description: e.target.value } : s))}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Opening hours</h2>
          <div className="mt-3 space-y-2">
            {DAYS.map((day) => (
              <div key={day.key} className="flex items-center gap-3">
                <span className="w-28 text-sm text-slate-600">{day.label}</span>
                <input
                  value={hours[day.key] ?? ''}
                  onChange={(e) => setHours((h) => ({ ...h, [day.key]: e.target.value }))}
                  placeholder="e.g. 10:00 - 00:00"
                  className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Change password</h2>
        <p className="mt-1 text-xs text-slate-500">Especially important once the admin panel is live on the internet.</p>
        <form onSubmit={changePassword} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Current password
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:col-span-2 sm:w-fit"
          >
            {changingPassword ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}
