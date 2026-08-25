'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [regNo, setRegNo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Welcome back to RExchange!');
      router.push('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated gradient blobs */}
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/20 blur-[100px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-cyan-500/20 blur-[100px]"
      />

      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 items-center justify-center mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Login with SRM credentials</h1>
            <p className="mt-2 text-sm text-muted-foreground">Access the campus exchange platform</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="regno">Registration Number</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="regno"
                  placeholder="RA2211003010XXX"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl py-2.5 relative overflow-hidden transition-transform hover:scale-[1.02] shadow-lg shadow-violet-500/20"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <div className="absolute inset-0 animate-shimmer" />}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Only SRM KTR students can access RExchange
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
