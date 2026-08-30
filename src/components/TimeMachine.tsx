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
      reverb: 0,
      alien: false,
    };

    if (newYear < 1920) {
      // 1500s-1920s: Medieval / Classical
      newState.vinyl = true;
      newState.reverb = 30; // Cathedral echo
    } else if (newYear < 1960) {
      // 1920s-1960s: Old Radio / Gramophone
      newState.vinyl = true;
      newState.telephone = true;
    } else if (newYear < 1995) {
      // 1960s-1990s: Cassette / Synthwave / LoFi
      newState.chorus = true;
      newState.lofi = true;
    } else if (newYear > 2200) {
      // 2200+: Deep Future
      newState.spin8D = true;
      newState.alien = true;
    } else if (newYear > 2030) {
      // 2030-2200: Futuristic Sci-Fi HUD
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
          min={1500}
          max={2500}
          value={year}
          onChange={(e) => handleYearChange(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, 
              #8b0000 0%,      /* 1500s Red */
              #d4af37 15%,     /* 1800s Gold */
              #ff8c00 30%,     /* 1950s Orange */
              #ff00ff 48%,     /* 1980s Pink */
              var(--spotify-green) 53%, /* 2026 Green */
              #00e5ff 70%,     /* 2200s Cyan */
              #8a2be2 100%)    /* 2500s Purple */`,
            borderRadius: '4px',
            outline: 'none',
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '0.8'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>
          <span style={{ color: '#8b0000' }}>1500s</span>
          <span style={{ color: '#d4af37' }}>1800s</span>
          <span style={{ color: '#ff00ff' }}>1980s</span>
          <span style={{ color: 'var(--spotify-green)' }}>2026</span>
          <span style={{ color: '#8a2be2' }}>2500s</span>
        </div>
      </div>
    </div>
  );
};

export default TimeMachine;
