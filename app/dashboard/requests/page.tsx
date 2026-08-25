'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { user } = await getCurrentUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          listings(title, category),
          profiles!requests_from_user_fkey(name, dept, year)
        `)
        .eq('to_user', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setRequests(data);
      setLoading(false);
    }
    load();
  }, []);

  const updateStatus = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('requests')
      .update({ status })
      .eq('id', id);

    if (!error) {
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Request ${status}.`);
    }
  };

  return (
    <DashboardShell activeNav="requests">
      <h2 className="text-xl font-bold mb-6">Requests</h2>
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-muted-foreground">No requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">{req.profiles?.name ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">
                  {req.profiles?.dept} · {req.profiles?.year}yr
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wants: <span className="text-foreground">{req.listings?.title}</span>
                </p>
              </div>
              {req.status === 'pending' ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateStatus(req.id, 'accepted')}
                    className="bg-green-600 hover:bg-green-500 text-white"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateStatus(req.id, 'declined')}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    Decline
                  </Button>
                </div>
              ) : (
                <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                  req.status === 'accepted' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {req.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
