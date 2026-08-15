import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, VolumeX, Heart, ListMusic, MonitorSpeaker } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';

const Player: React.FC = () => {
  const { 
    currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode,
    togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat
  } = usePlayer();

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="player-bar">
      
      {/* Left: Song Info */}
      <div style={{ width: '30%', display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentSong ? (
          <>
            <img 
              src={getCoverArtUrl(currentSong.audioId)} 
              onError={(e) => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
              alt={currentSong.title}
              style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }} className="ellipsis">
                {currentSong.title}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }} className="ellipsis">
                {currentSong.artist}
              </span>
            </div>
            <button style={{ marginLeft: '8px' }}><Heart size={16} /></button>
          </>
        ) : null}
      </div>

      {/* Center: Controls & Progress */}
      <div style={{ width: '40%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button onClick={toggleShuffle} style={{ color: isShuffled ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
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
          <button onClick={cycleRepeat} style={{ color: repeatMode !== 'none' ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
            <Repeat size={16} />
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '600px' }}>
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

      {/* Right: Volume & Extras */}
      <div style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
        <button><ListMusic size={16} /></button>
        <button><MonitorSpeaker size={16} /></button>
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
