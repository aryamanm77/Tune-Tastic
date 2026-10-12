import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import nebulaImage from '../assets/images/deep_space_nebula.png';

const NebulaBackground: React.FC = () => {
  const { djState } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Persist animation state across re-renders
  const bgScrollRef = useRef(0);
  const currentScaleRef = useRef(1.1);
  const starsRef = useRef<{x: number, y: number, z: number, size: number, baseAlpha: number}[]>([]);
  
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
    let imgLoaded = false;
    img.onload = () => { imgLoaded = true; };
    img.src = nebulaImage;
    if (img.complete && img.naturalWidth > 0) {
      imgLoaded = true;
    }
    
    // Initialize stars once
    if (starsRef.current.length === 0) {
      starsRef.current = Array.from({ length: 220 }, () => ({
        x: Math.random() * (canvas.width || window.innerWidth),
        y: Math.random() * (canvas.height || window.innerHeight),
        z: Math.random() * 2 + 0.5,
        size: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.5 + 0.3
      }));
    }

    const render = () => {
      time += 0.01;

      // Base background color
      ctx.fillStyle = '#05050c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const speedMult = 0.1;
      const bgSpeed = 0.1;

      if (imgLoaded && img.naturalWidth > 0) {
        const targetScale = 1.1;
        currentScaleRef.current += (targetScale - currentScaleRef.current) * 0.1;
        bgScrollRef.current -= bgSpeed * 1.5;

        const baseHeight = canvas.height * 1.5;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const baseWidth = baseHeight * aspectRatio;
        
        const imgWidth = baseWidth * currentScaleRef.current;
        const imgHeight = baseHeight * currentScaleRef.current;
        
        const startTileIndex = Math.floor(-bgScrollRef.current / imgWidth);
        
        ctx.save();
        ctx.globalAlpha = 1.0; 
        const yOffset = (canvas.height - imgHeight) / 2;
        
        for (let i = startTileIndex - 1; i <= startTileIndex + 2; i++) {
          const xPos = bgScrollRef.current + i * imgWidth;
          ctx.save();
          if (i % 2 !== 0) {
            ctx.translate(xPos + imgWidth, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(img, 0, yOffset, imgWidth + 1, imgHeight);
          } else {
            ctx.drawImage(img, xPos, yOffset, imgWidth + 1, imgHeight);
          }
          ctx.restore();
        }
        ctx.restore();
      } else {
        // High-fidelity cosmic nebula gradient fallback
        const grad1 = ctx.createRadialGradient(canvas.width * 0.35, canvas.height * 0.35, 60, canvas.width * 0.35, canvas.height * 0.35, canvas.width * 0.7);
        grad1.addColorStop(0, 'rgba(124, 58, 237, 0.45)');
        grad1.addColorStop(0.5, 'rgba(76, 29, 149, 0.2)');
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const grad2 = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.65, 80, canvas.width * 0.7, canvas.height * 0.65, canvas.width * 0.6);
        grad2.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        grad2.addColorStop(0.5, 'rgba(16, 185, 129, 0.18)');
        grad2.addColorStop(1, 'transparent');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw drifting stars
      starsRef.current.forEach(star => {
        star.x -= star.z * speedMult * 5;
        if (star.x < 0) star.x = canvas.width;
        if (star.x > canvas.width) star.x = 0;
        if (star.y < 0) star.y = canvas.height;
        if (star.y > canvas.height) star.y = 0;

        const baseSize = star.size;
        const twinkle = Math.abs(Math.sin(time * 2 + star.x));
        const alpha = Math.min(1, star.baseAlpha + (twinkle * 0.3));
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, baseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        if (star.z > 1.5) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'white';
        } else {
          ctx.shadowBlur = 0;
        }
      });

      if (djState.nebulaMode) {
        animationId = requestAnimationFrame(render);
      }
    };

    if (djState.nebulaMode) {
      render();
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [djState.nebulaMode]);

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
        background: '#05050c',
        opacity: djState.nebulaMode ? 1 : 0,
        visibility: djState.nebulaMode ? 'visible' : 'hidden',
        transition: 'opacity 0.6s ease',
      }}
    />
  );
};

export default NebulaBackground;
