import React from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { getAudioUrl } from '../utils/cloudinary';
import { Play, Heart, Music } from 'lucide-react';

interface PlaylistViewProps {
  playlistId: string | null;
}

const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId }) => {
  const { currentSong, isPlaying, playSong, togglePlayPause, playlists, likedSongs } = usePlayer();

  if (!playlistId) return <div className="main-view"></div>;

  const isLikedPlaylist = playlistId === 'liked';
  const playlist = isLikedPlaylist ? null : playlists.find(p => p.id === playlistId);
  
  const title = isLikedPlaylist ? "Liked Songs" : playlist?.name || "Unknown Playlist";
  const songs = isLikedPlaylist ? likedSongs : (playlist?.songs || []);
  const cover = isLikedPlaylist ? null : playlist?.coverArt;

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlayPause();
    } else {
      playSong(song);
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
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal' }}>Album</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song, index) => {
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
                        onError={(e) => { e.currentTarget.src = 'https://community.spotify.com/t5/image/serverpage/image-id/25294i2836BD1C1A31BDF2'; }}
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
                </tr>
              );
            })}
          </tbody>
        </table>

        {songs.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>It's a bit empty here...</h2>
            <p>Search for songs to add them to this playlist!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistView;
