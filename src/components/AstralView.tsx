import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Hexagon } from 'lucide-react';

const AstralView: React.FC = () => {
  const { djState, setDjState } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    
    const drawMandala = () => {
      ctx.fillStyle = djState.astralMode ? 'rgba(10, 5, 20, 0.2)' : 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.min(cx, cy) * 0.8;
      
      ctx.save();
      ctx.translate(cx, cy);
      
      if (djState.astralMode) {
        ctx.rotate(time * 0.005);
        ctx.strokeStyle = `hsla(${(time * 2) % 360}, 100%, 70%, 0.8)`;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      }
      
      ctx.lineWidth = 2;
      
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
      points.push({x: 0, y: 0});
      
      ctx.beginPath();
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          // Connect all nodes
          ctx.moveTo(points[i].x, points[i].y);
          ctx.lineTo(points[j].x, points[j].y);
        }
      }
      ctx.stroke();
      
      // Draw circles at nodes
      points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, djState.astralMode ? 10 + Math.sin(time*0.05)*5 : 5, 0, Math.PI * 2);
        ctx.fillStyle = djState.astralMode ? `hsla(${(time * 2) % 360}, 100%, 80%, 0.9)` : 'rgba(255,255,255,0.2)';
        ctx.fill();
      });
      
      ctx.restore();
      
      time++;
      animationRef.current = requestAnimationFrame(drawMandala);
    };
    
    drawMandala();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [djState.astralMode]);

  return (
    <div className="main-view" style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px', height: '100%', overflow: 'hidden', position: 'relative'
    }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        style={{ 
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '100vmin', height: '100vmin', zIndex: 0, pointerEvents: 'none',
          filter: djState.astralMode ? 'blur(1px) drop-shadow(0 0 20px rgba(138, 43, 226, 0.5))' : 'none',
          transition: 'filter 2s ease'
        }} 
      />
      
      <div style={{ zIndex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '40px', borderRadius: '24px', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Hexagon size={64} color={djState.astralMode ? '#b45bff' : 'white'} strokeWidth={1} style={{ transition: 'color 1s ease' }} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 900, marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>Astral Projection</h1>
        <p style={{ maxWidth: '400px', margin: '0 auto 32px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          Transcend the 3rd dimension. This mode retunes your music from 440Hz to the universal frequency of <strong>432Hz</strong> and injects invisible <strong>Binaural Beats</strong> (Theta state) into your left and right ears to induce deep meditation.
        </p>
        
        <button 
          onClick={() => setDjState({ astralMode: !djState.astralMode })}
          style={{
            background: djState.astralMode ? 'transparent' : 'white',
            color: djState.astralMode ? '#b45bff' : 'black',
            border: djState.astralMode ? '2px solid #b45bff' : '2px solid white',
            padding: '16px 48px', borderRadius: '100px', fontSize: '18px', fontWeight: 900, cursor: 'pointer',
            transition: 'all 0.3s ease', letterSpacing: '1px', textTransform: 'uppercase',
            boxShadow: djState.astralMode ? '0 0 30px rgba(180, 91, 255, 0.4)' : 'none'
          }}
        >
          {djState.astralMode ? 'Return to Earth' : 'Ascend'}
        </button>
      </div>
    </div>
  );
};

export default AstralView;
