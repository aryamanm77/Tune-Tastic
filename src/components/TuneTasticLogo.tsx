import React from 'react';

const TuneTasticLogo: React.FC<{ size?: number }> = ({ size = 36 }) => {
  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {/* Outer pulsing glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: '50%',
        background: 'var(--spotify-green)',
        filter: 'blur(10px)',
        opacity: 0.4,
        animation: 'pulseGlow 3s infinite ease-in-out'
      }} />

      {/* The 3D Image Logo */}
      <img 
        src="/logo.png" 
        alt="TuneTastic Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '25%', // Slight rounding for the squircle look
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
      />

      <style>
        {`
          @keyframes pulseGlow {
            0% { transform: scale(0.9); opacity: 0.3; }
            50% { transform: scale(1.15); opacity: 0.7; }
            100% { transform: scale(0.9); opacity: 0.3; }
          }
        `}
      </style>
    </div>
  );
};

export default TuneTasticLogo;
