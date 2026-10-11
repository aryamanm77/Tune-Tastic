import React, { useState, useMemo } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Download, Trash2, MoreHorizontal } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

const DownloadsView: React.FC = () => {
  const { songs: allSongs, currentSong, isPlaying, playSong, togglePlayPause, downloadedSongs, downloadedSongList: ctxDownloadedList, deleteDownload } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);

  const downloadedSongList = useMemo(() => {
    const list = [...(ctxDownloadedList || [])];
    allSongs.forEach(song => {
      if (downloadedSongs.has(song.id) && !list.some(s => s.id === song.id)) {
        list.push(song);
      }
    });
    return list;
  }, [ctxDownloadedList, allSongs, downloadedSongs]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) togglePlayPause();
    else playSong(song, downloadedSongList);
  };

  const handlePlayAll = () => {
    if (downloadedSongList.length > 0) {
      playSong(downloadedSongList[0], downloadedSongList);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="main-view">
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        padding: '24px',
        background: 'linear-gradient(180deg, #1db954 0%, var(--bg-base) 100%)',
        paddingTop: '80px',
        paddingBottom: '24px'
      }} className="playlist-header">
        
        <div style={{
          width: '232px',
          height: '232px',
          backgroundColor: '#282828',
          boxShadow: '0 4px 60px rgba(0,0,0,.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }} className="playlist-cover">
          <Download size={80} color="white" />
        </div>
        
        <div>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Offline Storage</p>
          <h1 style={{ fontSize: '72px', margin: '8px 0', fontWeight: '900', lineHeight: 1 }} className="playlist-title ellipsis">Downloads</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{downloadedSongList.length} downloaded songs</p>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', marginTop: '16px' }}>
          <button 
            onClick={handlePlayAll}
            disabled={downloadedSongList.length === 0}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: downloadedSongList.length > 0 ? 'var(--spotify-green)' : '#555',
              border: 'none',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: downloadedSongList.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
            }}>
            <Play size={28} fill="black" style={{ marginLeft: '4px' }} />
          </button>

          {downloadedSongList.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all downloaded songs?')) {
                  downloadedSongList.forEach(s => deleteDownload(s.id));
                }
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#ff4d4d',
                padding: '10px 18px',
                borderRadius: '100px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
              }}
            >
              <Trash2 size={15} /> Clear All Downloads
            </button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Album</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
              <th style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal', width: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {downloadedSongList.map((song: Song, index: number) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <tr 
                  key={song.id}
                  className="song-row"
                  onClick={() => handlePlay(song)}
                >
                  <td className="hide-mobile" style={{ padding: '12px 16px', color: isCurrent ? 'var(--spotify-green)' : 'var(--text-secondary)' }}>
                    <div className="song-index-col">
                    {isCurrent ? (
                      <div className={'eq-bars' + (isPlaying ? '' : ' paused')}>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                        <div className="eq-bar"></div>
                      </div>
                    ) : (
                      <span className="song-index">{index + 1}</span>
                    )}
                      <button className="song-play-btn" style={{ color: isCurrent ? 'var(--spotify-green)' : 'white' }}>
                        <Play size={16} fill="currentColor" />
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={song.coverArt || getAudioUrl(song.audioId).replace('.mp3', '.jpg')} 
                        onError={(e) => { e.currentTarget.src = './logo.png'; }}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} 
                        alt="" 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ color: isCurrent ? 'var(--spotify-green)' : 'var(--text-primary)' }} className="ellipsis">
                          {song.title}
                        </span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }} className="ellipsis">
                          {song.artist}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <span className="ellipsis" style={{ display: 'block', maxWidth: '200px' }}>{song.album}</span>
                  </td>
                  <td className="hide-mobile" style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'right' }}>
                    {formatTime(song.durationMs || 0)}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      {/* Bold, prominent Delete button */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); deleteDownload(song.id); }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(239, 68, 68, 0.18)',
                          border: '1px solid rgba(239, 68, 68, 0.45)',
                          color: '#ff4d4d',
                          padding: '6px 12px',
                          borderRadius: '100px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                          e.currentTarget.style.borderColor = '#ff4d4d';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.18)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                        }}
                        title="Remove song from offline downloads"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                        <span>Delete</span>
                      </button>

                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setModalSong(song); }}
                        style={{
                          color: 'rgba(255,255,255,0.7)',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                        }}
                        title="More options"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {downloadedSongList.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>No downloads yet</h2>
            <p>Click the download icon on any song to save it for offline listening!</p>
          </div>
        )}
      </div>

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </div>
  );
};

export default DownloadsView;
