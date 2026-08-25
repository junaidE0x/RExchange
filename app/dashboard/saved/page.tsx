'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { listings, initialSavedIds } from '@/lib/mock-data';
import { ListingCard } from '@/components/listing-card';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds);

  const savedListings = listings.filter((l) => savedIds.includes(l.id));

  const handleUnsave = (id: string) => {
    const listing = listings.find((l) => l.id === id);
    setSavedIds((prev) => prev.filter((s) => s !== id));
    toast.info(`Removed "${listing?.title}" from saved.`);
  };

  return (
    <PageTransition>
      <DashboardShell activeNav="saved">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Saved Listings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} bookmarked
          </p>
        </div>

        {savedListings.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <AnimatePresence>
              {savedListings.map((listing, i) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  index={i}
                  variant="saved"
                  onUnsave={handleUnsave}
                  exitAnimation
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No saved listings yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Tap the bookmark icon on any listing to save it here.</p>
          </div>
        )}
      </DashboardShell>
    </PageTransition>
  );
}
