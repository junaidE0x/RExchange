'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { myListings, currentUser } from '@/lib/mock-data';
import type { Listing } from '@/lib/mock-data';
import { ListingCard } from '@/components/listing-card';
import { PostListingModal } from '@/components/post-listing-modal';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>(myListings);
  const [modalOpen, setModalOpen] = useState(false);

  const handleDelete = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast.success('Listing deleted successfully.');
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
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} · {currentUser.name}
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="btn-press bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl shadow-lg shadow-violet-500/20 transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-1.5" /> New Listing
          </Button>
        </div>

        {listings.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <AnimatePresence>
              {listings.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  variant="owned"
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  exitAnimation
                />
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
