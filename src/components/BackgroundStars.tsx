import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export const BackgroundStars: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 90 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.8 + 0.8,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
      color: i % 4 === 0 ? 'bg-zinc-400' : i % 5 === 0 ? 'bg-zinc-300' : i % 7 === 0 ? 'bg-zinc-500' : 'bg-white'
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#060608] overflow-hidden pointer-events-none select-none">
      {/* Animated ambient glowing nebulae */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-[650px] h-[650px] bg-zinc-700/20 rounded-full blur-[140px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.25, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/2 -right-32 w-[700px] h-[700px] bg-zinc-800/20 rounded-full blur-[160px]" 
      />
      <motion.div 
        animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute -bottom-32 left-1/3 w-[650px] h-[650px] bg-zinc-600/20 rounded-full blur-[150px]" 
      />

      {/* Grid mesh background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* Floating starry particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: p.opacity, y: 0 }}
          animate={{ opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3], y: [-5, 5, -5] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          className={`absolute rounded-full ${p.color}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            boxShadow: p.size > 2 ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none'
          }}
        />
      ))}

      {/* Animated shooting lights */}
      <motion.div 
        animate={{ x: [-200, 600], opacity: [0, 0.8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/4 left-10 w-[450px] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent -rotate-12" 
      />
      <motion.div 
        animate={{ x: [200, -600], opacity: [0, 0.8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-1/3 right-10 w-[450px] h-[1px] bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent rotate-12" 
      />
    </div>
  );
};

