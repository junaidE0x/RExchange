'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { ListingCard } from '@/components/listing-card';
import { toast } from 'sonner';

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved')
        .select(`*, listings(*, profiles(name, dept, year))`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setSaved(data);
      setLoading(false);
    }
    load();
  }, []);

  const unsave = async (savedId: string) => {
    const { error } = await supabase.from('saved').delete().eq('id', savedId);
    if (!error) {
      setSaved((prev) => prev.filter((s) => s.id !== savedId));
      toast.success('Removed from saved.');
    }
  };

  return (
    <DashboardShell activeNav="saved">
      <h2 className="text-xl font-bold mb-6">Saved Listings</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : saved.length === 0 ? (
        <p className="text-muted-foreground">Nothing saved yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map((s) => (
            <div key={s.id} className="relative">
              <ListingCard listing={s.listings} />
              <button
                onClick={() => unsave(s.id)}
                className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300 bg-black/40 px-2 py-1 rounded-lg"
              >
                Unsave
              </button>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
