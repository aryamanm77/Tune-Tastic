import React, { useState } from 'react';
import { Ghost, Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

const GhostWhisperer: React.FC = () => {
  const { isPlaying } = usePlayer();
  const [text, setText] = useState('You are unstoppable');
  const [isWhispering, setIsWhispering] = useState(false);

  const handleWhisper = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis not supported in this browser.');
      return;
    }

    if (isWhispering) {
      window.speechSynthesis.cancel();
      setIsWhispering(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Configure to sound creepy/ethereal
    utterance.pitch = 0.1; // Very low pitch
    utterance.rate = 0.6; // Slow rate
    utterance.volume = 0.4; // Low volume so it sits "under" the music

    utterance.onend = () => setIsWhispering(false);
    utterance.onerror = () => setIsWhispering(false);

    setIsWhispering(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ color: 'var(--spotify-green)' }}><Ghost size={24} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white' }}>
            The Ghost Whisperer
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}>
            Injects subliminal text-to-speech affirmations beneath the music.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter an affirmation..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '10px 16px',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleWhisper}
          disabled={!isPlaying && !isWhispering}
          style={{
            background: isWhispering ? 'rgba(255,0,0,0.2)' : 'var(--spotify-green)',
            color: isWhispering ? '#ff4444' : 'black',
            border: 'none',
            borderRadius: '8px',
            padding: '0 20px',
            fontWeight: 700,
            cursor: (!isPlaying && !isWhispering) ? 'not-allowed' : 'pointer',
            opacity: (!isPlaying && !isWhispering) ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {isWhispering ? 'Stop' : <><Play size={16} fill="currentColor" /> Whisper</>}
        </button>
      </div>
    </div>
  );
};

export default GhostWhisperer;
