import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, Search, Loader2, Pause, Music } from 'lucide-react';
import { searchItunes } from '../utils/itunes-song-search';

const ItunesSearchView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSearching(true);

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const newSongs = await searchItunes(query, { limit: 20 });
        setResults(newSongs);
      } catch (error) {
        console.error('iTunes search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [query]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) { togglePlayPause(); return; }
    if (!song.audioUrl) return;
    playSong(song);
  };

  const formatTime = (ms: number) => {
    if (!ms) return '-:--';
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.dataset.fallbackAttempted) return;
    img.dataset.fallbackAttempted = 'true';
    img.src = '/logo.png';
  };

  const isCurrent = (song: Song) => currentSong?.id === song.id;

  return (
    <div className="main-view" style={{ padding: '0', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .premium-view * { font-family: 'Inter', sans-serif; }

        .premium-hero {
          background: linear-gradient(180deg, #3a0a14 0%, #1a0508 60%, var(--bg-base) 100%);
          padding: 48px 32px 32px;
          position: relative;
          overflow: hidden;
        }
        .premium-hero::before {
          content: '';
          position: absolute;
          top: -40%;
          left: -10%;
          width: 70%;
          height: 200%;
          background: radial-gradient(ellipse, rgba(255,45,85,0.25) 0%, transparent 65%);
          pointer-events: none;
        }

        .premium-search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          padding: 12px 16px;
          max-width: 680px;
          backdrop-filter: blur(12px);
          transition: background 0.2s, border-color 0.2s;
        }
        .premium-search-bar:focus-within {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.35);
        }
        .premium-search-bar input {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 15px;
          font-weight: 500;
          flex: 1;
          width: 100%;
        }
        .premium-search-bar input::placeholder { color: rgba(255,255,255,0.5); }

        .premium-section { padding: 0 32px 32px; }

        .premium-top-card {
          background: rgba(255,255,255,0.04);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .premium-top-card:hover { background: rgba(255,255,255,0.08); }

        .prem-play-fab {
          position: absolute;
          bottom: 20px;
          right: 20px;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #FF2D55;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(255,45,85,0.5);
          border: none;
          cursor: pointer;
        }
        .premium-top-card:hover .prem-play-fab,
        .prem-play-fab.active { opacity: 1; transform: translateY(0); }
        .prem-play-fab:hover { background: #ff4466; transform: translateY(0) scale(1.06) !important; }

        .premium-song-row {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
          gap: 14px;
        }
        .premium-song-row:hover { background: rgba(255,255,255,0.06); }

        .prem-thumb-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 6px;
          overflow: hidden;
        }
        .prem-thumb-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .prem-thumb-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .premium-song-row:hover .prem-thumb-overlay,
        .prem-thumb-overlay.visible { opacity: 1; }

        .prem-table-row {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .prem-table-row:hover { background: rgba(255,255,255,0.06); }

        .prem-idx {
          width: 36px;
          text-align: center;
          font-size: 15px;
          color: rgba(255,255,255,0.5);
          position: relative;
        }
        .prem-idx .prem-idx-num { display: block; }
        .prem-table-row:hover .prem-idx .prem-idx-num { display: none; }
        .prem-idx .prem-idx-play { display: none; color: white; }
        .prem-table-row:hover .prem-idx .prem-idx-play { display: flex; align-items: center; justify-content: center; }

        .premium-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 32px;
          text-align: center;
          gap: 20px;
        }
        .premium-empty-icon {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(255,45,85,0.2), rgba(255,55,95,0.05));
          border: 1px solid rgba(255,45,85,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FF2D55;
        }
        .section-title {
          font-size: 22px;
          font-weight: 700;
          color: white;
          margin: 0 0 16px;
        }
      `}</style>

      <div className="premium-view">
        {/* Hero Header */}
        <div className="premium-hero">
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Premium
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', margin: '0 0 24px' }}>
            Find any track from the official catalog
          </p>
          <div className="premium-search-bar" onClick={() => inputRef.current?.focus()}>
            <Search size={18} color="rgba(255,255,255,0.6)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Artists, songs, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {isSearching && <Loader2 size={18} color="rgba(255,255,255,0.5)" className="spin" />}
          </div>
        </div>

        {/* Empty state */}
        {!query.trim() && (
          <div className="premium-empty">
            <div className="premium-empty-icon">
              <Music size={44} />
            </div>
            <div>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: '24px', margin: '0 0 8px' }}>Search the catalog</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', maxWidth: '380px', lineHeight: 1.6 }}>
                Find your favourite artists, albums, and tracks from the official music catalog.
              </p>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {query.trim() && isSearching && results.length === 0 && (
          <div className="premium-section" style={{ marginTop: '24px' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 12px', marginBottom: '4px', opacity: 1 - i * 0.15 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '14px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', width: `${70 - i * 8}%`, marginBottom: '8px' }} />
                  <div style={{ height: '12px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', width: `${45 - i * 5}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {query.trim() && results.length > 0 && (
          <div className="premium-section" style={{ marginTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '40px' }}>

              {/* Top Result */}
              <div>
                <p className="section-title">Top Result</p>
                <div
                  className="premium-top-card"
                  onClick={() => handlePlay(results[0])}

                >
                  <img
                    src={results[0].coverArt}
                    onError={handleImageError}
                    alt=""
                    style={{ width: '96px', height: '96px', borderRadius: '8px', objectFit: 'cover', marginBottom: '20px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)', display: 'block' }}
                  />
                  <p style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {results[0].title}
                  </p>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {results[0].artist} · {results[0].album}
                  </p>

                  <button
                    className={`prem-play-fab ${isCurrent(results[0]) ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handlePlay(results[0]); }}
                    aria-label="Play"
                  >
                    {isCurrent(results[0]) && isPlaying
                      ? <Pause size={22} fill="white" />
                      : <Play size={22} fill="white" style={{ marginLeft: '3px' }} />
                    }
                  </button>
                </div>
              </div>

              {/* Songs column */}
              {results.length > 1 && (
                <div>
                  <p className="section-title">Songs</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {results.slice(1, 5).map((song) => {
                      const active = isCurrent(song);
                      return (
                        <div
                          key={song.id}
                          className="premium-song-row"
                          onClick={() => handlePlay(song)}

                        >
                          <div className="prem-thumb-wrap">
                            <img src={song.coverArt} onError={handleImageError} alt="" />
                            <div className={`prem-thumb-overlay ${active ? 'visible' : ''}`}>
                              {active && isPlaying
                                ? <div className="eq-bars"><div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" /><div className="eq-bar" /></div>
                                : <Play size={18} fill="white" style={{ marginLeft: '2px' }} />
                              }
                            </div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="ellipsis" style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: active ? '#FF2D55' : 'white' }}>{song.title}</p>
                            <p className="ellipsis" style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                          </div>
                          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{formatTime(song.durationMs || 0)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Full list */}
            {results.length > 5 && (
              <>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '0 0 24px' }} />
                <p className="section-title">All results</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '12px', padding: '0 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '4px' }}>
                    <span style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>#</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time</span>
                  </div>

                  {results.slice(5).map((song, i) => {
                    const active = isCurrent(song);
                    return (
                      <div
                        key={song.id}
                        className="prem-table-row"
                        onClick={() => handlePlay(song)}

                      >
                        <div className="prem-idx">
                          {active
                            ? <div className={'eq-bars' + (isPlaying ? '' : ' paused')} style={{ justifyContent: 'center' }}>
                                <div className="eq-bar" style={{ background: '#FF2D55' }} />
                                <div className="eq-bar" style={{ background: '#FF2D55' }} />
                                <div className="eq-bar" style={{ background: '#FF2D55' }} />
                                <div className="eq-bar" style={{ background: '#FF2D55' }} />
                              </div>
                            : <>
                                <span className="prem-idx-num">{i + 6}</span>
                                <span className="prem-idx-play"><Play size={15} fill="white" /></span>
                              </>
                          }
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <div className="prem-thumb-wrap" style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0 }}>
                            <img src={song.coverArt} onError={handleImageError} alt="" />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p className="ellipsis" style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: active ? '#FF2D55' : 'white' }}>{song.title}</p>
                            <p className="ellipsis" style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                          </div>
                        </div>
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>{formatTime(song.durationMs || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* No results */}
        {query.trim() && !isSearching && results.length === 0 && (
          <div className="premium-empty">
            <div className="premium-empty-icon">
              <Search size={44} />
            </div>
            <div>
              <h2 style={{ color: 'white', fontWeight: 700, fontSize: '22px', margin: '0 0 8px' }}>No results for "{query}"</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px' }}>Try different keywords or check for spelling mistakes.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItunesSearchView;
