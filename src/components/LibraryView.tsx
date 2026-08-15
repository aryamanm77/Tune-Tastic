import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Music } from 'lucide-react';

interface LibraryViewProps {
  onOpenPlaylist: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenPlaylist }) => {
  const { playlists, likedSongs } = usePlayer();

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Your Library</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '24px'
      }} className="library-grid">
        
        {/* Liked Songs Tile */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #450af5, #c4efd9)',
            padding: '24px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            aspectRatio: '1',
            position: 'relative',
            overflow: 'hidden'
          }}
          onClick={() => onOpenPlaylist('liked')}
        >
          <Heart size={64} style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.1, color: 'white' }} />
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px', color: 'white' }}>Liked Songs</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>{likedSongs.length} liked songs</p>
          </div>
        </div>

        {/* Custom Playlists */}
        {playlists.map(playlist => (
          <div 
            key={playlist.id}
            style={{
              backgroundColor: 'var(--bg-card)',
              padding: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'var(--bg-highlight)'}
            onMouseOut={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onClick={() => onOpenPlaylist(playlist.id)}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#282828',
              borderRadius: '4px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {playlist.coverArt ? (
                <img src={playlist.coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Music size={48} color="#b3b3b3" />
              )}
            </div>
            <h3 style={{ fontSize: '16px', marginBottom: '4px' }} className="ellipsis">{playlist.name}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{playlist.songs.length} songs</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
