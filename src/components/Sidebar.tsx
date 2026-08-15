import React from 'react';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          <Home size={24} /> Home
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          <Search size={24} /> Search
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          <Library size={24} /> Your Library
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          <div style={{ background: '#b3b3b3', color: 'black', padding: '4px', borderRadius: '2px' }}>
            <PlusSquare size={16} />
          </div>
          Create Playlist
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', fontWeight: 'bold' }}>
          <div style={{ background: 'linear-gradient(135deg, #450af5, #c4efd9)', color: 'white', padding: '4px', borderRadius: '2px' }}>
            <Heart size={16} />
          </div>
          Liked Songs
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: '16px', borderTop: '1px solid #282828', paddingTop: '16px' }}>
        {/* Placeholder for playlists */}
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>My Playlist #1</p>
      </div>
    </div>
  );
};

export default Sidebar;
