import React, { useState, useEffect } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import MainView from './components/MainView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import PlaylistView from './components/PlaylistView';
import BottomNav from './components/BottomNav';
import DJView from './components/DJView';
import ItunesSearchView from './components/ItunesSearchView';
import NebulaBackground from './components/NebulaBackground';
import DownloadsView from './components/DownloadsView';
import UploadsView from './components/UploadsView';
import { VIDEO_CATEGORIES } from './data/videoCategories';
import UserNameModal from './components/UserNameModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'premium' | 'library' | 'playlist' | 'dj' | 'downloads' | 'uploads'>('home');
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const { djState } = usePlayer();

  const isVideoActive = Boolean(djState.themeBackground && djState.themeBackground !== 'none' && !djState.nebulaMode);
  const activeCategory = VIDEO_CATEGORIES.find(c => c.id === djState.themeBackground) || VIDEO_CATEGORIES[0];
  const activeVideoUrl = activeCategory?.videoUrl || VIDEO_CATEGORIES[0].videoUrl;
  const activeYoutubeId = activeCategory?.youtubeId || VIDEO_CATEGORIES[0].youtubeId;
  const videoSourceMode = djState.videoSourceMode || 'youtube';

  const [isYtReady, setIsYtReady] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    setIsYtReady(false);
  }, [activeYoutubeId, videoSourceMode]);

  useEffect(() => {
    // Clear all existing theme and video classes
    const classesToRemove = Array.from(document.body.classList).filter(c => c.startsWith('theme-') || c === 'video-bg-active' || c === 'nebula-active');
    classesToRemove.forEach(c => document.body.classList.remove(c));
    
    // Add active theme classes
    if (djState.nebulaMode) {
      document.body.classList.add('nebula-active');
    } else if (isVideoActive) {
      document.body.classList.add('video-bg-active');
      if (djState.themeBackground) {
        document.body.classList.add(`theme-${djState.themeBackground}`);
      }
    }
  }, [djState.nebulaMode, djState.themeBackground, isVideoActive]);

  const navigateToPlaylist = (id: string) => {
    setActivePlaylistId(id);
    setActiveTab('playlist');
  };

  return (
    <>
      {/* Real Video Background Across Entire App (Home and All Rooms) */}
      {isVideoActive && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {/* Instant Video Loop: Plays immediately without loading, supports offline / without internet */}
          <video
            key={activeVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              opacity: (videoSourceMode === 'youtube' && isOnline && isYtReady) ? 0 : 0.95,
              filter: 'brightness(0.92) contrast(1.08)',
              transition: 'opacity 0.6s ease',
            }}
          >
            <source src={activeVideoUrl} type={activeVideoUrl.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>

          {/* YouTube 4K Stream (No YouTube buttons visible - cropped 130% with overflow hidden) */}
          {videoSourceMode === 'youtube' && isOnline && activeYoutubeId && (
            <div
              style={{
                position: 'absolute',
                top: '-15%',
                left: '-15%',
                width: '130%',
                height: '130%',
                pointerEvents: 'none',
                overflow: 'hidden',
                opacity: isYtReady ? 0.95 : 0,
                transition: 'opacity 0.6s ease',
              }}
            >
              <iframe
                key={activeYoutubeId}
                src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${activeYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`}
                title="Ambient Background Video"
                allow="autoplay; encrypted-media"
                onLoad={() => setIsYtReady(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  pointerEvents: 'none',
                  filter: 'brightness(0.92) contrast(1.08)',
                }}
              />
            </div>
          )}

          {/* Subtle contrast overlay for 100% crisp readability */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.36) 100%)',
            }}
          />
        </div>
      )}
      <NebulaBackground />
      <div className="app-container" style={{ position: 'relative', zIndex: 10 }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenPlaylist={navigateToPlaylist} />
      
      {activeTab === 'home' && <MainView />}
      {activeTab === 'search' && <SearchView />}
      {activeTab === 'library' && <LibraryView onOpenPlaylist={navigateToPlaylist} onOpenUploads={() => setActiveTab('uploads')} />}
      {activeTab === 'playlist' && <PlaylistView playlistId={activePlaylistId} goHome={() => setActiveTab('home')} />}
      {activeTab === 'dj' && <DJView />}
      {activeTab === 'premium' && <ItunesSearchView />}
      {activeTab === 'downloads' && <DownloadsView />}
      {activeTab === 'uploads' && <UploadsView />}
      
      <Player />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <UserNameModal />
    </div>
    </>
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
