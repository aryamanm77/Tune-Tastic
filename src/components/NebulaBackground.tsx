import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const NebulaBackground: React.FC = () => {
  const { getAnalyserData, isPlaying, djState } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create stars
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2, // depth/parallax
      size: Math.random() * 2 + 0.5,
      baseAlpha: Math.random() * 0.8 + 0.2
    }));

    const render = () => {
      time += 0.01;
      
      const audioData = getAnalyserData();
      let bassSum = 0;
      for (let i = 0; i < 5; i++) bassSum += audioData[i];
      const audioPulse = isNaN(bassSum) ? 0 : bassSum / 5;
      const pulse = audioPulse / 255; // 0 to 1

      // Dynamic trail effect (less alpha = longer trails, speeds up on bass)
      ctx.fillStyle = `rgba(5, 5, 12, ${0.1 + (pulse * 0.1)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Nebula Clouds if zeroGravity or space effects are on
      if (djState.zeroGravity || djState.spin8D || djState.alien) {
        const grd = ctx.createRadialGradient(
          canvas.width/2, canvas.height/2, 0,
          canvas.width/2, canvas.height/2, canvas.width/1.5
        );
        const hue = (time * 50 + pulse * 100) % 360;
        grd.addColorStop(0, `hsla(${hue}, 80%, 40%, ${0.05 + pulse * 0.1})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const isWarping = (audioRef?.current as any)?.playbackRate < 0.9 && !(djState as any).astralMode;
      const speedMult = (isPlaying ? (pulse * 10 + 0.5) : 0.1) * (isWarping ? 50 : 1);

      stars.forEach(star => {
        // Move stars (warp drive pulls them to center, zero gravity floats them up)
        if (djState.zeroGravity) {
          star.y -= (star.z * speedMult * 2);
          star.x += Math.sin(time + star.z) * 0.5;
        } else {
          star.x -= star.z * speedMult * 5; // standard left drift
        }

        // Warp drive effect (pull towards center)
        if (isWarping) {
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            star.x += (cx - star.x) * 0.05;
            star.y += (cy - star.y) * 0.05;
        }

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        const pulseSize = star.size + (pulse * star.z * 3);
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, isWarping ? pulseSize * 4 : pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.baseAlpha + (pulse * 0.5)})`;
        ctx.fill();
        
        if (pulse > 0.5 && star.z > 1.5) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'white';
        } else {
            ctx.shadowBlur = 0;
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [getAnalyserData, isPlaying, djState]);

  // Hacky way to access audioRef from context to check warp state
  const { currentSong } = usePlayer();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    audioRef.current = document.querySelector('audio');
  }, [currentSong]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        background: '#05050c', // deep space blue/black
        transition: 'opacity 1s'
      }}
    />
  );
};

export default NebulaBackground;
