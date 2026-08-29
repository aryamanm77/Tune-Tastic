import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, Search, Loader2 } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';

const GlobalSearchView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [archiveResults, setArchiveResults] = useState<Song[]>([]);
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const prefetchQueryRef = useRef<string>('');

  // Global Search Logic
  useEffect(() => {
    if (!query.trim()) {
      setArchiveResults([]);
      setIsSearching(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearching(true);

    searchTimeoutRef.current = window.setTimeout(async () => {
      try {
        // Safe Search Filter & Stricter Language/Title Matching
        // By restricting to title and subject, we prevent random language matches from massive text bodies.
        // We also strictly filter out non-music collections like audio_religion, audio_islamic, and audio_bookspoetry
        const q = `mediatype:audio AND (title:(${query}) OR subject:(${query})) AND NOT (subject:explicit OR subject:nsfw OR title:explicit OR mediatype:data OR collection:audio_religion OR collection:audio_islamic OR collection:audio_bookspoetry OR subject:quran OR subject:islam OR subject:sermon)`;
        
        const url = new URL('https://archive.org/advancedsearch.php');
        url.searchParams.append('q', q);
        url.searchParams.append('fl[]', 'identifier');
        url.searchParams.append('fl[]', 'title');
        url.searchParams.append('fl[]', 'creator');
        url.searchParams.append('fl[]', 'date');
        url.searchParams.append('output', 'json');
        url.searchParams.append('rows', '20');
        
        const searchUrl = url.toString();
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        const docs = searchData.response?.docs || [];
        if (docs.length === 0) {
          setArchiveResults([]);
          setIsSearching(false);
          return;
        }

        // Map directly to Song interface instantly using the reliable image service
        const newSongs: Song[] = docs.map((doc: any) => ({
          id: doc.identifier,
          title: doc.title || 'Unknown Title',
          artist: doc.creator || 'Unknown Artist',
          album: doc.date ? doc.date.substring(0, 4) : 'TuneTastic Global',
          durationMs: 0, // Will be fetched on play
          audioId: '',
          audioUrl: '', // Will be fetched on play
          coverArt: `https://archive.org/services/img/${doc.identifier}`
        }));

        setArchiveResults(newSongs);
      } catch (error) {
        console.error("Global search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400); // reduced debounce for faster feel

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  // Background Prefetcher: Resolve audioUrls and iTunes artwork for top 5 results
  useEffect(() => {
    if (archiveResults.length === 0 || prefetchQueryRef.current === query) return;
    prefetchQueryRef.current = query; // Prevent infinite loops
    
    const prefetchData = async () => {
      let stateChanged = false;
      const topSongs = archiveResults.slice(0, 5);
      
      await Promise.allSettled(topSongs.map(async (song) => {
        // 1. Proactively fetch iTunes Artwork to override ugly IA placeholders
        try {
          if (!song.coverArt?.includes('itunes')) {
            const searchQuery = encodeURIComponent(`${song.title} ${song.artist}`.trim());
            const itunesRes = await fetch(`https://itunes.apple.com/search?term=${searchQuery}&entity=song&limit=1`);
            const itunesData = await itunesRes.json();
            if (itunesData.results && itunesData.results.length > 0 && itunesData.results[0].artworkUrl100) {
              song.coverArt = itunesData.results[0].artworkUrl100.replace('100x100bb', '300x300bb');
              stateChanged = true;
            }
          }
        } catch (error) {}

        // 2. Fetch Audio URL
        if (!song.audioUrl) {
          try {
            const metaRes = await fetch(`https://archive.org/metadata/${song.id}`);
            const m = await metaRes.json();
            if (m && m.files) {
              let mp3File = m.files.find((f: any) => f.name.endsWith('.mp3') && f.format === 'VBR MP3') 
                         || m.files.find((f: any) => f.name.endsWith('.mp3'));
              if (mp3File) {
                song.audioUrl = `https://archive.org/download/${song.id}/${encodeURIComponent(mp3File.name)}`;
                song.durationMs = mp3File.length ? parseFloat(mp3File.length) * 1000 : 0;
                stateChanged = true;
              }
            }
          } catch (error) {}
        }
      }));

      // Trigger a re-render so the UI updates with the new iTunes images and durations
      if (stateChanged) {
        setArchiveResults([...archiveResults]);
      }
    };

    prefetchData();
  }, [archiveResults, query]);

  const handlePlay = async (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
      return;
    }

    if (!song.audioUrl) {
      setLoadingSongId(song.id);
      try {
        const metaRes = await fetch(`https://archive.org/metadata/${song.id}`);
        const m = await metaRes.json();
        
        if (!m || !m.files) throw new Error("No files found");

        let mp3File = m.files.find((f: any) => f.name.endsWith('.mp3') && f.format === 'VBR MP3');
        if (!mp3File) {
          mp3File = m.files.find((f: any) => f.name.endsWith('.mp3'));
        }

        if (mp3File) {
          // IMPORTANT: URL encode the filename to fix playback errors with spaces!
          song.audioUrl = `https://archive.org/download/${song.id}/${encodeURIComponent(mp3File.name)}`;
          song.durationMs = mp3File.length ? parseFloat(mp3File.length) * 1000 : 0;
        } else {
          console.error("No MP3 file found for this track");
          setLoadingSongId(null);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch audio stream:", error);
        setLoadingSongId(null);
        return;
      }
    }
    
    setLoadingSongId(null);
    playSong(song);
  };

  const formatTime = (ms: number) => {
    if (!ms) return '-:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>, song: Song) => {
    const imgElement = e.currentTarget;
    if (imgElement.dataset.fallbackAttempted) {
      imgElement.src = '/logo.png';
      return;
    }
    imgElement.dataset.fallbackAttempted = 'true';
    
    try {
      // Try to fetch artwork from iTunes based on title and artist
      const query = encodeURIComponent(`${song.title} ${song.artist}`.trim());
      const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
        // Enhance resolution from 100x100 to 300x300
        imgElement.src = data.results[0].artworkUrl100.replace('100x100bb', '300x300bb');
      } else {
        imgElement.src = '/logo.png';
      }
    } catch (err) {
      imgElement.src = '/logo.png';
    }
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          TuneTastic Global
        </h1>
      </div>

      <div style={{ position: 'sticky', top: '0', backgroundColor: 'var(--bg-base)', paddingBottom: '24px', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
          <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
          <input 
            type="text" 
            placeholder="Search the world for any song, artist, or language..." 
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

      {/* Empty State with Logo */}
      {!query.trim() && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <TuneTasticLogo size={96} />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '28px', fontWeight: 800 }}>
            Welcome to TuneTastic Global
          </h2>
          <p style={{ maxWidth: '450px', margin: '0 auto', lineHeight: 1.6, fontSize: '16px' }}>
            Search the world for any language, artist, or song. Discover millions of full-length, high-quality audio tracks instantly.
          </p>
        </div>
      )}

      {/* Loading State */}
      {query.trim() && isSearching && archiveResults.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px', color: 'var(--spotify-green)' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="var(--spotify-green)" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
            <rect x="2" y="8" width="4" height="8" rx="2">
              <animate attributeName="height" values="8;16;8" begin="0s" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y" values="8;4;8" begin="0s" dur="0.8s" repeatCount="indefinite" />
            </rect>
            <rect x="10" y="4" width="4" height="16" rx="2">
              <animate attributeName="height" values="16;4;16" begin="0.2s" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y" values="4;10;4" begin="0.2s" dur="0.8s" repeatCount="indefinite" />
            </rect>
            <rect x="18" y="8" width="4" height="8" rx="2">
              <animate attributeName="height" values="8;16;8" begin="0.4s" dur="0.8s" repeatCount="indefinite" />
              <animate attributeName="y" values="8;4;8" begin="0.4s" dur="0.8s" repeatCount="indefinite" />
            </rect>
          </svg>
          <h2 style={{ color: 'var(--text-primary)' }}>Searching TuneTastic Global...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Scanning millions of safe, full-length tracks</p>
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
          background-color: #3be477 !important;
        }
      `}</style>

      {/* Results Layout */}
      {query.trim() && archiveResults.length > 0 && (
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
                onClick={() => handlePlay(archiveResults[0])}
                onMouseOver={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#282828'}
                onMouseOut={(e) => (e.currentTarget as HTMLDivElement).style.backgroundColor = '#181818'}
              >
                <img 
                  src={archiveResults[0].coverArt} 
                  onError={(e) => handleImageError(e, archiveResults[0])}
                  style={{ width: '92px', height: '92px', borderRadius: '4px', objectFit: 'cover', marginBottom: '20px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }} 
                  alt="" 
                />
                <h3 style={{ fontSize: '32px', fontWeight: 700, margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {archiveResults[0].title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 700 }}>{archiveResults[0].artist}</span>
                  <span style={{ backgroundColor: '#121212', color: 'white', padding: '4px 12px', borderRadius: '500px', fontSize: '12px', fontWeight: 700 }}>Song</span>
                </div>
                
                {/* Big Play Button on Hover */}
                <div className="top-result-play-btn" style={{
                  position: 'absolute', right: '20px', bottom: '20px',
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: 'var(--spotify-green)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
                  color: 'black'
                }}>
                  {loadingSongId === archiveResults[0].id ? (
                     <Loader2 size={24} className="spin" />
                  ) : currentSong?.id === archiveResults[0].id && isPlaying ? (
                     <div className="eq-bars">
                        <div className="eq-bar" style={{backgroundColor: 'black'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'black'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'black'}}></div>
                        <div className="eq-bar" style={{backgroundColor: 'black'}}></div>
                     </div>
                  ) : (
                     <Play size={24} fill="currentColor" style={{ marginLeft: '4px' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Songs List */}
            {archiveResults.length > 1 && (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Songs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {archiveResults.slice(1, 5).map(song => {
                    const isCurrent = currentSong?.id === song.id;
                    const isLoadingThis = loadingSongId === song.id;
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
                            onError={(e) => handleImageError(e, song)}
                            style={{ width: '100%', height: '100%', borderRadius: '4px', objectFit: 'cover' }} 
                            alt="" 
                          />
                          <div className="song-play-btn" style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white'
                          }}>
                            {isLoadingThis ? (
                              <Loader2 size={20} className="spin" />
                            ) : isCurrent && isPlaying ? (
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
                          <span style={{ color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)', fontSize: '16px' }} className="ellipsis">
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
          {archiveResults.length > 5 && (
            <>
              <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>More from TuneTastic Global</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
                    <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
                    <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
                    <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {archiveResults.slice(5).map((song, index) => {
                    const isCurrent = currentSong?.id === song.id;
                    const isLoadingThis = loadingSongId === song.id;
                    return (
                      <tr 
                        key={song.id}
                        className="song-row"
                        onClick={() => handlePlay(song)}
                      >
                        <td className="hide-mobile" style={{ padding: '12px 16px', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
                          <div className="song-index-col">
                            {isLoadingThis ? (
                               <Loader2 size={16} className="spin" color="var(--spotify-green)" />
                            ) : isCurrent ? (
                              <div className={'eq-bars' + (isPlaying ? '' : ' paused')}>
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                                <div className="eq-bar"></div>
                              </div>
                            ) : (
                              <span className="song-index">{index + 6}</span>
                            )}
                            {!isLoadingThis && (
                              <button className="song-play-btn" style={{ color: isCurrent ? 'var(--spotify-green)' : 'white' }}>
                                <Play size={16} fill="currentColor" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img 
                              src={song.coverArt} 
                              onError={(e) => handleImageError(e, song)}
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
      {query.trim() && !isSearching && archiveResults.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No safe audio found for "{query}"</h2>
          <p>Try searching for a different track or artist name.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchView;
