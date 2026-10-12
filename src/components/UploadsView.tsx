import React, { useState, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { Play, UploadCloud, Trash2, MoreHorizontal, Plus } from 'lucide-react';
import AddToPlaylistModal from './AddToPlaylistModal';
import * as mm from 'music-metadata';

const UploadsView: React.FC = () => {
  const { currentSong, isPlaying, playSong, togglePlayPause, uploadedSongs, uploadSong, deleteUpload } = usePlayer();
  const [modalSong, setModalSong] = useState<Song | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) togglePlayPause();
    else playSong(song, uploadedSongs);
  };

  const handlePlayAll = () => {
    if (uploadedSongs.length > 0) {
      playSong(uploadedSongs[0], uploadedSongs);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let title = file.name.replace(/\.[^/.]+$/, ""); // strip extension
        let artist = "Unknown Artist";
        let album = "Unknown Album";
        let durationMs = 0;
        let coverArt = "";

        // Attempt to parse metadata using Web Audio API for duration
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await file.arrayBuffer();
        try {
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          durationMs = audioBuffer.duration * 1000;
        } catch(err) {
          console.error("Could not decode audio duration", err);
        }

        // We can try to use music-metadata if it works in browser
        try {
          const metadata = await mm.parseBlob(file);
          if (metadata.common.title) title = metadata.common.title;
          if (metadata.common.artist) artist = metadata.common.artist;
          if (metadata.common.album) album = metadata.common.album;
          
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const pic = metadata.common.picture[0];
            const blob = new Blob([pic.data as any], { type: pic.format });
            coverArt = URL.createObjectURL(blob);
          }
        } catch (err) {
          console.log("Metadata parsing failed or unsupported", err);
        }

        const newSong: Song = {
          id: `upload_${Date.now()}_${i}`,
          title,
          artist,
          album,
          durationMs,
          audioId: `upload:${file.name}`,
          coverArt: coverArt || undefined
        };

        await uploadSong(newSong, file);
      }
    } catch (err) {
      console.error("Upload process failed", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="main-view" style={{ background: 'transparent' }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '24px',
        padding: '24px',
        background: 'linear-gradient(180deg, rgba(255, 140, 0, 0.6) 0%, transparent 100%)',
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
          <UploadCloud size={80} color="white" />
        </div>
        
        <div>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Your Music</p>
          <h1 style={{ fontSize: '72px', margin: '8px 0', fontWeight: '900', lineHeight: 1 }} className="playlist-title ellipsis">My Uploads</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{uploadedSongs.length} local songs</p>
        </div>
      </div>

      <div style={{ padding: '0 24px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', marginTop: '16px' }}>
          <button 
            onClick={handlePlayAll}
            disabled={uploadedSongs.length === 0}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: uploadedSongs.length > 0 ? 'var(--spotify-green)' : '#555',
              border: 'none',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadedSongs.length > 0 ? 'pointer' : 'not-allowed',
              boxShadow: '0 8px 8px rgba(0,0,0,0.3)',
            }}>
            <Play size={28} fill="black" style={{ marginLeft: '4px' }} />
          </button>

          <input 
            type="file" 
            accept="audio/*" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '30px', backgroundColor: 'transparent', border: '1px solid #b3b3b3', color: 'white', fontWeight: 'bold', cursor: isUploading ? 'not-allowed' : 'pointer' }}
          >
            <Plus size={20} />
            {isUploading ? 'Uploading...' : 'Upload Music'}
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ color: 'var(--text-secondary)', borderBottom: '1px solid #282828', fontSize: '14px' }}>
              <th className="hide-mobile" style={{ padding: '8px 16px', width: '40px', fontWeight: 'normal' }}>#</th>
              <th style={{ padding: '8px 16px', fontWeight: 'normal' }}>Title</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', fontWeight: 'normal', width: '25%' }}>Album</th>
              <th className="hide-mobile" style={{ padding: '8px 16px', textAlign: 'right', fontWeight: 'normal', width: '80px' }}>Duration</th>
              <th style={{ padding: '8px 8px', width: '70px' }}></th>
            </tr>
          </thead>
          <tbody>
            {uploadedSongs.map((song: Song, index: number) => {
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
                        src={song.coverArt || './logo.png'} 
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
                        onClick={e => { e.stopPropagation(); deleteUpload(song.id); }}
                        style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        title="Delete upload"
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

        {uploadedSongs.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '64px', color: 'var(--text-secondary)' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Upload your first song</h2>
            <p>Click "Upload Music" above to add local MP3s directly to your library.</p>
          </div>
        )}
      </div>

      {modalSong && <AddToPlaylistModal song={modalSong} onClose={() => setModalSong(null)} />}
    </div>
  );
};

export default UploadsView;
