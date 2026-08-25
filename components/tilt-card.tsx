'use client';

import { useRef, useState, type ReactNode } from 'react';

export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -maxTilt;
    const rotateY = ((x - cx) / cx) * maxTilt;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`);
  };

  const handleLeave = () => {
    setTransform('perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transform, transition: 'transform 0.2s ease-out' }}
      className={className}
    >
      {children}
    </div>
  );
}
