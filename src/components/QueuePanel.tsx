import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { X, Play } from 'lucide-react';

interface QueuePanelProps {
  onClose: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ onClose }) => {
  const { queue, currentSong, playSong } = usePlayer();

  const currentIndex = queue.findIndex(s => s.id === currentSong?.id);
  const upNext = currentIndex >= 0 ? queue.slice(currentIndex + 1, currentIndex + 21) : queue.slice(0, 20);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: '90px',
      width: '320px',
      backgroundColor: '#121212',
      borderLeft: '1px solid #282828',
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
                onError={e => { e.currentTarget.src = '/logo.png'; }}
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

        {/* Up Next */}
        {upNext.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', padding: '0 16px', marginBottom: '8px' }}>
              NEXT UP
            </p>
            {upNext.map((song, i) => (
              <div
                key={`q-${song.id}-${i}`}
                onClick={() => playSong(song)}
                className="song-row"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '8px 16px', cursor: 'pointer',
                }}
                onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)')}
                onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={song.coverArt || getCoverArtUrl(song.audioId)}
                    onError={e => { e.currentTarget.src = '/logo.png'; }}
                    alt={song.title}
                    style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'background-color 0.2s',
                  }}
                    className="queue-play-overlay"
                  >
                    <Play size={16} fill="white" color="white" />
                  </div>
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {currentIndex + 1 + i + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        {upNext.length === 0 && !currentSong && (
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Queue is empty</p>
            <p style={{ fontSize: '14px' }}>Play a song to see what's next</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
