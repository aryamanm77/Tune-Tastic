import React from 'react';
import { usePlayer, Playlist } from '../context/PlayerContext';
import { Heart, Music, UploadCloud, ListMusic, Plus } from 'lucide-react';

interface LibraryViewProps {
  onOpenPlaylist: (id: string) => void;
  onOpenUploads: () => void;
  onCreatePlaylist?: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onOpenPlaylist, onOpenUploads, onCreatePlaylist }) => {
  const { playlists, likedSongs, queue, djState } = usePlayer();

  const cardStyle: React.CSSProperties = {
    background: djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)',
    backdropFilter: djState?.nebulaMode ? 'blur(12px)' : 'none',
    WebkitBackdropFilter: djState?.nebulaMode ? 'blur(12px)' : 'none',
    border: '1px solid rgba(255, 255, 255, 0.07)',
    padding: '16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
  };

  return (
    <div className="main-view" style={{ padding: '24px', background: 'transparent' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: '0 0 6px 0', fontSize: '32px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
          Your Library
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
          Your saved music, local uploads, queue, and custom playlists
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '20px',
      }} className="library-grid">

        {/* Create Playlist Card */}
        {onCreatePlaylist && (
          <div 
            style={cardStyle}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(29,185,84,0.12)';
              e.currentTarget.style.borderColor = 'var(--spotify-green)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.07)';
              e.currentTarget.style.transform = 'none';
            }}
            onClick={onCreatePlaylist}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '8px',
              marginBottom: '12px',
              background: 'linear-gradient(135deg, rgba(29,185,84,0.2) 0%, rgba(29,185,84,0.06) 100%)',
              border: '2px dashed rgba(29,185,84,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'var(--spotify-green)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(29,185,84,0.35)',
              }}>
                <Plus size={28} strokeWidth={2.8} />
              </div>
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'white' }} className="ellipsis">
              New Playlist
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Create and add songs
            </p>
          </div>
        )}
        
        {/* Liked Songs Card */}
        <div 
          style={cardStyle}
          onMouseEnter={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-highlight)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)';
            e.currentTarget.style.transform = 'none';
          }}
          onClick={() => onOpenPlaylist('liked')}
        >
          <div style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #450af5 0%, #8e2de2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(69, 10, 245, 0.3)',
          }}>
            <Heart size={48} color="white" fill="white" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'white' }} className="ellipsis">
            Liked Songs
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {likedSongs.length} {likedSongs.length === 1 ? 'song' : 'songs'}
          </p>
        </div>

        {/* My Uploads Card */}
        <div 
          style={cardStyle}
          onMouseEnter={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-highlight)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)';
            e.currentTarget.style.transform = 'none';
          }}
          onClick={onOpenUploads}
        >
          <div style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ff8c00 0%, #ff512f 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(255, 140, 0, 0.3)',
          }}>
            <UploadCloud size={48} color="white" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'white' }} className="ellipsis">
            My Uploads
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Local audio files
          </p>
        </div>

        {/* Queue Card */}
        <div 
          style={cardStyle}
          onMouseEnter={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-highlight)';
            e.currentTarget.style.transform = 'translateY(-3px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)';
            e.currentTarget.style.transform = 'none';
          }}
          onClick={() => onOpenPlaylist('queue')}
        >
          <div style={{
            width: '100%',
            aspectRatio: '1',
            borderRadius: '8px',
            marginBottom: '12px',
            background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(255, 65, 108, 0.3)',
          }}>
            <ListMusic size={48} color="white" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'white' }} className="ellipsis">
            Current Queue
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {queue && queue.length > 0 ? `${queue.length} ${queue.length === 1 ? 'song' : 'songs'} queued` : 'Empty queue'}
          </p>
        </div>

        {/* Custom Playlists */}
        {playlists.map((playlist: Playlist) => (
          <div 
            key={playlist.id}
            style={cardStyle}
            onMouseEnter={e => {
              e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-highlight)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = djState?.nebulaMode ? 'rgba(255, 255, 255, 0.05)' : 'var(--bg-card)';
              e.currentTarget.style.transform = 'none';
            }}
            onClick={() => onOpenPlaylist(playlist.id)}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1',
              backgroundColor: '#282828',
              borderRadius: '8px',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            }}>
              {playlist.coverArt ? (
                <img src={playlist.coverArt} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Music size={48} color="#b3b3b3" />
              )}
            </div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px', color: 'white' }} className="ellipsis">
              {playlist.name}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {playlist.songs.length} {playlist.songs.length === 1 ? 'song' : 'songs'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LibraryView;
