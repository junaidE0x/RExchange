'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import { categories, categoryGlowMap } from '@/lib/mock-data';
import type { Listing } from '@/lib/mock-data';
import { toggleSaved } from '@/lib/listings';
import { getCurrentUser } from '@/lib/auth';
import { toast } from 'sonner';

const categoryBadgeColors: Record<string, string> = {
  books: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  electronics: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  notes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  skills: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  tickets: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  giveaways: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

const typeLabels: Record<string, string> = {
  free: 'Free',
  exchange: 'Exchange',
  paid: 'Paid',
};

interface ListingCardProps {
  listing: any;
  index?: number;
  variant?: 'default' | 'owned' | 'saved';
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUnsave?: (id: string) => void;
  exitAnimation?: boolean;
}

export function ListingCard({
  listing,
  index = 0,
  variant = 'default',
  onEdit,
  onDelete,
  onUnsave,
  exitAnimation = false,
}: ListingCardProps) {
  const cat = categories.find((c) => c.id === listing.category);
  const glow = (categoryGlowMap as any)?.[listing.category] || 'rgba(124, 58, 237, 0.3)';
  const cardRef = useRef<HTMLDivElement>(null);
  
  const student = listing.student || listing.profiles || {};
  const studentName = student.name || 'SRM Student';
  const studentDept = student.dept || '';
  const studentYear = student.year || '';
  const avatarGradient = student.avatarGradient || 'from-violet-500 to-cyan-400';
  const initials = studentName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
  const gradient = listing.gradient || 'from-violet-600 via-purple-700 to-indigo-800';

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { user } = await getCurrentUser();
    if (!user) {
      toast.error('Please log in to save listings.');
      return;
    }
    const { saved, error } = await toggleSaved(user.id, listing.id);
    if (error) {
      toast.error('Failed to update saved listing.');
      return;
    }
    toast.success(saved ? 'Listing saved!' : 'Removed from saved.');
  };

  const inner = (
    <div
      ref={cardRef}
      className="group glass card-shimmer rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      style={{ ['--glow' as string]: glow }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 40px -8px ${glow}`;
        e.currentTarget.style.borderColor = glow.replace('0.3', '0.5');
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
      }}
    >
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)' }} />
        <span className="relative text-5xl font-bold text-white/90 tracking-tight">
          {listing.title ? listing.title.charAt(0) : 'R'}
        </span>
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className={`${categoryBadgeColors[listing.category] || 'bg-violet-500/15 text-violet-300 border-violet-500/30'} border backdrop-blur-md text-xs`}>
            {cat?.label || listing.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-12">
          <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur-md text-xs">
            {typeLabels[listing.type] || listing.type}
            {listing.type === 'paid' && listing.price && ` · ₹${listing.price}`}
          </Badge>
        </div>

        {/* Save button for default cards */}
        {variant === 'default' && (
          <button
            onClick={handleSave}
            aria-label="Save listing"
            className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-lg bg-black/40 hover:bg-black/70 border border-white/10 transition-colors"
          >
            <Bookmark className="h-4 w-4 text-white" />
          </button>
        )}

        {/* Action buttons overlay for owned/saved variants */}
        {variant !== 'default' && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {variant === 'owned' && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); onEdit?.(listing.id); }}
                  className="h-9 w-9 rounded-full glass-strong flex items-center justify-center hover:scale-110 btn-press transition-transform"
                >
                  <Pencil className="h-4 w-4 text-white" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); onDelete?.(listing.id); }}
                  className="h-9 w-9 rounded-full glass-strong flex items-center justify-center hover:scale-110 btn-press transition-transform"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </>
            )}
            {variant === 'saved' && (
              <button
                onClick={(e) => { e.preventDefault(); onUnsave?.(listing.id); }}
                className="h-9 w-9 rounded-full glass-strong flex items-center justify-center hover:scale-110 btn-press transition-transform"
              >
                <Bookmark className="h-4 w-4 text-violet-400 fill-violet-400" />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground truncate group-hover:text-violet-300 transition-colors">
          {listing.title}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
            {initials}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
            <span className="truncate">{studentName}</span>
            {studentDept && (
              <>
                <span className="text-muted-foreground/50">·</span>
                <span className="shrink-0">{studentDept}</span>
              </>
            )}
            {studentYear && (
              <>
                <span className="text-muted-foreground/50 shrink-0">·</span>
                <span className="shrink-0">{studentYear}yr</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (exitAnimation) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
        transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        {variant === 'default' ? <Link href={`/listing/${listing.id}`}>{inner}</Link> : inner}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      {variant === 'default' ? <Link href={`/listing/${listing.id}`}>{inner}</Link> : inner}
    </motion.div>
  );
}
