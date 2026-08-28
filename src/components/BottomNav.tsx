import React from 'react';
import { Home, Search, Library, Sliders } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: 'home' | 'search' | 'library' | 'playlist' | 'dj') => void;
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
        <span>Search</span>
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
    </div>
  );
};

export default BottomNav;
