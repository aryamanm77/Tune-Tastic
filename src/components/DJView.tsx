import React from 'react';
import DJSoundstage from './DJSoundstage';

const DJView: React.FC = () => {
  return (
    <div className="main-view custom-scrollbar" style={{ 
      padding: '24px 32px', 
      paddingBottom: '120px',
      background: 'linear-gradient(to bottom, #121212 0%, #000000 100%)',
      minHeight: '100%'
    }}>
      <h1 style={{ 
        fontSize: '32px', 
        fontWeight: 800, 
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #1db954, #1ed760)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        DJ Live Studio
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Real-time audio processing engine. Tweak your music on the fly.
      </p>

      <DJSoundstage />
    </div>
  );
};

export default DJView;
