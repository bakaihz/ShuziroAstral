import React, { useMemo } from 'react';

export const BackgroundStars: React.FC = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 110 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.8 + 0.8,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 7,
      delay: Math.random() * 6,
      opacity: Math.random() * 0.7 + 0.3,
      color: i % 4 === 0 ? 'bg-emerald-300' : i % 5 === 0 ? 'bg-indigo-300' : i % 7 === 0 ? 'bg-amber-200' : 'bg-white'
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#060608] overflow-hidden pointer-events-none select-none">
      {/* Animated ambient glowing nebulae */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[130px] animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/2 -right-32 w-[650px] h-[650px] bg-indigo-600/15 rounded-full blur-[150px] animate-pulse duration-[10000ms]" />
      <div className="absolute -bottom-32 left-1/3 w-[600px] h-[600px] bg-teal-500/15 rounded-full blur-[140px] animate-pulse duration-[9000ms]" />

      {/* Subtle grid mesh */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* Floating starry particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full animate-pulse ${p.color}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: p.size > 2 ? '0 0 8px rgba(255, 255, 255, 0.6)' : 'none'
          }}
        />
      ))}

      {/* Shooting lights */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent -rotate-12 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/3 right-10 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent rotate-12 animate-pulse duration-[8000ms]" />
    </div>
  );
};
