import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export function useHapticBass(enabled: boolean) {
  const { getAnalyserData, isPlaying } = usePlayer();
  const requestRef = useRef<number>();
  const lastVibrateRef = useRef<number>(0);

  // Expose a state indicating if bass is currently hitting (useful for UI testing)
  const [isHitting, setIsHitting] = useState(false);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (!enabled || !isPlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const checkBass = () => {
      const data = getAnalyserData();
      if (data.length > 0) {
        // Bass frequencies are usually in the lower bins (e.g. 0-5)
        let bassSum = 0;
        const bassRange = 6;
        for (let i = 0; i < bassRange; i++) {
          bassSum += data[i];
        }
        const bassAverage = bassSum / bassRange;

        // Threshold (0-255). 220 is a strong kick.
        if (bassAverage > 230) {
          const now = Date.now();
          // Debounce so it doesn't vibrate constantly (wait 250ms between kicks)
          if (now - lastVibrateRef.current > 250) {
            lastVibrateRef.current = now;
            
            setIsHitting(true);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = window.setTimeout(() => setIsHitting(false), 100);

            if ('vibrate' in navigator) {
              navigator.vibrate(40); // 40ms quick vibration for a kick drum
            }
          }
        }
      }
      requestRef.current = requestAnimationFrame(checkBass);
    };

    requestRef.current = requestAnimationFrame(checkBass);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, isPlaying, getAnalyserData]);

  return { isHitting };
}
