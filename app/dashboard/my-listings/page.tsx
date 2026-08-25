'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserListings, deleteListing } from '@/lib/listings';
import { getCurrentUser } from '@/lib/auth';
import { ListingCard } from '@/components/listing-card';
import { PostListingModal } from '@/components/post-listing-modal';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';

export default function MyListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { user } = await getCurrentUser();
        if (!user) return;
        const { data, error } = await getUserListings(user.id);
        if (!error && data) setListings(data);
      } catch (err) {
        console.error('Error loading my listings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await deleteListing(id);
    if (!error) {
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success('Listing deleted.');
    } else {
      toast.error('Failed to delete listing.');
    }
  };

  const handleEdit = (id: string) => {
    toast.info('Edit functionality coming soon — for now you can delete and repost.');
  };

  return (
    <PageTransition>
      <DashboardShell activeNav="listings">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Listings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {loading
                ? 'Loading your listings...'
                : `${listings.length} ${listings.length === 1 ? 'listing' : 'listings'}`}
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="btn-press bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl shadow-lg shadow-violet-500/20 transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Listing
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground animate-pulse">Loading listings...</p>
          </div>
        ) : listings.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <AnimatePresence>
              {listings.map((listing, i) => (
                <div key={listing.id} className="relative group">
                  <ListingCard
                    listing={listing}
                    index={i}
                    variant="owned"
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    exitAnimation
                  />
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="absolute top-3 right-3 z-20 text-xs text-red-400 hover:text-red-300 bg-black/60 hover:bg-black/80 px-2.5 py-1 rounded-lg border border-red-500/30 backdrop-blur-md transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">You haven't posted any listings yet.</p>
            <Button
              onClick={() => setModalOpen(true)}
              className="mt-4 btn-press bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Post your first listing
            </Button>
          </div>
        )}

        <PostListingModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </DashboardShell>
    </PageTransition>
  );
}
