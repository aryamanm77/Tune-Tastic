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
      
      // The pulse is no longer calculated as visuals are entirely decoupled from audio

      // Base background color
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const isWarping = djState.isWarping;
      // Stars and background always pan at a constant very slow speed, regardless of music or effects
      const speedMult = 0.1;
      const bgSpeed = 0.1;

      if (imgLoaded) {
        // Background scale stays constant, no pulsing
        let targetScale = 1.1;
        if (isWarping) targetScale = 3.0; // Huge zoom into hyperspace
        
        // Smoothly approach target scale
        currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.1;
        
        // Update background scroll position (smooth constant speed)
        bgScrollRef.current -= bgSpeed * 1.5; // Scroll left normally

        const baseHeight = canvas.height * 1.5; // Ensure it covers height
        const aspectRatio = img.width / img.height;
        const baseWidth = baseHeight * aspectRatio;
        
        const imgWidth = baseWidth * currentScaleRef.current;
        const imgHeight = baseHeight * currentScaleRef.current;
        
        // Wrap the scroll position so it loops infinitely
        const scrollWrapped = ((bgScrollRef.current % imgWidth) + imgWidth) % imgWidth;
        
        ctx.save();
        ctx.globalAlpha = 1.0; // Fully clear image
        
        // Draw the image twice for an infinite scrolling effect
        const yOffset = (canvas.height - imgHeight) / 2;
        
        // Horizontal infinite scroll
        ctx.drawImage(img, scrollWrapped, yOffset, imgWidth, imgHeight);
        ctx.drawImage(img, scrollWrapped - imgWidth, yOffset, imgWidth, imgHeight);
        
        ctx.restore();
      }

      // No overlays to ensure a perfectly clear view of space

      starsRef.current.forEach(star => {
        // Move stars constantly to the left
        star.x -= star.z * speedMult * 5; // standard left drift

        // Wrap around screen
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        const baseSize = star.size;
        const twinkle = Math.abs(Math.sin(time * 2 + star.x));
        const alpha = Math.min(1, star.baseAlpha + (twinkle * 0.3));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, isWarping ? baseSize * 4 : baseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        if (star.z > 1.5) {
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
