import React, { useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Heart } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';

const MainView: React.FC = () => {
  const { songs, currentSong, isPlaying, playSong, togglePlayPause, toggleLike, isLiked } = usePlayer();

  const [greeting, setGreeting] = React.useState('');

  React.useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    
    updateGreeting(); // Set immediately
    const interval = setInterval(updateGreeting, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

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
      {/* Hero Section with Animated Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '36px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(29,185,84,0.12) 0%, rgba(0,0,0,0) 60%)',
        borderRadius: '16px',
        border: '1px solid rgba(29,185,84,0.12)',
        flexWrap: 'wrap',
      }}>
        <TuneTasticLogo size={90} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffffff 0%, #1db954 60%, #1ed760 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
              letterSpacing: '-1px',
              margin: 0,
            }}>TuneTastic</h1>
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(13px, 2vw, 16px)',
            margin: 0,
          }}>
            {greeting} 👋 &nbsp;·&nbsp; Your personal music universe
          </p>
          <p style={{
            color: 'var(--spotify-green)',
            fontSize: '13px',
            fontWeight: 600,
            margin: 0,
            marginTop: '4px',
          }}>
            492 songs &nbsp;·&nbsp; Hindi · English · Kannada
          </p>
        </div>
      </div>

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
                    {isCurrent ? (
                      <div className={'eq-bars' + (isPlaying ? '' : ' paused')}>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                      </div>
                    ) : (
                      <span className="song-index">{index + 1}</span>
                    )}
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
                    {formatTime(song.durationMs || 0)}
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
