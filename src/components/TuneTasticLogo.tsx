import React from 'react';

const TuneTasticLogo: React.FC<{ size?: number }> = ({ size = 36 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1db954" />
        <stop offset="100%" stopColor="#1ed760" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Outer circle */}
    <circle cx="50" cy="50" r="46" fill="url(#logoGradient)" filter="url(#glow)" />

    {/* Music note body */}
    <ellipse cx="36" cy="68" rx="10" ry="7" fill="#0a3d1f" />
    <rect x="44" y="30" width="5" height="38" fill="#0a3d1f" rx="2" />
    <rect x="44" y="30" width="22" height="5" fill="#0a3d1f" rx="2" />
    <ellipse cx="61" cy="46" rx="10" ry="7" fill="#0a3d1f" />
    <rect x="61" y="21" width="5" height="28" fill="#0a3d1f" rx="2" />

    {/* Pulse ring animation */}
    <circle cx="50" cy="50" r="46" fill="none" stroke="#1ed760" strokeWidth="3" opacity="0.6">
      <animate attributeName="r" values="46;54;46" dur="2.4s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default TuneTasticLogo;
