import React from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';
import DJSoundstage from './DJSoundstage';

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

      <DJSoundstage />

      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>All Music</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        paddingBottom: '40px',
      }} className="library-grid">
        {songs.map(song => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div
              key={`all-${song.id}`}
              onClick={() => handlePlay(song)}
              style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '10px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s',
                position: 'relative',
                boxShadow: isCurrent ? '0 0 0 2px var(--spotify-green)' : 'none',
              }}
              onMouseOver={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isCurrent
                  ? '0 8px 24px rgba(29,185,84,0.4)'
                  : '0 8px 24px rgba(0,0,0,0.6)';
              }}
              onMouseOut={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = isCurrent ? '0 0 0 2px var(--spotify-green)' : 'none';
              }}
            >
              {/* Album Art */}
              <div style={{ position: 'relative', paddingTop: '100%' }}>
                <img
                  src={song.coverArt || getAudioUrl(song.audioId).replace('.mp3', '.jpg')}
                  onError={e => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
                  alt={song.title}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%', objectFit: 'cover',
                  }}
                />
                {/* Hover play button */}
                <div className="card-play-overlay" style={{
                  position: 'absolute', bottom: '8px', right: '8px',
                  background: 'var(--spotify-green)', borderRadius: '50%',
                  width: '40px', height: '40px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isCurrent ? 1 : 0,
                  transform: isCurrent ? 'translateY(0)' : 'translateY(8px)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                }}>
                  <Play size={18} fill="black" color="black" style={{ marginLeft: '2px' }} />
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '12px 14px 14px' }}>
                <p style={{
                  fontWeight: 700, fontSize: '14px',
                  color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)',
                  margin: 0, marginBottom: '4px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{song.title}</p>
                <p style={{
                  fontSize: '12px', color: 'var(--text-secondary)',
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
