/**
 * NowPlayingScreen.tsx
 * Full-screen Spotify-style Now Playing view for mobile.
 * Opens when user taps the mini player bar.
 */
import React, { useState, useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Heart, ChevronDown, MoreHorizontal, Volume2, VolumeX,
  Sparkles, Disc, Image as ImageIcon, Download, Plus, ListMusic, Trash2,
  Search, RefreshCw, Target, X
} from 'lucide-react';
import Visualizer from './Visualizer';
import VinylScratch from './VinylScratch';
import AuraMode from './AuraMode';
import AddToPlaylistModal from './AddToPlaylistModal';
import { getCuratedLyrics, parseLrcLyrics, SyncedLyricLine } from '../data/lyricsDatabase';

interface NowPlayingScreenProps {
  onClose: () => void;
}

interface LyricsCardProps {
  artist: string;
  title: string;
  currentTime: number;
  seekTo: (time: number) => void;
  isPlaying?: boolean;
  duration?: number;
}

const LyricsCard: React.FC<LyricsCardProps> = ({ artist, title, currentTime, seekTo, duration }) => {
  const [syncedLines, setSyncedLines] = useState<SyncedLyricLine[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<string>('');
  const [userScrolled, setUserScrolled] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [customPastedLyrics, setCustomPastedLyrics] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const userScrollTimeoutRef = useRef<any>(null);

  // Compute active lyric line index
  const activeIndex = syncedLines.length > 0
    ? syncedLines.reduce((acc, line, idx) => (currentTime >= line.time ? idx : acc), -1)
    : -1;

  // Auto-scroll to keep active line centered
  useEffect(() => {
    if (!userScrolled && activeLineRef.current && scrollContainerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, userScrolled]);

  const fetchLyrics = (searchTitle: string, searchArtist: string) => {
    setSyncedLines([]);
    setPlainLyrics(null);
    setError(false);
    setSource('');
    setUserScrolled(false);

    // 1. Check local curated database first for instant real synchronized lyrics
    const curated = getCuratedLyrics(searchTitle, searchArtist);
    if (curated) {
      const parsed = parseLrcLyrics(curated.syncedLyrics);
      if (parsed.length > 0) {
        setSyncedLines(parsed);
        setSource('TuneTastic Synced');
        return;
      }
    }

    // Smart cleaning of artist and title
    let cleanArtist = (searchArtist || '').split(',')[0].replace(/feat\.?.*/i, '').replace(/ft\.?.*/i, '').replace(/with .*/i, '').trim();
    let cleanTitle = (searchTitle || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/feat\.?.*/i, '').replace(/ft\.?.*/i, '').replace(/remix.*/i, '').trim();

    if (cleanTitle.toLowerCase().includes('believer') && (!cleanArtist || cleanArtist.toLowerCase() === 'unknown artist')) {
      cleanArtist = 'Imagine Dragons';
      cleanTitle = 'Believer';
    }
    cleanTitle = cleanTitle.replace(/\s+\d+$/, '').trim();

    if (!cleanTitle) {
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const tryLrcLib = () =>
      fetch(`https://lrclib.net/api/search?q=${encodeURIComponent((cleanArtist ? cleanArtist + ' ' : '') + cleanTitle)}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          const syncedHit = data?.find((d: any) => d.syncedLyrics);
          if (syncedHit?.syncedLyrics) {
            const parsed = parseLrcLyrics(syncedHit.syncedLyrics);
            if (parsed.length > 0) return { synced: parsed, src: 'LRCLIB (Synced)' };
          }
          const plainHit = data?.find((d: any) => d.plainLyrics) ?? data?.[0];
          if (plainHit?.plainLyrics) return { plain: plainHit.plainLyrics, src: 'LRCLIB' };
          throw new Error('empty');
        });

    const tryLrcLibByTrack = () =>
      fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          if (data?.syncedLyrics) {
            const parsed = parseLrcLyrics(data.syncedLyrics);
            if (parsed.length > 0) return { synced: parsed, src: 'LRCLIB (Synced)' };
          }
          if (data?.plainLyrics) return { plain: data.plainLyrics, src: 'LRCLIB' };
          throw new Error('empty');
        });

    const tryLyricsOvh = () =>
      cleanArtist
        ? fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`)
            .then(r => { if (!r.ok) throw new Error(); return r.json(); })
            .then(data => {
              if (data?.lyrics) return { plain: data.lyrics.trim(), src: 'Lyrics.ovh' };
              throw new Error('empty');
            })
        : Promise.reject(new Error('no artist'));

    tryLrcLib()
      .catch(() => tryLrcLibByTrack())
      .catch(() => tryLyricsOvh())
      .then((result: any) => {
        if (cancelled) return;
        if (result.synced) {
          setSyncedLines(result.synced);
        } else if (result.plain) {
          // Convert plain lyrics into estimated time blocks so user gets moving highlight
          const rawLines = result.plain.split('\n').map((l: string) => l.trim()).filter(Boolean);
          const trackDuration = duration && duration > 20 ? duration : 180;
          const interval = Math.max(3, (trackDuration - 10) / Math.max(rawLines.length, 1));
          const generated: SyncedLyricLine[] = rawLines.map((text: string, i: number) => ({
            time: Math.round(i * interval * 10) / 10,
            text,
          }));
          setSyncedLines(generated);
          setPlainLyrics(result.plain);
        }
        setSource(result.src);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  };

  useEffect(() => {
    fetchLyrics(title, artist);
  }, [artist, title, duration]);

  // Handle manual scroll detection
  const handleScroll = () => {
    setUserScrolled(true);
    if (userScrollTimeoutRef.current) clearTimeout(userScrollTimeoutRef.current);
    userScrollTimeoutRef.current = setTimeout(() => {
      // Resume auto scroll after 4 seconds of idle
      setUserScrolled(false);
    }, 4500);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15,15,22,0.65) 0%, rgba(10,10,16,0.45) 100%)',
      backdropFilter: 'blur(28px)',
      WebkitBackdropFilter: 'blur(28px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '24px 20px',
      marginTop: '28px',
      marginBottom: '32px',
      minHeight: '280px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            Spotify Synced Lyrics
          </h3>
          {source && (
            <span style={{ fontSize: '10px', color: 'var(--spotify-green)', fontWeight: 700, background: 'rgba(29, 185, 84, 0.15)', padding: '2px 8px', borderRadius: '100px' }}>
              {source}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setCustomSearchQuery(`${artist} ${title}`);
              setShowSearchModal(true);
            }}
            title="Search or Add Lyrics Manually"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <Search size={12} />
            <span>Search Lyrics</span>
          </button>

          <button
            type="button"
            onClick={() => fetchLyrics(title, artist)}
            title="Reload Lyrics"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              padding: '6px',
              borderRadius: '50%',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Synchronized Live Moving Block Content */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px 0' }}>
          {[1, 0.75, 0.9, 0.6, 0.85, 0.7].map((w, i) => (
            <div key={i} style={{
              height: '24px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.1)',
              width: `${w * 100}%`,
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : error || (syncedLines.length === 0 && !plainLyrics) ? (
        <div style={{ textAlign: 'center', padding: '36px 16px', color: 'rgba(255,255,255,0.6)' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>🎵</div>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>Lyrics not found yet</p>
          <p style={{ margin: '8px 0 16px', fontSize: '13px', lineHeight: 1.5, opacity: 0.75 }}>
            Don't worry! You can search online or paste lyrics manually with one click.
          </p>
          <button
            type="button"
            onClick={() => {
              setCustomSearchQuery(`${artist} ${title}`);
              setShowSearchModal(true);
            }}
            style={{
              background: 'var(--spotify-green)',
              color: 'black',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(29, 185, 84, 0.4)',
            }}
          >
            Search & Add Lyrics Now
          </button>
        </div>
      ) : syncedLines.length > 0 ? (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '6px',
            scrollBehavior: 'smooth',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {syncedLines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = activeIndex !== -1 && idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seekTo(line.time)}
                title={`Seek to ${Math.floor(line.time / 60)}:${Math.floor(line.time % 60).toString().padStart(2, '0')}`}
                style={{
                  padding: isActive ? '12px 18px' : '8px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: isActive ? '24px' : '19px',
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? '#ffffff' : isPast ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)',
                  background: isActive ? 'rgba(29, 185, 84, 0.16)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--spotify-green)' : '4px solid transparent',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'left center',
                  transition: 'all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  textShadow: isActive ? '0 0 18px rgba(255,255,255,0.45)' : 'none',
                  lineHeight: 1.5,
                  userSelect: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = isPast ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {line.text}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Floating Sync Button if User Scrolled Away */}
      {userScrolled && activeIndex !== -1 && (
        <button
          type="button"
          onClick={() => {
            setUserScrolled(false);
            activeLineRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '18px',
            background: 'var(--spotify-green)',
            color: 'black',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '100px',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Target size={14} />
          <span>Sync to Audio</span>
        </button>
      )}

      {/* Manual Search & Add Lyrics Modal */}
      {showSearchModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#181822', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>Search & Add Lyrics</h3>
              <button onClick={() => setShowSearchModal(false)} style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
              Search LRCLib or paste text to synchronize line-by-line:
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Song title or artist..."
                value={customSearchQuery}
                onChange={e => setCustomSearchQuery(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: '14px', outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setShowSearchModal(false);
                  fetchLyrics(customSearchQuery, '');
                }}
                style={{
                  background: 'var(--spotify-green)', color: 'black',
                  padding: '10px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '13px',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Search
              </button>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                Or paste lyrics manually:
              </p>
              <textarea
                placeholder="Paste lyrics line-by-line here..."
                rows={5}
                value={customPastedLyrics}
                onChange={e => setCustomPastedLyrics(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (customPastedLyrics.trim()) {
                    const rawLines = customPastedLyrics.split('\n').map(l => l.trim()).filter(Boolean);
                    const trackDuration = duration && duration > 20 ? duration : 180;
                    const interval = Math.max(3, (trackDuration - 10) / Math.max(rawLines.length, 1));
                    const generated = rawLines.map((text, i) => ({
                      time: Math.round(i * interval * 10) / 10,
                      text,
                    }));
                    setSyncedLines(generated);
                    setSource('Manual Lyrics');
                    setShowSearchModal(false);
                  }
                }}
                style={{
                  marginTop: '10px', width: '100%',
                  background: 'white', color: 'black',
                  padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '13px',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Apply Pasted Lyrics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({ onClose }) => {
  const {
    currentSong, isPlaying, progress, currentTime, duration, volume,
    isShuffled, repeatMode,
    togglePlayPause, nextSong, prevSong, seekTo, setVolume,
    toggleShuffle, cycleRepeat, toggleLike, isLiked,
    downloadSong, downloadedSongs, downloadProgress,
    addToQueue, deleteDownload
  } = usePlayer();

  const [touching, setTouching] = useState(false);
  const [activeMode, setActiveMode] = useState<'normal' | 'party' | 'vinyl' | 'aura'>('normal');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  if (!currentSong) return null;

  const liked = isLiked(currentSong.id);

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    return `${Math.floor(t / 60)}:${Math.floor(t % 60).toString().padStart(2, '0')}`;
  };

  const repeatColor = repeatMode !== 'none' ? 'var(--spotify-green)' : 'rgba(255,255,255,0.6)';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 800,
      background: 'var(--dynamic-bg-color, #1e3a29)',
      display: 'flex', flexDirection: 'column',
      animation: 'npSlideUp 0.32s cubic-bezier(0.32,0.72,0,1)',
      overflowY: 'auto',
      overflowX: 'hidden',
      scrollbarGutter: 'stable',
      scrollbarWidth: 'thin'
    }}>
      <style>{`
        @keyframes npSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '0 28px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'env(safe-area-inset-top, 16px)', marginTop: '16px' }}>
          <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
            <ChevronDown size={28} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Now Playing</p>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowMenu(!showMenu)} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
              <MoreHorizontal size={24} />
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute', top: '100%', right: 0,
                backgroundColor: '#282828', borderRadius: '4px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.8)',
                zIndex: 100, minWidth: '220px', overflow: 'hidden'
              }}>
                <button 
                  onClick={() => { setShowMenu(false); setShowAddModal(true); }}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                  <Plus size={16} /> Add to Playlist
                </button>
                <button 
                  onClick={() => { setShowMenu(false); addToQueue(currentSong); }}
                  style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                >
                  <ListMusic size={16} /> Add to Queue
                </button>
                {downloadedSongs.has(currentSong.id) ? (
                  <button 
                    onClick={() => { setShowMenu(false); deleteDownload(currentSong.id); }}
                    style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Trash2 size={16} color="#ff6b6b" /> Remove from Downloads
                  </button>
                ) : (
                  <button 
                    onClick={() => { setShowMenu(false); downloadSong(currentSong); }}
                    style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <Download size={16} /> 
                    {downloadProgress[currentSong.id] !== undefined ? 'Downloading...' : 'Download song'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Fun Modes Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
          {[
            { id: 'normal', icon: ImageIcon, label: 'Art' },
            { id: 'party', icon: Sparkles, label: 'Party' },
            { id: 'vinyl', icon: Disc, label: 'Vinyl' },
            { id: 'aura', icon: Sparkles, label: 'Aura' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '100px', border: 'none',
                backgroundColor: activeMode === m.id ? 'var(--spotify-green)' : 'rgba(255,255,255,0.1)',
                color: activeMode === m.id ? 'black' : 'white',
                fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                transition: 'all 0.2s ease', zIndex: 2
              }}
            >
              <m.icon size={14} />
              {m.label}
            </button>
          ))}
        </div>

        {/* Central Display Area */}
        <div style={{ flex: '1 0 auto', minHeight: '310px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', zIndex: 2 }}>
          {activeMode === 'vinyl' && <VinylScratch />}
          {activeMode === 'aura' && <AuraMode onBack={() => setActiveMode('normal')} />}
          {activeMode === 'party' && <Visualizer onBack={() => setActiveMode('normal')} />}
          
          {activeMode === 'normal' && (
            <img
              src={currentSong.coverArt || (currentSong.audioId ? getCoverArtUrl(currentSong.audioId) : './logo.png')}
              onError={e => {
                if (e.currentTarget.src.includes('600x600bb')) {
                  e.currentTarget.src = e.currentTarget.src.replace('600x600bb', '100x100bb');
                } else {
                  e.currentTarget.src = './logo.png';
                }
              }}
              alt={currentSong.title}
              style={{
                width: '100%',
                maxWidth: '320px',
                aspectRatio: '1 / 1',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                transform: touching ? 'scale(0.95)' : isPlaying ? 'scale(1)' : 'scale(0.88)',
                transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              }}
              onTouchStart={() => setTouching(true)}
              onTouchEnd={() => setTouching(false)}
            />
          )}
        </div>

        {/* Song info + like */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: '22px', fontWeight: 800, color: 'white',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{currentSong.title}</p>
            <p style={{ margin: '4px 0 0', fontSize: '15px', color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {currentSong.artist}
            </p>
          </div>
          <button
            onClick={() => toggleLike(currentSong)}
            style={{ color: liked ? '#FF2D55' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <Heart size={26} fill={liked ? '#FF2D55' : 'none'} />
          </button>
        </div>

        {/* Progress bar */}
        <div>
          <input
            type="range" min="0" max="1" step="0.001"
            value={progress || 0}
            onChange={e => seekTo(parseFloat(e.target.value))}
            style={{ width: '100%', height: '4px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', cursor: 'pointer', accentColor: 'white' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{formatTime(currentTime)}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <button onClick={toggleShuffle} style={{ color: isShuffled ? 'var(--spotify-green)' : 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Shuffle size={22} />
          </button>
          <button onClick={prevSong} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <SkipBack size={32} fill="white" />
          </button>
          <button
            onClick={togglePlayPause}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              backgroundColor: 'white', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {isPlaying
              ? <Pause size={30} fill="black" color="black" />
              : <Play size={30} fill="black" color="black" style={{ marginLeft: '4px' }} />}
          </button>
          <button onClick={nextSong} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            <SkipForward size={32} fill="white" />
          </button>
          <button onClick={cycleRepeat} style={{ color: repeatColor, background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
            <Repeat size={22} />
            {repeatMode === 'one' && (
              <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', fontWeight: 800, color: 'var(--spotify-green)' }}>1</span>
            )}
          </button>
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px', marginBottom: 'env(safe-area-inset-bottom, 32px)', paddingBottom: '16px' }}>
          <button onClick={() => setVolume(0)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <VolumeX size={18} />
          </button>
          <input
            type="range" min="0" max="1" step="0.01"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            style={{ flex: 1, height: '4px', WebkitAppearance: 'none', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', accentColor: 'white' }}
          />
          <button onClick={() => setVolume(1)} style={{ color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Volume2 size={18} />
          </button>
        </div>

        {/* Lyrics Card (Spotify-style live moving block synchronized lyrics) */}
        <LyricsCard
          artist={currentSong.artist}
          title={currentSong.title}
          currentTime={currentTime}
          seekTo={seekTo}
          isPlaying={isPlaying}
          duration={duration}
        />
      </div>
      
      {showAddModal && <AddToPlaylistModal song={currentSong} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default NowPlayingScreen;
