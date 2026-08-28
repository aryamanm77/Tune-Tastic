import React, { useState, useRef, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Settings2, Zap, AudioLines, Sparkles, Music2, Wind, Gauge, Radio, HeartPulse, Orbit, Disc } from 'lucide-react';

const DJSoundstage: React.FC = () => {
  const { djState, setDjState, isPlaying } = usePlayer();
  const [visualizerBars, setVisualizerBars] = useState<number[]>(Array(20).fill(4));
  const animFrameRef = useRef<number | null>(null);

  // Animate visualizer bars when playing
  useEffect(() => {
    if (!isPlaying) {
      setVisualizerBars(Array(20).fill(4));
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }
    const animate = () => {
      setVisualizerBars(prev => prev.map(() =>
        Math.floor(Math.random() * (djState.bass > 0 ? 48 : 32)) + 4
      ));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [isPlaying, djState.bass]);

  const ToggleCard = ({ 
    active, onClick, color, icon, title, desc 
  }: { 
    active: boolean; onClick: () => void; color: string; 
    icon: React.ReactNode; title: string; desc: string;
  }) => (
    <div onClick={onClick} style={{
      background: active ? `${color}18` : 'rgba(255,255,255,0.03)',
      borderRadius: '12px', padding: '18px',
      border: `1px solid ${active ? color + '66' : 'rgba(255,255,255,0.05)'}`,
      cursor: 'pointer', transition: 'all 0.2s ease',
      display: 'flex', flexDirection: 'column', gap: '10px',
      boxShadow: active ? `0 0 20px ${color}22` : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: active ? color : 'white' }}>
          {icon} {title}
        </span>
        <div style={{
          width: '40px', height: '22px', borderRadius: '11px',
          background: active ? color : 'rgba(255,255,255,0.15)',
          position: 'relative', transition: 'background 0.3s', flexShrink: 0
        }}>
          <div style={{
            position: 'absolute', top: '2px', left: active ? '20px' : '2px',
            width: '18px', height: '18px', background: 'white', borderRadius: '50%',
            transition: 'left 0.3s ease', boxShadow: '0 1px 4px rgba(0,0,0,0.3)'
          }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
    </div>
  );

  const SliderCard = ({
    value, min, max, label, unit, color, icon, onChange
  }: {
    value: number; min: number; max: number; label: string;
    unit: string; color: string; icon: React.ReactNode; onChange: (v: number) => void;
  }) => (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '18px',
      border: `1px solid ${value > min ? color + '44' : 'rgba(255,255,255,0.05)'}`,
      boxShadow: value > min ? `0 0 16px ${color}18` : 'none',
      transition: 'all 0.2s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '14px', color: value > min ? color : 'white' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: '12px', color: value > min ? color : 'var(--text-secondary)', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600 }}>
          {value > min ? `${value}${unit}` : 'OFF'}
        </span>
      </div>
      <input type="range" min={min} max={max} step="1" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          width: '100%', height: '6px', WebkitAppearance: 'none',
          background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%)`,
          borderRadius: '3px', cursor: 'pointer', outline: 'none'
        }}
      />
    </div>
  );

  return (
    <div style={{
      marginBottom: '48px',
      background: 'linear-gradient(135deg, rgba(18,18,18,0.95) 0%, rgba(8,8,8,0.98) 100%)',
      borderRadius: '20px', padding: '28px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '-30%', left: '-10%',
        width: '50%', height: '120%',
        background: 'radial-gradient(ellipse, rgba(29,185,84,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '40%', height: '100%',
        background: 'radial-gradient(ellipse, rgba(141,103,171,0.07) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', position: 'relative' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--spotify-green), #1ed760)',
          padding: '10px', borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(29,185,84,0.4)'
        }}>
          <Settings2 size={20} color="black" />
        </div>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Live DJ Soundstage
          </h2>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '1px', marginTop: '2px' }}>
            {isPlaying ? '🔴 LIVE' : '⏸ PAUSED'} · REAL-TIME AUDIO ENGINE
          </p>
        </div>

        {/* Live Visualizer */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
          {visualizerBars.map((h, i) => (
            <div key={i} style={{
              width: '4px', height: `${h}px`,
              background: isPlaying
                ? `hsl(${140 + i * 5}, 70%, ${50 + i * 1}%)`
                : 'rgba(255,255,255,0.15)',
              borderRadius: '2px',
              transition: isPlaying ? 'height 0.08s ease' : 'height 0.5s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Controls Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', position: 'relative'
      }}>

        {/* Bass Boost */}
        <SliderCard
          value={djState.bass} min={0} max={25} label="Bass Boost"
          unit="dB" color="var(--spotify-green)" icon={<AudioLines size={16} />}
          onChange={v => setDjState({ bass: v })}
        />

        {/* Reverb */}
        <SliderCard
          value={djState.reverb ?? 0} min={0} max={10} label="Reverb / Echo"
          unit="x" color="#4fc3f7" icon={<Wind size={16} />}
          onChange={v => setDjState({ reverb: v })}
        />

        {/* Playback Speed */}
        <SliderCard
          value={djState.speed ?? 10} min={5} max={20} label="Playback Speed"
          unit="x" color="#ffb74d" icon={<Gauge size={16} />}
          onChange={v => setDjState({ speed: v })}
        />

        {/* 8D Audio */}
        <ToggleCard
          active={djState.spin8D}
          onClick={() => setDjState({ spin8D: !djState.spin8D })}
          color="var(--spotify-green)"
          icon={<Sparkles size={16} />}
          title="8D Surround"
          desc="Spins audio 360° around your head. Best with headphones!"
        />

        {/* Nightcore */}
        <ToggleCard
          active={djState.nightcore}
          onClick={() => setDjState({ nightcore: !djState.nightcore })}
          color="#d1a3ff"
          icon={<Zap size={16} />}
          title="Nightcore Mode"
          desc="Higher pitch + faster tempo for high-energy anime vibes."
        />

        {/* Lofi Mode */}
        <ToggleCard
          active={djState.lofi ?? false}
          onClick={() => setDjState({ lofi: !djState.lofi })}
          color="#80cbc4"
          icon={<Radio size={16} />}
          title="Lo-Fi Mode"
          desc="Slows down and warms the sound for chill study sessions."
        />

        {/* Karaoke */}
        <ToggleCard
          active={djState.karaoke ?? false}
          onClick={() => setDjState({ karaoke: !djState.karaoke })}
          color="#f48fb1"
          icon={<Music2 size={16} />}
          title="Vocal Boost"
          desc="Amplifies mid-range frequencies to bring out the vocals."
        />

        {/* Tremolo / Heartbeat */}
        <ToggleCard
          active={djState.tremolo ?? false}
          onClick={() => setDjState({ tremolo: !djState.tremolo })}
          color="#ff5252"
          icon={<HeartPulse size={16} />}
          title="Tremolo Pulse"
          desc="Rhythmic, stuttering heartbeat volume modulation."
        />

        {/* Phaser / Psychedelic */}
        <ToggleCard
          active={djState.phaser ?? false}
          onClick={() => setDjState({ phaser: !djState.phaser })}
          color="#e040fb"
          icon={<Orbit size={16} />}
          title="Phaser Sweep"
          desc="Psychedelic swirling frequency sweeps for a trippy vibe."
        />

        {/* Vinyl / Saturation */}
        <ToggleCard
          active={djState.vinyl ?? false}
          onClick={() => setDjState({ vinyl: !djState.vinyl })}
          color="#ff9100"
          icon={<Disc size={16} />}
          title="Vinyl Overdrive"
          desc="Intense harmonic distortion for gritty vintage warmth."
        />

      </div>

      {/* Active effects strip */}
      {(djState.bass > 0 || djState.spin8D || djState.nightcore || djState.lofi || djState.karaoke || djState.tremolo || djState.phaser || djState.vinyl || (djState.reverb ?? 0) > 0) && (
        <div style={{
          marginTop: '20px', padding: '10px 16px', borderRadius: '10px',
          background: 'rgba(29,185,84,0.08)', border: '1px solid rgba(29,185,84,0.2)',
          display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '1px', fontWeight: 600 }}>ACTIVE:</span>
          {djState.bass > 0 && <Chip label={`Bass +${djState.bass}dB`} color="var(--spotify-green)" />}
          {(djState.reverb ?? 0) > 0 && <Chip label={`Reverb ${djState.reverb}x`} color="#4fc3f7" />}
          {djState.spin8D && <Chip label="8D Surround" color="var(--spotify-green)" />}
          {djState.nightcore && <Chip label="Nightcore" color="#d1a3ff" />}
          {djState.lofi && <Chip label="Lo-Fi" color="#80cbc4" />}
          {djState.karaoke && <Chip label="Vocal Boost" color="#f48fb1" />}
          {djState.tremolo && <Chip label="Tremolo Pulse" color="#ff5252" />}
          {djState.phaser && <Chip label="Phaser Sweep" color="#e040fb" />}
          {djState.vinyl && <Chip label="Vinyl Overdrive" color="#ff9100" />}
        </div>
      )}
    </div>
  );
};

const Chip = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    fontSize: '11px', fontWeight: 700, padding: '3px 10px',
    borderRadius: '20px', background: `${color}22`,
    color: color, border: `1px solid ${color}44`, letterSpacing: '0.5px'
  }}>{label}</span>
);

export default DJSoundstage;
