import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import nebulaImage from '../assets/images/deep_space_nebula.png';

const NebulaBackground: React.FC = () => {
  const { getAnalyserData, isPlaying, djState, currentSong } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Persist animation state across re-renders (like play/pause toggles)
  const bgScrollRef = useRef(0);
  const currentScaleRef = useRef(1.1);
  const starsRef = useRef<{x: number, y: number, z: number, size: number, baseAlpha: number}[]>([]);
  
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
    img.src = nebulaImage;
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };
    
    // Initialize stars once
    if (starsRef.current.length === 0) {
      starsRef.current = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 2 + 0.5,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3
      }));
    }

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
      // Stars and background always pan at a constant slow speed, regardless of music
      const speedMult = 0.5 * (isWarping ? 50 : 1);
      const bgSpeed = 0.5 * (isWarping ? 10 : 1);

      if (imgLoaded) {
        // Background pulses in size to the beat
        let targetScale = 1.1 + (pulse * 0.15);
        if (isWarping) targetScale = 3.0; // Huge zoom into hyperspace
        
        // Smoothly approach target scale
        currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.1;
        
        // Update background scroll position (smooth constant speed)
        if (djState.zeroGravity) {
          bgScrollRef.current += bgSpeed * 0.5; // Scroll up/down in zero G
        } else {
          bgScrollRef.current -= bgSpeed * 1.5; // Scroll left normally
        }

        const baseHeight = canvas.height * 1.5; // Ensure it covers height
        const aspectRatio = img.width / img.height;
        const baseWidth = baseHeight * aspectRatio;
        
        const imgWidth = baseWidth * currentScaleRef.current;
        const imgHeight = baseHeight * currentScaleRef.current;
        
        // Wrap the scroll position so it loops infinitely
        const scrollWrapped = ((bgScrollRef.current % imgWidth) + imgWidth) % imgWidth;
        
        ctx.save();
        ctx.globalAlpha = 0.6 + (pulse * 0.4); // Image pulses brightness on bass hits
        
        // Draw the image twice for an infinite scrolling effect
        const yOffset = (canvas.height - imgHeight) / 2;
        
        if (djState.zeroGravity) {
            // Vertical infinite scroll
            const vScrollWrapped = ((bgScrollRef.current % imgHeight) + imgHeight) % imgHeight;
            const xOffset = (canvas.width - imgWidth) / 2;
            ctx.drawImage(img, xOffset, vScrollWrapped, imgWidth, imgHeight);
            ctx.drawImage(img, xOffset, vScrollWrapped - imgHeight, imgWidth, imgHeight);
        } else {
            // Horizontal infinite scroll
            ctx.drawImage(img, scrollWrapped, yOffset, imgWidth, imgHeight);
            ctx.drawImage(img, scrollWrapped - imgWidth, yOffset, imgWidth, imgHeight);
        }
        
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

      starsRef.current.forEach(star => {
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
        const twinkle = Math.abs(Math.sin(time * 2 + star.x));
        const alpha = Math.min(1, star.baseAlpha + (pulse * 0.5) + (twinkle * 0.3));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, isWarping ? pulseSize * 4 : pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        if (pulse > 0.5 && star.z > 1.5) {
            ctx.shadowBlur = 15;
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
