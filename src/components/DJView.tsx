import React from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import {
  Zap, AudioLines, Sparkles, Music2, Wind, Gauge,
  Radio, HeartPulse, Orbit, Disc, Users, PhoneCall, Bot, Activity, Compass, Hexagon
} from 'lucide-react';
import TimeMachine from './TimeMachine';
import GhostWhisperer from './GhostWhisperer';
import MotionControlDJ from './MotionControlDJ';
import { useHapticBass } from '../hooks/useHapticBass';
import { useAnchorSpatialAudio } from '../hooks/useAnchorSpatialAudio';

const DJView: React.FC = () => {
  const { djState, setDjState, isPlaying, currentSong } = usePlayer();
  const { isHitting } = useHapticBass(djState.hapticBass ?? false);
  const { requestPermission: requestSpatialAudio } = useAnchorSpatialAudio(djState.spatialAudio ?? false);

  // ─── Toggle switch ──────────────────────────────────────────────────────────
  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      aria-checked={active}
      role="switch"
      style={{
        width: '51px', height: '31px', borderRadius: '16px',
        background: active ? '#1db954' : 'rgba(255,255,255,0.18)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0, transition: 'background 0.25s',
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: active ? '22px' : '2px',
        width: '27px', height: '27px',
        borderRadius: '50%', background: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        transition: 'left 0.25s cubic-bezier(.34,1.56,.64,1)',
      }} />
    </button>
  );

  // ─── Row item ───────────────────────────────────────────────────────────────
  const Row = ({
    icon, title, desc, right,
  }: { icon: React.ReactNode; title: string; desc?: string; right: React.ReactNode }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '16px',
      padding: '14px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'white' }}>{title}</p>
        {desc && <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{desc}</p>}
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );

  // ─── Slider row ─────────────────────────────────────────────────────────────
  const SliderRow = ({
    icon, title, value, min, max, color, unit, onChange,
  }: {
    icon: React.ReactNode; title: string; value: number;
    min: number; max: number; color: string; unit: string;
    onChange: (v: number) => void;
  }) => (
    <div style={{ padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>{icon}</div>
        <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'white', flex: 1 }}>{title}</p>
        <span style={{
          fontSize: '13px', fontWeight: 700,
          color: value > min ? color : 'rgba(255,255,255,0.3)',
          background: value > min ? `${color}18` : 'transparent',
          padding: '2px 10px', borderRadius: '12px',
          border: value > min ? `1px solid ${color}44` : '1px solid transparent',
          transition: 'all 0.2s',
        }}>
          {value > min ? `${value}${unit}` : 'Off'}
        </span>
      </div>
      <div style={{ paddingLeft: '36px' }}>
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{
            width: '100%', height: '4px', WebkitAppearance: 'none',
            background: `linear-gradient(to right, ${color} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.15) ${((value - min) / (max - min)) * 100}%)`,
            borderRadius: '2px', cursor: 'pointer', outline: 'none',
          }}
        />
      </div>
    </div>
  );

  // ─── Section header ─────────────────────────────────────────────────────────
  const SectionHeader = ({ title }: { title: string }) => (
    <p style={{
      margin: 0,
      padding: '20px 24px 8px',
      fontSize: '13px', fontWeight: 700,
      color: 'rgba(255,255,255,0.5)',
      textTransform: 'uppercase', letterSpacing: '1.5px',
    }}>{title}</p>
  );

  const anyActive = djState.bass > 0 || djState.spin8D || djState.nightcore || djState.lofi
    || djState.karaoke || djState.tremolo || djState.phaser || djState.vinyl
    || djState.chorus || djState.telephone || djState.alien || (djState.reverb ?? 0) > 0
    || (djState.speed ?? 10) !== 10 || djState.astralMode;

  return (
    <div className="main-view" style={{ padding: 0, background: '#000' }}>
      <style>{`
        @keyframes eq-pulse {
          0%, 100% { height: 6px; }
          50% { height: 28px; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(180deg, #1a2a1a 0%, #000 100%)',
        padding: '32px 24px 24px',
        display: 'flex', alignItems: 'center', gap: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Album art or placeholder */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={currentSong?.coverArt || (currentSong ? getCoverArtUrl(currentSong.audioId) : '/logo.png')}
            onError={e => { e.currentTarget.src = '/logo.png'; }}
            alt=""
            style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', display: 'block' }}
          />
          {anyActive && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '8px',
              border: '2px solid var(--spotify-green)',
              boxShadow: '0 0 16px rgba(29,185,84,0.4)',
              pointerEvents: 'none',
            }} />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>DJ Studio</p>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Audio Effects
          </h1>
          {currentSong
            ? <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSong.title} — {currentSong.artist}</p>
            : <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Play a song to hear effects in real-time</p>}
        </div>

        {/* Mini live visualizer */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px', flexShrink: 0 }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{
              width: '3px', borderRadius: '2px',
              background: anyActive ? 'var(--spotify-green)' : 'rgba(255,255,255,0.15)',
              height: isPlaying && anyActive ? undefined : '4px',
              animation: isPlaying && anyActive
                ? `eq-pulse ${0.4 + (i % 4) * 0.15}s infinite alternate ease-in-out`
                : 'none',
              animationDelay: `${i * 0.06}s`,
            }} />
          ))}
        </div>
      </div>

      {/* ── Scrollable settings list ────────────────────────────────────── */}
      <div style={{ paddingBottom: '120px' }}>

        {/* Active badge */}
        {anyActive && (
          <div style={{ padding: '12px 24px', background: 'rgba(29,185,84,0.08)', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--spotify-green)', flexShrink: 0, boxShadow: '0 0 6px rgba(29,185,84,0.8)' }} />
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--spotify-green)', fontWeight: 600 }}>Effects active — sound is being processed</p>
          </div>
        )}

        {/* ── Spiritual ─── */}
        <SectionHeader title="Spiritual" />
        <Row
          icon={<Hexagon size={20} color={djState.astralMode ? '#b45bff' : 'currentColor'} style={{ transition: 'color 0.3s' }} />}
          title="Astral Projection"
          desc="432Hz tuning + Theta Binaural Beats for deep meditation"
          right={
            <button
              onClick={() => setDjState({ astralMode: !djState.astralMode })}
              style={{
                background: djState.astralMode ? 'transparent' : 'white',
                color: djState.astralMode ? '#b45bff' : 'black',
                border: djState.astralMode ? '1px solid #b45bff' : '1px solid white',
                padding: '6px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                transition: 'all 0.3s ease', letterSpacing: '0.5px', textTransform: 'uppercase',
                boxShadow: djState.astralMode ? '0 0 15px rgba(180, 91, 255, 0.3)' : 'none'
              }}
            >
              {djState.astralMode ? 'Return to Earth' : 'Ascend'}
            </button>
          }
        />

        {/* ── Time Machine ─── */}
        <TimeMachine />

        {/* ── Experimental Features ─── */}
        <SectionHeader title="Next-Gen Experimental" />
        <Row
          icon={<Activity size={20} color={isHitting ? 'var(--spotify-green)' : 'currentColor'} style={{ transition: 'color 0.1s' }} />}
          title="Haptic Bass Engine"
          desc="Phone vibrates to the kick drum (Android only)"
          right={<Toggle active={djState.hapticBass ?? false} onClick={() => setDjState({ hapticBass: !djState.hapticBass })} />}
        />
        <Row
          icon={<Compass size={20} />}
          title="Anchor Spatial Audio"
          desc="Locks the music to a physical spot in your room"
          right={<Toggle active={djState.spatialAudio ?? false} onClick={async () => {
            const nextState = !djState.spatialAudio;
            if (nextState) {
              const granted = await requestSpatialAudio();
              if (!granted) {
                alert('Gyroscope permission denied.');
                return;
              }
            }
            setDjState({ spatialAudio: nextState });
          }} />}
        />
        <GhostWhisperer />
        <MotionControlDJ />

        {/* ── Equalizer ─── */}
        <SectionHeader title="Equalizer" />
        <SliderRow
          icon={<AudioLines size={20} />}
          title="Bass Boost"
          value={djState.bass} min={0} max={25}
          color="var(--spotify-green)" unit=" dB"
          onChange={v => setDjState({ bass: v })}
        />
        <SliderRow
          icon={<Wind size={20} />}
          title="Reverb / Echo"
          value={djState.reverb ?? 0} min={0} max={10}
          color="#4fc3f7" unit="x"
          onChange={v => setDjState({ reverb: v })}
        />
        <SliderRow
          icon={<Gauge size={20} />}
          title="Playback Speed"
          value={djState.speed ?? 10} min={5} max={20}
          color="#ffb74d" unit="x"
          onChange={v => setDjState({ speed: v })}
        />

        {/* ── Sound Effects ─── */}
        <SectionHeader title="Sound Effects" />
        <Row
          icon={<Sparkles size={20} />}
          title="8D Surround"
          desc="Spins audio 360° around your head — best with headphones"
          right={<Toggle active={djState.spin8D} onClick={() => setDjState({ spin8D: !djState.spin8D })} />}
        />
        <Row
          icon={<Zap size={20} />}
          title="Nightcore"
          desc="Higher pitch + faster tempo for high-energy vibes"
          right={<Toggle active={djState.nightcore} onClick={() => setDjState({ nightcore: !djState.nightcore })} />}
        />
        <Row
          icon={<Radio size={20} />}
          title="Lo-Fi Mode"
          desc="Warms the sound for chill study sessions"
          right={<Toggle active={djState.lofi ?? false} onClick={() => setDjState({ lofi: !djState.lofi })} />}
        />
        <Row
          icon={<Music2 size={20} />}
          title="Vocal Boost"
          desc="Amplifies mid-range to bring out the vocals"
          right={<Toggle active={djState.karaoke ?? false} onClick={() => setDjState({ karaoke: !djState.karaoke })} />}
        />

        {/* ── Advanced ─── */}
        <SectionHeader title="Advanced" />
        <Row
          icon={<HeartPulse size={20} />}
          title="Tremolo Pulse"
          desc="Rhythmic stuttering volume modulation"
          right={<Toggle active={djState.tremolo ?? false} onClick={() => setDjState({ tremolo: !djState.tremolo })} />}
        />
        <Row
          icon={<Orbit size={20} />}
          title="Phaser Sweep"
          desc="Psychedelic swirling frequency sweeps"
          right={<Toggle active={djState.phaser ?? false} onClick={() => setDjState({ phaser: !djState.phaser })} />}
        />
        <Row
          icon={<Disc size={20} />}
          title="Vinyl Overdrive"
          desc="Harmonic distortion for vintage warmth"
          right={<Toggle active={djState.vinyl ?? false} onClick={() => setDjState({ vinyl: !djState.vinyl })} />}
        />
        <Row
          icon={<Users size={20} />}
          title="Chorus"
          desc="Makes the sound like a choir"
          right={<Toggle active={djState.chorus ?? false} onClick={() => setDjState({ chorus: !djState.chorus })} />}
        />
        <Row
          icon={<PhoneCall size={20} />}
          title="Telephone EQ"
          desc="Vintage phone call effect"
          right={<Toggle active={djState.telephone ?? false} onClick={() => setDjState({ telephone: !djState.telephone })} />}
        />
        <Row
          icon={<Bot size={20} />}
          title="Alien Ring Mod"
          desc="Extraterrestrial robotic voice distortion"
          right={<Toggle active={djState.alien ?? false} onClick={() => setDjState({ alien: !djState.alien })} />}
        />

        {/* Reset button */}
        {anyActive && (
          <div style={{ padding: '24px' }}>
            <button
              onClick={() => setDjState({ bass: 0, spin8D: false, nightcore: false, reverb: 0, speed: 10, lofi: false, karaoke: false, tremolo: false, phaser: false, vinyl: false, chorus: false, telephone: false, alien: false })}
              style={{
                width: '100%', padding: '14px',
                borderRadius: '500px', border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent', color: 'white', fontSize: '14px',
                fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            >
              Reset All Effects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DJView;
