import React, { useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Heart } from 'lucide-react';

const MainView: React.FC = () => {
  const { songs, currentSong, isPlaying, playSong, togglePlayPause, toggleLike, isLiked } = usePlayer();

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const recentSongs = useMemo(() => {
    return [...songs].slice(0, 6);
  }, [songs]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>{greeting}</h1>
      
      {/* Recent Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }} className="library-grid">
        {recentSongs.map(song => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div 
              key={`recent-${song.id}`}
              style={{
                backgroundColor: 'var(--bg-highlight)',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'}
              onClick={() => handlePlay(song)}
            >
              <img 
                src={song.coverArt || getAudioUrl(song.audioId).replace('.mp3', '.jpg')}
                onError={(e) => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
                style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                alt="" 
              />
              <span style={{ padding: '0 16px', fontWeight: 'bold', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)' }} className="ellipsis">
                {song.title}
              </span>
            </div>
          )
        })}
      </div>

      <h2 style={{ marginBottom: '24px', fontSize: '24px' }}>All Music</h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
            <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
            <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
            <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Album</th>
            <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            return (
              <tr 
                key={song.id}
                className="song-row"
                onClick={() => handlePlay(song)}
              >
                <td className="hide-mobile" style={{ padding: '12px 16px', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
                  <div className="song-index-col">
                    <span className="song-index">{index + 1}</span>
                    <button className="song-play-btn" style={{ color: isCurrent ? 'var(--spotify-green)' : 'white' }}>
                      <Play size={16} fill="currentColor" />
                    </button>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img 
                      src={song.coverArt || getAudioUrl(song.audioId).replace('.mp3', '.jpg')} 
                      onError={(e) => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
                      style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                      alt="" 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)' }} className="ellipsis">
                        {song.title}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }} className="ellipsis">
                        {song.artist}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  <span className="ellipsis" style={{ display: 'block', maxWidth: '200px' }}>{song.album}</span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(song); }}
                    style={{ marginRight: '16px', color: isLiked(song.id) ? 'var(--spotify-green)' : 'var(--text-secondary)' }}
                  >
                    <Heart size={16} fill={isLiked(song.id) ? 'currentColor' : 'none'} />
                  </button>
                  <span className="hide-mobile" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {formatTime(song.durationMs)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MainView;
