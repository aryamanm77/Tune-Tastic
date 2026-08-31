import React from 'react';

const TuneTasticLogo: React.FC<{ size?: number }> = ({ size = 36 }) => {
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
        @keyframes tt-logo-pulse {
          0%   { transform: scale(1); box-shadow: 0 0 10px rgba(29,185,84,0.3); }
          50%  { transform: scale(1.05); box-shadow: 0 0 20px rgba(29,185,84,0.6); }
          100% { transform: scale(1); box-shadow: 0 0 10px rgba(29,185,84,0.3); }
        }
      `}</style>
      
      {/* Background glow behind the image */}
      <div
        style={{
          position: 'absolute',
          inset: 2,
          borderRadius: '50%',
          background: 'var(--spotify-green)',
          filter: 'blur(8px)',
          opacity: 0.5,
          zIndex: 0,
        }}
      />

      <img 
        src="./logo.png" 
        alt="TuneTastic Premium Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '50%',
          position: 'relative',
          zIndex: 1,
          animation: 'tt-logo-pulse 3s infinite ease-in-out',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      />
    </div>
  );
};

export default TuneTasticLogo;
