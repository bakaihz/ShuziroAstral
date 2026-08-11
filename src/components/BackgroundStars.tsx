import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface BackgroundStarsProps {
  isStatic?: boolean;
}

export const BackgroundStars: React.FC<BackgroundStarsProps> = ({ isStatic = false }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const particleCount = isMobile ? 25 : 80;

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      size: Math.random() * 2.2 + 0.8,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.6 + 0.3,
      color: i % 4 === 0 ? 'bg-zinc-400' : i % 5 === 0 ? 'bg-zinc-300' : 'bg-white'
    }));
  }, [particleCount]);

  return (
    <div className="fixed inset-0 z-0 bg-[#060608] overflow-hidden pointer-events-none select-none">
      {/* Ambient glowing nebulae - lightened blur on mobile */}
      <div 
        className="absolute -top-32 -left-32 w-[350px] md:w-[650px] h-[350px] md:h-[650px] bg-zinc-700/15 rounded-full blur-[60px] md:blur-[140px] transform-gpu" 
      />
      <div 
        className="absolute top-1/2 -right-32 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-zinc-800/15 rounded-full blur-[70px] md:blur-[160px] transform-gpu" 
      />

      {/* Grid mesh background */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_75%_75%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* Starry particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: p.opacity }}
          animate={isStatic || isMobile ? { opacity: p.opacity } : { opacity: [p.opacity * 0.4, p.opacity, p.opacity * 0.4] }}
          transition={{ duration: p.duration, repeat: isStatic || isMobile ? 0 : Infinity, ease: 'easeInOut', delay: p.delay }}
          className={`absolute rounded-full ${p.color} transform-gpu`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            willChange: 'opacity'
          }}
        />
      ))}

      {/* Shooting lights - desktop only */}
      {!isStatic && !isMobile && (
        <>
          <motion.div 
            animate={{ x: [-200, 600], opacity: [0, 0.8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute top-1/4 left-10 w-[450px] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent -rotate-12 transform-gpu" 
          />
          <motion.div 
            animate={{ x: [200, -600], opacity: [0, 0.8, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute bottom-1/3 right-10 w-[450px] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-12 transform-gpu" 
          />
        </>
      )}
    </div>
  );
};


