'use client';

import { motion } from 'framer-motion';

export function BackgroundBeams() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Rotating beam glow */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]"
        style={{
          background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(124,58,237,0.08) 60deg, transparent 120deg, rgba(6,182,212,0.06) 180deg, transparent 240deg, rgba(124,58,237,0.08) 300deg, transparent 360deg)',
        }}
      />
      {/* Static radial glows */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 60%)' }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)' }}
      />
    </div>
  );
}
