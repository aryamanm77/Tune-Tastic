import React from 'react';
import { usePlayer, Playlist } from '../context/PlayerContext';
import { Heart, Music, UploadCloud, ListMusic, Plus } from 'lucide-react';

interface LibraryViewProps {
  onOpenPlaylist: (id: string) => void;
  onOpenUploads: () => void;
  onCreatePlaylist?: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenPlaylist, onOpenUploads, onCreatePlaylist }) => {
  const { playlists, likedSongs, queue } = usePlayer();

  return (
    <div className="main-view" style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Your Library</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '24px'
      }} className="library-grid">

        {/* Create Playlist Tile */}
        {onCreatePlaylist && (
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(29,185,84,0.15), rgba(29,185,84,0.04))',
              border: '2px dashed rgba(29,185,84,0.5)',
              padding: '24px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              aspectRatio: '1',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={e => {
              e.currentTarget.style.borderColor = 'var(--spotify-green)';
              e.currentTarget.style.background = 'rgba(29,185,84,0.22)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.borderColor = 'rgba(29,185,84,0.5)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(29,185,84,0.15), rgba(29,185,84,0.04))';
            }}
            onClick={onCreatePlaylist}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--spotify-green)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 4px 16px rgba(29,185,84,0.4)',
            }}>
              <Plus size={30} strokeWidth={2.8} />
            </div>
            <h2 style={{ fontSize: '20px', margin: '0 0 6px', color: 'white', fontWeight: 700 }}>New Playlist</h2>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Create and add songs</p>
          </div>
        )}
        
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

        {/* My Uploads Tile */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ff8c00, #ffb347)',
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
          onClick={onOpenUploads}
        >
          <UploadCloud size={64} style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.1, color: 'white' }} />
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px', color: 'white' }}>My Uploads</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>Local Music</p>
          </div>
        </div>

        {/* Room Queue Tile */}
        <div 
          style={{
            background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
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
          onClick={() => onOpenPlaylist('queue')}
        >
          <ListMusic size={64} style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.15, color: 'white' }} />
          <div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px', color: 'white' }}>Queue</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 'bold' }}>
              {queue && queue.length > 0 ? `${queue.length} ${queue.length === 1 ? 'song' : 'songs'} queued` : 'Empty (0 songs)'}
            </p>
          </div>
        </div>

        {/* Custom Playlists */}
        {playlists.map((playlist: Playlist) => (
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
