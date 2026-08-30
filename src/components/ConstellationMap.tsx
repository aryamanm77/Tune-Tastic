import React, { useEffect, useRef, useState } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';

interface Star {
  x: number;
  y: number;
  radius: number;
  color: string;
  song: Song;
  angle: number;
  speed: number;
  distance: number;
}

const ConstellationMap: React.FC = () => {
  const { songs, playSong, currentSong, isPlaying, getAnalyserData } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSong, setHoveredSong] = useState<Song | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const starsRef = useRef<Star[]>([]);
  const requestRef = useRef<number>();

  useEffect(() => {
    const generateGalaxy = () => {
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 600;
      const cx = w / 2;
      const cy = h / 2;

      starsRef.current = songs.map((song, i) => {
        // Spiral distribution
        const angle = i * 137.5 * (Math.PI / 180);
        const distance = Math.sqrt(i + 1) * (Math.min(w, h) / Math.sqrt(songs.length)) * 0.4;
        
        // Add some noise
        const noiseX = (Math.random() - 0.5) * 40;
        const noiseY = (Math.random() - 0.5) * 40;

        return {
          x: cx + Math.cos(angle) * distance + noiseX,
          y: cy + Math.sin(angle) * distance + noiseY,
          radius: Math.random() * 2 + 1.5,
          color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`, // Cool blues/cyans
          song,
          angle,
          speed: 0.0002 + Math.random() * 0.0005,
          distance
        };
      });
    };
    
    generateGalaxy();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = containerRef.current?.clientWidth || window.innerWidth;
    let height = canvas.height = containerRef.current?.clientHeight || 500;

    const render = () => {
      ctx.fillStyle = 'rgba(10, 15, 25, 0.2)'; // Trailing effect
      ctx.fillRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      
      let bass = 0;
      if (isPlaying) {
        const data = getAnalyserData();
        bass = data[0] || 0;
      }

      // Pre-calculate line distances for performance
      for (let i = 0; i < starsRef.current.length; i++) {
        for (let j = i + 1; j < starsRef.current.length; j++) {
          const star = starsRef.current[i];
          const other = starsRef.current[j];
          const dx = star.x - other.x;
          const dy = star.y - other.y;
          const distSq = dx*dx + dy*dy;
          if (distSq < 3600) { // 60^2
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255,255,255,${0.1 - (Math.sqrt(distSq)/600)})`;
            ctx.stroke();
          }
        }
      }

      starsRef.current.forEach(star => {
        // Orbit
        star.angle += star.speed;
        star.x = cx + Math.cos(star.angle) * star.distance;
        star.y = cy + Math.sin(star.angle) * star.distance;

        // Pulse if playing
        const isCurrent = currentSong?.id === star.song.id;
        let r = star.radius;
        if (isCurrent && isPlaying) {
          r += (bass / 50);
          ctx.shadowBlur = 20;
          ctx.shadowColor = star.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#1db954' : star.color;
        ctx.fill();
        ctx.closePath();
      });

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [songs, currentSong, isPlaying, getAnalyserData]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let found: Song | null = null;
    for (const star of starsRef.current) {
      const dx = star.x - x;
      const dy = star.y - y;
      if (Math.sqrt(dx*dx + dy*dy) < 15) {
        found = star.song;
        break;
      }
    }
    setHoveredSong(found);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleClick = () => {
    if (hoveredSong) {
      playSong(hoveredSong);
    }
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '600px', position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: hoveredSong ? 'pointer' : 'default', backgroundColor: '#0a0f19', boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' }}>
      <canvas 
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      
      {/* Overlay Title */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', pointerEvents: 'none' }}>
        <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 800, background: 'linear-gradient(90deg, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Sonic Constellation
        </h2>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Explore your music. Hover over a star to reveal it, click to play.
        </p>
      </div>

      {hoveredSong && (
        <div style={{
          position: 'fixed',
          top: mousePos.y + 15,
          left: mousePos.x + 15,
          background: 'rgba(0,0,0,0.8)',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.2)',
          pointerEvents: 'none',
          zIndex: 100,
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '14px', color: 'white' }}>{hoveredSong.title}</p>
          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{hoveredSong.artist}</p>
        </div>
      )}
    </div>
  );
};

export default ConstellationMap;
