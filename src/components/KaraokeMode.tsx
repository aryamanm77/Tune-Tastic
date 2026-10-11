import React, { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface LyricLine {
  time: number;
  text: string;
}

const parseLrc = (lrc: string): LyricLine[] => {
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseInt(match[3], 10) * (match[3].length === 2 ? 10 : 1);
      const time = minutes * 60 + seconds + ms / 1000;
      const text = line.replace(timeRegex, '').trim();
      
      // If line is empty but has a timestamp, it usually indicates an instrumental break
      result.push({ time, text: text || '♪' });
    }
  }
  return result;
};

const KaraokeMode: React.FC = () => {
  const { currentSong, currentTime, duration, seekTo } = usePlayer();
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentSong) return;
    
    let isMounted = true;
    const fetchLyrics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Clean up title for better API matching (e.g., remove " (feat. ...)")
        const cleanTitle = currentSong.title.replace(/\([^)]*\)/g, '').trim();
        
        const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(currentSong.artist)}&track_name=${encodeURIComponent(cleanTitle)}`);
        
        if (!res.ok) throw new Error('Not found');
        
        const data = await res.json();
        if (!isMounted) return;
        
        if (data.syncedLyrics) {
          setLyrics(parseLrc(data.syncedLyrics));
          setIsSynced(true);
        } else if (data.plainLyrics) {
          setLyrics([{ time: 0, text: data.plainLyrics }]);
          setIsSynced(false);
        } else {
          throw new Error('No lyrics available');
        }
      } catch (err) {
        if (isMounted) setError("Looks like we don't have lyrics for this song.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchLyrics();
    
    return () => { isMounted = false; };
  }, [currentSong]);

  // Find current lyric index based on time
  const activeIndex = isSynced ? lyrics.findIndex((l, i) => 
    currentTime >= l.time && (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
  ) : -1;

  // Auto-scroll to active lyric
  // A single lyric line is approx 56px (36px font + margins).
  const LINE_HEIGHT = 56;
  const offset = activeIndex !== -1 ? (activeIndex * LINE_HEIGHT) : 0;

  const handleLyricClick = (time: number) => {
    if (isSynced && duration > 0) {
      seekTo(time / duration);
    }
  };

  return (
    <div style={{
      width: '100%', 
      height: '100%', 
      minHeight: '400px',
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'flex-start',
      backgroundColor: 'transparent',
      padding: '32px', 
      position: 'relative', 
      overflow: 'hidden',
    }}>
      <style>{`
        .lyric-line {
          transition: color 0.3s ease, font-size 0.3s ease;
          text-align: left;
          margin: 16px 0;
          cursor: pointer;
          transform-origin: left center;
        }
        .lyric-line:hover {
          color: rgba(255,255,255,0.8) !important;
        }
        .lyric-active {
          font-size: 40px;
          font-weight: 800;
          color: #ffffff;
        }
        .lyric-inactive {
          font-size: 32px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.4);
        }
        .lyrics-scroll-container {
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          width: 100%;
          padding-top: 100px;
          padding-bottom: 200px;
        }
      `}</style>
      
      {loading && (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)' }}>Loading lyrics...</h2>
        </div>
      )}
      
      {error && !loading && (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ color: 'rgba(255,255,255,0.5)' }}>{error}</h2>
        </div>
      )}

      {!loading && !error && lyrics.length > 0 && (
        isSynced ? (
          <div style={{ flex: 1, position: 'relative', width: '100%' }}>
            <div 
              className="lyrics-scroll-container"
              style={{ transform: `translateY(-${offset}px)` }}
            >
              {lyrics.map((l, i) => (
                <div 
                  key={i} 
                  onClick={() => handleLyricClick(l.time)}
                  className={`lyric-line ${i === activeIndex ? 'lyric-active' : 'lyric-inactive'}`}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ overflowY: 'auto', flex: 1, paddingRight: '16px' }}>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '24px', fontWeight: '600', color: '#fff', lineHeight: '1.6' }}>
              {lyrics[0].text}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default KaraokeMode;
