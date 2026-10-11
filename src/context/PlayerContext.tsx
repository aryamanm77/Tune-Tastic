import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { getAudioUrl } from '../utils/cloudinary';
import { getDownloadedSong, saveDownloadedSong, deleteDownloadedSong, getAllDownloadedSongs, getUploadedSong, saveUploadedSong, deleteUploadedSong, getAllUploadedSongs } from '../db';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationMs: number | null;
  audioId: string;
  audioUrl?: string;
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
  playbackTracklist?: Song[];
  clearQueue?: () => void;
  removeFromQueue?: (songId: string) => void;
  playlists: Playlist[];
  likedSongs: Song[];
  recentlyPlayed: Song[];
  removeFromRecentlyPlayed: (songId: string) => void;
  setQueue: React.Dispatch<React.SetStateAction<Song[]>>;
  playSong: (song: Song, newQueue?: Song[]) => void;
  togglePlayPause: () => void;
  nextSong: () => void;
  prevSong: () => void;
  seekTo: (progress: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  createPlaylist: (name: string, initialSong?: Song) => Playlist;
  addToPlaylist: (playlistId: string, song: Song) => void;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  clearSong: () => void;
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addToQueue: (song: Song) => void;
  djState: { bass: number; spin8D: boolean; nightcore: boolean; reverb?: number; speed?: number; lofi?: boolean; karaoke?: boolean; tremolo?: boolean; phaser?: boolean; vinyl?: boolean; chorus?: boolean; telephone?: boolean; alien?: boolean; era?: number; hapticBass?: boolean; spatialAudio?: boolean; motionDJ?: boolean; astralMode: boolean; zeroGravity: boolean; nebulaMode: boolean; isWarping: boolean; themeBackground?: string; videoSourceMode?: 'youtube' | 'instant' };
  setDjState: (state: Partial<{ bass: number; spin8D: boolean; nightcore: boolean; reverb: number; speed: number; lofi: boolean; karaoke: boolean; tremolo: boolean; phaser: boolean; vinyl: boolean; chorus: boolean; telephone: boolean; alien: boolean; era: number; hapticBass: boolean; spatialAudio: boolean; motionDJ: boolean; astralMode: boolean; zeroGravity: boolean; nebulaMode: boolean; isWarping: boolean; themeBackground: string; videoSourceMode: 'youtube' | 'instant' }>) => void;
  getAnalyserData: () => Uint8Array;
  setPlaybackRate: (rate: number) => void;
  setPan: (panValue: number) => void;
  downloadedSongs: Set<string>;
  downloadedSongList: Song[];
  downloadProgress: Record<string, number>;
  downloadSong: (song: Song) => Promise<void>;
  downloadAllSongs: (songs: Song[]) => Promise<void>;
  deleteDownload: (songId: string) => Promise<void>;
  uploadedSongs: Song[];
  uploadSong: (song: Song, blob: Blob) => Promise<void>;
  deleteUpload: (songId: string) => Promise<void>;
  userName: string;
  setUserName: (name: string) => void;
  isNameModalOpen: boolean;
  setIsNameModalOpen: (open: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [userName, setUserNameState] = useState<string>(() => {
    const saved = localStorage.getItem('tunetastic_user_name');
    if (!saved || saved.trim() === '' || saved === 'Aryaman') return '';
    return saved.trim();
  });

  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem('tunetastic_user_name');
    return !saved || saved.trim() === '' || saved === 'Aryaman';
  });

  useEffect(() => {
    const saved = localStorage.getItem('tunetastic_user_name');
    if (saved === 'Aryaman') {
      localStorage.removeItem('tunetastic_user_name');
      setUserNameState('');
      setIsNameModalOpen(true);
    }
  }, []);

  const setUserName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== 'Aryaman') {
      setUserNameState(trimmed);
      localStorage.setItem('tunetastic_user_name', trimmed);
    } else {
      setUserNameState('');
      localStorage.removeItem('tunetastic_user_name');
    }
  };

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'all' | 'one'>('none');
  const [userQueue, setUserQueue] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunetastic_user_queue');
    return saved ? JSON.parse(saved) : [];
  });
  const [playbackTracklist, setPlaybackTracklist] = useState<Song[]>([]);
  const [originalTracklist, setOriginalTracklist] = useState<Song[]>([]);

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('tunetastic_playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedSongs, setLikedSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunetastic_liked');
    return saved ? JSON.parse(saved) : [];
  });
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunetastic_recent');
    return saved ? JSON.parse(saved) : [];
  });

  const [downloadedSongs, setDownloadedSongs] = useState<Set<string>>(new Set());
  const [downloadedSongList, setDownloadedSongList] = useState<Song[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>([]);

  useEffect(() => {
    getAllDownloadedSongs().then(songs => {
      setDownloadedSongs(new Set(songs.map(s => s.songId)));
      setDownloadedSongList(songs.map(s => s.songData).filter(Boolean));
    });
    getAllUploadedSongs().then(uploads => {
      setUploadedSongs(uploads.map(u => u.songData));
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('tunetastic_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('tunetastic_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('tunetastic_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  const removeFromRecentlyPlayed = (songId: string) => {
    setRecentlyPlayed(prev => prev.filter(s => s.id !== songId));
  };

  useEffect(() => {
    localStorage.setItem('tunetastic_user_queue', JSON.stringify(userQueue));
  }, [userQueue]);

  useEffect(() => {
    import('../data/songs.json').then((module) => {
      const allSongs = module.default as Song[];
      setSongs(allSongs);
      setPlaybackTracklist(allSongs);
      setOriginalTracklist(allSongs);
      // NOTE: userQueue remains empty by default - only explicitly queued songs go into userQueue!
    });
  }, []);

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
      r = Math.round(r / count * 0.5);
      g = Math.round(g / count * 0.5);
      b = Math.round(b / count * 0.5);
      document.documentElement.style.setProperty('--dynamic-bg-color', `rgb(${r},${g},${b})`);
    };
    img.onerror = () => {
      document.documentElement.style.setProperty('--dynamic-bg-color', '#1e3a29');
    };
  }, [currentSong]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    if (!currentSong) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const artworkSrc = currentSong.coverArt || './logo.png';
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: currentSong.album || '',
      artwork: [
        { src: artworkSrc, sizes: '96x96',   type: 'image/png' },
        { src: artworkSrc, sizes: '128x128', type: 'image/png' },
        { src: artworkSrc, sizes: '192x192', type: 'image/png' },
        { src: artworkSrc, sizes: '256x256', type: 'image/png' },
        { src: artworkSrc, sizes: '384x384', type: 'image/png' },
        { src: artworkSrc, sizes: '512x512', type: 'image/png' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audioRef.current?.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSongRef.current());
    navigator.mediaSession.setActionHandler('previoustrack', () => prevSongRef.current());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && audioRef.current) {
        audioRef.current.currentTime = details.seekTime;
      }
    });
  }, [currentSong]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioRef.current) return;
    try {
      if (duration > 0) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: audioRef.current.playbackRate || 1,
          position: Math.min(currentTime, duration),
        });
      }
    } catch (_) { }
  }, [currentTime, duration]);

  const [djState, setDjStateInternal] = useState(() => {
    const savedTheme = localStorage.getItem('tunetastic_theme_bg') || 'racing-cars';
    const savedVideoMode = (localStorage.getItem('tunetastic_video_mode') as 'youtube' | 'instant') || 'youtube';
    return {
      bass: 0, spin8D: false, nightcore: false, 
      reverb: 0, speed: 10, lofi: false, karaoke: false,
      tremolo: false, phaser: false, vinyl: false,
      chorus: false, telephone: false, alien: false,
      era: 2026, hapticBass: false, spatialAudio: false, motionDJ: false, astralMode: false,
      zeroGravity: false, nebulaMode: false, isWarping: false, themeBackground: savedTheme,
      videoSourceMode: savedVideoMode
    };
  });
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const warpIntervalRef = useRef<number | null>(null);
  const binauralNodesRef = useRef<{ oscL: OscillatorNode, oscR: OscillatorNode, gain: GainNode } | null>(null);
  
  const bassNodeRef = useRef<BiquadFilterNode | null>(null);
  const vocalNodeRef = useRef<BiquadFilterNode | null>(null);
  const lofiNodeRef = useRef<BiquadFilterNode | null>(null);
  const echoDelayNodeRef = useRef<DelayNode | null>(null);
  const echoGainNodeRef = useRef<GainNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const tremoloGainNodeRef = useRef<GainNode | null>(null);
  const phaserNodeRef = useRef<BiquadFilterNode | null>(null);
  const vinylNodeRef = useRef<WaveShaperNode | null>(null);
  const telephoneNodeRef = useRef<BiquadFilterNode | null>(null);
  const chorusDelayNodeRef = useRef<DelayNode | null>(null);
  const chorusGainNodeRef = useRef<GainNode | null>(null);
  const alienGainNodeRef = useRef<GainNode | null>(null);
  const alienOscNodeRef = useRef<OscillatorNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  
  const zgHPFRef = useRef<BiquadFilterNode | null>(null);
  const zgConvolverRef = useRef<ConvolverNode | null>(null);
  const zgGainRef = useRef<GainNode | null>(null);
  const spatialPannerRef = useRef<StereoPannerNode | null>(null);
  
  const tremoloLFOGainRef = useRef<GainNode | null>(null);
  const phaserLFOGainRef = useRef<GainNode | null>(null);
  const chorusIntervalRef = useRef<number | null>(null);
  const leftGainRef = useRef<GainNode | null>(null);
  const rightGainRef = useRef<GainNode | null>(null);
  const lfoGainLRef = useRef<GainNode | null>(null);
  const lfoGainRRef = useRef<GainNode | null>(null);

  const makeDistortionCurve = (amount: number) => {
    let k = amount, n_samples = 44100, curve = new Float32Array(n_samples), deg = Math.PI / 180, i = 0, x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      // Multiply by 0.4 to compensate for the heavy RMS loudness boost of distortion
      curve[i] = (( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) )) * 0.4;
    }
    return curve;
  };

  const generateImpulseResponse = (ctx: AudioContext, duration: number, decay: number) => {
    const length = ctx.sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
      const n = i / length;
      const env = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioRef.current && !sourceNodeRef.current) {
      const ctx = audioContextRef.current;
      audioRef.current.crossOrigin = 'anonymous';
      
      try {
        const source = ctx.createMediaElementSource(audioRef.current);
        sourceNodeRef.current = source;

        const bassNode = ctx.createBiquadFilter(); bassNode.type = 'lowshelf'; bassNode.frequency.value = 150; bassNodeRef.current = bassNode;
        const vocalNode = ctx.createBiquadFilter(); vocalNode.type = 'peaking'; vocalNode.frequency.value = 3000; vocalNode.Q.value = 1.5; vocalNodeRef.current = vocalNode;
        const lofiNode = ctx.createBiquadFilter(); lofiNode.type = 'lowpass'; lofiNodeRef.current = lofiNode;
        const tremoloNode = ctx.createGain(); tremoloGainNodeRef.current = tremoloNode;
        const tremoloLFO = ctx.createOscillator(); tremoloLFO.type = 'sine'; tremoloLFO.frequency.value = 5; tremoloLFO.start();
        const tremoloLFOGain = ctx.createGain(); tremoloLFOGain.gain.value = 0; tremoloLFOGainRef.current = tremoloLFOGain;
        tremoloLFO.connect(tremoloLFOGain).connect(tremoloNode.gain);

        const phaserNode = ctx.createBiquadFilter(); phaserNode.type = 'peaking'; phaserNode.Q.value = 4; phaserNodeRef.current = phaserNode;
        phaserNode.frequency.value = 2250;
        const phaserLFO = ctx.createOscillator(); phaserLFO.type = 'sine'; phaserLFO.frequency.value = 0.3; phaserLFO.start();
        const phaserLFOGain = ctx.createGain(); phaserLFOGain.gain.value = 0; phaserLFOGainRef.current = phaserLFOGain;
        phaserLFO.connect(phaserLFOGain).connect(phaserNode.frequency);
        
        const vinylNode = ctx.createWaveShaper(); vinylNode.oversample = '4x'; vinylNodeRef.current = vinylNode;
        const telephoneNode = ctx.createBiquadFilter(); telephoneNode.type = 'bandpass'; telephoneNode.frequency.value = 1500; telephoneNodeRef.current = telephoneNode;
        
        const alienGain = ctx.createGain(); alienGain.gain.value = 1;
        const alienOsc = ctx.createOscillator(); alienOsc.type = 'sawtooth'; alienOsc.frequency.value = 50; alienOsc.start();
        alienGainNodeRef.current = alienGain; alienOscNodeRef.current = alienOsc;

        const chorusDelay = ctx.createDelay(0.1); chorusDelay.delayTime.value = 0.03; chorusDelayNodeRef.current = chorusDelay;
        const chorusGain = ctx.createGain(); chorusGain.gain.value = 0; chorusGainNodeRef.current = chorusGain;
        
        // --- BULLETPROOF 8D SURROUND IMPLEMENTATION (Splitter/Merger + Native LFOs) ---
        // By using ONLY GainNodes, this is mathematically flawless, zero-zipper-noise, and immune to Safari WebKit bugs.
        const pannerInput = ctx.createGain();
        const leftGain = ctx.createGain(); leftGainRef.current = leftGain;
        const rightGain = ctx.createGain(); rightGainRef.current = rightGain;
        const pannerMerger = ctx.createChannelMerger(2); pannerNodeRef.current = pannerInput as any;
        const spatialPanner = ctx.createStereoPanner(); spatialPannerRef.current = spatialPanner;
        
        pannerInput.connect(leftGain);
        pannerInput.connect(rightGain);
        leftGain.connect(pannerMerger, 0, 0); // Connect to Left ear
        rightGain.connect(pannerMerger, 0, 1); // Connect to Right ear
        pannerMerger.connect(spatialPanner);
        
        // pannerInput acts as the "pannerNode" for the rest of the chain to connect INTO.
        // We must override its connect method to ensure the signal comes OUT of the spatial panner!
        (pannerInput as any).connect = (destination: AudioNode) => {
          return spatialPanner.connect(destination);
        };

        const spinLfo = ctx.createOscillator(); spinLfo.type = 'sine'; spinLfo.frequency.value = 0.2; spinLfo.start();
        const spinLfoInv = ctx.createGain(); spinLfoInv.gain.value = -1; spinLfo.connect(spinLfoInv);
        
        const lfoGainL = ctx.createGain(); lfoGainL.gain.value = 0; lfoGainLRef.current = lfoGainL;
        const lfoGainR = ctx.createGain(); lfoGainR.gain.value = 0; lfoGainRRef.current = lfoGainR;
        
        spinLfo.connect(lfoGainL).connect(leftGain.gain);
        spinLfoInv.connect(lfoGainR).connect(rightGain.gain);
        // -----------------------------------------------------------------------------

        const zgHPF = ctx.createBiquadFilter(); zgHPF.type = 'highpass'; zgHPF.frequency.value = 400; zgHPFRef.current = zgHPF;
        const zgConvolver = ctx.createConvolver(); zgConvolver.buffer = generateImpulseResponse(ctx, 10, 5); zgConvolverRef.current = zgConvolver;
        const zgGain = ctx.createGain(); zgGain.gain.value = 0; zgGainRef.current = zgGain;
        
        const delayNode = ctx.createDelay(1.0); delayNode.delayTime.value = 0.3; echoDelayNodeRef.current = delayNode;
        const echoMixGain = ctx.createGain(); echoMixGain.gain.value = 0; echoGainNodeRef.current = echoMixGain;
        const feedbackGain = ctx.createGain(); feedbackGain.gain.value = 0.4;
        
        const analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyserNodeRef.current = analyser;

        source.connect(vinylNode).connect(bassNode).connect(telephoneNode).connect(vocalNode).connect(phaserNode).connect(lofiNode).connect(alienGain);
        alienGain.connect(tremoloNode).connect(pannerInput).connect(analyser);
        chorusGain.connect(alienGain);
        
        alienGain.connect(zgHPF).connect(zgConvolver).connect(zgGain).connect(analyser);
        
        lofiNode.connect(delayNode).connect(echoMixGain).connect(pannerInput);
        delayNode.connect(feedbackGain).connect(delayNode);
        lofiNode.connect(chorusDelay).connect(chorusGain);
        
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -3;
        compressor.knee.value = 10;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;

        analyser.connect(compressor);
        compressor.connect(ctx.destination);

      } catch (err) {
        console.error("Failed to initialize AudioContext:", err);
      }
    }
  };

  const applyDjEffects = (state: typeof djState) => {
    if (bassNodeRef.current) bassNodeRef.current.gain.value = state.bass;
    if (vocalNodeRef.current) vocalNodeRef.current.gain.value = state.karaoke ? 8 : 0;
    if (lofiNodeRef.current) lofiNodeRef.current.frequency.value = state.lofi ? 2500 : 20000;
    if (echoGainNodeRef.current) echoGainNodeRef.current.gain.value = (state.reverb ?? 0) > 0 ? (state.reverb! / 50) : 0;
    if (vinylNodeRef.current) vinylNodeRef.current.curve = state.vinyl ? makeDistortionCurve(400) : null;
    if (telephoneNodeRef.current) telephoneNodeRef.current.Q.value = state.telephone ? 2.5 : 0.0001; 

    if (chorusGainNodeRef.current) {
      chorusGainNodeRef.current.gain.value = state.chorus ? 0.8 : 0;
      if (state.chorus) {
        if (!chorusIntervalRef.current && chorusDelayNodeRef.current) {
          let time = 0;
          chorusIntervalRef.current = window.setInterval(() => {
            time += 0.1;
            const delay = 0.03 + 0.01 * Math.sin(time);
            if (chorusDelayNodeRef.current) chorusDelayNodeRef.current.delayTime.value = delay;
          }, 50);
        }
      } else if (chorusIntervalRef.current) {
        window.clearInterval(chorusIntervalRef.current);
        chorusIntervalRef.current = null;
      }
    }

    if (alienOscNodeRef.current && alienGainNodeRef.current) {
      if (state.alien) {
        try { alienOscNodeRef.current.connect(alienGainNodeRef.current.gain); } catch(e) {}
      } else {
        try { alienOscNodeRef.current.disconnect(); } catch(e) {}
        alienGainNodeRef.current.gain.value = 1;
      }
    }

    if (zgGainRef.current) {
      zgGainRef.current.gain.setTargetAtTime(state.zeroGravity ? 2.0 : 0, (audioContextRef.current?.currentTime || 0), 0.5);
    }

    if (audioRef.current) {
      if (warpIntervalRef.current) { window.clearInterval(warpIntervalRef.current); warpIntervalRef.current = null; }

      if (state.isWarping) {
        (audioRef.current as any).preservesPitch = false;
        if ('webkitPreservesPitch' in audioRef.current) (audioRef.current as any).webkitPreservesPitch = false;
        
        warpIntervalRef.current = window.setInterval(() => {
          if (!audioRef.current) return;
          if (audioRef.current.playbackRate > 0.1) {
            audioRef.current.playbackRate = Math.max(0.1, audioRef.current.playbackRate - 0.02);
          } else {
            if (warpIntervalRef.current) window.clearInterval(warpIntervalRef.current);
          }
        }, 16);
      } else {
        if (state.nightcore) {
          audioRef.current.playbackRate = 1.3;
          (audioRef.current as any).preservesPitch = false;
        } else if (state.astralMode) {
          audioRef.current.playbackRate = 432 / 440;
          (audioRef.current as any).preservesPitch = false;
        } else {
          const speedMultiplier = (state.speed ?? 10) / 10;
          audioRef.current.playbackRate = speedMultiplier;
          (audioRef.current as any).preservesPitch = true;
          if ('webkitPreservesPitch' in audioRef.current) (audioRef.current as any).webkitPreservesPitch = true;
        }
      }
    }

    const now = audioContextRef.current?.currentTime || 0;

    if (state.spin8D) {
      if (leftGainRef.current) leftGainRef.current.gain.setTargetAtTime(0.5, now, 0.1);
      if (rightGainRef.current) rightGainRef.current.gain.setTargetAtTime(0.5, now, 0.1);
      if (lfoGainLRef.current) lfoGainLRef.current.gain.setTargetAtTime(0.5, now, 0.1);
      if (lfoGainRRef.current) lfoGainRRef.current.gain.setTargetAtTime(0.5, now, 0.1);
    } else {
      if (leftGainRef.current) leftGainRef.current.gain.setTargetAtTime(1, now, 0.1);
      if (rightGainRef.current) rightGainRef.current.gain.setTargetAtTime(1, now, 0.1);
      if (lfoGainLRef.current) lfoGainLRef.current.gain.setTargetAtTime(0, now, 0.1);
      if (lfoGainRRef.current) lfoGainRRef.current.gain.setTargetAtTime(0, now, 0.1);
    }

    if (state.tremolo && !state.alien) {
      if (tremoloGainNodeRef.current) tremoloGainNodeRef.current.gain.setTargetAtTime(0.65, now, 0.1);
      if (tremoloLFOGainRef.current) tremoloLFOGainRef.current.gain.setTargetAtTime(0.35, now, 0.1);
    } else {
      if (tremoloGainNodeRef.current) tremoloGainNodeRef.current.gain.setTargetAtTime(1, now, 0.1);
      if (tremoloLFOGainRef.current) tremoloLFOGainRef.current.gain.setTargetAtTime(0, now, 0.1);
    }

    if (state.phaser) {
      if (phaserNodeRef.current) phaserNodeRef.current.gain.setTargetAtTime(12, now, 0.1);
      if (phaserLFOGainRef.current) phaserLFOGainRef.current.gain.setTargetAtTime(1750, now, 0.1);
    } else {
      if (phaserNodeRef.current) phaserNodeRef.current.gain.setTargetAtTime(0, now, 0.1);
      if (phaserLFOGainRef.current) phaserLFOGainRef.current.gain.setTargetAtTime(0, now, 0.1);
    }

    if (state.astralMode && audioContextRef.current) {
      if (!binauralNodesRef.current) {
        const ctx = audioContextRef.current;
        const merger = ctx.createChannelMerger(2);
        const oscL = ctx.createOscillator(); oscL.frequency.value = 100;
        const pannerL = ctx.createStereoPanner(); pannerL.pan.value = -1;
        oscL.connect(pannerL).connect(merger, 0, 0);
        const oscR = ctx.createOscillator(); oscR.frequency.value = 104.5;
        const pannerR = ctx.createStereoPanner(); pannerR.pan.value = 1;
        oscR.connect(pannerR).connect(merger, 0, 1);
        const gain = ctx.createGain(); gain.gain.value = 0.15;
        merger.connect(gain).connect(ctx.destination);
        oscL.start(); oscR.start();
        binauralNodesRef.current = { oscL, oscR, gain };
      }
    } else if (binauralNodesRef.current) {
      binauralNodesRef.current.oscL.stop(); binauralNodesRef.current.oscR.stop();
      binauralNodesRef.current.oscL.disconnect(); binauralNodesRef.current.oscR.disconnect();
      binauralNodesRef.current.gain.disconnect(); binauralNodesRef.current = null;
    }
  };

  useEffect(() => {
    if (isPlaying || djState.astralMode) {
      initAudioContext();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    }
    applyDjEffects(djState);
  }, [djState, isPlaying]);

  const setDjState = (newState: Partial<typeof djState>) => {
    if (newState.themeBackground !== undefined) {
      localStorage.setItem('tunetastic_theme_bg', newState.themeBackground);
    }
    if (newState.videoSourceMode !== undefined) {
      localStorage.setItem('tunetastic_video_mode', newState.videoSourceMode);
    }
    setDjStateInternal(prev => ({ ...prev, ...newState }));
  };

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = 'anonymous';
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
  const prevSongRef = useRef(() => {});

  useEffect(() => {
    nextSongRef.current = () => {
      if (repeatMode === 'one' && currentSong) {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
        return;
      }
      
      // 1. Prioritize user-queued songs (only explicit queued songs)
      if (userQueue.length > 0) {
        const nextInQueue = userQueue[0];
        setUserQueue(prev => prev.slice(1));
        playSong(nextInQueue);
        return;
      }

      // 2. Play next in background playlist tracklist
      if (!currentSong) return;
      const tracklist = playbackTracklist.length > 0 ? playbackTracklist : songs;
      const currentIndex = tracklist.findIndex(s => s.id === currentSong.id);
      if (currentIndex === -1) {
        if (tracklist.length > 0) playSong(tracklist[0]);
        return;
      }

      if (currentIndex < tracklist.length - 1) {
        playSong(tracklist[currentIndex + 1]);
      } else if (repeatMode === 'all') {
        playSong(tracklist[0]);
      } else {
        setIsPlaying(false);
      }
    };
  }, [userQueue, playbackTracklist, songs, currentSong, repeatMode]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const playSong = async (song: Song, newQueue?: Song[]) => {
    // If user played a song that is in userQueue, remove it from queue
    setUserQueue(prev => prev.filter(s => s.id !== song.id));

    if (newQueue) {
      setOriginalTracklist(newQueue);
      if (isShuffled) {
        const others = newQueue.filter(s => s.id !== song.id);
        const shuffled = [...others].sort(() => Math.random() - 0.5);
        setPlaybackTracklist([song, ...shuffled]);
      } else {
        setPlaybackTracklist(newQueue);
      }
    } else {
      setPlaybackTracklist(prev => {
        if (prev.some(s => s.id === song.id)) return prev;
        const all = songs.length > 0 ? songs : [song];
        const idx = all.findIndex(s => s.id === song.id);
        if (idx !== -1) {
          return all.slice(idx);
        }
        return [song, ...prev];
      });
    }
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCurrentSong(song);

    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [song, ...filtered].slice(0, 20);
    });

    const audio = audioRef.current;
    if (audio) {
      try {
        if (song.audioUrl) {
          audio.src = song.audioUrl;
        } else if (song.audioId && song.audioId.startsWith('upload:')) {
          const uploaded = await getUploadedSong(song.id);
          if (uploaded) {
            audio.src = URL.createObjectURL(uploaded.audioBlob);
          } else {
            audio.src = getAudioUrl(song.audioId);
          }
        } else {
          const downloaded = await getDownloadedSong(song.id);
          if (downloaded) {
            audio.src = URL.createObjectURL(downloaded.audioBlob);
          } else {
            audio.src = song.audioId ? getAudioUrl(song.audioId) : (song.audioUrl || '');
          }
        }
      } catch (e) {
        audio.src = song.audioUrl || (song.audioId ? getAudioUrl(song.audioId) : '');
      }
      
      audio.load();
      audio.play().then(() => {
        setIsPlaying(true);
        applyDjEffects(djState);
      }).catch(err => {
        console.error("Playback failed", err);
      });
    }
  };

  const downloadSong = async (song: Song) => {
    if (downloadedSongs.has(song.id)) return;
    
    setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }));
    try {
      const url = song.audioUrl || (song.audioId ? getAudioUrl(song.audioId) : '');
      if (!url) throw new Error('No audio URL found');
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      
      await saveDownloadedSong(song, blob);
      setDownloadedSongs(prev => new Set(prev).add(song.id));
      setDownloadedSongList(prev => {
        if (prev.some(s => s.id === song.id)) return prev;
        return [...prev, song];
      });

      setDownloadProgress(prev => {
        const next = { ...prev };
        delete next[song.id];
        return next;
      });
    } catch (e) {
      console.error("Download failed", e);
      setDownloadProgress(prev => {
        const next = { ...prev };
        delete next[song.id];
        return next;
      });
    }
  };

  const downloadAllSongs = async (songsToDownload: Song[]) => {
    for (const s of songsToDownload) {
      await downloadSong(s);
    }
  };

  const deleteDownload = async (songId: string) => {
    await deleteDownloadedSong(songId);
    setDownloadedSongs(prev => {
      const next = new Set(prev);
      next.delete(songId);
      return next;
    });
    setDownloadedSongList(prev => prev.filter(s => s.id !== songId));
  };

  const uploadSong = async (song: Song, blob: Blob) => {
    await saveUploadedSong(song, blob);
    setUploadedSongs(prev => [...prev, song]);
  };

  const deleteUpload = async (songId: string) => {
    await deleteUploadedSong(songId);
    setUploadedSongs(prev => prev.filter(s => s.id !== songId));
  };

  const togglePlayPause = () => {
    initAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    if (currentSong && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error("Playback failed:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSong = () => nextSongRef.current();

  const prevSong = () => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (recentlyPlayed.length > 1) {
      playSong(recentlyPlayed[1]);
      return;
    }
    
    if (!currentSong) return;
    const tracklist = playbackTracklist.length > 0 ? playbackTracklist : songs;
    const currentIndex = tracklist.findIndex(s => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(tracklist[currentIndex - 1]);
    }
  };

  useEffect(() => {
    prevSongRef.current = prevSong;
  });

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
      const tracklist = playbackTracklist.length > 0 ? playbackTracklist : songs;
      if (currentSong) {
        const others = tracklist.filter(s => s.id !== currentSong.id);
        setPlaybackTracklist([currentSong, ...others.sort(() => Math.random() - 0.5)]);
      } else {
        setPlaybackTracklist([...tracklist].sort(() => Math.random() - 0.5));
      }
    } else {
      setPlaybackTracklist(originalTracklist.length > 0 ? originalTracklist : songs);
    }
    setIsShuffled(!isShuffled);
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  };

  const createPlaylist = (name: string, initialSong?: Song): Playlist => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      songs: initialSong ? [initialSong] : [],
      coverArt: initialSong ? (initialSong.coverArt || (initialSong.audioId ? getAudioUrl(initialSong.audioId) : undefined)) : undefined
    };
    setPlaylists(prev => {
      const next = [...prev, newPlaylist];
      try {
        localStorage.setItem('tunetastic_playlists', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
    return newPlaylist;
  };

  const addToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(playlists.map(p => {
      if (p.id === playlistId && !p.songs.find(s => s.id === song.id)) {
        return { ...p, songs: [...p.songs, song], coverArt: p.songs.length === 0 ? song.coverArt || getAudioUrl(song.audioId) : p.coverArt };
      }
      return p;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, name: newName } : p));
  };

  const addToQueue = (song: Song) => {
    setUserQueue(prev => {
      const filtered = prev.filter(s => s.id !== song.id);
      return [...filtered, song];
    });
  };

  const removeFromQueue = (songId: string) => {
    setUserQueue(prev => prev.filter(s => s.id !== songId));
  };

  const clearQueue = () => {
    setUserQueue([]);
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

  const getAnalyserData = useCallback(() => {
    if (!analyserNodeRef.current) return new Uint8Array(0);
    const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    analyserNodeRef.current.getByteFrequencyData(dataArray);
    return dataArray;
  }, []);

  const setPan = (panValue: number) => {
    if (spatialPannerRef.current) {
      spatialPannerRef.current.pan.value = Math.max(-1, Math.min(1, panValue));
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <PlayerContext.Provider value={{
      songs, currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode,
      queue: userQueue,
      playbackTracklist,
      clearQueue,
      removeFromQueue,
      playlists, likedSongs, recentlyPlayed, removeFromRecentlyPlayed,
      setQueue: setUserQueue,
      playSong, togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat,
      createPlaylist, addToPlaylist, toggleLike, isLiked, clearSong, setPlaylists, deletePlaylist, renamePlaylist, addToQueue,
      djState,
      setDjState,
      getAnalyserData,
      setPlaybackRate,
      setPan,
      downloadedSongs,
      downloadedSongList,
      downloadProgress,
      downloadSong,
      downloadAllSongs,
      deleteDownload,
      uploadedSongs,
      uploadSong,
      deleteUpload,
      userName,
      setUserName,
      isNameModalOpen,
      setIsNameModalOpen
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
