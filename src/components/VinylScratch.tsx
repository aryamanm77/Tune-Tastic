import React, { useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';

const VinylScratch: React.FC = () => {
  const { currentSong, isPlaying, setPlaybackRate, currentTime, duration, seekTo } = usePlayer();
  const [isScratching, setIsScratching] = useState(false);
  const lastXRef = useRef(0);
  const scrubTimeRef = useRef(0);
  
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScratching(true);
    lastXRef.current = e.clientX;
    scrubTimeRef.current = currentTime; // Capture precise time on grab
    setPlaybackRate(0); // Stop normal playback
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScratching) return;
    const dx = e.clientX - lastXRef.current;
    
    // 1 pixel = 0.05 seconds of scrub (adjust for sensitivity)
    scrubTimeRef.current += dx * 0.05;
    scrubTimeRef.current = Math.max(0, Math.min(duration, scrubTimeRef.current));
    
    seekTo(scrubTimeRef.current / duration);

    lastXRef.current = e.clientX;
  };

  const handlePointerUp = () => {
    setIsScratching(false);
    setPlaybackRate(1); // Restore normal speed
  };

  if (!currentSong) return null;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '300px',
        aspectRatio: '1 / 1',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxSizing: 'border-box',
        contain: 'layout size paint',
      }}
    >
      <style>{`
        @keyframes vinylSpin {
          0%   { transform: rotate(0deg) translateZ(0); }
          100% { transform: rotate(360deg) translateZ(0); }
        }
      `}</style>

      {/* Rotating Vinyl Disc */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85)',
          border: '10px solid #111',
          boxSizing: 'border-box',
          transformOrigin: '50% 50%',
          animation: 'vinylSpin 3.2s linear infinite',
          animationPlayState: (!isScratching && isPlaying) ? 'running' : 'paused',
          cursor: isScratching ? 'grabbing' : 'grab',
          touchAction: 'none',
          willChange: 'transform',
          WebkitBackfaceVisibility: 'hidden',
          backfaceVisibility: 'hidden',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          src={currentSong.coverArt || getCoverArtUrl(currentSong.audioId)}
          onError={e => {
            if (e.currentTarget.src.includes('600x600bb')) {
              e.currentTarget.src = e.currentTarget.src.replace('600x600bb', '100x100bb');
            } else {
              e.currentTarget.src = './logo.png';
            }
          }}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none', userSelect: 'none' }}
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
    </div>
  );
};

export default VinylScratch;
