import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Settings2, Zap, AudioLines, Sparkles } from 'lucide-react';

const DJSoundstage: React.FC = () => {
  const { djState, setDjState, isPlaying } = usePlayer();

  return (
    <div style={{
      marginBottom: '48px',
      background: 'linear-gradient(135deg, rgba(30,30,30,0.8) 0%, rgba(10,10,10,0.95) 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background glow */}
      <div style={{
        position: 'absolute',
        top: '-50%', left: '-20%',
        width: '60%', height: '150%',
        background: 'radial-gradient(ellipse, rgba(29, 185, 84, 0.15) 0%, transparent 70%)',
        transform: 'rotate(20deg)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative' }}>
        <div style={{ background: 'var(--spotify-green)', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Settings2 size={20} color="black" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Live DJ Soundstage
        </h2>
        {isPlaying && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }} className="eq-bars">
            <div className="eq-bar" style={{ background: 'var(--spotify-green)', height: '12px' }}></div>
            <div className="eq-bar" style={{ background: 'var(--spotify-green)', height: '18px' }}></div>
            <div className="eq-bar" style={{ background: 'var(--spotify-green)', height: '10px' }}></div>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        position: 'relative'
      }}>
        
        {/* Bass Boost Slider */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <AudioLines size={18} color={djState.bass > 0 ? 'var(--spotify-green)' : 'var(--text-secondary)'} />
              Bass Boost
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
              {djState.bass > 0 ? `+${djState.bass}dB` : 'OFF'}
            </span>
          </div>
          <input 
            type="range" 
            min="0" max="25" step="1" 
            value={djState.bass}
            onChange={(e) => setDjState({ bass: parseInt(e.target.value) })}
            style={{ 
              width: '100%', height: '6px', WebkitAppearance: 'none', 
              background: `linear-gradient(to right, var(--spotify-green) ${(djState.bass/25)*100}%, rgba(255,255,255,0.1) ${(djState.bass/25)*100}%)`,
              borderRadius: '3px', cursor: 'pointer' 
            }}
          />
        </div>

        {/* 8D Audio Toggle */}
        <div 
          onClick={() => setDjState({ spin8D: !djState.spin8D })}
          style={{
            background: djState.spin8D ? 'rgba(29, 185, 84, 0.1)' : 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${djState.spin8D ? 'rgba(29, 185, 84, 0.4)' : 'rgba(255,255,255,0.05)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: djState.spin8D ? 'var(--spotify-green)' : 'white' }}>
              <Sparkles size={18} />
              8D Audio Spin
            </span>
            <div style={{ 
              width: '40px', height: '22px', borderRadius: '11px', 
              background: djState.spin8D ? 'var(--spotify-green)' : 'rgba(255,255,255,0.2)',
              position: 'relative', transition: 'background 0.3s'
            }}>
              <div style={{
                position: 'absolute', top: '2px', left: djState.spin8D ? '20px' : '2px',
                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                transition: 'left 0.3s ease'
              }}></div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Spins the music in a 360° circle around your head. (Use headphones!)
          </p>
        </div>

        {/* Nightcore Mode Toggle */}
        <div 
          onClick={() => setDjState({ nightcore: !djState.nightcore })}
          style={{
            background: djState.nightcore ? 'rgba(141, 103, 171, 0.15)' : 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '20px',
            border: `1px solid ${djState.nightcore ? 'rgba(141, 103, 171, 0.5)' : 'rgba(255,255,255,0.05)'}`,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: djState.nightcore ? '#d1a3ff' : 'white' }}>
              <Zap size={18} />
              Nightcore Mode
            </span>
            <div style={{ 
              width: '40px', height: '22px', borderRadius: '11px', 
              background: djState.nightcore ? '#8D67AB' : 'rgba(255,255,255,0.2)',
              position: 'relative', transition: 'background 0.3s'
            }}>
              <div style={{
                position: 'absolute', top: '2px', left: djState.nightcore ? '20px' : '2px',
                width: '18px', height: '18px', background: 'white', borderRadius: '50%',
                transition: 'left 0.3s ease'
              }}></div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Increases tempo and pitches up vocals for high-energy vibes.
          </p>
        </div>

      </div>
    </div>
  );
};

export default DJSoundstage;
