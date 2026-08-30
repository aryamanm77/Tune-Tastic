import React from 'react';
import { usePlayer } from '../context/PlayerContext';

const KaraokeMode: React.FC = () => {
  const { currentTime } = usePlayer();

  // Simple mock lyrics that loop every 40 seconds
  const loopTime = currentTime % 40;
  const lyrics = [
    { time: 0, text: "♪ (Intro)" },
    { time: 5, text: "Ooh, yeah..." },
    { time: 10, text: "Let's go!" },
    { time: 15, text: "Singing along to the beat," },
    { time: 20, text: "Dancing in the street!" },
    { time: 25, text: "We don't need no sleep," },
    { time: 30, text: "Because the music's too sweet!" },
    { time: 35, text: "♪ (Chorus)" }
  ];

  const activeIndex = lyrics.findIndex((l, i) => 
    loopTime >= l.time && (i === lyrics.length - 1 || loopTime < lyrics[i + 1].time)
  );

  return (
    <div style={{
      width: '100%', maxWidth: '400px', height: '320px',
      margin: '0 auto', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '16px',
      padding: '24px', position: 'relative', overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
    }}>
      <style>{`
        .lyric-line {
          transition: all 0.3s ease;
          text-align: center;
          margin: 12px 0;
        }
        .lyric-active {
          font-size: 28px;
          font-weight: 800;
          color: var(--spotify-green);
          text-shadow: 0 0 12px rgba(29,185,84,0.6);
          transform: scale(1.1);
        }
        .lyric-inactive {
          font-size: 18px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
      
      <div style={{
        display: 'flex', flexDirection: 'column',
        transform: `translateY(${(3 - activeIndex) * 44}px)`,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        width: '100%'
      }}>
        {lyrics.map((l, i) => (
          <div key={i} className={`lyric-line ${i === activeIndex ? 'lyric-active' : 'lyric-inactive'}`}>
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KaraokeMode;
