import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const MotionControlDJ: React.FC = () => {
  const { setDjState, isPlaying } = usePlayer();
  const [isActive, setIsActive] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const requestRef = useRef<number>();
  const lastTriggerRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Video play error:", e));
        setIsActive(true);
      }
    } catch (e) {
      console.error(e);
      alert('Camera access denied or unavailable.');
    }
  };

  const stopCamera = () => {
    setIsActive(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    if (!isActive || !isPlaying) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const detectMotion = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        ctx.drawImage(video, 0, 0, 64, 64);
        const frameData = ctx.getImageData(0, 0, 64, 64).data;

        if (prevFrameRef.current) {
          let score = 0;
          // Compare pixel by pixel (we only check the red channel for speed, since overall luma correlates)
          for (let i = 0; i < frameData.length; i += 4) {
            const diff = Math.abs(frameData[i] - prevFrameRef.current[i]);
            if (diff > 20) { // Threshold for a pixel change
              score++;
            }
          }

          // If a significant amount of pixels changed (e.g. 400 out of 4096)
          if (score > 400) {
            const now = Date.now();
            if (now - lastTriggerRef.current > 1000) { // 1 second cooldown
              lastTriggerRef.current = now;
              
              // Trigger a massive phaser effect
              setDjState({ phaser: true, spin8D: true });
              setIsTriggered(true);
              
              // Turn it off after 1 second
              setTimeout(() => {
                setDjState({ phaser: false, spin8D: false });
                setIsTriggered(false);
              }, 1000);
            }
          }
        }

        prevFrameRef.current = new Uint8ClampedArray(frameData);
      }
      requestRef.current = requestAnimationFrame(detectMotion);
    };

    requestRef.current = requestAnimationFrame(detectMotion);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, isPlaying, setDjState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ color: isTriggered ? '#1db954' : (isActive ? '#ff0f7b' : 'rgba(255,255,255,0.5)'), transition: 'color 0.2s', filter: isTriggered ? 'drop-shadow(0 0 8px #1db954)' : 'none' }}>
          <Sparkles size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white' }}>
            Motion Control DJ
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
            Turn on your webcam and wave your hands to trigger the Phaser drop.
          </p>
        </div>
        <button
          onClick={isActive ? stopCamera : startCamera}
          style={{
            background: isActive ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.1)',
            color: isActive ? '#ff4444' : 'white',
            border: 'none',
            borderRadius: '500px',
            padding: '8px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isActive ? <><CameraOff size={16} /> Stop Camera</> : <><Camera size={16} /> Start Camera</>}
        </button>
      </div>
      
      {/* Hidden elements for processing */}
      <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
      <canvas ref={canvasRef} width="64" height="64" style={{ display: 'none' }} />
    </div>
  );
};

export default MotionControlDJ;
