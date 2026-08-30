import React, { useState } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import { Play, MoreHorizontal, Plus } from 'lucide-react';
import TuneTasticLogo from './TuneTasticLogo';
import AddToPlaylistModal from './AddToPlaylistModal';

const MainView: React.FC = () => {
  const { songs, currentSong, playSong, togglePlayPause, createPlaylist, recentlyPlayed } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

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

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: '22px', fontWeight: 700 }}>Recently Played</h2>
          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
            {recentlyPlayed.slice(0, 10).map((song: Song) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`recent-${song.id}`}
                  onClick={() => handlePlay(song)}
                  style={{
                    flexShrink: 0,
                    width: '140px',
                    cursor: 'pointer',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: isCurrent ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.05)',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                  onMouseOut={e => { if (!isCurrent) (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                >
                  <div style={{ position: 'relative', marginBottom: '10px' }}>
                    <img
                      src={song.coverArt || getCoverArtUrl(song.audioId)}
                      onError={e => { e.currentTarget.src = '/logo.png'; }}
                      alt={song.title}
                      style={{ width: '116px', height: '116px', borderRadius: '6px', objectFit: 'cover', display: 'block' }}
                    />
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

      <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>All Music</h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingBottom: '40px',
      }} className="library-list">
        {songs.map((song, index) => {
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
                  onError={e => { e.currentTarget.src = '/logo.png'; }}
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
              {/* Three-dot menu */}
              <button
                onClick={e => { e.stopPropagation(); setModalSong(song); }}
                style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
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
          position: 'fixed', bottom: '84px', right: '20px',
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
