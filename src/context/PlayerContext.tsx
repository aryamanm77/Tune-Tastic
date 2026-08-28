import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { getAudioUrl } from '../utils/cloudinary';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number | null;
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
  clearSong: () => void;
  // DJ State
  djState: { bass: number; spin8D: boolean; nightcore: boolean; reverb?: number; speed?: number; lofi?: boolean; karaoke?: boolean };
  setDjState: (state: Partial<{ bass: number; spin8D: boolean; nightcore: boolean; reverb: number; speed: number; lofi: boolean; karaoke: boolean }>) => void;
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

  // Dynamic background color — extracts dominant color from album art like Spotify
  useEffect(() => {
    if (!currentSong?.coverArt) {
      document.documentElement.style.setProperty('--dynamic-bg-color', '#1e3a29');
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentSong.coverArt;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; g += data[i+1]; b += data[i+2]; count++;
      }
      r = Math.round(r / count * 0.5); // Darken so it's background-safe
      g = Math.round(g / count * 0.5);
      b = Math.round(b / count * 0.5);
      document.documentElement.style.setProperty('--dynamic-bg-color', `rgb(${r},${g},${b})`);
    };
    img.onerror = () => {
      document.documentElement.style.setProperty('--dynamic-bg-color', '#1e3a29');
    };
  }, [currentSong]);

  // DJ State
  const [djState, setDjStateInternal] = useState({ 
    bass: 0, spin8D: false, nightcore: false, 
    reverb: 0, speed: 10, lofi: false, karaoke: false 
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // Audio Nodes
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const vocalNodeRef = useRef<BiquadFilterNode | null>(null);
  const lofiNodeRef = useRef<BiquadFilterNode | null>(null);
  const echoDelayNodeRef = useRef<DelayNode | null>(null);
  const echoGainNodeRef = useRef<GainNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const pannerIntervalRef = useRef<number | null>(null);

  const initAudioContext = () => {
    if (audioContextRef.current) return;
    
    // Create AudioContext (must be on user interaction)
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    
    if (audioRef.current) {
      // Must set crossOrigin for Web Audio API to work with remote URLs
      audioRef.current.crossOrigin = 'anonymous';
      
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;

        // 1. Bass Boost Node (LowShelf)
        const bassNode = ctx.createBiquadFilter();
        bassNode.type = 'lowshelf';
        bassNode.frequency.value = 150; 
        bassNode.gain.value = djState.bass;
        bassNodeRef.current = bassNode;

        // 2. Vocal Boost / Karaoke Node (Peaking)
        const vocalNode = ctx.createBiquadFilter();
        vocalNode.type = 'peaking';
        vocalNode.frequency.value = 3000; // Boost mid-high frequencies for vocals
        vocalNode.Q.value = 1.5;
        vocalNode.gain.value = djState.karaoke ? 8 : 0;
        vocalNodeRef.current = vocalNode;

        // 3. Lo-Fi Node (Lowpass + Highpass for radio effect)
        const lofiNode = ctx.createBiquadFilter();
        lofiNode.type = 'lowpass';
        lofiNode.frequency.value = djState.lofi ? 3000 : 20000;
        lofiNodeRef.current = lofiNode;

        // 4. Reverb/Echo (Delay + Feedback)
        const delayNode = ctx.createDelay(1.0);
        delayNode.delayTime.value = 0.3; // 300ms delay
        echoDelayNodeRef.current = delayNode;
        
        const feedbackGain = ctx.createGain();
        feedbackGain.gain.value = (djState.reverb ?? 0) > 0 ? (djState.reverb! / 20) : 0;
        echoGainNodeRef.current = feedbackGain;

        // 5. Stereo Panner Node (8D Spin)
        const pannerNode = ctx.createStereoPanner();
        pannerNode.pan.value = 0;
        pannerNodeRef.current = pannerNode;

        // Connect the graph
        // Dry signal path: Source -> Bass -> Vocal -> LoFi -> Panner -> Destination
        source.connect(bassNode);
        bassNode.connect(vocalNode);
        vocalNode.connect(lofiNode);
        lofiNode.connect(pannerNode);
        pannerNode.connect(ctx.destination);

        // Wet signal path (Echo): LoFi -> Delay -> Feedback -> Panner
        lofiNode.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode); // feedback loop
        delayNode.connect(pannerNode);

      } catch (err) {
        console.error("Failed to initialize AudioContext:", err);
      }
    }
  };

  const applyDjEffects = (state: typeof djState) => {
    // Apply Bass
    if (bassNodeRef.current) bassNodeRef.current.gain.value = state.bass;
    
    // Apply Vocal Boost
    if (vocalNodeRef.current) vocalNodeRef.current.gain.value = state.karaoke ? 8 : 0;
    
    // Apply Lo-Fi
    if (lofiNodeRef.current) lofiNodeRef.current.frequency.value = state.lofi ? 2500 : 20000;
    
    // Apply Reverb (Delay amount)
    if (echoGainNodeRef.current) echoGainNodeRef.current.gain.value = (state.reverb ?? 0) > 0 ? (state.reverb! / 15) : 0;

    // Apply Nightcore and Speed
    if (audioRef.current) {
      if (state.nightcore) {
        audioRef.current.playbackRate = 1.3;
        (audioRef.current as any).preservesPitch = false;
        (audioRef.current as any).webkitPreservesPitch = false;
      } else {
        const speedMultiplier = (state.speed ?? 10) / 10;
        audioRef.current.playbackRate = speedMultiplier;
        (audioRef.current as any).preservesPitch = true;
        (audioRef.current as any).webkitPreservesPitch = true;
      }
    }

    // Apply 8D Spin
    if (state.spin8D) {
      if (!pannerIntervalRef.current && pannerNodeRef.current) {
        let panValue = 0;
        let direction = 1;
        pannerIntervalRef.current = window.setInterval(() => {
          panValue += 0.02 * direction;
          if (panValue >= 1) { panValue = 1; direction = -1; }
          if (panValue <= -1) { panValue = -1; direction = 1; }
          if (pannerNodeRef.current) pannerNodeRef.current.pan.value = panValue;
        }, 50);
      }
    } else {
      if (pannerIntervalRef.current) {
        window.clearInterval(pannerIntervalRef.current);
        pannerIntervalRef.current = null;
      }
      if (pannerNodeRef.current) pannerNodeRef.current.pan.value = 0;
    }
  };

  const setDjState = (newState: Partial<typeof djState>) => {
    setDjStateInternal(prev => {
      const updated = { ...prev, ...newState };
      if (isPlaying) {
        initAudioContext();
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        applyDjEffects(updated);
      }
      return updated;
    });
  };

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = 'anonymous'; // CRITICAL: Set this BEFORE any src is loaded!
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
      if (pannerIntervalRef.current) clearInterval(pannerIntervalRef.current);
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
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentSong(song);

    const audio = audioRef.current;
    if (audio) {
      audio.src = getAudioUrl(song.audioId);
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
        applyDjEffects(djState);
      }).catch(err => {
        console.error("Playback failed", err);
      });
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

  const clearSong = () => {
    setCurrentSong(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  return (
    <PlayerContext.Provider value={{
      songs, currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode, queue,
      playlists, likedSongs,
      playSong, togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat,
      createPlaylist, addToPlaylist, toggleLike, isLiked,      clearSong,
      djState,
      setDjState
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
