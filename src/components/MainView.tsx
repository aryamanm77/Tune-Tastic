import React, { useState, useMemo, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { Play, MoreHorizontal, Plus, Download, Check, Loader, Trash2, X, Edit3, User } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';
import AddToPlaylistModal from './AddToPlaylistModal';

const MainView: React.FC = () => {
  const { songs, currentSong, playSong, togglePlayPause, createPlaylist, recentlyPlayed, removeFromRecentlyPlayed, downloadedSongs, downloadProgress, downloadSong, userName, setUserName, setIsNameModalOpen } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [activeArtist, setActiveArtist] = useState<string>('All');
  const [deleteRecentSong, setDeleteRecentSong] = useState<Song | null>(null);
  const longPressTimerRef = useRef<any>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName || '');
  const [liveGreeting, setLiveGreeting] = useState<string>(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return 'Good morning';
    if (hr >= 12 && hr < 17) return 'Good afternoon';
    if (hr >= 17 && hr < 22) return 'Good evening';
    return 'Good night';
  });

  React.useEffect(() => {
    const updateGreeting = () => {
      const hr = new Date().getHours();
      if (hr >= 5 && hr < 12) setLiveGreeting('Good morning');
      else if (hr >= 12 && hr < 17) setLiveGreeting('Good afternoon');
      else if (hr >= 17 && hr < 22) setLiveGreeting('Good evening');
      else setLiveGreeting('Good night');
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
      <div className="show-mobile" style={{ display: 'none', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <TuneTasticLogo size={44} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{
            fontSize: '22px',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #1db954 0%, #1ed760 50%, #4ade80 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}>TuneTastic</span>
        </div>
      </div>

      {/* Live Greeting with Name Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        padding: '18px 24px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '20px',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0 }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #1db954 0%, #10b981 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', boxShadow: '0 0 20px rgba(29, 185, 84, 0.4)',
            color: 'white', fontWeight: 800, flexShrink: 0
          }}>
            {userName ? userName[0].toUpperCase() : <User size={22} />}
          </div>

          <div style={{ minWidth: 0 }}>
            {isEditingName ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (tempName.trim()) {
                    setUserName(tempName.trim());
                  }
                  setIsEditingName(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
              >
                <span style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{liveGreeting},</span>
                <input
                  type="text"
                  value={tempName}
                  autoFocus
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Your name..."
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: 'var(--spotify-green)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1.5px solid var(--spotify-green)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    outline: 'none',
                    width: '180px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'var(--spotify-green)',
                    color: 'black',
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Check size={14} strokeWidth={3} /> Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={14} />
                </button>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1
                    onClick={() => setIsNameModalOpen(true)}
                    title="Click to edit your name"
                    style={{
                      margin: 0,
                      fontSize: '26px',
                      fontWeight: 800,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>{liveGreeting}{userName ? `, ${userName}` : ''}</span>
                    <span style={{ fontSize: '24px' }}>👋</span>
                  </h1>

                  {/* Change/Set Name Button */}
                  <button
                    type="button"
                    onClick={() => setIsNameModalOpen(true)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: 'rgba(255, 255, 255, 0.85)',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                    }}
                  >
                    <Edit3 size={13} />
                    <span>{userName ? 'Change Name' : 'Set Name'}</span>
                  </button>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.55)' }}>
                  Welcome back to your music sanctuary
                </p>
              </div>
            )}
          </div>
        </div>
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

      {/* Mobile FAB – Create Playlist */}
      <button
        className="show-mobile"
        onClick={() => setCreatingPlaylist(true)}
        style={{
          display: 'none',
          position: 'fixed', bottom: '144px', right: '20px',
          width: '52px', height: '52px', borderRadius: '50%',
          background: 'var(--spotify-green)', color: 'black',
          boxShadow: '0 4px 16px rgba(29,185,84,0.5)',
          border: 'none', cursor: 'pointer', zIndex: 200,
          alignItems: 'center', justifyContent: 'center',
        }}
        aria-label="Create Playlist"
      >
        <Plus size={24} />
      </button>

      {/* Mobile create-playlist dialog */}
      {creatingPlaylist && (
        <>
          <div onClick={() => setCreatingPlaylist(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#282828', borderRadius: '16px 16px 0 0', padding: '24px 20px 40px', zIndex: 9999 }}>
            <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '18px', color: 'white' }}>New Playlist</p>
            <input
              autoFocus
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && newPlaylistName.trim()) {
                  createPlaylist(newPlaylistName.trim());
                  setCreatingPlaylist(false);
                  setNewPlaylistName('');
                }
              }}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setCreatingPlaylist(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: '15px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => { if (newPlaylistName.trim()) { createPlaylist(newPlaylistName.trim()); setCreatingPlaylist(false); setNewPlaylistName(''); } }}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'var(--spotify-green)', border: 'none', color: 'black', fontWeight: 700, fontSize: '15px', cursor: 'pointer' }}
              >Create</button>
            </div>
          </div>
        </>
      )}

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </div>
  );
};

export default MainView;
