import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, Search, Loader2 } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';
import { searchItunes } from '../utils/itunes-song-search';

const ItunesSearchView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Song[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const newSongs = await searchItunes(query, { limit: 20 });
        
        if (newSongs.length === 0) {
          setResults([]);
          setIsSearching(false);
          return;
        }

        setResults(newSongs);
      } catch (error) {
        console.error("iTunes search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
      return;
    }

    if (!song.audioUrl) {
      console.error("No preview URL found for this track");
      return;
    }
    
    playSong(song);
  };

  const formatTime = (ms: number) => {
    if (!ms) return '-:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const imgElement = e.currentTarget;
    if (imgElement.dataset.fallbackAttempted) return;
    imgElement.dataset.fallbackAttempted = 'true';
    imgElement.src = '/logo.png';
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #FF2D55, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Premium
        </h1>
      </div>

      <div style={{ position: 'sticky', top: '0', backgroundColor: 'var(--bg-base)', paddingBottom: '24px', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
          <input 
            type="text" 
            placeholder="Search mainstream tracks and listen to 30s previews..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: '500px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* Empty State */}
      {!query.trim() && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
             {/* Apple Music inspired icon placeholder */}
             <div style={{ width: '96px', height: '96px', borderRadius: '24px', background: 'linear-gradient(135deg, #FF2D55, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 24px rgba(255, 45, 85, 0.4)' }}>
                <Play size={48} color="white" fill="white" />
             </div>
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: 800 }}>
            Premium Catalog Previews
          </h2>
          <p style={{ maxWidth: '450px', margin: '0 auto', lineHeight: 1.6, fontSize: '16px' }}>
            Search for mainstream hits and stream high-quality 30-second previews with pristine cover art.
          </p>
        </div>
      )}

      {/* Loading State */}
      {query.trim() && isSearching && results.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px', color: '#FF2D55' }}>
          <Loader2 size={48} className="spin" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: 'var(--text-primary)' }}>Searching Premium Catalog...</h2>
        </div>
      )}

      <style>{`
        .top-result-play-btn {
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
        }
        .top-result-card:hover .top-result-play-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .top-result-play-btn:hover {
          transform: translateY(0) scale(1.05) !important;
          background-color: #FF375F !important;
        }
      `}</style>

      {/* Results Layout */}
      {query.trim() && results.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            
            {/* Top Result Card */}
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Top result</h2>
              <div 
                style={{
                  backgroundColor: '#181818',
                  padding: '20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background-color 0.3s ease'
                }}
                className="top-result-card"
                onClick={() => handlePlay(results[0])}
                onMouseOver={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#282828'}
                onMouseOut={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#181818'}
              >
                <img 
                  src={results[0].coverArt} 
                  onError={handleImageError}
                  style={{ width: '92px', height: '92px', borderRadius: '4px', objectFit: 'cover', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
                  alt="" 
                />
                <h3 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {results[0].title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700 }}>{results[0].artist}</span>
                  <span style={{ backgroundColor: '#121212', color: 'white', padding: '4px 12px', borderRadius: '500px', fontSize: '12px', fontWeight: 700 }}>Preview</span>
                </div>
                
                {/* Big Play Button on Hover */}
                <div className="top-result-play-btn" style={{
                  position: 'absolute', right: '20px', bottom: '20px',
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: '#FF2D55',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
                  color: 'white'
                }}>
                  {currentSong?.id === results[0].id && isPlaying ? (
                     <div className="eq-bars">
                        <div className="eq-bar" style={{backgroundColor: 'white'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'white'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'white'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'white'}}></div>
                     </div>
                  ) : (
                     <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Songs List */}
            {results.length > 1 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Songs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {results.slice(1, 5).map(song => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <div 
                        key={song.id}
                        className="song-row"
                        style={{ display: 'flex', alignItems: 'center', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => handlePlay(song)}
                      >
                        <div style={{ position: 'relative', width: '40px', height: '40px', marginRight: '16px', flexShrink: 0 }}>
                          <img 
                            src={song.coverArt} 
                            onError={handleImageError}
                            style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} 
                            alt="" 
                          />
                          <div className="song-play-btn" style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                          }}>
                            {isCurrent && isPlaying ? (
                              <div className="eq-bars">
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                              </div>
                            ) : (
                              <Play size={20} fill="currentColor" />
                            )}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                          <span style={{ color: isCurrent ? '#FF2D55' : 'var(--text-primary)', fontSize: '16px' }} className="ellipsis">
                            {song.title}
                          </span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }} className="ellipsis">
                            {song.artist}
                          </span>
                        </div>
                        
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', marginLeft: '16px' }}>
                          {formatTime(song.durationMs || 0)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* More Results Table */}
          {results.length > 5 && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>More from Premium</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
                    <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
                    <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
                    <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(5).map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    return (
                      <tr 
                        key={song.id}
                        className="song-row"
                        onClick={() => handlePlay(song)}
                      >
                        <td className="hide-mobile" style={{ padding: '12px 16px', color: isCurrent ? '#FF2D55' : 'var(--text-secondary)' }}>
                          <div className="song-index-col">
                            {isCurrent ? (
                              <div className={'eq-bars' + (isPlaying ? '' : ' paused')}>
                                <div className="eq-bar" style={{background:'#FF2D55'}}></div>
                                <div className="eq-bar" style={{background:'#FF2D55'}}></div>
                                <div className="eq-bar" style={{background:'#FF2D55'}}></div>
                                <div className="eq-bar" style={{background:'#FF2D55'}}></div>
                              </div>
                            ) : (
                              <span className="song-index">{index + 6}</span>
                            )}
                            <button className="song-play-btn" style={{ color: isCurrent ? '#FF2D55' : 'white' }}>
                              <Play size={16} fill="currentColor" />
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={song.coverArt} 
                              onError={handleImageError}
                              style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                              alt="" 
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                              <span style={{ color: isCurrent ? '#FF2D55' : 'var(--text-primary)' }} className="ellipsis">
                                {song.title}
                              </span>
                              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }} className="ellipsis">
                                {song.artist}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'right' }}>
                          {formatTime(song.durationMs || 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
      
      {/* No Results */}
      {query.trim() && !isSearching && results.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No results found for "{query}"</h2>
          <p>Try searching for a different track or artist name.</p>
        </div>
      )}
    </div>
  );
};

export default ItunesSearchView;
