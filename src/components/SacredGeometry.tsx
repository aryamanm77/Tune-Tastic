import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const SacredGeometry: React.FC = () => {
  const { djState, getAnalyserData } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!djState.astralMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let time = 0;
    
    const drawMandala = () => {
      // Get audio data to make it react to the music
      const audioData = getAnalyserData();
      let bassSum = 0;
      for (let i = 0; i < 10; i++) bassSum += audioData[i];
      const audioPulse = isNaN(bassSum) ? 0 : bassSum / 10; // 0 to 255
      const normalizedPulse = audioPulse / 255;

      ctx.fillStyle = 'rgba(5, 0, 15, 0.15)'; // Dark purple trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const baseRadius = Math.min(cx, cy) * 0.6;
      const radius = baseRadius + (normalizedPulse * 50); // React to bass
      
      ctx.save();
      ctx.translate(cx, cy);
      
      // Rotate slowly over time, speed up slightly with bass
      ctx.rotate(time * 0.002 + (normalizedPulse * 0.1));
      
      // Dynamic color based on time and audio
      const hue = (time * 0.5 + normalizedPulse * 50) % 360;
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.lineWidth = 2 + normalizedPulse * 3;
      
      // Draw Metatron's Cube / Sacred Geometry
      const points: {x: number, y: number}[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        points.push({
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius
        });
        // Inner points
        points.push({
          x: Math.cos(angle) * (radius / 2),
          y: Math.sin(angle) * (radius / 2)
        });
      }
      points.push({x: 0, y: 0}); // Center point
      
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          // Connect all nodes to form the complex geometry
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
        }
      }
      ctx.stroke();
      
      // Draw glowing circles at nodes
      points.forEach(p => {
        ctx.beginPath();
        const nodeRadius = 8 + normalizedPulse * 15;
        ctx.arc(p.x, p.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
        ctx.shadowColor = `hsla(${hue}, 100%, 70%, 1)`;
        ctx.shadowBlur = 20;
        ctx.fill();
      });
      
      ctx.restore();
      
      time++;
      animationRef.current = requestAnimationFrame(drawMandala);
    };
    
    drawMandala();
    
    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [djState.astralMode, getAnalyserData]);

  if (!djState.astralMode) return null;

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100vw', 
        height: '100vh', 
        zIndex: 0, // Behind the UI
        pointerEvents: 'none', // Let clicks pass through to the UI
        mixBlendMode: 'screen',
        opacity: 0.8,
        transition: 'opacity 1s ease'
      }} 
    />
  );
};

export default SacredGeometry;
