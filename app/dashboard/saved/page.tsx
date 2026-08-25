'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { getSavedListings } from '@/lib/listings';
import { DashboardShell } from '@/components/dashboard-shell';
import { ListingCard } from '@/components/listing-card';
import { toast } from 'sonner';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function unwrapListing(row: any) {
  const nested = row?.listings ?? row?.listing;
  if (Array.isArray(nested)) return nested[0] ?? null;
  return nested ?? null;
}

export default function SavedPage() {
  const router = useRouter();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { user } = await getCurrentUser();
        if (!user) {
          router.push('/login');
          return;
        }

        const { data, error } = await getSavedListings(user.id);
        if (error) {
          console.error('Failed to fetch saved listings:', error);
          toast.error('Could not load saved listings.');
          setSaved([]);
        } else {
          setSaved(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch saved listings:', err);
        toast.error('Could not load saved listings.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const unsave = async (savedId: string) => {
    const { error } = await supabase.from('saved').delete().eq('id', savedId);
    if (!error) {
      setSaved((prev) => prev.filter((s) => s.id !== savedId));
      toast.success('Removed from saved.');
    } else {
      toast.error('Failed to remove from saved.');
    }
  };

  const validSaved = saved
    .map((s) => ({ ...s, listings: unwrapListing(s) }))
    .filter((s) => s && s.listings);

  return (
    <DashboardShell activeNav="saved">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Saved Listings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {loading
            ? 'Loading saved listings...'
            : `${validSaved.length} ${validSaved.length === 1 ? 'listing' : 'listings'} bookmarked`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground animate-pulse">Loading saved listings...</p>
        </div>
      ) : validSaved.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl p-8 max-w-md mx-auto">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-foreground font-medium">Nothing saved yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Tap the bookmark icon on any listing to save it here for quick access.
          </p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl">
              Explore Listings
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {validSaved.map((s) => (
            <div key={s.id} className="relative group">
              <ListingCard
                listing={s.listings}
                variant="saved"
                onUnsave={() => unsave(s.id)}
              />
              <button
                onClick={() => unsave(s.id)}
                className="absolute top-3 right-3 z-20 text-xs text-red-400 hover:text-red-300 bg-black/60 hover:bg-black/80 px-2.5 py-1 rounded-lg border border-red-500/30 backdrop-blur-md transition-colors"
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
