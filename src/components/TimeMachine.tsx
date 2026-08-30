import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Clock } from 'lucide-react';

const TimeMachine: React.FC = () => {
  const { djState, setDjState } = usePlayer();
  const [year, setYear] = useState(djState.era ?? 2026);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    
    // Default (Modern)
    let newState = {
      era: newYear,
      vinyl: false,
      telephone: false,
      chorus: false,
      lofi: false,
      spin8D: false,
      phaser: false,
    };

    if (newYear < 1960) {
      // 1920s-1950s: Old Radio / Gramophone
      newState.vinyl = true;
      newState.telephone = true;
    } else if (newYear < 1995) {
      // 1960s-1990s: Cassette / Synthwave / LoFi
      newState.chorus = true;
      newState.lofi = true;
    } else if (newYear > 2030) {
      // 2030+: Futuristic Sci-Fi HUD
      newState.spin8D = true;
      newState.phaser = true;
    }

    setDjState(newState);
  };

  useEffect(() => {
    // Apply global CSS theme class to body
    document.body.classList.remove('theme-1920', 'theme-1980', 'theme-2050');
    
    if (year < 1960) {
      document.body.classList.add('theme-1920');
    } else if (year < 1995) {
      document.body.classList.add('theme-1980');
    } else if (year > 2030) {
      document.body.classList.add('theme-2050');
    }
  }, [year]);

  return (
    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ color: 'var(--spotify-green)' }}><Clock size={24} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>
            The Time Machine
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
            Drag to travel through time. The music and UI will morph instantly.
          </p>
        </div>
        <div style={{ 
          background: 'rgba(29,185,84,0.15)', border: '1px solid var(--spotify-green)', 
          padding: '4px 12px', borderRadius: '100px', color: 'var(--spotify-green)', 
          fontWeight: 800, fontSize: '16px', fontFamily: 'monospace'
        }}>
          {year}
        </div>
      </div>
      
      <div style={{ position: 'relative', padding: '10px 0' }}>
        <input
          type="range"
          min={1920}
          max={2050}
          value={year}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, 
              rgba(255,255,255,0.1) 0%, 
              rgba(255,255,255,0.1) ${((year - 1920) / (2050 - 1920)) * 100}%, 
              rgba(255,255,255,0.05) ${((year - 1920) / (2050 - 1920)) * 100}%, 
              rgba(255,255,255,0.05) 100%)`,
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          <span>1920s (Vintage)</span>
          <span>1980s (Retro)</span>
          <span>2026 (Modern)</span>
          <span>2050s (Future)</span>
        </div>
      </div>
    </div>
  );
};

export default TimeMachine;
