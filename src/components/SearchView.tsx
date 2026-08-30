import React, { useState, useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Search, Lock, Zap, Crown } from 'lucide-react';

const PremiumAd: React.FC = () => (
  <div style={{
    marginTop: '24px',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 40%, #0d1f3c 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    minHeight: '220px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px 32px',
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes glow-pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 0.9; }
      }
    `}</style>

    {/* Background glow orbs */}
    <div style={{
      position: 'absolute', top: '-40px', right: '-40px',
      width: '200px', height: '200px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
      animation: 'glow-pulse 3s ease-in-out infinite',
      pointerEvents: 'none'
    }} />
    <div style={{
      position: 'absolute', bottom: '-60px', left: '-20px',
      width: '250px', height: '250px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(138,43,226,0.12) 0%, transparent 70%)',
      animation: 'glow-pulse 4s ease-in-out infinite reverse',
      pointerEvents: 'none'
    }} />

    {/* Coming Soon badge */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '100px',
        background: 'rgba(255,215,0,0.12)',
        border: '1px solid rgba(255,215,0,0.3)',
      }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FFD700', animation: 'glow-pulse 1.5s infinite' }} />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFD700', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Under Development
        </span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 12px', borderRadius: '100px',
        background: 'rgba(138,43,226,0.15)',
        border: '1px solid rgba(138,43,226,0.35)',
      }}>
        <Lock size={10} style={{ color: '#a855f7' }} />
        <span style={{ fontSize: '11px', fontWeight: 800, color: '#a855f7', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Coming Soon
        </span>
      </div>
    </div>

    {/* Main content */}
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', zIndex: 1, position: 'relative' }}>
      <div style={{ animation: 'float 3s ease-in-out infinite', flexShrink: 0 }}>
        <Crown size={48} style={{ color: '#FFD700', filter: 'drop-shadow(0 0 12px rgba(255,215,0,0.5))' }} />
      </div>
      <div>
        <h2 style={{
          margin: '0 0 8px', fontSize: '28px', fontWeight: 900,
          background: 'linear-gradient(90deg, #FFD700, #FFA500, #FF6B6B, #a855f7, #FFD700)',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          animation: 'shimmer 4s linear infinite',
          letterSpacing: '-0.5px',
        }}>
          TuneTastic Premium
        </h2>
        <p style={{ margin: '0 0 4px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          🎵 Unlimited song streaming from the internet
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          🤖 AI-powered voice cloning (real this time!)
        </p>
        <p style={{ margin: '0 0 4px', fontSize: '15px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          🎛️ Studio-grade DJ effects &amp; mastering
        </p>
        <p style={{ margin: '16px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          We're working hard to bring you the ultimate music experience. Stay tuned! 🚀
        </p>
      </div>
    </div>

    {/* Feature pills */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', zIndex: 1, position: 'relative' }}>
      {['Offline Mode', 'High Quality Audio', 'No Ads', 'Social Sharing', 'Cloud Sync', 'Lyrics'].map(f => (
        <div key={f} style={{
          padding: '5px 14px', borderRadius: '100px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', gap: '5px'
        }}>
          <Zap size={10} style={{ color: '#FFD700' }} /> {f}
        </div>
      ))}
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
