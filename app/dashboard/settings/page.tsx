'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'EEE'];
const YEARS = ['1', '2', '3', '4'];

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState({ name: '', dept: '', year: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const { profile } = await getCurrentUser();
      if (profile) {
        setProfile(profile);
        setForm({
          name: profile.name ?? '',
          dept: profile.dept ?? '',
          year: String(profile.year ?? ''),
        });
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        name: form.name,
        dept: form.dept,
        year: parseInt(form.year),
      })
      .eq('id', profile.id);

    if (error) {
      toast.error('Failed to save changes.');
    } else {
      toast.success('Profile updated!');
    }
    setLoading(false);
  };

  return (
    <DashboardShell activeNav="settings">
      <h2 className="text-xl font-bold mb-2">Settings</h2>
      <p className="text-muted-foreground text-sm mb-8">Manage your profile and preferences</p>

      <div className="max-w-lg space-y-6">
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.03] space-y-5">
          <h3 className="font-semibold">Profile</h3>

          {/* Display Name */}
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
            />
          </div>

          {/* Dept + Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <select
                value={form.dept}
                onChange={(e) => setForm((p) => ({ ...p, dept: e.target.value }))}
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Year</Label>
              <select
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reg No — read only */}
          <div className="space-y-2">
            <Label>Registration Number</Label>
            <Input
              value={profile?.reg_no ?? ''}
              disabled
              className="bg-white/[0.03] border-white/10 opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Your registration number cannot be changed.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
