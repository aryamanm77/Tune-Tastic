import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';

const VinylScratch: React.FC = () => {
  const { currentSong, isPlaying, setPlaybackRate } = usePlayer();
  const [isScratching, setIsScratching] = useState(false);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
    setPlaybackRate(0); // Stop playback while holding
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    const dx = e.clientX - lastXRef.current;
    const dt = Date.now() - lastTimeRef.current;
    
    if (dt > 0) {
      const velocity = dx / dt; // pixels per ms
      let rate = velocity * 2;
      rate = Math.max(-3, Math.min(3, rate));
      if (Math.abs(rate) < 0.1) rate = 0;
      setPlaybackRate(rate);
    }
    
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    setPlaybackRate(1); // Restore normal speed
  };

  if (!currentSong) return null;

  return (
    <div 
      style={{
        width: '100%', maxWidth: '320px', aspectRatio: '1 / 1',
        borderRadius: '50%', overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
        border: '12px solid #111',
        position: 'relative',
        animation: (!isScratching && isPlaying) ? 'spin 3s linear infinite' : 'none',
        cursor: isScratching ? 'grabbing' : 'grab',
        touchAction: 'none',
        margin: '0 auto'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <img
        src={currentSong.coverArt || getCoverArtUrl(currentSong.audioId)}
        onError={e => {
          if (e.currentTarget.src.includes('600x600bb')) {
            e.currentTarget.src = e.currentTarget.src.replace('600x600bb', '100x100bb');
          } else {
            e.currentTarget.src = '/logo.png';
          }
        }}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        draggable={false}
      />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '24px', height: '24px',
        backgroundColor: '#111', borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.2)'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: 'repeating-radial-gradient(transparent, transparent 4px, rgba(0,0,0,0.3) 5px, transparent 6px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
};

export default VinylScratch;
