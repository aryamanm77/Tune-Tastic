import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const Visualizer: React.FC = () => {
  const { getAnalyserData, isPlaying } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: { x: number, y: number, vx: number, vy: number, size: number, color: string }[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 4 + 1,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`
      });
    }

    const render = () => {
      if (!isPlaying) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      const data = getAnalyserData();
      if (!data || data.length === 0) {
        requestRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = (width / data.length) * 2.5;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const barHeight = data[i] * 1.5;
        const r = barHeight + (25 * (i / data.length));
        const g = 250 * (i / data.length);
        const b = 50;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, height - barHeight / 2, barWidth, barHeight / 2);
        x += barWidth + 1;
      }

      // Draw beat particles
      const bassFreq = data[0] || 0; 
      
      particles.forEach(p => {
        p.x += p.vx * (bassFreq / 50 + 1);
        p.y += p.vy * (bassFreq / 50 + 1);

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (bassFreq / 100 + 1), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.closePath();
      });

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [getAnalyserData, isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.8
      }}
    />
  );
};

export default Visualizer;
