import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, Search, Loader2, Pause, Music2, MoreHorizontal } from 'lucide-react';
import { searchItunes } from '../utils/itunes-song-search';
import AddToPlaylistModal from './AddToPlaylistModal';

const ItunesSearchView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsSearching(false); return; }
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    setIsSearching(true);
    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const newSongs = await searchItunes(query, { limit: 20 });
        setResults(newSongs);
      } catch { /* silent */ } finally { setIsSearching(false); }
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
    if (e.currentTarget.dataset.fallbackAttempted) return;
    e.currentTarget.dataset.fallbackAttempted = 'true';
    e.currentTarget.src = '/logo.png';
  };

  const isCurrent = (song: Song) => currentSong?.id === song.id;

  return (
    <>
      <div className="main-view" style={{ padding: '0', overflowX: 'hidden', background: 'var(--bg-base)' }}>
        <style>{`
          /* ── Spotify Search page styles ── */
          .sp-search-header {
            background: linear-gradient(180deg, #1a3a2a 0%, #121212 100%);
            padding: 24px 24px 0;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .sp-search-input-wrap {
            display: flex;
            align-items: center;
            gap: 12px;
            background: white;
            border-radius: 500px;
            padding: 10px 16px;
            max-width: 360px;
            margin-bottom: 24px;
          }
          .sp-search-input-wrap input {
            background: transparent;
            border: none;
            outline: none;
            color: black;
            font-size: 14px;
            font-weight: 600;
            flex: 1;
          }
          .sp-search-input-wrap input::placeholder { color: #6a6a6a; }
          .sp-section { padding: 0 24px; }
          .sp-section-title {
            font-size: 22px;
            font-weight: 700;
            color: white;
            margin: 0 0 16px;
          }
          /* Song rows */
          .sp-song-row {
            display: grid;
            grid-template-columns: 16px 40px 1fr auto auto;
            align-items: center;
            gap: 14px;
            padding: 6px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.15s;
          }
          .sp-song-row:hover { background: rgba(255,255,255,0.08); }
          .sp-row-num { text-align: right; font-size: 15px; color: rgba(255,255,255,0.5); }
          .sp-row-num .sp-play-icon { display: none; }
          .sp-song-row:hover .sp-row-num .sp-row-idx { display: none; }
          .sp-song-row:hover .sp-row-num .sp-play-icon { display: flex; justify-content: center; }
          .sp-row-img { width: 40px; height: 40px; border-radius: 4px; object-fit: cover; display: block; }
          .sp-row-actions { display: flex; align-items: center; gap: 8px; opacity: 0; }
          .sp-song-row:hover .sp-row-actions { opacity: 1; }
          /* Top result card */
          .sp-top-card {
            background: rgba(255,255,255,0.07);
            border-radius: 8px;
            padding: 20px;
            cursor: pointer;
            position: relative;
            transition: background 0.2s;
          }
          .sp-top-card:hover { background: rgba(255,255,255,0.14); }
          .sp-top-card-fab {
            position: absolute;
            bottom: 16px; right: 16px;
            width: 48px; height: 48px;
            border-radius: 50%;
            background: var(--spotify-green);
            border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            opacity: 0; transform: translateY(8px);
            transition: opacity 0.2s, transform 0.2s;
            box-shadow: 0 8px 24px rgba(29,185,84,0.5);
          }
          .sp-top-card:hover .sp-top-card-fab,
          .sp-top-card-fab.playing { opacity: 1; transform: translateY(0); }
          /* Browse grid */
          .sp-browse-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 8px;
          }
          .sp-browse-card {
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            min-height: 100px;
          }
          @keyframes sp-shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
          .sp-skeleton {
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
            background-size: 400px 100%;
            animation: sp-shimmer 1.4s infinite;
            border-radius: 4px;
          }
        `}</style>

        {/* Search header */}
        <div className="sp-search-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '0' }}>
            <div className="sp-search-input-wrap" style={{ flex: 1, maxWidth: '380px' }}>
              <Search size={18} color="#121212" />
              <input
                ref={inputRef}
                type="text"
                placeholder="What do you want to listen to?"
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {isSearching && <Loader2 size={16} color="#6a6a6a" style={{ animation: 'spin 1s linear infinite' }} />}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ padding: '24px' }}>

          {/* Empty state — Browse categories */}
          {!query.trim() && (
            <>
              <p style={{ fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}>Search for any song</p>
              <div className="sp-browse-grid">
                {[
                  { label: 'Pop', color: '#E8115B', image: '/genres/pop.png' },
                  { label: 'Hip-Hop', color: '#BA5D07', image: '/genres/hiphop.png' },
                  { label: 'Dance/Electronic', color: '#1E3264', image: '/genres/dance.png' },
                  { label: 'R&B', color: '#E8115B', image: '/genres/rb.png' },
                  { label: 'Rock', color: '#8D67AB', image: '/genres/rock.png' },
                  { label: 'K-Pop', color: '#1E3264', image: '/genres/kpop.png' },
                  { label: 'Indie', color: '#477D95', image: '/genres/indie.png' },
                  { label: 'Podcasts', color: '#E91429', image: '/genres/podcasts.png' },
                  { label: 'Classical', color: '#056952', image: '/genres/classical.png' },
                  { label: 'Latin', color: '#BA5D07', image: '/genres/latin.png' },
                  { label: 'Country', color: '#477D95', image: '/genres/country.png' },
                  { label: 'Jazz', color: '#503750', image: '/genres/jazz.png' },
                ].map(cat => (
                  <div
                    key={cat.label}
                    className="sp-browse-card"
                    style={{ backgroundColor: cat.color }}
                    onClick={() => { setQuery(cat.label); inputRef.current?.focus(); }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '16px', color: 'white' }}>{cat.label}</p>
                    <img 
                      src={cat.image} 
                      alt={cat.label}
                      style={{
                        position: 'absolute', bottom: '-10px', right: '-15px',
                        width: '80px', height: '80px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        transform: 'rotate(25deg)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                        pointerEvents: 'none'
                      }} 
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Skeleton */}
          {query.trim() && isSearching && results.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 16px', opacity: 1 - i * 0.1 }}>
                  <div className="sp-skeleton" style={{ width: '40px', height: '40px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div className="sp-skeleton" style={{ height: '14px', width: `${70 - i * 5}%`, marginBottom: '8px' }} />
                    <div className="sp-skeleton" style={{ height: '12px', width: `${45 - i * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {query.trim() && results.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

              {/* Top Result + Songs grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                {/* Top Result */}
                <div>
                  <p className="sp-section-title">Top result</p>
                  <div className="sp-top-card" onClick={() => handlePlay(results[0])}>
                    <img
                      src={results[0].coverArt?.replace('600x600bb', '300x300bb')}
                      onError={handleImageError}
                      alt=""
                      style={{ width: '92px', height: '92px', borderRadius: '6px', objectFit: 'cover', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', display: 'block' }}
                    />
                    <p style={{ fontSize: '28px', fontWeight: 800, color: 'white', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {results[0].title}
                    </p>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 0 16px' }}>
                      Song · {results[0].artist}
                    </p>
                    <button
                      className={`sp-top-card-fab ${isCurrent(results[0]) && isPlaying ? 'playing' : ''}`}
                      onClick={e => { e.stopPropagation(); handlePlay(results[0]); }}
                    >
                      {isCurrent(results[0]) && isPlaying
                        ? <Pause size={22} fill="black" color="black" />
                        : <Play size={22} fill="black" color="black" style={{ marginLeft: '3px' }} />}
                    </button>
                  </div>
                </div>

                {/* Songs column */}
                {results.length > 1 && (
                  <div>
                    <p className="sp-section-title">Songs</p>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {results.slice(1, 5).map(song => {
                        const active = isCurrent(song);
                        return (
                          <div key={song.id} className="sp-song-row" onClick={() => handlePlay(song)}>
                            <div className="sp-row-num">
                              <span className="sp-row-idx" style={{ color: active ? 'var(--spotify-green)' : undefined }}>{/* hidden on hover */}</span>
                              <span className="sp-play-icon">
                                {active && isPlaying
                                  ? <div className="eq-bars" style={{ transform: 'scale(0.75)' }}><div className="eq-bar"/><div className="eq-bar"/><div className="eq-bar"/><div className="eq-bar"/></div>
                                  : <Play size={14} fill="white" color="white" />}
                              </span>
                            </div>
                            <img className="sp-row-img" src={song.coverArt?.replace('600x600bb', '100x100bb')} onError={handleImageError} alt="" />
                            <div style={{ minWidth: 0 }}>
                              <p className="ellipsis" style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: active ? 'var(--spotify-green)' : 'white' }}>{song.title}</p>
                              <p className="ellipsis" style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                            </div>
                            <div className="sp-row-actions">
                              <button onClick={e => { e.stopPropagation(); setModalSong(song); }} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{formatTime(song.durationMs || 0)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* All results table */}
              {results.length > 5 && (
                <div>
                  <p className="sp-section-title">All results</p>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '16px 40px 1fr auto auto', gap: '14px', padding: '0 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '4px' }}>
                    <span style={{ textAlign: 'right', fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>#</span>
                    <span />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Title</span>
                    <span />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>⏱</span>
                  </div>
                  {results.slice(5).map((song, i) => {
                    const active = isCurrent(song);
                    return (
                      <div key={song.id} className="sp-song-row" onClick={() => handlePlay(song)}>
                        <div className="sp-row-num">
                          {active
                            ? <div className={'eq-bars' + (isPlaying ? '' : ' paused')} style={{ transform: 'scale(0.7)', justifyContent: 'center' }}>
                                <div className="eq-bar" style={{ background: 'var(--spotify-green)' }} /><div className="eq-bar" style={{ background: 'var(--spotify-green)' }} /><div className="eq-bar" style={{ background: 'var(--spotify-green)' }} /><div className="eq-bar" style={{ background: 'var(--spotify-green)' }} />
                              </div>
                            : <>
                                <span className="sp-row-idx">{i + 6}</span>
                                <span className="sp-play-icon"><Play size={14} fill="white" color="white" /></span>
                              </>}
                        </div>
                        <img className="sp-row-img" src={song.coverArt?.replace('600x600bb', '100x100bb')} onError={handleImageError} loading="lazy" alt="" />
                        <div style={{ minWidth: 0 }}>
                          <p className="ellipsis" style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: active ? 'var(--spotify-green)' : 'white' }}>{song.title}</p>
                          <p className="ellipsis" style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{song.artist}</p>
                        </div>
                        <div className="sp-row-actions">
                          <button onClick={e => { e.stopPropagation(); setModalSong(song); }} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{formatTime(song.durationMs || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* No results */}
          {query.trim() && !isSearching && results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Music2 size={48} color="rgba(255,255,255,0.2)" style={{ marginBottom: '16px' }} />
              <h2 style={{ color: 'white', fontWeight: 700, margin: '0 0 8px' }}>No results found for "{query}"</h2>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>Please make sure your words are spelled correctly, or use fewer or different keywords.</p>
            </div>
          )}
        </div>
      </div>

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </>
  );
};

export default ItunesSearchView;
