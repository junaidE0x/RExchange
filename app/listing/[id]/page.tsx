'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, BadgeCheck, Calendar, Tag,
  BookOpen, Cpu, FileText, Sparkles, Ticket, Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getListingById, getListingsByStudent, getCategoryById } from '@/lib/mock-data';
import { ListingCard } from '@/components/listing-card';
import { PageTransition } from '@/components/page-transition';

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen, Cpu, FileText, Sparkles, Ticket, Gift,
};

const categoryBadgeColors: Record<string, string> = {
  books: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  electronics: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  notes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  skills: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  tickets: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  giveaways: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

const typeLabels: Record<string, string> = {
  free: 'Free',
  exchange: 'Exchange',
  paid: 'Paid',
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const listing = getListingById(id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold mb-2">Listing not found</p>
          <Button onClick={() => router.push('/dashboard')} className="bg-violet-600 hover:bg-violet-500 text-white">
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  const cat = getCategoryById(listing.category);
  const Icon = cat ? iconMap[cat.icon] : BookOpen;
  const moreListings = getListingsByStudent(listing.student.id).filter((l) => l.id !== listing.id).slice(0, 3);
  const initials = listing.student.name.split(' ').map((n) => n[0]).join('');
  const postedDate = new Date(listing.postedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleConnect = () => {
    toast.success(`Request sent! ${listing.student.name} will be notified.`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
          <div className="max-w-5xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to browse
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold gradient-text">RExchange</span>
            </Link>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image area */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative aspect-square rounded-3xl bg-gradient-to-br ${listing.gradient} overflow-hidden flex items-center justify-center`}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
              <Icon className="relative h-24 w-24 text-white/80" />
              <div className="absolute top-4 left-4">
                <Badge variant="outline" className={`${categoryBadgeColors[listing.category]} border backdrop-blur-md`}>
                  {cat?.label}
                </Badge>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col"
            >
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{listing.title}</h1>

              <div className="flex items-center gap-3 mt-4">
                <Badge variant="outline" className={`${categoryBadgeColors[listing.category]} border`}>
                  {cat?.label}
                </Badge>
                <Badge variant="outline" className="glass border-white/10">
                  <Tag className="h-3 w-3 mr-1" /> {typeLabels[listing.type]}
                  {listing.type === 'paid' && listing.price && ` · ₹${listing.price}`}
                </Badge>
              </div>

              {/* Poster info */}
              <div className="glass rounded-2xl p-4 mt-5">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${listing.student.avatarGradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm truncate">{listing.student.name}</p>
                      <BadgeCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {listing.student.dept} · {listing.student.year}st Year · {listing.student.regNo}
                    </p>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                        <BadgeCheck className="h-3 w-3" /> Verified SRM Student
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Description</h3>
                <p className="text-sm text-foreground/90 leading-relaxed">{listing.description}</p>
              </div>

              {/* Posted date */}
              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Posted on {postedDate}
              </div>

              {/* CTA */}
              <Button
                onClick={handleConnect}
                size="lg"
                className="btn-press mt-6 w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl shadow-xl shadow-violet-500/25 transition-transform hover:scale-[1.02]"
              >
                Request to Connect
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                {listing.student.name.split(' ')[0]} will be notified of your request
              </p>
            </motion.div>
          </div>

          {/* More from this student */}
          {moreListings.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold mb-5">More from {listing.student.name.split(' ')[0]}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {moreListings.map((l, i) => (
                  <ListingCard key={l.id} listing={l} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
