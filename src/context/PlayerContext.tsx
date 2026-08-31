import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import { getAudioUrl } from '../utils/cloudinary';

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
  playlists: Playlist[];
  likedSongs: Song[];
  recentlyPlayed: Song[];
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
  setPlaylists: React.Dispatch<React.SetStateAction<Playlist[]>>;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  addToQueue: (song: Song) => void;
  djState: { bass: number; spin8D: boolean; nightcore: boolean; reverb?: number; speed?: number; lofi?: boolean; karaoke?: boolean; tremolo?: boolean; phaser?: boolean; vinyl?: boolean; chorus?: boolean; telephone?: boolean; alien?: boolean; era?: number; hapticBass?: boolean; spatialAudio?: boolean; motionDJ?: boolean; astralMode: boolean; zeroGravity: boolean; nebulaMode: boolean; isWarping: boolean };
  setDjState: (state: Partial<{ bass: number; spin8D: boolean; nightcore: boolean; reverb: number; speed: number; lofi: boolean; karaoke: boolean; tremolo: boolean; phaser: boolean; vinyl: boolean; chorus: boolean; telephone: boolean; alien: boolean; era: number; hapticBass: boolean; spatialAudio: boolean; motionDJ: boolean; astralMode: boolean; zeroGravity: boolean; nebulaMode: boolean; isWarping: boolean }>) => void;
  getAnalyserData: () => Uint8Array;
  setPlaybackRate: (rate: number) => void;
  setPan: (panValue: number) => void;
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

  useEffect(() => {
    localStorage.setItem('tunetastic_playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('tunetastic_liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('tunetastic_recent', JSON.stringify(recentlyPlayed));
  }, [recentlyPlayed]);

  useEffect(() => {
    import('../data/songs.json').then((module) => {
      const allSongs = module.default as Song[];
      setSongs(allSongs);
      setQueue(allSongs);
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

    const artworkSrc = currentSong.coverArt || '/logo.png';
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
      audioRef.current?.play();
      setIsPlaying(true);
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => nextSongRef.current());
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (audioRef.current && audioRef.current.currentTime > 3) {
        audioRef.current.currentTime = 0;
      } else {
        const currentIndex = queue.findIndex(s => s.id === currentSong.id);
        if (currentIndex > 0) playSong(queue[currentIndex - 1]);
      }
    });
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

  const [djState, setDjStateInternal] = useState({ 
    bass: 0, spin8D: false, nightcore: false, 
    reverb: 0, speed: 10, lofi: false, karaoke: false,
    tremolo: false, phaser: false, vinyl: false,
    chorus: false, telephone: false, alien: false,
    era: 2026, hapticBass: false, spatialAudio: false, motionDJ: false, astralMode: false,
    zeroGravity: false, nebulaMode: false, isWarping: false
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
  
  const pannerLFOGainRef = useRef<GainNode | null>(null);
  const tremoloLFOGainRef = useRef<GainNode | null>(null);
  const phaserLFOGainRef = useRef<GainNode | null>(null);
  const chorusIntervalRef = useRef<number | null>(null);

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
        
        const pannerNode = ctx.createStereoPanner(); pannerNodeRef.current = pannerNode;
        const pannerLFO = ctx.createOscillator(); pannerLFO.type = 'triangle'; pannerLFO.frequency.value = 0.2; pannerLFO.start();
        const pannerLFOGain = ctx.createGain(); pannerLFOGain.gain.value = 0; pannerLFOGainRef.current = pannerLFOGain;
        pannerLFO.connect(pannerLFOGain).connect(pannerNode.pan);
        
        const zgHPF = ctx.createBiquadFilter(); zgHPF.type = 'highpass'; zgHPF.frequency.value = 400; zgHPFRef.current = zgHPF;
        const zgConvolver = ctx.createConvolver(); zgConvolver.buffer = generateImpulseResponse(ctx, 10, 5); zgConvolverRef.current = zgConvolver;
        const zgGain = ctx.createGain(); zgGain.gain.value = 0; zgGainRef.current = zgGain;
        
        const delayNode = ctx.createDelay(1.0); delayNode.delayTime.value = 0.3; echoDelayNodeRef.current = delayNode;
        const echoMixGain = ctx.createGain(); echoMixGain.gain.value = 0; echoGainNodeRef.current = echoMixGain;
        const feedbackGain = ctx.createGain(); feedbackGain.gain.value = 0.4;
        
        const analyser = ctx.createAnalyser(); analyser.fftSize = 256; analyserNodeRef.current = analyser;

        source.connect(vinylNode).connect(bassNode).connect(telephoneNode).connect(vocalNode).connect(phaserNode).connect(lofiNode).connect(alienGain);
        alienGain.connect(tremoloNode).connect(pannerNode).connect(analyser);
        chorusGain.connect(alienGain);
        
        alienGain.connect(zgHPF).connect(zgConvolver).connect(zgGain).connect(analyser);
        
        lofiNode.connect(delayNode).connect(echoMixGain).connect(pannerNode);
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
      if (pannerLFOGainRef.current) pannerLFOGainRef.current.gain.setTargetAtTime(1, now, 0.1);
    } else {
      if (pannerLFOGainRef.current) pannerLFOGainRef.current.gain.setTargetAtTime(0, now, 0.1);
      if (pannerNodeRef.current) pannerNodeRef.current.pan.setTargetAtTime(0, now, 0.1);
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
      audio.src = song.audioUrl || getAudioUrl(song.audioId);
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

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(playlists.filter(p => p.id !== playlistId));
  };

  const renamePlaylist = (playlistId: string, newName: string) => {
    setPlaylists(playlists.map(p => p.id === playlistId ? { ...p, name: newName } : p));
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => {
      const currentIndex = prev.findIndex(s => s.id === currentSong?.id);
      const insertAt = currentIndex >= 0 ? currentIndex + 1 : prev.length;
      const next = [...prev];
      const existingIdx = next.findIndex(s => s.id === song.id);
      if (existingIdx > insertAt) next.splice(existingIdx, 1);
      next.splice(insertAt, 0, song);
      return next;
    });
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
    if (pannerNodeRef.current) {
      pannerNodeRef.current.pan.value = Math.max(-1, Math.min(1, panValue));
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  return (
    <PlayerContext.Provider value={{
      songs, currentSong, isPlaying, progress, currentTime, duration, volume, isShuffled, repeatMode, queue,
      playlists, likedSongs, recentlyPlayed,
      playSong, togglePlayPause, nextSong, prevSong, seekTo, setVolume, toggleShuffle, cycleRepeat,
      createPlaylist, addToPlaylist, toggleLike, isLiked, clearSong, setPlaylists, deletePlaylist, renamePlaylist, addToQueue,
      djState,
      setDjState,
      getAnalyserData,
      setPlaybackRate,
      setPan
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
