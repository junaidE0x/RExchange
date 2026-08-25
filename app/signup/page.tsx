'use client';

import { signUp } from '@/lib/auth'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { GraduationCap, ArrowLeft, Lock, Mail, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEPARTMENTS = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML', 'EEE']
const YEARS = ['1', '2', '3', '4']

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    regNo: '',
    dept: '',
    year: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!formData.email.endsWith('@srmist.edu.in')) {
      setError('Only @srmist.edu.in email addresses are allowed.');
      return;
    }

    setLoading(true);

    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      regNo: formData.regNo,
      dept: formData.dept,
      year: formData.year,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Redirect to dashboard on success
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden py-12">
      {/* Animated blobs */}
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
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Join the SRM KTR exchange community</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="Aarav Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            {/* SRM Email */}
            <div className="space-y-2">
              <Label htmlFor="email">SRM Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yourname@srmist.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="regNo">Registration Number</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="regNo"
                  name="regNo"
                  placeholder="RA2211003010XXX"
                  value={formData.regNo}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            {/* Dept + Year side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <select
                  id="dept"
                  name="dept"
                  value={formData.dept}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option value="" disabled>Select</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <option value="" disabled>Select</option>
                  {YEARS.map(y => (
                    <option key={y} value={y}>{y}st/nd/rd/th Year</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-400 text-center">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl py-2.5 transition-transform hover:scale-[1.02] shadow-lg shadow-violet-500/20"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-violet-400 hover:text-violet-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}