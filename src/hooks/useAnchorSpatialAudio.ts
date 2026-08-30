import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';

export function useAnchorSpatialAudio(enabled: boolean) {
  const { setPan } = usePlayer();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const baselineAlphaRef = useRef<number | null>(null);

  const requestPermission = async () => {
    // @ts-ignore (iOS 13+ requires this)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const permissionState = await DeviceOrientationEvent.requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error(error);
        return false;
      }
    } else {
      // Non-iOS 13+ devices don't require permission
      setPermissionGranted(true);
      return true;
    }
  };

  useEffect(() => {
    if (!enabled) {
      setPan(0); // Reset pan when disabled
      baselineAlphaRef.current = null;
      return;
    }

    if (!permissionGranted) {
      requestPermission();
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { alpha } = event; // 0 to 360 (compass direction)
      if (alpha === null) return;

      if (baselineAlphaRef.current === null) {
        baselineAlphaRef.current = alpha;
      }

      // Calculate difference from baseline
      let diff = alpha - baselineAlphaRef.current;
      
      // Normalize to -180 to 180
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      // Map a 90 degree turn to full pan (1 or -1)
      // If you turn right (positive diff), the sound should pan left (-1)
      let panValue = -(diff / 90);
      
      // Clamp between -1 and 1
      panValue = Math.max(-1, Math.min(1, panValue));
      
      setPan(panValue);
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [enabled, permissionGranted, setPan]);

  return { requestPermission, permissionGranted };
}
