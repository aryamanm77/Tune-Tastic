import React, { useState } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MainView from './components/MainView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import BottomNav from './components/BottomNav';
import DJView from './components/DJView';
import ItunesSearchView from './components/ItunesSearchView';
import SacredGeometry from './components/SacredGeometry';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'premium' | 'library' | 'playlist' | 'dj'>('home');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  const navigateToPlaylist = (id: string) => {
    setActivePlaylistId(id);
    setActiveTab('playlist');
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenPlaylist={navigateToPlaylist} />
      
      {activeTab === 'home' && <MainView />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'library' && <LibraryView onOpenPlaylist={navigateToPlaylist} />}
      {activeTab === 'playlist' && <PlaylistView playlistId={activePlaylistId} goHome={() => setActiveTab('home')} />}
      {activeTab === 'dj' && <DJView />}
      {activeTab === 'premium' && <ItunesSearchView />}
      
      <Player />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <SacredGeometry />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
};

export default App;
