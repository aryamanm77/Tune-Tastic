import React, { useState, useEffect, useRef } from 'react';
import { usePlayer, Song } from '../context/PlayerContext';
import { RefreshCw, Trophy, Volume2 } from 'lucide-react';
import { getCoverArtUrl } from '../utils/cloudinary';

const MusicTrivia: React.FC = () => {
  const { songs, playSong, togglePlayPause, setVolume } = usePlayer();
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [, setRound] = useState(1);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'revealed'>('idle');
  const [targetSong, setTargetSong] = useState<Song | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startRound = () => {
    if (songs.length < 4) return;
    
    const targetIdx = Math.floor(Math.random() * songs.length);
    const target = songs[targetIdx];
    setTargetSong(target);
    
    const wrongOptions: string[] = [];
    while (wrongOptions.length < 3) {
      const idx = Math.floor(Math.random() * songs.length);
      if (idx !== targetIdx && !wrongOptions.includes(songs[idx].title)) {
        wrongOptions.push(songs[idx].title);
      }
    }
    
    const allOptions = [...wrongOptions, target.title].sort(() => Math.random() - 0.5);
    setOptions(allOptions);
    setSelectedOption(null);
    setGameState('playing');
    
    setVolume(1);
    playSong(target);
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      // Pause after 5 seconds
      togglePlayPause(); 
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleGuess = (title: string) => {
    if (gameState !== 'playing') return;
    
    setSelectedOption(title);
    setGameState('revealed');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Pause the song since the round is over
    togglePlayPause();
    
    if (title === targetSong?.title) {
      setScore(s => s + 100 * (streak + 1));
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Volume2 size={32} color="var(--spotify-green)" />
          Guess The Song
        </h1>
        <div style={{ display: 'flex', gap: '16px', fontSize: '18px', fontWeight: 600 }}>
          <span style={{ color: 'var(--spotify-green)' }}>Score: {score}</span>
          <span style={{ color: '#FF9500' }}>Streak: 🔥 {streak}</span>
        </div>
      </div>

      {gameState === 'idle' ? (
        <div style={{ textAlign: 'center', padding: '64px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
          <Trophy size={64} color="var(--spotify-green)" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '24px', margin: '0 0 12px' }}>Ready to test your ears?</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>We'll play a 5-second clip of a random song from your library.</p>
          <button 
            onClick={startRound}
            style={{ padding: '16px 48px', fontSize: '18px', fontWeight: 700, borderRadius: '500px', border: 'none', backgroundColor: 'var(--spotify-green)', color: 'black', cursor: 'pointer' }}
          >
            Start Game
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Target Visual */}
          <div style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
            height: '240px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '16px', position: 'relative', overflow: 'hidden' 
          }}>
            {gameState === 'revealed' && targetSong ? (
              <>
                <img src={targetSong.coverArt || getCoverArtUrl(targetSong.audioId)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3, filter: 'blur(10px)' }} />
                <img src={targetSong.coverArt || getCoverArtUrl(targetSong.audioId)} alt="" style={{ width: '160px', height: '160px', borderRadius: '12px', zIndex: 1, boxShadow: '0 12px 32px rgba(0,0,0,0.5)' }} />
                <h3 style={{ margin: '16px 0 0', zIndex: 1, fontSize: '20px' }}>{targetSong.title}</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', zIndex: 1 }}>{targetSong.artist}</p>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <Volume2 size={48} color="white" style={{ animation: 'pulse 1s infinite' }} />
                <p style={{ marginTop: '16px', fontSize: '18px', fontWeight: 600, color: 'var(--spotify-green)' }}>Listening...</p>
              </div>
            )}
            <style>{`@keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }`}</style>
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {options.map(opt => {
              let bg = 'rgba(255,255,255,0.1)';
              if (gameState === 'revealed') {
                if (opt === targetSong?.title) bg = 'var(--spotify-green)';
                else if (opt === selectedOption) bg = '#E91429';
              }
              return (
                <button
                  key={opt}
                  onClick={() => handleGuess(opt)}
                  disabled={gameState === 'revealed'}
                  style={{
                    padding: '24px', borderRadius: '12px', border: 'none',
                    backgroundColor: bg, color: bg === 'var(--spotify-green)' ? 'black' : 'white',
                    fontSize: '16px', fontWeight: 600, cursor: gameState === 'revealed' ? 'default' : 'pointer',
                    transition: 'all 0.2s', textAlign: 'center'
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Next Round Button */}
          {gameState === 'revealed' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button 
                onClick={() => { setRound(r => r + 1); startRound(); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 32px', fontSize: '16px', fontWeight: 700, borderRadius: '500px', border: 'none', backgroundColor: 'white', color: 'black', cursor: 'pointer' }}
              >
                <RefreshCw size={20} /> Next Round
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MusicTrivia;
