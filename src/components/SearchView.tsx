import React, { useState, useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Search, Crown } from 'lucide-react';

const PremiumAd: React.FC = () => (
  <div style={{
    marginTop: '24px',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    background: 'linear-gradient(90deg, #1e3a5f 0%, #2d1b4e 100%)',
    padding: '24px 24px 24px 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  }}>
    {/* Left accent bar */}
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: '4px',
      background: 'linear-gradient(180deg, #1db954, #a855f7)',
    }} />

    {/* Crown icon */}
    <Crown size={40} style={{ color: '#1db954', flexShrink: 0 }} />

    {/* Text */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px',
          textTransform: 'uppercase', color: '#1db954',
        }}>Coming Soon</span>
      </div>
      <h2 style={{
        margin: '0 0 4px', fontSize: '20px', fontWeight: 800,
        color: 'white', letterSpacing: '-0.3px',
      }}>
        TuneTastic Premium
      </h2>
      <p style={{
        margin: 0, fontSize: '13px',
        color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
      }}>
        Unlimited streaming · AI voice cloning · Studio DJ effects · Lyrics · No ads
      </p>
    </div>

    {/* Badge */}
    <div style={{
      padding: '8px 16px', borderRadius: '500px', flexShrink: 0,
      background: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
      whiteSpace: 'nowrap',
    }}>
      Notify me
    </div>
  </div>
);

const SearchView: React.FC = () => {
  const { songs, currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');

  const filteredSongs = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return songs.filter(s =>
      s.title.toLowerCase().includes(lowerQuery) ||
      s.artist.toLowerCase().includes(lowerQuery)
    );
  }, [songs, query]);

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
      <div style={{ position: 'sticky', top: '0', backgroundColor: 'var(--bg-base)', paddingBottom: '16px', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
          <input
            type="text"
            placeholder="Search your local songs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: '500px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500'
            }}
          />
        </div>
      </div>

      {/* Premium Ad — shown when not searching */}
      {!query.trim() && <PremiumAd />}


      {query.trim() && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '16px' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Album</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredSongs.map((song, index) => {
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
                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
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
                  <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'right' }}>
                    {formatTime(song.durationMs || 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
      {query.trim() && filteredSongs.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No results found for "{query}"</h2>
          <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default SearchView;
