import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Clock } from 'lucide-react';

const TimeMachine: React.FC = () => {
  const { djState, setDjState } = usePlayer();
  const [year, setYear] = useState(djState.era ?? 2026);

  const getEraColor = (y: number) => {
    if (y < 1920) return '#8b0000'; // Medieval Red
    if (y < 1960) return '#d4af37'; // Vintage Gold
    if (y < 1995) return '#ff00ff'; // Retro Pink
    if (y < 2200) return '#1db954'; // Modern Green
    return '#00e5ff'; // Future Cyan
  };

  const currentColor = getEraColor(year);

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
            Click an era to travel through time. The music and UI will morph instantly.
          </p>
        </div>
        <div style={{ 
          background: `${currentColor}22`, border: `1px solid ${currentColor}`, 
          padding: '4px 12px', borderRadius: '100px', color: currentColor, 
          fontWeight: 800, fontSize: '16px', fontFamily: 'monospace',
          transition: 'all 0.3s ease'
        }}>
          {year}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '8px' }}>
        {[
          { label: '1920s', value: 1920 },
          { label: '1980s', value: 1980 },
          { label: 'Modern', value: 2026 },
          { label: '2050s', value: 2050 },
        ].map((era) => (
          <button
            key={era.value}
            onClick={() => handleYearChange(era.value)}
            style={{
              background: year === era.value ? `${currentColor}22` : 'rgba(255,255,255,0.05)',
              border: `1px solid ${year === era.value ? currentColor : 'rgba(255,255,255,0.1)'}`,
              color: year === era.value ? currentColor : 'rgba(255,255,255,0.5)',
              padding: '10px 0',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {era.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeMachine;
