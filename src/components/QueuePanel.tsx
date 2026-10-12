import React from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { X, Trash2 } from 'lucide-react';

interface QueuePanelProps {
  onClose: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ onClose }) => {
  const { queue, currentSong, playSong, setQueue, clearQueue, removeFromQueue, djState } = usePlayer() as any;

  const queuedSongs: Song[] = queue || [];

  const handlePlayQueued = (song: Song, index: number) => {
    if (setQueue) {
      setQueue(queuedSongs.slice(index + 1));
    }
    playSong(song);
  };

  const handleRemove = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (removeFromQueue) {
      removeFromQueue(songId);
    } else if (setQueue) {
      setQueue((prev: Song[]) => prev.filter(s => s.id !== songId));
    }
  };

  const handleClear = () => {
    if (clearQueue) {
      clearQueue();
    } else if (setQueue) {
      setQueue([]);
    }
  };

  const isNebula = djState?.nebulaMode;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: '90px',
      width: '320px',
      backgroundColor: isNebula ? 'rgba(18, 18, 24, 0.85)' : '#121212',
      backdropFilter: isNebula ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: isNebula ? 'blur(20px)' : 'none',
      borderLeft: isNebula ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #282828',
      zIndex: 500,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 20px 16px',
        borderBottom: '1px solid #282828',
      }}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Queue</h2>
        <button
          onClick={onClose}
          style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1, padding: '16px 0' }}>
        {/* Now Playing */}
        {currentSong && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', padding: '0 16px', marginBottom: '8px' }}>
              NOW PLAYING
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '8px 16px', backgroundColor: 'rgba(29,185,84,0.08)',
            }}>
              <img
                src={currentSong.coverArt || getCoverArtUrl(currentSong.audioId)}
                onError={e => { e.currentTarget.src = './logo.png'; }}
                alt={currentSong.title}
                style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--spotify-green)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.title}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queued Songs - strictly user-added */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', margin: 0 }}>
              QUEUED SONGS ({queuedSongs.length})
            </p>
            {queuedSongs.length > 0 && (
              <button
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                Clear all
              </button>
            )}
          </div>

          {queuedSongs.length > 0 ? (
            queuedSongs.map((song, i) => (
              <div key={`q-${song.id}-${i}`}
                onClick={() => handlePlayQueued(song, i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 16px', cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.15s',
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={song.coverArt || getCoverArtUrl(song.audioId)}
                    onError={e => { e.currentTarget.src = './logo.png'; }}
                    alt={song.title}
                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                </div>
                {/* Always-visible delete button */}
                <button
                  onClick={(e) => handleRemove(song.id, e)}
                  type="button"
                  title="Remove from queue"
                  style={{
                    background: 'rgba(255,75,75,0.12)',
                    border: '1px solid rgba(255,75,75,0.25)',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background 0.15s, transform 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,75,75,0.28)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,75,75,0.12)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Queue is empty</p>
              <p style={{ fontSize: '13px', margin: 0, opacity: 0.7 }}>Add songs to queue using the (•••) menu on any track</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QueuePanel;
