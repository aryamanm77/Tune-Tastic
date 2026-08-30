/**
 * NowPlayingScreen.tsx
 * Full-screen Spotify-style Now Playing view for mobile.
 * Opens when user taps the mini player bar.
 */
import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat,
  Heart, ChevronDown, MoreHorizontal, Volume2, VolumeX,
} from 'lucide-react';

interface NowPlayingScreenProps {
  onClose: () => void;
  onMoreOptions: () => void;
}

const NowPlayingScreen: React.FC<NowPlayingScreenProps> = ({ onClose, onMoreOptions }) => {
  const {
    currentSong, isPlaying, progress, currentTime, duration, volume,
    isShuffled, repeatMode,
    togglePlayPause, nextSong, prevSong, seekTo, setVolume,
    toggleShuffle, cycleRepeat, toggleLike, isLiked,
  } = usePlayer();

  const [touching, setTouching] = useState(false);

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
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '0 28px' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 'env(safe-area-inset-top, 16px)', marginTop: '16px' }}>
          <button onClick={onClose} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
            <ChevronDown size={28} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Now Playing</p>
          </div>
          <button onClick={onMoreOptions} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex' }}>
            <MoreHorizontal size={24} />
          </button>
        </div>

        {/* Album Art */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
          <img
            src={currentSong.coverArt || getCoverArtUrl(currentSong.audioId)}
            onError={e => {
              if (e.currentTarget.src.includes('600x600bb')) {
                e.currentTarget.src = e.currentTarget.src.replace('600x600bb', '100x100bb');
              } else {
                e.currentTarget.src = '/logo.png';
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
              transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onTouchStart={() => setTouching(true)}
            onTouchEnd={() => setTouching(false)}
          />
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
      </div>
    </div>
  );
};

export default NowPlayingScreen;
