import React from 'react';

export const BackgroundStars: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-2] bg-[#09090b] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(74,222,128,0.03),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.03),transparent_60%)]" />
      {Array.from({ length: 80 }).map((_, i) => {
        const size = Math.random() * 2.5 + 1;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const duration = 3 + Math.random() * 5;
        const delay = Math.random() * 5;
        const opacity = Math.random() * 0.5 + 0.2;
        return (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              opacity,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
};
