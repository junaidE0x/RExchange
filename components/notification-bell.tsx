'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, MessageCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

type NotifType = 'request' | 'listing' | 'system';

interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
  href?: string;
}

const iconMap = {
  request: MessageCircle,
  listing: Package,
  system: Info,
};

const colorMap = {
  request: 'text-violet-400 bg-violet-500/10',
  listing: 'text-cyan-400 bg-cyan-500/10',
  system: 'text-amber-400 bg-amber-500/10',
};

function readKey(userId: string) {
  return `rex-notif-read-${userId}`;
}

function loadReadIds(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(readKey(userId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(userId: string, ids: Set<string>) {
  localStorage.setItem(readKey(userId), JSON.stringify(Array.from(ids)));
}

function timeAgo(iso?: string | null) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true });
}

function listingTitle(row: any) {
  const nested = row?.listings ?? row?.listing;
  const listing = Array.isArray(nested) ? nested[0] : nested;
  return listing?.title || 'a listing';
}

function profileName(row: any) {
  const nested = row?.profiles ?? row?.profile;
  const profile = Array.isArray(nested) ? nested[0] : nested;
  return profile?.name || 'A student';
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

  const loadNotifications = async (uid: string) => {
    const readIds = loadReadIds(uid);

    const incomingQuery = await supabase
      .from('requests')
      .select(`
        id, status, created_at, from_user, to_user, listing_id,
        listings(title),
        profiles!requests_from_user_fkey(name)
      `)
      .eq('to_user', uid)
      .order('created_at', { ascending: false })
      .limit(20);

    let incoming: any[] | null = null;
    if (!incomingQuery.error && incomingQuery.data) {
      incoming = incomingQuery.data;
    } else {
      const fallback = await supabase
        .from('requests')
        .select('id, status, created_at, from_user, to_user, listing_id')
        .eq('to_user', uid)
        .limit(20);
      incoming = fallback.data;
    }

    const outgoingQuery = await supabase
      .from('requests')
      .select(`id, status, created_at, from_user, to_user, listing_id, listings(title)`)
      .eq('from_user', uid)
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10);

    let outgoing: any[] | null = outgoingQuery.data;
    if (outgoingQuery.error) {
      const fallback = await supabase
        .from('requests')
        .select('id, status, created_at, from_user, to_user, listing_id')
        .eq('from_user', uid)
        .neq('status', 'pending')
        .limit(10);
      outgoing = fallback.data;
    }

    const rows = incoming || [];
    const rawListingIds = [...rows, ...(outgoing || [])]
      .map((r: any) => r.listing_id)
      .filter(Boolean);
    const listingIds = rawListingIds.filter((v, i, a) => a.indexOf(v) === i);

    const rawUserIds = rows.map((r: any) => r.from_user).filter(Boolean);
    const fromUserIds = rawUserIds.filter((v, i, a) => a.indexOf(v) === i);

    const needsListings = [...rows, ...(outgoing || [])].some((r: any) => !listingTitle(r) || listingTitle(r) === 'a listing');
    const needsNames = rows.some((r: any) => profileName(r) === 'A student');

    let listingsMap = new Map<string, any>();
    let profilesMap = new Map<string, any>();

    if (needsListings && listingIds.length) {
      const { data } = await supabase.from('listings').select('id, title').in('id', listingIds);
      listingsMap = new Map((data || []).map((l: any) => [String(l.id), l]));
    }
    if (needsNames && fromUserIds.length) {
      const { data } = await supabase.from('profiles').select('id, name').in('id', fromUserIds);
      profilesMap = new Map((data || []).map((p: any) => [String(p.id), p]));
    }

    const mappedIncoming: AppNotification[] = rows.map((req: any) => {
      const listing = listingsMap.get(String(req.listing_id));
      const profile = profilesMap.get(String(req.from_user));
      const title = listing?.title || listingTitle(req);
      const name = profile?.name || profileName(req);
      const pending = req.status === 'pending' || !req.status;
      return {
        id: `in-${req.id}`,
        type: 'request' as const,
        title: pending ? 'New connection request' : `Request ${req.status}`,
        description: pending
          ? `${name} wants to connect on "${title}"`
          : `${name}'s request for "${title}" is ${req.status}`,
        time: timeAgo(req.created_at),
        read: readIds.has(`in-${req.id}`) || !pending,
        href: '/dashboard/requests',
      };
    });

    const mappedOutgoing: AppNotification[] = (outgoing || []).map((req: any) => {
      const listing = listingsMap.get(String(req.listing_id));
      const title = listing?.title || listingTitle(req);
      return {
        id: `out-${req.id}`,
        type: 'listing' as const,
        title: `Request ${req.status}`,
        description: `Your request for "${title}" was ${req.status}`,
        time: timeAgo(req.created_at),
        read: readIds.has(`out-${req.id}`),
        href: '/dashboard/requests',
      };
    });

    const combined = [...mappedIncoming, ...mappedOutgoing].slice(0, 20);
    setNotifications(combined);
  };

  // ✅ Single, self-contained useEffect with init() inside and proper cleanup
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { user } = await getCurrentUser();
      if (!user || cancelled) {
        setLoading(false);
        return;
      }
      setUserId(user.id);
      await loadNotifications(user.id);

      // Remove any existing channel first before creating a new one
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      if (cancelled) return;

      channelRef.current = supabase
        .channel(`requests-notif-${user.id}-${Date.now()}`) // unique name per mount
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'requests', filter: `to_user=eq.${user.id}` },
          () => loadNotifications(user.id)
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'requests', filter: `from_user=eq.${user.id}` },
          () => loadNotifications(user.id)
        )
        .subscribe();
    }

    init();

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  // Click-outside handler
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    if (!userId) return;
    const ids = new Set(notifications.map((n) => n.id));
    saveReadIds(userId, ids);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const openNotification = (n: AppNotification) => {
    if (userId && !n.read) {
      const ids = loadReadIds(userId);
      ids.add(n.id);
      saveReadIds(userId, ids);
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
      );
    }
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (userId) loadNotifications(userId);
        }}
        className="relative h-10 w-10 rounded-full glass hover:border-white/20 flex items-center justify-center btn-press transition-all"
      >
        <Bell className="h-4 w-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-notification-pulse" />
            <span className="absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75 animate-ping" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-80 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <span className="text-sm font-semibold">Notifications</span>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</p>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No notifications yet. You will see connection requests here.
                </p>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  return (
                    <button
                      type="button"
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`w-full text-left flex gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors ${!n.read ? 'bg-white/[0.01]' : ''}`}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>
                        {n.time && <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>}
                      </div>
                      {!n.read && <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0 mt-1.5" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}