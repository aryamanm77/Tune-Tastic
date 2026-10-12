/**
 * NowPlayingScreen.tsx
 * Full-screen Spotify-style Now Playing view for mobile.
 * Opens when user taps the mini player bar.
 */
import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Heart, ChevronDown, MoreHorizontal, Volume2, VolumeX,
  Sparkles, Disc, Image as ImageIcon, Download, Plus, ListMusic, Trash2
} from 'lucide-react';
import Visualizer from './Visualizer';
import VinylScratch from './VinylScratch';
import AuraMode from './AuraMode';
import AddToPlaylistModal from './AddToPlaylistModal';

interface NowPlayingScreenProps {
  onClose: () => void;
}

const LyricsCard: React.FC<{ artist: string, title: string }> = ({ artist, title }) => {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    setLyrics(null);
    setError(false);
    setSource('');

    const cleanArtist = (artist || '').split(',')[0].replace(/feat\.?.*/i, '').trim();
    const cleanTitle  = (title  || '').replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();

    if (!cleanArtist || cleanArtist.toLowerCase() === 'unknown artist') {
      setError(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const tryLrcLib = () =>
      fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(cleanArtist + ' ' + cleanTitle)}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          const hit = data?.find((d: any) => d.plainLyrics) ?? data?.[0];
          if (hit?.plainLyrics) return { text: hit.plainLyrics, src: 'lrclib' };
          if (hit?.syncedLyrics) {
            // strip timestamps like [01:23.45]
            const stripped = hit.syncedLyrics.replace(/\[\d+:\d+\.\d+\]/g, '').trim();
            if (stripped) return { text: stripped, src: 'lrclib' };
          }
          throw new Error('empty');
        });

    const tryLyricsOvh = () =>
      fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          if (data?.lyrics) return { text: data.lyrics.trim(), src: 'lyrics.ovh' };
          throw new Error('empty');
        });

    const tryLrcLibByTrack = () =>
      fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(cleanArtist)}&track_name=${encodeURIComponent(cleanTitle)}`)
        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
        .then(data => {
          if (data?.plainLyrics) return { text: data.plainLyrics, src: 'lrclib' };
          if (data?.syncedLyrics) {
            const stripped = data.syncedLyrics.replace(/\[\d+:\d+\.\d+\]/g, '').trim();
            if (stripped) return { text: stripped, src: 'lrclib' };
          }
          throw new Error('empty');
        });

    // Chain: lrclib search → lrclib direct get → lyrics.ovh
    tryLrcLib()
      .catch(() => tryLrcLibByTrack())
      .catch(() => tryLyricsOvh())
      .then(result => {
        if (cancelled) return;
        setLyrics(result.text);
        setSource(result.src);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [artist, title]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 100%)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '28px 24px',
      marginTop: '32px',
      marginBottom: '32px',
      minHeight: '200px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Lyrics</h3>
        {source && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px' }}>{source}</span>}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 0.7, 0.9, 0.6, 0.8].map((w, i) => (
            <div key={i} style={{
              height: '18px', borderRadius: '9px',
              background: `rgba(255,255,255,0.1)`,
              width: `${w * 100}%`,
              animation: 'shimmer 1.5s infinite',
              animationDelay: `${i * 0.1}s`,
            }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎵</div>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Lyrics not found</p>
          <p style={{ margin: '8px 0 0', fontSize: '13px', lineHeight: 1.5, opacity: 0.7 }}>
            This track isn't in our lyrics database yet.<br/>Try a different song.
          </p>
        </div>
      ) : lyrics ? (
        <div style={{
          fontSize: '22px',
          fontWeight: 700,
          lineHeight: 1.7,
          color: 'white',
          whiteSpace: 'pre-wrap',
          fontFamily: 'inherit',
        }}>
          {lyrics}
        </div>
      ) : null}
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

        {/* Lyrics Card (Always shown so user can scroll down to it) */}
        <LyricsCard artist={currentSong.artist} title={currentSong.title} />
      </div>
      
      {showAddModal && <AddToPlaylistModal song={currentSong} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

export default NowPlayingScreen;
