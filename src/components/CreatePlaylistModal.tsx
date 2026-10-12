import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { PlusSquare, X } from 'lucide-react';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onClose, onCreated }) => {
  const { createPlaylist } = usePlayer();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      const newPl = createPlaylist(trimmed);
      if (onCreated && newPl?.id) {
        onCreated(newPl.id);
      }
      onClose();
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99998,
          animation: 'fadeIn 0.2s ease',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '480px',
          margin: '0 auto',
          background: '#1e1e24',
          borderRadius: '20px 20px 0 0',
          padding: '24px 20px 36px',
          zIndex: 99999,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'var(--spotify-green)', color: 'black',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <PlusSquare size={18} strokeWidth={2.5} />
            </div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '18px', color: 'white' }}>Create New Playlist</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '30px', height: '30px',
              color: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            placeholder="My Awesome Playlist..."
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid var(--spotify-green)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 600,
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '18px',
            }}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '100px',
                background: name.trim() ? 'var(--spotify-green)' : 'rgba(255,255,255,0.2)',
                border: 'none',
                color: name.trim() ? 'black' : 'rgba(255,255,255,0.4)',
                fontWeight: 800,
                fontSize: '14px',
                cursor: name.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreatePlaylistModal;
