import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Search, Loader2, Globe } from 'lucide-react';

const SearchView: React.FC = () => {
  const { songs, currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [archiveResults, setArchiveResults] = useState<Song[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);

  // Local filtering for empty query
  const localLibraryCover = songs[2]?.coverArt || '';

  // Archive Search Logic
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
        // 1. Search for audio items on Internet Archive
        const searchUrl = `https://archive.org/advancedsearch.php?q=mediatype:audio+AND+(${encodeURIComponent(query)})&fl[]=identifier,title,creator,date&sort[]=downloads+desc&output=json&rows=15`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        const docs = searchData.response?.docs || [];
        if (docs.length === 0) {
          setArchiveResults([]);
          setIsSearching(false);
          return;
        }

        // 2. Fetch metadata for top results concurrently to find the exact MP3 files
        const metadataPromises = docs.map((doc: any) => 
          fetch(`https://archive.org/metadata/${doc.identifier}`).then(res => res.json()).catch(() => null)
        );
        
        const metadatas = await Promise.all(metadataPromises);
        
        // 3. Map to our Song interface
        const newSongs: Song[] = [];
        
        metadatas.forEach((m: any) => {
          if (!m || !m.files) return;
          
          // Find the best MP3 file (prefer VBR, then standard)
          let mp3File = m.files.find((f: any) => f.name.endsWith('.mp3') && f.format === 'VBR MP3');
          if (!mp3File) {
            mp3File = m.files.find((f: any) => f.name.endsWith('.mp3'));
          }

          if (mp3File) {
            const audioUrl = `https://archive.org/download/${m.metadata.identifier}/${mp3File.name}`;
            
            // Try to find cover art in the files
            const imgFile = m.files.find((f: any) => f.format === 'JPEG' || f.format === 'PNG' || f.name.endsWith('.jpg') || f.name.endsWith('.png'));
            const coverArt = imgFile ? `https://archive.org/download/${m.metadata.identifier}/${imgFile.name}` : 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2';

            newSongs.push({
              id: m.metadata.identifier,
              title: m.metadata.title || 'Unknown Title',
              artist: m.metadata.creator || 'Unknown Artist',
              album: m.metadata.date || 'Internet Archive',
              durationMs: mp3File.length ? parseFloat(mp3File.length) * 1000 : 0,
              audioId: '', // We don't use Cloudinary ID for archive songs
              audioUrl: audioUrl,
              coverArt: coverArt
            });
          }
        });

        setArchiveResults(newSongs);
      } catch (error) {
        console.error("Archive search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  const formatTime = (ms: number) => {
    if (!ms) return '-:--';
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <div style={{ position: 'sticky', top: '0', backgroundColor: 'var(--bg-base)', paddingBottom: '24px', zIndex: 10 }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <Search size={24} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'black' }} />
          <input 
            type="text" 
            placeholder="Search the Global Internet Archive for any song..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '16px 16px 16px 48px',
              borderRadius: '500px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '500',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          />
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={18} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Archive.org API</span>
          </div>
        </div>
      </div>

      {/* Browse All — shown when not searching */}
      {!query.trim() && (
        <>
          <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 700 }}>Library Categories</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }} className="library-grid">
            {[
              { label: 'Hindi Hits',  color: '#E13300' },
              { label: 'English Pop', color: '#1e3264' },
              { label: 'Kannada',     color: '#006450' },
              { label: 'Trending',    color: '#8D67AB' },
              { label: 'Romantic',    color: '#c13584' },
              { label: 'Party',       color: '#E8115B' },
              { label: 'Chill',       color: '#0d73ec' },
              { label: 'All Songs',   color: '#1db954' },
            ].map((cat, i) => (
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
              >
                <span style={{
                  position: 'absolute', top: '14px', left: '14px',
                  fontWeight: 800, fontSize: '18px', color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>{cat.label}</span>
                {localLibraryCover && (
                  <img
                    src={localLibraryCover}
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
            ))}
          </div>
        </>
      )}

      {/* Loading State */}
      {query.trim() && isSearching && archiveResults.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px', color: 'var(--spotify-green)' }}>
          <Loader2 size={48} className="spin" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: 'var(--text-primary)' }}>Searching Global Archive...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Scanning millions of full-length tracks</p>
        </div>
      )}

      {/* Results Table */}
      {query.trim() && archiveResults.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '16px' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Source</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {archiveResults.map((song, index) => {
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
                        src={song.coverArt} 
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
                    <span className="ellipsis" style={{ display: 'block', maxWidth: '200px' }}>Archive.org</span>
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
      
      {/* No Results */}
      {query.trim() && !isSearching && archiveResults.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No audio found for "{query}"</h2>
          <p>Try searching for a different track or artist name.</p>
        </div>
      )}
    </div>
  );
};

export default SearchView;
