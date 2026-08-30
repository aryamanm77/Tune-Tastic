import React from 'react';
import { Home, Search, Library, Sliders, Sparkles, Hexagon } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'playlist' | 'dj' | 'premium' | 'astral') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bottom-nav">
      <button 
        className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
      >
        <Home size={24} />
        <span>Home</span>
      </button>
      
      <button 
        className={`bottom-nav-item ${activeTab === 'search' ? 'active' : ''}`}
        onClick={() => setActiveTab('search')}
      >
        <Search size={24} />
        <span>Local</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'premium' ? 'active' : ''}`}
        onClick={() => setActiveTab('premium')}
        style={{ color: activeTab === 'premium' ? '#FF2D55' : undefined }}
      >
        <Sparkles size={24} />
        <span>Premium</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'library' || activeTab === 'playlist' ? 'active' : ''}`}
        onClick={() => setActiveTab('library')}
      >
        <Library size={24} />
        <span>Library</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'dj' ? 'active' : ''}`}
        onClick={() => setActiveTab('dj')}
      >
        <Sliders size={24} />
        <span>DJ Studio</span>
      </button>

      <button 
        className={`bottom-nav-item ${activeTab === 'astral' ? 'active' : ''}`}
        onClick={() => setActiveTab('astral')}
      >
        <Hexagon size={24} />
        <span>Astral</span>
      </button>
    </div>
  );
};

export default BottomNav;
