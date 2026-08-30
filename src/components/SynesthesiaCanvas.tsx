import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { X } from 'lucide-react';

interface SynesthesiaCanvasProps {
  onClose: () => void;
}

const SynesthesiaCanvas: React.FC<SynesthesiaCanvasProps> = ({ onClose }) => {
  const { getAnalyserData, isPlaying } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Track mouse coordinates
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleDown = () => { isMouseDownRef.current = true; };
    const handleUp = () => { isMouseDownRef.current = false; };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchstart', handleDown);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchstart', handleDown);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas to fill screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    let animationFrameId: number;
    let hueOffset = 0;

    const render = () => {
      // Fade out previous frames slightly to create trailing effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isPlaying) {
        const data = getAnalyserData();
        if (data.length > 0) {
          // Bass frequencies (0-10) for radius
          let bassSum = 0;
          for (let i = 0; i < 10; i++) bassSum += data[i];
          const bass = bassSum / 10; // 0 to 255

          // Treble frequencies (100-150) for hue/color
          let trebleSum = 0;
          for (let i = 100; i < 150; i++) trebleSum += data[i] || 0;
          const treble = trebleSum / 50; // 0 to 255

          // Draw the brush stroke
          const radius = Math.max(2, (bass / 255) * 60); // Base size 2px, up to 62px
          const hue = (treble * 2 + hueOffset) % 360; 
          
          ctx.beginPath();
          ctx.arc(mouseRef.current.x, mouseRef.current.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
          
          // If mouse is down, glow brighter
          if (isMouseDownRef.current) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
          } else {
            ctx.shadowBlur = 0;
          }
          
          ctx.fill();
        }
      } else {
        // Draw idle dot if not playing
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }

      hueOffset += 0.5;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, getAnalyserData]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'black',
      cursor: 'crosshair'
    }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block' }}
      />
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', pointerEvents: 'none' }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px', fontWeight: 800 }}>Synesthesia Canvas</h1>
        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
          Move your mouse to paint with the music.<br/>
          Click and drag for brighter strokes.
        </p>
      </div>

      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '32px',
          right: '32px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default SynesthesiaCanvas;
