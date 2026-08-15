import React, { useEffect, useRef } from 'react';

interface BackgroundStarsProps {
  isStatic?: boolean;
}

export const BackgroundStars: React.FC<BackgroundStarsProps> = ({ isStatic = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initStars();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    const isMobile = width < 768;
    const count = isMobile ? 30 : 50;

    interface Star {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseAlpha: number;
      flickerSpeed: number;
      flickerOffset: number;
      color: string;
    }

    let stars: Star[] = [];
    const colors = ['#ffffff', '#f4f4f5', '#e4e4e7', '#cbd5e1'];

    const initStars = () => {
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          size: Math.random() * 1.2 + 0.5,
          baseAlpha: Math.random() * 0.4 + 0.2,
          flickerSpeed: Math.random() * 0.02 + 0.01,
          flickerOffset: Math.random() * Math.PI * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    initStars();

    if (isStatic) {
      ctx.clearRect(0, 0, width, height);
      stars.forEach(s => {
        ctx.globalAlpha = s.baseAlpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }

    let t = 0;
    const render = () => {
      t += 0.012;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle stars without bubble halos or clutter
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        s.x += s.vx;
        s.y += s.vy;

        if (s.x < 0) s.x = width;
        else if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        else if (s.y > height) s.y = 0;

        const flicker = Math.sin(t * s.flickerSpeed * 40 + s.flickerOffset) * 0.3 + 0.7;
        const currentAlpha = Math.max(0.1, Math.min(0.8, s.baseAlpha * flicker));

        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isStatic]);

  return (
    <div className="fixed inset-0 z-0 bg-[#060608] overflow-hidden pointer-events-none select-none contain-strict">
      {/* Single High-Performance Background Wallpaper (65% opacity) */}
      <img
        src="https://i.ibb.co/7JnpRSPy/b13bdb12a704c5b71b5b6dd6c0ef6b4f.jpg"
        alt="Background Wallpaper"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.65] pointer-events-none z-0 transform-gpu"
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />

      {/* Subtle vignette gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#060608]/40 via-[#060608]/20 to-[#060608]/60 pointer-events-none z-0" />

      {/* Futuristic Lightweight Mesh Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_60%,transparent_100%)] opacity-40 z-0" 
      />

      {/* Clean canvas for subtle point stars */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />
    </div>
  );
};


