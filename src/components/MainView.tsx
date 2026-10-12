import React, { useState, useMemo, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { Play, MoreHorizontal, Download, Check, Loader, Trash2, X, User } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';
import AddToPlaylistModal from './AddToPlaylistModal';

const MainView: React.FC = () => {
  const { songs, currentSong, playSong, togglePlayPause, recentlyPlayed, removeFromRecentlyPlayed, downloadedSongs, downloadProgress, downloadSong, userName, setIsNameModalOpen } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [activeArtist, setActiveArtist] = useState<string>('All');
  const [deleteRecentSong, setDeleteRecentSong] = useState<Song | null>(null);
  const longPressTimerRef = useRef<any>(null);

  const [liveGreeting, setLiveGreeting] = useState<string>(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good morning';
    if (hr >= 12 && hr < 18) return 'Good afternoon';
    return 'Good evening';
  });

  React.useEffect(() => {
    const updateGreeting = () => {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 12) setLiveGreeting('Good morning');
      else if (hr >= 12 && hr < 18) setLiveGreeting('Good afternoon');
      else setLiveGreeting('Good evening');
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Build unique artist list from songs
  const artists = useMemo(() => {
    const unique = [...new Set(songs.map(s => s.artist).filter(a => a && a !== 'Unknown Artist'))];
    return unique.sort();
  }, [songs]);

  // Filtered songs
  const filteredSongs = useMemo(() => {
    if (activeArtist === 'All') return songs;
    return songs.filter(s => s.artist === activeArtist);
  }, [songs, activeArtist]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
    }
  };

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      {/* Mobile-only logo header */}
      <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <TuneTasticLogo size={38} />
        <span style={{
          fontSize: '20px',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #4ade80 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px',
        }}>TuneTastic</span>
      </div>

      {/* Real Spotify-Grade Greeting Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        gap: '16px',
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 800,
          letterSpacing: '-0.8px',
          margin: 0,
          color: '#ffffff',
          lineHeight: 1.15,
        }}>
          {liveGreeting}{userName ? `, ${userName}` : ''}
        </h1>

        {/* Minimalist Profile Pill */}
        <button
          type="button"
          onClick={() => setIsNameModalOpen(true)}
          title={userName ? `Profile: ${userName} (click to change)` : 'Set Profile Name'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '100px',
            padding: '4px 12px 4px 4px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: 'white',
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 100%)',
            color: '#000000',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {userName ? userName.trim()[0].toUpperCase() : <User size={15} strokeWidth={2.5} />}
          </div>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#ffffff',
            maxWidth: '120px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {userName || 'Profile'}
          </span>
        </button>
      </div>

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Recently Played</h2>
          </div>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {recentlyPlayed.slice(0, 10).map((song: Song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`recent-${song.id}`}
                  onClick={() => handlePlay(song)}
                  onTouchStart={() => {
                    longPressTimerRef.current = setTimeout(() => {
                      setDeleteRecentSong(song);
                    }, 500);
                  }}
                  onTouchEnd={() => {
                    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  }}
                  onTouchMove={() => {
                    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDeleteRecentSong(song);
                  }}
                  style={{
                    flexShrink: 0,
                    width: '140px',
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isCurrent ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.05)',
                    transition: 'background-color 0.2s',
                    position: 'relative',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                  }}
                  onMouseOver={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                  onMouseOut={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                >
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <img
                      src={song.coverArt || getCoverArtUrl(song.audioId)}
                      onError={e => { e.currentTarget.src = './logo.png'; }}
                      alt={song.title}
                      style={{ width: '116px', height: '116px', borderRadius: '6px', objectFit: 'cover', display: 'block' }}
                    />
                    
                    {/* Delete hover button on desktop */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRecentSong(song);
                      }}
                      title="Remove from Recently Played"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        padding: 0,
                        zIndex: 2,
                      }}
                    >
                      <X size={13} />
                    </button>

                    {isCurrent && (
                      <div style={{
                        position: 'absolute', bottom: '6px', right: '6px',
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: 'var(--spotify-green)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}>
                        <Play size={14} fill="black" color="black" style={{ marginLeft: '2px' }} />
                      </div>
                    )}
                  </div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.artist}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Recent Song Confirmation Modal */}
      {deleteRecentSong && (
        <div
          onClick={() => setDeleteRecentSong(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#242424',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.1)',
              textAlign: 'center',
              animation: 'popIn 0.2s ease-out',
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} color="#ef4444" />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: 'white' }}>Remove from Recents?</h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              Remove <strong style={{ color: 'white' }}>{deleteRecentSong.title}</strong> from your recently played history?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteRecentSong(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeFromRecentlyPlayed(deleteRecentSong.id);
                  setDeleteRecentSong(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '100px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter chips */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>All Music</h2>
          {activeArtist !== 'All' && (
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {filteredSongs.length} songs
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {['All', ...artists].map(artist => (
            <button
              key={artist}
              onClick={() => setActiveArtist(artist)}
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeArtist === artist ? 'var(--spotify-green)' : 'rgba(255,255,255,0.1)',
                color: activeArtist === artist ? 'black' : 'white',
              }}
            >
              {artist}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '40px',
      }} className="library-list">
        {filteredSongs.map((song, index) => {
          const isCurrent = currentSong?.id === song.id;
          return (
            <div
              key={`all-${song.id}`}
              onClick={() => handlePlay(song)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: isCurrent ? 'rgba(29, 185, 84, 0.15)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                gap: '16px'
              }}
              onMouseOver={e => {
                if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseOut={e => {
                if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
              }}
            >
              {/* Song Number / Play Icon (Optional, can just use cover) */}
              <div style={{ width: '20px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '14px' }}>
                {isCurrent ? <Play size={16} color="var(--spotify-green)" fill="var(--spotify-green)" /> : index + 1}
              </div>

              {/* Album Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={song.coverArt || getCoverArtUrl(song.audioId)}
                  onError={e => { e.currentTarget.src = './logo.png'; }}
                  alt={song.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <p style={{
                  fontWeight: 600, fontSize: '15px',
                  color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)',
                  margin: 0, marginBottom: '2px',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{song.title}</p>
                <p style={{
                  fontSize: '13px', color: 'var(--text-secondary)',
                  margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{song.artist !== 'Unknown Artist' ? song.artist : 'TuneTastic'}</p>
              </div>
              
              {/* Download Button */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  if (!downloadedSongs.has(song.id) && downloadProgress[song.id] === undefined) {
                    downloadSong(song);
                  }
                }}
                style={{ marginLeft: 'auto', marginRight: '8px', color: downloadedSongs.has(song.id) ? 'var(--spotify-green)' : 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: downloadedSongs.has(song.id) || downloadProgress[song.id] !== undefined ? 'default' : 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                aria-label="Download"
              >
                {downloadedSongs.has(song.id) ? (
                  <Check size={18} />
                ) : downloadProgress[song.id] !== undefined ? (
                  <Loader size={18} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Download size={18} />
                )}
              </button>

              {/* Three-dot menu */}
              <button
                onClick={e => { e.stopPropagation(); setModalSong(song); }}
                style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                aria-label="More options"
              >
                <MoreHorizontal size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </div>
  );
};

export default MainView;
