import React, { useState, useEffect, useRef } from 'react';
import { Mic, Video, VideoOff, Mic2 } from 'lucide-react';

const MusicStudio: React.FC = () => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [instrument, setInstrument] = useState<OscillatorType>('sine');
  const [lyrics, setLyrics] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>();
  const lastImageDataRef = useRef<Uint8ClampedArray | null>(null);
  
  // Audio Context for the synths
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Debounce map so we don't trigger 60 notes a second
  const lastPlayedRef = useRef<{ [key: string]: number }>({
    q1: 0, q2: 0, q3: 0, q4: 0
  });

  const freqs = {
    q1: 261.63, // C4
    q2: 329.63, // E4
    q3: 392.00, // G4
    q4: 493.88  // B4
  };

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playNote = (quadrant: 'q1'|'q2'|'q3'|'q4') => {
    const now = Date.now();
    if (now - lastPlayedRef.current[quadrant] < 300) return; // Debounce 300ms
    lastPlayedRef.current[quadrant] = now;

    if (!audioCtxRef.current) return;
    
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.type = instrument;
    osc.frequency.setValueAtTime(freqs[quadrant], audioCtxRef.current.currentTime);
    
    // Envelope
    gain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtxRef.current.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + 0.5);
  };

  useEffect(() => {
    if (isCameraActive) {
      initAudio();
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          startMotionDetection();
        })
        .catch(err => {
          console.error("Camera error:", err);
          setIsCameraActive(false);
          alert("Camera access denied or unavailable.");
        });
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isCameraActive, instrument]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startMotionDetection = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const processFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, 64, 64);
        const frame = ctx.getImageData(0, 0, 64, 64);
        const data = frame.data;
        
        if (lastImageDataRef.current) {
          let scores = { q1: 0, q2: 0, q3: 0, q4: 0 };
          const threshold = 40;

          for (let i = 0; i < data.length; i += 4) {
            const rDiff = Math.abs(data[i] - lastImageDataRef.current[i]);
            const gDiff = Math.abs(data[i+1] - lastImageDataRef.current[i+1]);
            const bDiff = Math.abs(data[i+2] - lastImageDataRef.current[i+2]);
            
            if (rDiff + gDiff + bDiff > threshold) {
              // Determine quadrant (64x64 grid)
              const pixelIndex = i / 4;
              const x = pixelIndex % 64;
              const y = Math.floor(pixelIndex / 64);
              
              if (x < 32 && y < 32) scores.q1++;
              else if (x >= 32 && y < 32) scores.q2++;
              else if (x < 32 && y >= 32) scores.q3++;
              else scores.q4++;
            }
          }
          
          // Trigger notes if enough motion in a quadrant (e.g., > 15 pixels changed)
          if (scores.q1 > 20) playNote('q1');
          if (scores.q2 > 20) playNote('q2');
          if (scores.q3 > 20) playNote('q3');
          if (scores.q4 > 20) playNote('q4');
        }
        
        lastImageDataRef.current = new Uint8ClampedArray(data);
      }
      animationRef.current = requestAnimationFrame(processFrame);
    };
    
    processFrame();
  };

  return (
    <div className="main-view" style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #1db954, #127533)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'black', boxShadow: '0 8px 24px rgba(29, 185, 84, 0.4)'
        }}>
          <Mic size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>Music Studio</h1>
          <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
            Produce beats with hand gestures, write lyrics, and record tracks.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Gestures Area */}
        <div style={{ flex: '1 1 400px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Gesture Synthesizer</h2>
            <button 
              onClick={() => setIsCameraActive(!isCameraActive)}
              style={{
                background: isCameraActive ? 'rgba(255,0,0,0.2)' : 'var(--spotify-green)',
                color: isCameraActive ? '#ff4444' : 'black',
                border: 'none', borderRadius: '100px', padding: '8px 16px', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}
            >
              {isCameraActive ? <VideoOff size={16} /> : <Video size={16} />}
              {isCameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
            </button>
          </div>
          
          <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', background: 'black', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            {isCameraActive ? (
              <>
                <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                {/* 4 Quadrant Grid Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', pointerEvents: 'none' }}>
                  <div style={{ borderRight: '2px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:'4px'}}>C4</span></div>
                  <div style={{ borderBottom: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:'4px'}}>E4</span></div>
                  <div style={{ borderRight: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:'4px'}}>G4</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{background:'rgba(0,0,0,0.5)', padding:'4px 8px', borderRadius:'4px'}}>B4</span></div>
                </div>
              </>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)' }}>
                Camera is off.
              </div>
            )}
            <canvas ref={canvasRef} width={64} height={64} style={{ display: 'none' }} />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {['sine', 'square', 'triangle', 'sawtooth'].map((type) => (
              <button 
                key={type}
                onClick={() => { initAudio(); setInstrument(type as OscillatorType); }}
                style={{
                  background: instrument === type ? 'var(--spotify-green)' : 'rgba(255,255,255,0.1)',
                  color: instrument === type ? 'black' : 'white',
                  border: 'none', borderRadius: '100px', padding: '6px 12px', fontSize: '13px', cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Lyrics Area */}
        <div style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700 }}>Lyrics Prompter</h2>
          <textarea 
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste your lyrics here..."
            style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', color: 'white', fontSize: '14px', resize: 'none', fontFamily: 'monospace' }}
          />
          <button style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Mic2 size={18} /> Speak Lyrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
