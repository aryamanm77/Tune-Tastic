import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, Search, Loader2, Globe, ShieldCheck } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';

const GlobalSearchView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [archiveResults, setArchiveResults] = useState<Song[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);

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
        // Safe Search Filter: Exclude explicit, NSFW, and non-audio content
        const q = `mediatype:audio AND (${query}) AND NOT (subject:explicit OR subject:nsfw OR title:explicit OR mediatype:data)`;
        
        // Search for audio items on Internet Archive
        const url = new URL('https://archive.org/advancedsearch.php');
        url.searchParams.append('q', q);
        url.searchParams.append('fl[]', 'identifier');
        url.searchParams.append('fl[]', 'title');
        url.searchParams.append('fl[]', 'creator');
        url.searchParams.append('fl[]', 'date');
        url.searchParams.append('sort[]', 'downloads desc');
        url.searchParams.append('output', 'json');
        url.searchParams.append('rows', '15');
        
        const searchUrl = url.toString();
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        const docs = searchData.response?.docs || [];
        if (docs.length === 0) {
          setArchiveResults([]);
          setIsSearching(false);
          return;
        }

        // Fetch metadata for top results concurrently to find the exact MP3 files
        const metadataPromises = docs.map((doc: any) => 
          fetch(`https://archive.org/metadata/${doc.identifier}`).then(res => res.json()).catch(() => null)
        );
        
        const metadatas = await Promise.all(metadataPromises);
        
        // Map to our Song interface
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={32} color="#1db954" /> Global Archive Room
        </h1>
        <TuneTasticLogo size={40} />
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
          <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="#1db954" />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Safe Search On</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!query.trim() && (
        <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
          <Globe size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Explore the Internet Archive</h2>
          <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
            Search through millions of full-length, copyright-free, and user-uploaded audio tracks from around the world.
            Powered by Archive.org.
          </p>
        </div>
      )}

      {/* Loading State */}
      {query.trim() && isSearching && archiveResults.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '64px', color: 'var(--spotify-green)' }}>
          <Loader2 size={48} className="spin" style={{ marginBottom: '16px' }} />
          <h2 style={{ color: 'var(--text-primary)' }}>Searching Global Archive...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Scanning millions of safe, full-length tracks</p>
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
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No safe audio found for "{query}"</h2>
          <p>Try searching for a different track or artist name.</p>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchView;
