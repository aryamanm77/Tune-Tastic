import React from 'react';

const TuneTasticLogo: React.FC<{ size?: number; animated?: boolean }> = ({ size = 36, animated = true }) => {
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
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="50" fill="#1db954" />
        <g transform="rotate(-8 50 50)">
          <path d="M 22 32 Q 50 12 78 32" stroke="white" strokeWidth="8.5" strokeLinecap="round" fill="none" />
          <path d="M 28 50 Q 50 32 72 50" stroke="white" strokeWidth="7.5" strokeLinecap="round" fill="none" />
          <path d="M 35 68 Q 50 55 65 68" stroke="white" strokeWidth="6.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
};

export default TuneTasticLogo;
