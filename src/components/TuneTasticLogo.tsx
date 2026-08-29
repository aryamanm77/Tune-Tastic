import React from 'react';

/**
 * TuneTasticLogo — Premium animated SVG logo
 * Features:
 *  - Animated gradient ring (spinning conic gradient)
 *  - Animated equalizer bars inside
 *  - Subtle floating / levitation animation on the whole icon
 *  - Premium glass-morphic inner circle
 */
const TuneTasticLogo: React.FC<{ size?: number; animated?: boolean }> = ({ size = 36, animated = true }) => {
  const id = `ttl-${size}`;

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes tt-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tt-float {
          0%   { transform: translateY(0px);   }
          50%  { transform: translateY(-4px);  }
          100% { transform: translateY(0px);   }
        }
        @keyframes tt-glow-pulse {
          0%   { opacity: 0.35; transform: scale(0.92); }
          50%  { opacity: 0.75; transform: scale(1.12); }
          100% { opacity: 0.35; transform: scale(0.92); }
        }
        @keyframes tt-bar1 {
          0%,100% { height: 30%; }
          25%     { height: 80%; }
          75%     { height: 55%; }
        }
        @keyframes tt-bar2 {
          0%,100% { height: 60%; }
          40%     { height: 100%; }
          70%     { height: 40%; }
        }
        @keyframes tt-bar3 {
          0%,100% { height: 45%; }
          30%     { height: 90%; }
          60%     { height: 30%; }
        }
        @keyframes tt-bar4 {
          0%,100% { height: 70%; }
          20%     { height: 35%; }
          55%     { height: 85%; }
        }
      `}</style>

      {/* Outer glow halo */}
      <div
        style={{
          position: 'absolute',
          inset: `-${size * 0.12}px`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(29,185,84,0.55) 0%, transparent 70%)',
          animation: animated ? 'tt-glow-pulse 2.8s ease-in-out infinite' : 'none',
          pointerEvents: 'none',
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          animation: animated ? 'tt-float 4s ease-in-out infinite' : 'none',
          position: 'relative',
          zIndex: 1,
          filter: `drop-shadow(0 ${size * 0.06}px ${size * 0.14}px rgba(29,185,84,0.5))`,
        }}
      >
        <defs>
          {/* Spinning gradient ring */}
          <linearGradient id={`${id}-ring`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1db954" />
            <stop offset="40%" stopColor="#1ed760" />
            <stop offset="70%" stopColor="#4ade80" />
            <stop offset="100%" stopColor="#1db954" stopOpacity="0.2" />
          </linearGradient>

          {/* Glass inner fill */}
          <radialGradient id={`${id}-glass`} cx="38%" cy="32%" r="62%">
            <stop offset="0%" stopColor="#2a2a3a" />
            <stop offset="100%" stopColor="#0a0a12" />
          </radialGradient>

          {/* Bar gradient */}
          <linearGradient id={`${id}-bar`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1ed760" />
            <stop offset="100%" stopColor="#1db954" stopOpacity="0.6" />
          </linearGradient>

          {/* Clip to circle */}
          <clipPath id={`${id}-clip`}>
            <circle cx="50" cy="50" r="43" />
          </clipPath>
        </defs>

        {/* Spinning outer ring (rotated via animateTransform) */}
        <circle
          cx="50" cy="50" r="48"
          stroke={`url(#${id}-ring)`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="200 100"
          fill="none"
          style={{ transformOrigin: '50px 50px', animation: animated ? 'tt-spin 3s linear infinite' : 'none' }}
        />

        {/* Secondary ring counter-spin */}
        <circle
          cx="50" cy="50" r="44"
          stroke="rgba(29,185,84,0.18)"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="60 250"
          style={{ transformOrigin: '50px 50px', animation: animated ? 'tt-spin 6s linear infinite reverse' : 'none' }}
        />

        {/* Glass inner disk */}
        <circle cx="50" cy="50" r="40" fill={`url(#${id}-glass)`} />

        {/* Subtle gloss sheen */}
        <ellipse cx="44" cy="36" rx="18" ry="10"
          fill="rgba(255,255,255,0.06)"
          clipPath={`url(#${id}-clip)`}
        />

        {/* Equalizer bars — centered group */}
        <g clipPath={`url(#${id}-clip)`} style={{ transformOrigin: '50px 50px' }}>
          {/* Bar 1 */}
          <rect
            x="27" y="35" width="7" rx="3.5"
            fill={`url(#${id}-bar)`}
            style={{
              transformOrigin: '30.5px 80px',
              height: '30px',
              animation: animated ? 'tt-bar1 1.1s ease-in-out infinite' : 'none',
            }}
          />
          {/* Bar 2 */}
          <rect
            x="37" y="28" width="7" rx="3.5"
            fill={`url(#${id}-bar)`}
            style={{
              transformOrigin: '40.5px 80px',
              height: '37px',
              animation: animated ? 'tt-bar2 0.9s ease-in-out infinite 0.15s' : 'none',
            }}
          />
          {/* Bar 3 */}
          <rect
            x="47" y="32" width="7" rx="3.5"
            fill={`url(#${id}-bar)`}
            style={{
              transformOrigin: '50.5px 80px',
              height: '33px',
              animation: animated ? 'tt-bar3 1.3s ease-in-out infinite 0.05s' : 'none',
            }}
          />
          {/* Bar 4 */}
          <rect
            x="57" y="24" width="7" rx="3.5"
            fill="rgba(29,215,96,0.75)"
            style={{
              transformOrigin: '60.5px 80px',
              height: '41px',
              animation: animated ? 'tt-bar4 0.8s ease-in-out infinite 0.3s' : 'none',
            }}
          />
          {/* Bar 5 */}
          <rect
            x="67" y="31" width="7" rx="3.5"
            fill="rgba(29,185,84,0.5)"
            style={{
              transformOrigin: '70.5px 80px',
              height: '34px',
              animation: animated ? 'tt-bar1 1.05s ease-in-out infinite 0.2s' : 'none',
            }}
          />

          {/* Base line under bars */}
          <rect x="23" y="68" width="54" height="2" rx="1" fill="rgba(29,185,84,0.25)" />
        </g>

        {/* Outer rim highlight (top-left arc sheen) */}
        <circle
          cx="50" cy="50" r="40"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          fill="none"
        />
      </svg>
    </div>
  );
};

export default TuneTasticLogo;
