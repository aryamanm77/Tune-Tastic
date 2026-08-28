import React from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { Play } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';

const MainView: React.FC = () => {
  const { songs, currentSong, playSong, togglePlayPause } = usePlayer();

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      {/* Mobile-only logo header */}
      <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <TuneTasticLogo size={34} />
        <span style={{
          fontSize: '22px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #1db954, #1ed760)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>TuneTastic</span>
      </div>

      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>All Music</h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '40px',
      }} className="library-list">
        {songs.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div
              key={`all-${song.id}`}
              onClick={() => handlePlay(song)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: isCurrent ? 'rgba(29, 185, 84, 0.15)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                gap: '16px'
              }}
              onMouseOver={e => {
                if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={e => {
                if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
              }}
            >
              {/* Song Number / Play Icon (Optional, can just use cover) */}
              <div style={{ width: '20px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '14px' }}>
                {isCurrent ? <Play size={16} color="var(--spotify-green)" fill="var(--spotify-green)" /> : index + 1}
              </div>

              {/* Album Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={song.coverArt || getCoverArtUrl(song.audioId)}
                  onError={e => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
                  alt={song.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <p style={{
                  fontWeight: 600, fontSize: '15px',
                  color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)',
                  margin: 0, marginBottom: '2px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{song.title}</p>
                <p style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{song.artist !== 'Unknown Artist' ? song.artist : 'TuneTastic'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MainView;
