import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { getCoverArtUrl } from '../utils/cloudinary';

interface AuraModeProps {
  onBack?: () => void;
}

const AuraMode: React.FC<AuraModeProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentSong, isPlaying, togglePlayPause, nextSong, prevSong, getAnalyserData } = usePlayer();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let phase = 0;

    // Elegant atmospheric stardust
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; hue: number }[] = [];

    const resize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      
      stars.length = 0;
      for (let i = 0; i < 60; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          alpha: Math.random() * 0.7 + 0.2,
          speed: Math.random() * 0.6 + 0.2,
          hue: Math.random() > 0.5 ? 260 : 190, // Indigo & Cyan
        });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Dark luxurious backdrop with smooth trail
      ctx.fillStyle = 'rgba(10, 12, 16, 0.4)';
      ctx.fillRect(0, 0, width, height);

      const data = getAnalyserData();
      let avgBass = 0;
      let avgMid = 0;
      let avgTreble = 0;

      if (data && data.length > 0) {
        for (let i = 0; i < 12; i++) avgBass += data[i] || 0;
        for (let i = 12; i < 48; i++) avgMid += data[i] || 0;
        for (let i = 48; i < 96; i++) avgTreble += data[i] || 0;
        avgBass = avgBass / 12;
        avgMid = avgMid / 36;
        avgTreble = avgTreble / 48;
      }

      const bassFactor = isPlaying ? (avgBass / 255) : 0.05;
      const midFactor = isPlaying ? (avgMid / 255) : 0.05;
      phase += 0.02 + bassFactor * 0.04;

      const centerX = width / 2;
      const centerY = height * 0.44;
      const baseRadius = Math.min(width, height) * 0.22;

      // 1. Draw drifting ambient stardust
      stars.forEach(s => {
        s.y -= s.speed * (1 + bassFactor * 2);
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${s.alpha * (0.4 + bassFactor * 0.6)})`;
        ctx.fill();
      });

      // 2. Multi-layered Harmonic Aura Rings (Atmospheric neon waveform)
      const numRings = 5;
      for (let r = 0; r < numRings; r++) {
        const ringProgress = (r + 1) / numRings;
        const ringRadius = baseRadius + ringProgress * (70 + bassFactor * 80);
        const waveCount = 8 + r * 2;

        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.04) {
          const wave = Math.sin(a * waveCount + phase * (r % 2 === 0 ? 1 : -1) + r) * (8 + bassFactor * 26 + midFactor * 14);
          const rad = ringRadius + wave;
          const x = centerX + Math.cos(a) * rad;
          const y = centerY + Math.sin(a) * rad;

          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // High-end ambient color ramp: Cyan -> Electric Indigo -> Soft Violet
        const hue = 180 + r * 25 + bassFactor * 30;
        const alpha = (1 - ringProgress * 0.7) * (0.35 + bassFactor * 0.65);
        ctx.strokeStyle = `hsla(${hue}, 90%, 65%, ${alpha})`;
        ctx.lineWidth = 2 + (1 - ringProgress) * 2;
        ctx.shadowBlur = 18 + bassFactor * 24;
        ctx.shadowColor = `hsla(${hue}, 95%, 60%, 0.9)`;
        ctx.stroke();
      }

      // 3. Central Deep Radial Glow
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, baseRadius * 0.2,
        centerX, centerY, baseRadius * 1.6
      );
      glowGrad.addColorStop(0, `rgba(50, 210, 255, ${0.25 + bassFactor * 0.45})`);
      glowGrad.addColorStop(0.5, `rgba(130, 80, 255, ${0.18 + midFactor * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [getAnalyserData, isPlaying]);

  const coverUrl = currentSong?.coverArt || (currentSong?.audioId ? getCoverArtUrl(currentSong.audioId) : './logo.png');

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 900,
      background: 'radial-gradient(ellipse at center, #0f172a 0%, #030712 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Dynamic Background Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 1 }}
      />

      {/* Top Header with Prominent BACK Button */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))'
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '500px',
            color: 'white',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)'}
          onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
        >
          <ArrowLeft size={18} />
          <span>Back to Art</span>
        </button>

        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.7)',
          background: 'rgba(0,0,0,0.4)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          Aura Soundscape
        </span>
      </div>

      {/* Floating Center Artwork with Audio-Reactive Halo */}
      <div style={{
        position: 'absolute',
        top: '44%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: 'min(200px, 46vw)',
          height: 'min(200px, 46vw)',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 50px rgba(99, 102, 241, 0.6), 0 20px 40px rgba(0,0,0,0.8)',
          border: '3px solid rgba(255,255,255,0.3)',
          transform: isPlaying ? 'scale(1.02)' : 'scale(0.98)',
          transition: 'transform 0.4s ease'
        }}>
          <img
            src={coverUrl}
            alt={currentSong?.title || ''}
            onError={e => { e.currentTarget.src = './logo.png'; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Bottom Floating Info & Minimal Playback Controls */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        marginTop: 'auto',
        padding: '24px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        background: 'linear-gradient(180deg, rgba(3, 7, 18, 0) 0%, rgba(3, 7, 18, 0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        {/* Track Title & Artist */}
        <div style={{ textAlign: 'center', maxWidth: '85%' }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 800,
            color: 'white',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {currentSong?.title || 'Unknown Title'}
          </h2>
          <p style={{
            margin: '4px 0 0',
            fontSize: '14px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {currentSong?.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Minimal Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={prevSong}
            style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <SkipBack size={26} fill="white" />
          </button>

          <button
            onClick={togglePlayPause}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.94)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            {isPlaying ? <Pause size={26} fill="black" color="black" /> : <Play size={26} fill="black" color="black" style={{ marginLeft: '3px' }} />}
          </button>

          <button
            onClick={nextSong}
            style={{ color: 'rgba(255,255,255,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
          >
            <SkipForward size={26} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuraMode;
