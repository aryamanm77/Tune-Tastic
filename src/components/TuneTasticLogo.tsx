import React from 'react';

const TuneTasticLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0, overflow: 'visible' }}
  >
    <defs>
      <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#1a3a24" />
        <stop offset="100%" stopColor="#0a0a0a" />
      </radialGradient>
      <linearGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1db954" />
        <stop offset="100%" stopColor="#1ed760" />
      </linearGradient>
      <filter id="greenGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Dark background circle */}
    <circle cx="100" cy="100" r="90" fill="url(#bgGrad)" />

    {/* Outermost slow spinning dashed ring */}
    <circle cx="100" cy="100" r="85" fill="none" stroke="#1db954" strokeWidth="1.5"
      strokeDasharray="8 14" strokeOpacity="0.35">
      <animateTransform attributeName="transform" type="rotate"
        from="0 100 100" to="360 100 100" dur="18s" repeatCount="indefinite" />
    </circle>

    {/* Pulsing outer glow ring 1 */}
    <circle cx="100" cy="100" r="75" fill="none" stroke="#1db954" strokeWidth="2" opacity="0">
      <animate attributeName="r" values="72;88;72" dur="3s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.55;0;0.55" dur="3s" repeatCount="indefinite" />
    </circle>

    {/* Pulsing glow ring 2 (offset) */}
    <circle cx="100" cy="100" r="72" fill="none" stroke="#1ed760" strokeWidth="1.5" opacity="0">
      <animate attributeName="r" values="65;82;65" dur="3s" begin="1s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" begin="1s" repeatCount="indefinite" />
    </circle>

    {/* Main green filled circle */}
    <circle cx="100" cy="100" r="62" fill="url(#circleGrad)" filter="url(#greenGlow)" />

    {/* Inner dark overlay for depth */}
    <circle cx="100" cy="100" r="58" fill="#0d1f13" opacity="0.45" />

    {/* Music note — clean white double quaver */}
    <rect x="88" y="62" width="8" height="52" rx="4" fill="white" filter="url(#softGlow)" />
    <rect x="114" y="52" width="8" height="42" rx="4" fill="white" filter="url(#softGlow)" />
    <rect x="88" y="62" width="34" height="9" rx="4" fill="white" filter="url(#softGlow)" />
    <ellipse cx="88" cy="116" rx="14" ry="9" fill="white"
      transform="rotate(-20 88 116)" filter="url(#softGlow)" />
    <ellipse cx="114" cy="95" rx="14" ry="9" fill="white"
      transform="rotate(-20 114 95)" filter="url(#softGlow)" />

    {/* Breathing glow ring */}
    <circle cx="100" cy="100" r="62" fill="none" stroke="#1ed760" strokeWidth="3" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
      <animate attributeName="r" values="62;66;62" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default TuneTasticLogo;
