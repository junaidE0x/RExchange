'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Inbox, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { initialRequests, categories } from '@/lib/mock-data';
import type { ConnectRequest } from '@/lib/mock-data';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';

const categoryBadgeColors: Record<string, string> = {
  books: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  electronics: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  notes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  skills: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  tickets: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
  giveaways: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
};

function RequestItem({ request, index }: { request: ConnectRequest; index: number }) {
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>(request.status);
  const [exiting, setExiting] = useState(false);

  const initials = request.requester.name.split(' ').map((n) => n[0]).join('');
  const postedDate = new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const handleAccept = () => {
    setStatus('accepted');
    toast.success(`Accepted! ${request.requester.name} will be notified.`);
    setTimeout(() => setExiting(true), 1200);
  };

  const handleDecline = () => {
    setStatus('declined');
    toast.info(`Request from ${request.requester.name} declined.`);
    setTimeout(() => setExiting(true), 400);
  };

  return (
    <AnimatePresence onExitComplete={() => {}}>
      {!exiting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
          transition={{ duration: 0.35, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-2xl p-5 hover:border-white/15 transition-all"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Requester avatar + info */}
            <div className="flex items-start gap-3 sm:w-64 shrink-0">
              <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${request.requester.avatarGradient} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{request.requester.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {request.requester.dept} · {request.requester.year}st Year
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{request.requester.regNo}</p>
              </div>
            </div>

            {/* Message + listing */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">Interested in:</span>
                <span className="text-xs font-medium text-violet-300 truncate">{request.listingTitle}</span>
              </div>
              <div className="glass rounded-xl p-3 flex gap-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80 leading-relaxed">{request.message}</p>
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2">{postedDate}</p>
            </div>

            {/* Actions */}
            <div className="flex sm:flex-col gap-2 sm:w-32 shrink-0">
              {status === 'pending' && (
                <>
                  <Button
                    onClick={handleAccept}
                    size="sm"
                    className="btn-press flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-transform hover:scale-105"
                  >
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                  <Button
                    onClick={handleDecline}
                    size="sm"
                    variant="outline"
                    className="btn-press flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                  >
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </>
              )}
              {status === 'accepted' && (
                <div className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-400 bg-emerald-500/10 rounded-xl py-2 border border-emerald-500/20">
                  <Check className="h-4 w-4" /> Accepted
                </div>
              )}
              {status === 'declined' && (
                <div className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-xl py-2 border border-red-500/20">
                  <X className="h-4 w-4" /> Declined
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ConnectRequest[]>(initialRequests);

  const visibleRequests = requests;

  return (
    <PageTransition>
      <DashboardShell activeNav="requests">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Connection Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {requests.filter((r) => r.status === 'pending').length} pending · {requests.length} total
          </p>
        </div>

        {visibleRequests.length > 0 ? (
          <motion.div layout className="space-y-4">
            <AnimatePresence>
              {visibleRequests.map((req, i) => (
                <RequestItem key={req.id} request={req} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <Inbox className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No connection requests yet.</p>
          </div>
        )}
      </DashboardShell>
    </PageTransition>
  );
}
