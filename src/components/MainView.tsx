import React, { useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';


const MainView: React.FC = () => {
  const { songs, currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const recentSongs = useMemo(() => songs.slice(0, 6), [songs]);
  const allMusic = useMemo(() => [...songs].sort(() => Math.random() - 0.5).slice(0, 50), [songs]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="main-view" style={{ 
      background: 'linear-gradient(180deg, #1e3264 0%, var(--bg-base) 300px)',
      padding: '24px'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '24px' }}>{greeting}</h1>
      
      {/* 2-Column Grid (Shortcut Cards) */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' 
      }}>
        {recentSongs.map(song => (
          <div 
            key={song.id}
            onClick={() => handlePlay(song)}
            style={{
              display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px', overflow: 'hidden', cursor: 'pointer', transition: 'background 0.3s'
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <img src={getCoverArtUrl(song.audioId)} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 'bold', padding: '0 16px', flex: 1 }} className="ellipsis">{song.title}</span>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>All Your Music</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', fontSize: '14px', borderBottom: '1px solid #282828' }}>
              <th style={{ padding: '8px 16px', width: '40px' }}>#</th>
              <th style={{ padding: '8px 16px' }}>Title</th>
              <th style={{ padding: '8px 16px' }}>Artist</th>
            </tr>
          </thead>
          <tbody>
            {allMusic.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <tr 
                  key={song.id} 
                  onClick={() => handlePlay(song)}
                  style={{ cursor: 'pointer', transition: 'background 0.2s', background: 'transparent' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
                    {isCurrent && isPlaying ? <img src="https://open.spotifycdn.com/cdn/images/equaliser-animated-green.f93a2ef4.gif" width="14" alt="playing" /> : idx + 1}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={getCoverArtUrl(song.audioId)} style={{ width: '40px', height: '40px', borderRadius: '4px' }} alt="" />
                      <span style={{ color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)' }} className="ellipsis">
                        {song.title}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{song.artist}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MainView;
