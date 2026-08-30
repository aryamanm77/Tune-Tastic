import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

const NebulaBackground: React.FC = () => {
  const { getAnalyserData, isPlaying, djState, currentSong } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    audioRef.current = document.querySelector('audio');
  }, [currentSong]);
  
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

    const img = new Image();
    img.src = '/images/deep_space_nebula.png';
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };
    
    let currentScale = 1.1;

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

      // Base background color
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isWarping = djState.isWarping;
      const speedMult = (isPlaying ? (pulse * 10 + 0.5) : 0.1) * (isWarping ? 50 : 1);

      if (imgLoaded) {
        // Calculate target scale based on music and warp drive
        let targetScale = 1.1 + (pulse * 0.15);
        if (isWarping) targetScale = 3.0; // Huge zoom into hyperspace
        
        // Smoothly approach target scale
        currentScale += (targetScale - currentScale) * 0.1;
        
        // Draw the image centered and scaled
        const imgWidth = canvas.width * currentScale;
        const imgHeight = canvas.height * currentScale;
        const offsetX = (canvas.width - imgWidth) / 2;
        const offsetY = (canvas.height - imgHeight) / 2;
        
        ctx.save();
        ctx.globalAlpha = 0.6 + (pulse * 0.4); // Image gets brighter on bass hits
        ctx.drawImage(img, offsetX, offsetY, imgWidth, imgHeight);
        ctx.restore();
      }

      // Draw Nebula Clouds if zeroGravity or space effects are on
      if (djState.zeroGravity || djState.spin8D || djState.alien) {
        const grd = ctx.createRadialGradient(
          canvas.width/2, canvas.height/2, 0,
          canvas.width/2, canvas.height/2, canvas.width/1.5
        );
        const hue = (time * 50 + pulse * 100) % 360;
        grd.addColorStop(0, `hsla(${hue}, 80%, 40%, ${0.1 + pulse * 0.2})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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

  if (!djState.nebulaMode) return null;

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
