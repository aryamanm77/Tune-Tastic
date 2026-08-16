import React from 'react';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import TuneTasticLogo from './TuneTasticLogo';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'playlist') => void;
  onOpenPlaylist: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenPlaylist }) => {
  const { createPlaylist, playlists } = usePlayer();

  const handleCreatePlaylist = () => {
    const name = prompt("Enter a name for your new playlist:");
    if (name && name.trim()) {
      createPlaylist(name.trim());
    }
  };

  return (
    <div className="sidebar hide-mobile">
      {/* Animated Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <TuneTasticLogo size={40} />
        <span style={{
          fontSize: '20px',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #1db954, #1ed760)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          TuneTastic
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
        <button 
          onClick={() => setActiveTab('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold', color: activeTab === 'home' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <Home size={24} /> Home
        </button>
        <button 
          onClick={() => setActiveTab('search')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold', color: activeTab === 'search' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <Search size={24} /> Search
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold', color: activeTab === 'library' ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          <Library size={24} /> Your Library
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <button 
          onClick={handleCreatePlaylist}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}
        >
          <div style={{ background: '#b3b3b3', color: 'black', padding: '4px', borderRadius: '2px' }}>
            <PlusSquare size={16} />
          </div>
          Create Playlist
        </button>
        <button 
          onClick={() => onOpenPlaylist('liked')}
          style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}
        >
          <div style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', color: 'white', padding: '4px', borderRadius: '2px' }}>
            <Heart size={16} />
          </div>
          Liked Songs
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', borderTop: '1px solid #282828', paddingTop: '16px' }}>
        {playlists.map(playlist => (
          <button 
            key={playlist.id}
            onClick={() => onOpenPlaylist(playlist.id)}
            style={{ fontSize: '14px', display: 'block', marginBottom: '12px', textAlign: 'left', width: '100%' }}
            className="ellipsis"
          >
            {playlist.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
