import React, { useState } from 'react';
import { usePlayer, Song, Playlist } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Heart, Music, MoreHorizontal, Trash2 } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';

interface PlaylistViewProps {
  playlistId: string | null;
  goHome?: () => void;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId, goHome }) => {
  const { currentSong, isPlaying, playSong, togglePlayPause, playlists, likedSongs, toggleLike, setPlaylists, deletePlaylist, renamePlaylist } = usePlayer() as any;
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  if (!playlistId) return <div className="main-view"></div>;

  const isLikedPlaylist = playlistId === 'liked';
  const playlist: Playlist | null = isLikedPlaylist ? null : playlists.find((p: Playlist) => p.id === playlistId);
  
  const title = isLikedPlaylist ? "Liked Songs" : playlist?.name || "Unknown Playlist";
  const songs: Song[] = isLikedPlaylist ? likedSongs : (playlist?.songs || []);
  const cover = isLikedPlaylist ? null : playlist?.coverArt;

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) togglePlayPause();
    else playSong(song);
  };

  const removeSong = (songId: string) => {
    if (isLikedPlaylist) {
      const s = songs.find((x: Song) => x.id === songId);
      if (s) toggleLike(s);
    } else {
      setPlaylists((prev: Playlist[]) =>
        prev.map(p => p.id === playlistId ? { ...p, songs: p.songs.filter(s => s.id !== songId) } : p)
      );
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0]);
    }
  };

  const handleDelete = () => {
    if (playlistId && window.confirm("Are you sure you want to delete this playlist?")) {
      deletePlaylist(playlistId);
      if (goHome) goHome();
    }
  };

  const handleRename = () => {
    const newName = prompt("Enter new playlist name:", title);
    if (newName && newName.trim() && playlistId) {
      renamePlaylist(playlistId, newName.trim());
    }
    setShowMenu(false);
  };

  return (
    <div className="main-view">
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        padding: '24px',
        background: isLikedPlaylist ? 'linear-gradient(180deg, #450af5 0%, var(--bg-base) 100%)' : 'linear-gradient(180deg, #535353 0%, var(--bg-base) 100%)',
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
          {isLikedPlaylist ? (
            <Heart size={80} color="white" fill="white" />
          ) : cover ? (
            <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Music size={80} color="#b3b3b3" />
          )}
        </div>
        
        <div>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Playlist</p>
          <h1 style={{ fontSize: '72px', margin: '8px 0', fontWeight: '900', lineHeight: 1 }} className="playlist-title ellipsis">{title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{songs.length} songs</p>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', marginTop: '16px' }}>
          <button 
            onClick={handlePlayAll}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--spotify-green)',
              border: 'none',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
            }}>
            <Play size={28} fill="black" style={{ marginLeft: '4px' }} />
          </button>
          
          {!isLikedPlaylist && (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                style={{ color: '#b3b3b3', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <MoreHorizontal size={32} />
              </button>
              
              {showMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  backgroundColor: '#282828',
                  borderRadius: '4px',
                  boxShadow: '0 16px 24px rgba(0,0,0,.3), 0 6px 8px rgba(0,0,0,.2)',
                  padding: '4px',
                  zIndex: 10,
                  minWidth: '160px'
                }}>
                  <button 
                    onClick={handleRename} 
                    style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Rename
                  </button>
                  <button 
                    onClick={handleDelete} 
                    style={{ width: '100%', textAlign: 'left', padding: '12px', background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#333'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Delete Playlist
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Album</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
              <th style={{ padding: '8px 16px', width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song: Song, index: number) => {
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
                        onError={(e) => { e.currentTarget.src = '/logo.png'; }}
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
                  {/* Actions: three-dot + remove */}
                  <td style={{ padding: '8px 8px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setModalSong(song); }}
                        style={{ color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="More options"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); removeSong(song.id); }}
                        style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Remove from playlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {songs.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>It's a bit empty here...</h2>
            <p>Search for songs and tap ··· to add them to this playlist!</p>
          </div>
        )}
      </div>

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </div>
  );
};

export default PlaylistView;
