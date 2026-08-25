'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, MessageSquare, Save, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { DashboardShell } from '@/components/dashboard-shell';
import { PageTransition } from '@/components/page-transition';
import { toast } from 'sonner';
import { currentUser } from '@/lib/mock-data';

const depts = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT', 'AIDS', 'AIML'];

export default function SettingsPage() {
  const [name, setName] = useState(currentUser.name);
  const [dept, setDept] = useState(currentUser.dept);
  const [year, setYear] = useState(String(currentUser.year));
  const [contactPref, setContactPref] = useState<'whatsapp' | 'email'>('whatsapp');
  const [notifNewRequests, setNotifNewRequests] = useState(true);
  const [notifListingViews, setNotifListingViews] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <PageTransition>
      <DashboardShell activeNav="settings">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your profile and preferences</p>
        </div>

        <form onSubmit={handleSave} className="max-w-2xl space-y-8">
          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <User className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h2 className="font-semibold">Profile</h2>
                <p className="text-xs text-muted-foreground">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={dept} onValueChange={setDept}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 focus:ring-violet-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      {depts.map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="bg-white/[0.03] border-white/10 focus:ring-violet-500/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/10">
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Registration Number</Label>
                <Input
                  value={currentUser.regNo}
                  disabled
                  className="bg-white/[0.02] border-white/[0.06] text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">Your registration number cannot be changed.</p>
              </div>
            </div>
          </motion.div>

          {/* Contact preference */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-semibold">Contact Preference</h2>
                <p className="text-xs text-muted-foreground">How should others reach you?</p>
              </div>
            </div>

            <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <button
                type="button"
                onClick={() => setContactPref('whatsapp')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium btn-press transition-all ${
                  contactPref === 'whatsapp'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setContactPref('email')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium btn-press transition-all ${
                  contactPref === 'email'
                    ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="h-4 w-4" /> Email
              </button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <Bell className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold">Notifications</h2>
                <p className="text-xs text-muted-foreground">Choose what you want to be notified about</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">New connection requests</p>
                  <p className="text-xs text-muted-foreground">Get notified when someone wants to connect</p>
                </div>
                <Switch checked={notifNewRequests} onCheckedChange={setNotifNewRequests} />
              </div>
              <Separator className="bg-white/[0.06]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Listing views milestone</p>
                  <p className="text-xs text-muted-foreground">When your listing hits 10+ views</p>
                </div>
                <Switch checked={notifListingViews} onCheckedChange={setNotifListingViews} />
              </div>
            </div>
          </motion.div>

          {/* Account info */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold">Account</h2>
                <p className="text-xs text-muted-foreground">Your account is verified</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <Shield className="h-3 w-3" /> Verified SRM Student
              </span>
            </div>
          </motion.div>

          {/* Save button */}
          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              size="lg"
              className="btn-press bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl shadow-xl shadow-violet-500/25 transition-transform hover:scale-105 px-10"
            >
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </form>
      </DashboardShell>
    </PageTransition>
  );
}
