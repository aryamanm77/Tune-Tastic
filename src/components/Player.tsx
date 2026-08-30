import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart, Timer, X } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';

const SLEEP_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

const Player: React.FC = () => {
  const { 
    currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode,
    togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat,
    toggleLike, isLiked, clearSong
  } = usePlayer();

  const [touchStartX, setTouchStartX] = useState(0);

  // ─── Sleep Timer ──────────────────────────────────────────────
  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepSecondsLeft, setSleepSecondsLeft] = useState<number | null>(null);
  const sleepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSleepTimer = (minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepMinutes(minutes);
    const totalSecs = minutes * 60;
    setSleepSecondsLeft(totalSecs);
    sleepTimerRef.current = setInterval(() => {
      setSleepSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current!);
          // Pause playback
          if (isPlaying) togglePlayPause();
          setSleepMinutes(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    setShowSleepMenu(false);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    setSleepMinutes(null);
    setSleepSecondsLeft(null);
  };

  useEffect(() => {
    return () => { if (sleepTimerRef.current) clearInterval(sleepTimerRef.current); };
  }, []);

  // ─── Keyboard Shortcuts ───────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't fire if user is typing in an input/textarea
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentSong) togglePlayPause();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); nextSong(); }
          else if (currentSong) { e.preventDefault(); seekTo(Math.min(1, progress + 0.05)); }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) { e.preventDefault(); prevSong(); }
          else if (currentSong) { e.preventDefault(); seekTo(Math.max(0, progress - 0.05)); }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'KeyM':
          setVolume(volume > 0 ? 0 : 1);
          break;
        case 'KeyS':
          if (e.shiftKey) toggleShuffle();
          break;
        case 'KeyR':
          cycleRepeat();
          break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentSong, isPlaying, progress, volume, togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!currentSong) return;
    const touchEndX = e.changedTouches[0].clientX;
    if (Math.abs(touchEndX - touchStartX) > 100) clearSong();
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const formatSleepLeft = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => seekTo(parseFloat(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => setVolume(parseFloat(e.target.value));

  return (
    <div 
      className="player-bar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ display: currentSong ? 'flex' : 'none' }}
    >
      
      {/* Left: Song Info */}
      <div style={{ width: '30%', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentSong ? (
          <>
            <img 
              src={currentSong.coverArt || getCoverArtUrl(currentSong.audioId)} 
              onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              alt={currentSong.title}
              style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }} className="ellipsis">
                {currentSong.title}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="ellipsis">
                {currentSong.artist}
              </span>
            </div>
            <button 
              style={{ marginLeft: '8px', color: isLiked(currentSong.id) ? 'var(--spotify-green)' : 'var(--text-secondary)' }}
              onClick={() => toggleLike(currentSong)}
            >
              <Heart size={16} fill={isLiked(currentSong.id) ? 'currentColor' : 'none'} />
            </button>
          </>
        ) : null}
      </div>

      {/* Center: Controls & Progress */}
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }} className="player-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={toggleShuffle} className="hide-mobile" style={{ color: isShuffled ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
            <Shuffle size={16} />
          </button>
          <button onClick={prevSong}><SkipBack size={20} /></button>
          <button 
            onClick={togglePlayPause}
            style={{ 
              background: 'white', color: 'black', borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" style={{ marginLeft: '2px' }} />}
          </button>
          <button onClick={nextSong}><SkipForward size={20} /></button>
          <button onClick={cycleRepeat} className="hide-mobile" style={{ color: repeatMode !== 'none' ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
            <Repeat size={16} />
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '600px' }} className="player-progress">
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '40px', textAlign: 'right' }}>
            {formatTime(currentTime)}
          </span>
          <input 
            type="range" 
            min="0" max="1" step="0.001" 
            value={progress || 0}
            onChange={handleSeek}
            style={{ 
              width: '100%', height: '4px', WebkitAppearance: 'none', background: 'var(--text-secondary)', borderRadius: '2px', cursor: 'pointer' 
            }}
          />
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '40px' }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume, Sleep Timer & Extras */}
      <div style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }} className="player-volume">
        
        {/* Sleep Timer */}
        <div style={{ position: 'relative' }} className="hide-mobile">
          <button
            onClick={() => setShowSleepMenu(v => !v)}
            title="Sleep Timer"
            style={{ color: sleepMinutes !== null ? 'var(--spotify-green)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Timer size={16} />
            {sleepSecondsLeft !== null && (
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{formatSleepLeft(sleepSecondsLeft)}</span>
            )}
          </button>

          {showSleepMenu && (
            <div style={{
              position: 'absolute', bottom: '140%', right: 0,
              backgroundColor: '#282828', borderRadius: '8px',
              boxShadow: '0 16px 24px rgba(0,0,0,.4)', padding: '8px',
              zIndex: 999, minWidth: '160px',
            }}>
              <p style={{ margin: '0 0 8px 8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>SLEEP TIMER</p>
              {SLEEP_OPTIONS.map(m => (
                <button
                  key={m}
                  onClick={() => startSleepTimer(m)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px',
                    background: 'none', border: 'none', color: sleepMinutes === m ? 'var(--spotify-green)' : 'white',
                    cursor: 'pointer', fontSize: '14px', borderRadius: '4px',
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#333')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {m} minutes
                </button>
              ))}
              {sleepMinutes !== null && (
                <button
                  onClick={cancelSleepTimer}
                  style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px',
                    background: 'none', border: 'none', color: '#ff4d4d',
                    cursor: 'pointer', fontSize: '14px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    marginTop: '4px', borderTop: '1px solid #333',
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#333')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <X size={14} /> Cancel Timer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100px' }}>
          <button onClick={() => setVolume(volume > 0 ? 0 : 1)}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            value={volume}
            onChange={handleVolume}
            style={{ width: '100%', height: '4px', WebkitAppearance: 'none', background: 'var(--text-secondary)', borderRadius: '2px' }}
          />
        </div>
      </div>

    </div>
  );
};

export default Player;
