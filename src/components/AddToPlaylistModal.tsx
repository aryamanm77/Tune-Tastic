/**
 * AddToPlaylistModal.tsx
 * -------------------------------------------------------
 * Spotify-style sheet/modal for liking a song and adding
 * it to any playlist. Works on both mobile and desktop.
 */
import React, { useState } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Heart, Plus, ListMusic, Check, X } from 'lucide-react';

interface AddToPlaylistModalProps {
  song: Song;
  onClose: () => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({ song, onClose }) => {
  const { playlists, createPlaylist, addToPlaylist, toggleLike, isLiked } = usePlayer();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  const liked = isLiked(song.id);

  const handleAddTo = (playlistId: string) => {
    addToPlaylist(playlistId, song);
    setAdded(playlistId);
    setTimeout(() => setAdded(null), 1500);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    // find the newly created playlist and add the song
    setTimeout(() => {
      const latest = JSON.parse(localStorage.getItem('tunetastic_playlists') || '[]');
      const newest = latest[latest.length - 1];
      if (newest) handleAddTo(newest.id);
    }, 50);
    setCreating(false);
    setNewName('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 9998,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 9999,
        background: '#282828',
        borderRadius: '16px 16px 0 0',
        padding: '0 0 env(safe-area-inset-bottom)',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
        animation: 'slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          .apt-row {
            display: flex; align-items: center; gap: 14px;
            padding: 14px 20px; cursor: pointer;
            transition: background 0.15s;
            border: none; background: transparent;
            width: 100%; text-align: left; color: white;
          }
          .apt-row:hover, .apt-row:active { background: rgba(255,255,255,0.08); }
        `}</style>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '4px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Song info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {song.coverArt && (
            <img src={song.coverArt} alt="" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: '15px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.title}</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{song.artist}</p>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Like */}
        <button className="apt-row" onClick={() => toggleLike(song)}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: liked ? 'rgba(255,45,85,0.2)' : 'rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Heart size={20} fill={liked ? '#FF2D55' : 'none'} color={liked ? '#FF2D55' : 'white'} />
          </div>
          <span style={{ fontSize: '15px', fontWeight: 500 }}>{liked ? 'Remove from Liked Songs' : 'Like'}</span>
          {liked && <Check size={16} color="var(--spotify-green)" style={{ marginLeft: 'auto' }} />}
        </button>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />

        <p style={{ padding: '12px 20px 4px', margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
          Add to playlist
        </p>

        {/* Create new playlist */}
        {creating ? (
          <div style={{ padding: '12px 20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              autoFocus
              placeholder="Playlist name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: 'white', fontSize: '15px', outline: 'none',
              }}
            />
            <button onClick={handleCreate} style={{ padding: '10px 16px', borderRadius: '8px', background: 'var(--spotify-green)', color: 'black', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '14px' }}>
              Create
            </button>
          </div>
        ) : (
          <button className="apt-row" onClick={() => setCreating(true)}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="white" />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Create new playlist</span>
          </button>
        )}

        {/* Existing playlists */}
        {playlists.map(p => {
          const isInPlaylist = p.songs.some(s => s.id === song.id);
          const justAdded = added === p.id;
          return (
            <button key={p.id} className="apt-row" onClick={() => !isInPlaylist && handleAddTo(p.id)}>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', flexShrink: 0, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {p.coverArt
                  ? <img src={p.coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <ListMusic size={18} color="rgba(255,255,255,0.5)" />
                }
              </div>
              <span style={{ fontSize: '15px', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              {(isInPlaylist || justAdded) && <Check size={16} color="var(--spotify-green)" style={{ flexShrink: 0 }} />}
            </button>
          );
        })}

        <div style={{ height: '24px' }} />
      </div>
    </>
  );
};

export default AddToPlaylistModal;
