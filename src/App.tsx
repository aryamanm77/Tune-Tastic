import React from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MainView from './components/MainView';
import { PlayerProvider } from './context/PlayerContext';
import './index.css';

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <div className="app-container">
        <Sidebar />
        <MainView />
        <Player />
      </div>
    </PlayerProvider>
  );
};

export default App;
