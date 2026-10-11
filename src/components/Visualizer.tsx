import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Rocket, Zap } from 'lucide-react';
import { getCoverArtUrl } from '../utils/cloudinary';

interface VisualizerProps {
  onBack?: () => void;
}

type VisualizerMode = 'tunnel' | 'orb';

export const Visualizer: React.FC<VisualizerProps> = ({ onBack }) => {
  const { currentSong, isPlaying, togglePlayPause, nextSong, prevSong, getAnalyserData } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VisualizerMode>('tunnel');

  const coverUrl = currentSong?.coverArt || (currentSong?.audioId ? getCoverArtUrl(currentSong.audioId) : './logo.png');

  // Animation state ref for 60fps canvas loop
  const stateRef = useRef({
    time: 0,
    stars: [] as { x: number; y: number; z: number; pz: number; size: number }[],
    particles: [] as { angle: number; dist: number; speed: number; size: number; color: string }[],
    smoothedBass: 0,
    smoothedMid: 0,
    smoothedTreble: 0,
  });

  // Setup stars and particles
  useEffect(() => {
    const stars = [];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 1000 + 1,
        pz: 1000,
        size: Math.random() * 2 + 1,
      });
    }

    const particles = [];
    const colors = ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#38bdf8'];
    for (let i = 0; i < 80; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 120 + 50,
        speed: (Math.random() * 0.02 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    stateRef.current.stars = stars;
    stateRef.current.particles = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    let animId: number;

    const render = () => {
      stateRef.current.time += 0.016;
      const t = stateRef.current.time;

      const data = getAnalyserData();
      const hasAudio = data && data.length > 0 && isPlaying;

      let rawBass = 0;
      let rawMid = 0;
      let rawTreble = 0;

      if (hasAudio && data) {
        const bassCount = 14;
        const midCount = 40;
        const trebleCount = 50;

        for (let i = 0; i < bassCount; i++) rawBass += data[i] || 0;
        rawBass /= bassCount * 255;

        for (let i = bassCount; i < bassCount + midCount; i++) rawMid += data[i] || 0;
        rawMid /= midCount * 255;

        for (let i = bassCount + midCount; i < bassCount + midCount + trebleCount; i++) rawTreble += data[i] || 0;
        rawTreble /= trebleCount * 255;
      } else {
        rawBass = (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.2 + 0.06;
        rawMid = (Math.cos(t * 1.2) * 0.5 + 0.5) * 0.16 + 0.05;
        rawTreble = (Math.sin(t * 2.1) * 0.5 + 0.5) * 0.14 + 0.05;
      }

      const state = stateRef.current;
      state.smoothedBass += (rawBass - state.smoothedBass) * 0.2;
      state.smoothedMid += (rawMid - state.smoothedMid) * 0.16;
      state.smoothedTreble += (rawTreble - state.smoothedTreble) * 0.22;

      const bass = state.smoothedBass;
      const mid = state.smoothedMid;
      const treble = state.smoothedTreble;

      ctx.fillStyle = '#05070f';
      ctx.fillRect(0, 0, width, height);

      if (mode === 'tunnel') {
        renderCyberTunnel(ctx, width, height, t, bass, mid, treble);
      } else if (mode === 'orb') {
        renderNeonOrb(ctx, width, height, t, bass, mid, treble, data, hasAudio);
      }

      animId = requestAnimationFrame(render);
    };

    // --- MODE 1: CYBER TUNNEL & SYNTHWAVE GRID ---
    const renderCyberTunnel = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      b: number,
      m: number,
      tr: number
    ) => {
      const cx = w / 2;
      const cy = h * 0.44;

      const warpSpeed = 12 + b * 46;

      // Vanishing point synthwave glow
      const portalGrad = c.createRadialGradient(cx, cy, 2, cx, cy, Math.min(w, h) * 0.55);
      portalGrad.addColorStop(0, `rgba(168, 85, 247, ${0.45 + b * 0.4})`);
      portalGrad.addColorStop(0.35, `rgba(6, 182, 212, ${0.18 + m * 0.25})`);
      portalGrad.addColorStop(1, 'rgba(5, 7, 15, 0)');
      c.fillStyle = portalGrad;
      c.fillRect(0, 0, w, h);

      // Floor & ceiling perspective grid rays
      const gridCount = 14;
      c.lineWidth = 1.2;
      for (let i = 0; i <= gridCount; i++) {
        const spreadX = ((i - gridCount / 2) / (gridCount / 2)) * (w * 0.9);

        // Floor
        c.strokeStyle = `rgba(6, 182, 212, ${0.18 + b * 0.3})`;
        c.beginPath();
        c.moveTo(cx, cy + 12);
        c.lineTo(cx + spreadX, h);
        c.stroke();

        // Ceiling
        c.strokeStyle = `rgba(168, 85, 247, ${0.14 + m * 0.22})`;
        c.beginPath();
        c.moveTo(cx, cy - 12);
        c.lineTo(cx + spreadX, 0);
        c.stroke();
      }

      // Moving transverse grid lines
      const floorRings = 9;
      const gridOffset = (t * (2.6 + b * 6)) % 1;
      for (let i = 0; i < floorRings; i++) {
        const p = (i + gridOffset) / floorRings;
        const depthY = cy + Math.pow(p, 2.5) * (h - cy);
        const ringAlpha = Math.pow(p, 1.8) * (0.35 + b * 0.5);

        c.strokeStyle = `rgba(6, 182, 212, ${ringAlpha})`;
        c.beginPath();
        c.moveTo(0, depthY);
        c.lineTo(w, depthY);
        c.stroke();

        const ceilY = cy - Math.pow(p, 2.5) * cy;
        c.strokeStyle = `rgba(236, 72, 153, ${ringAlpha * 0.8})`;
        c.beginPath();
        c.moveTo(0, ceilY);
        c.lineTo(w, ceilY);
        c.stroke();
      }

      // 3D Starfield Warp Tunnel
      const stars = stateRef.current.stars;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= warpSpeed;

        if (s.z <= 10) {
          s.z = 1000;
          s.pz = 1000;
          s.x = (Math.random() - 0.5) * w * 2.2;
          s.y = (Math.random() - 0.5) * h * 2.2;
        }

        const k = 320 / s.z;
        const px = s.x * k + cx;
        const py = s.y * k + cy;

        const prevK = 320 / s.pz;
        const prevX = s.x * prevK + cx;
        const prevY = s.y * prevK + cy;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const depthAlpha = Math.min(1, (1000 - s.z) / 600);
          const streakWidth = Math.max(1, (s.size + b * 3) * k * 0.4);

          c.beginPath();
          c.moveTo(prevX, prevY);
          c.lineTo(px, py);
          c.strokeStyle = `rgba(255, 255, 255, ${depthAlpha * (0.6 + tr * 0.4)})`;
          c.lineWidth = streakWidth;
          c.stroke();
        }
      }

      // Center Bass Pulse Portal Rings
      const ringRadius = 32 + b * 65;
      c.save();
      c.beginPath();
      c.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      c.strokeStyle = `rgba(255, 255, 255, ${0.7 + b * 0.3})`;
      c.lineWidth = 2.5;
      c.shadowBlur = 20;
      c.shadowColor = '#06b6d4';
      c.stroke();

      c.beginPath();
      c.arc(cx, cy, ringRadius * 1.5, 0, Math.PI * 2);
      c.strokeStyle = `rgba(168, 85, 247, ${0.4 + m * 0.4})`;
      c.lineWidth = 1.5;
      c.shadowColor = '#ec4899';
      c.stroke();
    };

    // --- MODE 2: 3D NEON ORB ---
    const renderNeonOrb = (
      c: CanvasRenderingContext2D,
      w: number,
      h: number,
      t: number,
      b: number,
      m: number,
      tr: number,
      data: Uint8Array | null,
      hasAudio: boolean
    ) => {
      const cx = w / 2;
      const cy = h * 0.44;
      const baseRadius = Math.min(w, h) * 0.2 * (0.85 + b * 0.4);

      // Center sphere ambient glow
      const orbGrad = c.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 2);
      orbGrad.addColorStop(0, `rgba(236, 72, 153, ${0.7 + b * 0.3})`);
      orbGrad.addColorStop(0.45, `rgba(168, 85, 247, ${0.4 + m * 0.3})`);
      orbGrad.addColorStop(0.85, `rgba(6, 182, 212, ${0.15 + tr * 0.2})`);
      orbGrad.addColorStop(1, 'rgba(5, 7, 15, 0)');

      c.fillStyle = orbGrad;
      c.beginPath();
      c.arc(cx, cy, baseRadius * 2, 0, Math.PI * 2);
      c.fill();

      // 360-degree Radial Equalizer Spikes
      const spikeCount = 64;
      c.save();
      for (let i = 0; i < spikeCount; i++) {
        const angle = (i / spikeCount) * Math.PI * 2 + t * 0.2;
        let spikeHeight = 12 + Math.sin(i * 3 + t * 4) * 6;

        if (hasAudio && data) {
          const sampleIdx = Math.floor(Math.pow(i / spikeCount, 1.3) * Math.min(data.length, 120));
          const val = (data[sampleIdx] || 0) / 255;
          spikeHeight = val * Math.min(w, h) * 0.28 + 6;
        } else {
          spikeHeight = (Math.sin(angle * 4 + t * 3) * 0.5 + 0.5) * 45 + 10;
        }

        const r1 = baseRadius;
        const r2 = baseRadius + spikeHeight;

        const x1 = cx + Math.cos(angle) * r1;
        const y1 = cy + Math.sin(angle) * r1;
        const x2 = cx + Math.cos(angle) * r2;
        const y2 = cy + Math.sin(angle) * r2;

        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);

        const hue = (i / spikeCount) * 180 + 190;
        c.strokeStyle = `hsla(${hue}, 95%, 65%, ${0.65 + (spikeHeight / 90) * 0.35})`;
        c.lineWidth = 3.2;
        c.lineCap = 'round';
        c.stroke();
      }
      c.restore();

      // Inner Core Solid Glowing Circle
      c.save();
      c.beginPath();
      c.arc(cx, cy, baseRadius * 0.88, 0, Math.PI * 2);
      c.fillStyle = '#0a0d1f';
      c.shadowBlur = 28;
      c.shadowColor = '#a855f7';
      c.fill();
      c.lineWidth = 3;
      c.strokeStyle = `rgba(255, 255, 255, ${0.7 + b * 0.3})`;
      c.stroke();
      c.restore();

      // Orbiting Quantum Particles
      const particles = stateRef.current.particles;
      for (let p of particles) {
        p.angle += p.speed * (1 + b * 3);
        const orbitDist = baseRadius * 1.3 + Math.sin(p.angle * 2 + t) * (p.dist * 0.45);
        const px = cx + Math.cos(p.angle) * orbitDist;
        const py = cy + Math.sin(p.angle) * orbitDist;

        c.beginPath();
        c.arc(px, py, p.size * (0.8 + tr * 1.5), 0, Math.PI * 2);
        c.fillStyle = p.color;
        c.shadowBlur = 10;
        c.shadowColor = p.color;
        c.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [getAnalyserData, isPlaying, mode]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: '#05070f',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 60fps Canvas Display */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          zIndex: 1,
        }}
      />

      {/* Top Header Bar */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          paddingTop: 'max(16px, env(safe-area-inset-top))',
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              borderRadius: '500px',
              color: 'white',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
          >
            <ArrowLeft size={16} />
            <span>Back to Art</span>
          </button>
        )}

        {/* Visualizer Mode Badge */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '6px 14px',
            borderRadius: '100px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          Party Suite
        </span>
      </div>

      {/* Center Floating Artwork in Neon Orb & Cyber Tunnel modes for identity */}
      {(mode === 'tunnel' || mode === 'orb') && (
        <div
          style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              width: mode === 'orb' ? 'min(140px, 32vw)' : 'min(90px, 22vw)',
              height: mode === 'orb' ? 'min(140px, 32vw)' : 'min(90px, 22vw)',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: mode === 'orb'
                ? '0 0 40px rgba(168, 85, 247, 0.8), 0 10px 30px rgba(0,0,0,0.9)'
                : '0 0 35px rgba(6, 182, 212, 0.8), 0 10px 25px rgba(0,0,0,0.9)',
              border: '2.5px solid rgba(255, 255, 255, 0.4)',
              transform: isPlaying ? 'scale(1)' : 'scale(0.92)',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <img
              src={coverUrl}
              alt={currentSong?.title || ''}
              onError={e => { e.currentTarget.src = './logo.png'; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      )}

      {/* Bottom Floating Info, Controls, & Style Switcher Pills */}
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          marginTop: 'auto',
          padding: '16px 20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          background: 'linear-gradient(180deg, rgba(5, 7, 15, 0) 0%, rgba(5, 7, 15, 0.96) 55%, #05070f 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        {/* Style Switcher Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '100px',
            padding: '5px 8px',
            boxShadow: '0 10px 32px rgba(0, 0, 0, 0.6)',
            maxWidth: '92vw',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'tunnel', label: 'Cyber Tunnel', icon: Rocket },
            { id: 'orb', label: 'Neon Orb', icon: Zap },
          ].map(item => {
            const active = mode === item.id;
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setMode(item.id as VisualizerMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '100px',
                  border: 'none',
                  background: active
                    ? 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)'
                    : 'transparent',
                  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: active ? 700 : 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: active ? '0 4px 16px rgba(168, 85, 247, 0.45)' : 'none',
                }}
              >
                <IconComponent size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Track Title & Artist */}
        <div style={{ textAlign: 'center', maxWidth: '85%' }}>
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 800,
              color: 'white',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentSong?.title || 'Unknown Title'}
          </h2>
          <p
            style={{
              margin: '3px 0 0',
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {currentSong?.artist || 'Unknown Artist'}
          </p>
        </div>

        {/* Minimal Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button
            onClick={prevSong}
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <SkipBack size={24} fill="white" />
          </button>

          <button
            onClick={togglePlayPause}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              transition: 'transform 0.15s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isPlaying ? (
              <Pause size={24} fill="black" color="black" />
            ) : (
              <Play size={24} fill="black" color="black" style={{ marginLeft: '3px' }} />
            )}
          </button>

          <button
            onClick={nextSong}
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              transition: 'transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.9)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <SkipForward size={24} fill="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;
