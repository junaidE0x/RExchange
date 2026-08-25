'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { categories } from '@/lib/mock-data';
import type { CategoryId, ListingType } from '@/lib/mock-data';
import {
  BookOpen, Cpu, FileText, Ticket, Gift,
} from 'lucide-react';

const iconMap: Record<string, typeof BookOpen> = {
  BookOpen, Cpu, FileText, Sparkles, Ticket, Gift,
};

const types: { id: ListingType; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: 'exchange', label: 'Exchange' },
  { id: 'paid', label: 'Paid' },
];

export function PostListingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('books');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ListingType>('free');
  const [price, setPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Listing posted! It will appear in the browse feed.');
    setTitle('');
    setDescription('');
    setPrice('');
    setType('free');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="glass-strong rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl rounded-t-2xl">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  Post a Listing
                </h2>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Calculus by Thomas — 3rd Sem"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const Icon = iconMap[cat.icon];
                      const active = category === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all ${
                            active
                              ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)]'
                              : 'border-white/[0.08] hover:border-white/20 bg-white/[0.02]'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${active ? 'text-violet-400' : 'text-muted-foreground'}`} />
                          <span className={`text-[11px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {cat.label.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the item, condition, pickup location on campus..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <div className="flex gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    {types.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setType(t.id)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                          type === t.id
                            ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {type === 'paid' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-1">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          placeholder="e.g. 250"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="bg-white/[0.03] border-white/10 focus-visible:ring-violet-500/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label>Image</Label>
                  <button
                    type="button"
                    className="w-full rounded-xl border border-dashed border-white/[0.12] hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/[0.03] p-6 flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click to upload an image</span>
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white rounded-xl py-2.5 transition-transform hover:scale-[1.02] shadow-lg shadow-violet-500/20"
                >
                  Post Listing
                </Button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
