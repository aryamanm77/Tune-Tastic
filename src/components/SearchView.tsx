import React, { useState, useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Search } from 'lucide-react';

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
      <div style={{ position: 'sticky', top: '0', backgroundColor: 'var(--bg-base)', paddingBottom: '24px', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
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

      {/* Browse All — shown when not searching */}
      {!query.trim() && (
        <>
          <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 700 }}>Browse All</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }} className="library-grid">
            {[
              { label: 'Hindi Hits',  color: '#E13300', pick: 2 },
              { label: 'English Pop', color: '#1e3264', pick: 8 },
              { label: 'Kannada',     color: '#006450', pick: 15 },
              { label: 'Trending',    color: '#8D67AB', pick: 30 },
              { label: 'Romantic',    color: '#c13584', pick: 45 },
              { label: 'Party',       color: '#E8115B', pick: 60 },
              { label: 'Chill',       color: '#0d73ec', pick: 75 },
              { label: 'All Songs',   color: '#1db954', pick: 90 },
            ].map(cat => {
              const coverSong = songs.find((s, i) => i === cat.pick && s.coverArt) || songs.find((_, i) => i > cat.pick && songs[i]?.coverArt);
              return (
              <div
                key={cat.label}
                style={{
                  backgroundColor: cat.color,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  height: '110px',
                  position: 'relative',
                  transition: 'filter 0.2s ease',
                }}
                onMouseOver={e => (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1.15)'}
                onMouseOut={e => (e.currentTarget as HTMLDivElement).style.filter = 'brightness(1)'}
                onClick={() => coverSong && playSong(coverSong)}
              >
                <span style={{
                  position: 'absolute', top: '14px', left: '14px',
                  fontWeight: 800, fontSize: '18px', color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>{cat.label}</span>
                {coverSong?.coverArt && (
                  <img
                    src={coverSong.coverArt}
                    alt=""
                    style={{
                      position: 'absolute', bottom: '-4px', right: '-4px',
                      width: '70px', height: '70px', objectFit: 'cover',
                      borderRadius: '6px', transform: 'rotate(25deg)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    }}
                  />
                )}
              </div>
              );
            })}          </div>
        </>
      )}

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
