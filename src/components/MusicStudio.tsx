import React from 'react';
import { Mic } from 'lucide-react';

const MusicStudio: React.FC = () => {
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
            Produce beats with hand gestures, write lyrics, and record tracks directly into your playlist.
          </p>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Gestures Area */}
        <div style={{ flex: '1 1 400px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700 }}>Gesture Synthesizer</h2>
          <div style={{ height: '300px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Camera Feed Loading...</p>
          </div>
        </div>

        {/* Lyrics Area */}
        <div style={{ flex: '1 1 300px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700 }}>Lyrics Prompter</h2>
          <textarea 
            placeholder="Paste your lyrics here..."
            style={{ width: '100%', height: '200px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '16px', color: 'white', fontSize: '14px', resize: 'none', fontFamily: 'monospace' }}
          />
          <button style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'var(--spotify-green)', color: 'black', border: 'none', borderRadius: '100px', fontWeight: 700, cursor: 'pointer' }}>
            Speak Lyrics
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
