'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Package, MessageCircle, Info } from 'lucide-react';
import { initialNotifications } from '@/lib/mock-data';
import type { AppNotification } from '@/lib/mock-data';

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

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;

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
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
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
              {notifications.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer ${!n.read ? 'bg-white/[0.01]' : ''}`}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                    </div>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0 mt-1.5" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
