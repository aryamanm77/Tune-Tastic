import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { getAudioUrl } from '../utils/cloudinary';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number;
  audioId: string;
  coverArt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  coverArt?: string;
}

interface PlayerContextType {
  songs: Song[];
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'all' | 'one';
  queue: Song[];
  playlists: Playlist[];
  likedSongs: Song[];
  playSong: (song: Song) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [queue, setQueue] = useState<Song[]>([]);

  // Local Storage State
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('tunetastic_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunetastic_liked');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('tunetastic_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('tunetastic_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    import('../data/songs.json').then((module) => {
      const allSongs = module.default as Song[];
      setSongs(allSongs);
      setQueue(allSongs);
    });
  }, []);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.currentTime / (audio.duration || 1));
    };
    
    const onLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const onEnded = () => {
      nextSongRef.current();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
      audio.src = '';
    };
  }, []);

  const nextSongRef = useRef(() => {});

  useEffect(() => {
    nextSongRef.current = () => {
      if (repeatMode === 'one' && currentSong) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return;
      }
      
      if (!currentSong) return;
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      if (currentIndex === -1) return;

      if (currentIndex < queue.length - 1) {
        playSong(queue[currentIndex + 1]);
      } else if (repeatMode === 'all') {
        playSong(queue[0]);
      } else {
        setIsPlaying(false);
      }
    };
  }, [queue, currentSong, repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = getAudioUrl(song.audioId);
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Playback failed:", e));
    }
  };

  const togglePlayPause = () => {
    if (currentSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => nextSongRef.current();

  const prevSong = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (!currentSong) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1]);
    }
  };

  const seekTo = (newProgress: number) => {
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = newProgress * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleShuffle = () => {
    if (!isShuffled) {
      setQueue([...songs].sort(() => Math.random() - 0.5));
    } else {
      setQueue(songs);
    }
    setIsShuffled(!isShuffled);
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = { id: crypto.randomUUID(), name, songs: [] };
    setPlaylists([...playlists, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId && !p.songs.find(s => s.id === song.id)) {
        return { ...p, songs: [...p.songs, song], coverArt: p.songs.length === 0 ? song.coverArt || getAudioUrl(song.audioId) : p.coverArt };
      }
      return p;
    }));
  };

  const toggleLike = (song: Song) => {
    if (likedSongs.find(s => s.id === song.id)) {
      setLikedSongs(likedSongs.filter(s => s.id !== song.id));
    } else {
      setLikedSongs([...likedSongs, song]);
    }
  };

  const isLiked = (songId: string) => {
    return likedSongs.some(s => s.id === songId);
  };

  return (
    <PlayerContext.Provider value={{
      songs, currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode, queue,
      playlists, likedSongs,
      playSong, togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat,
      createPlaylist, addToPlaylist, toggleLike, isLiked
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
