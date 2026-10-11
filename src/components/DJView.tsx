import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { getCoverArtUrl } from '../utils/cloudinary';
import {
  Zap, AudioLines, Sparkles, Music2, Wind, Gauge,
  Radio, HeartPulse, Orbit, Disc, Users, PhoneCall, Bot, Activity, Compass, Hexagon, Rocket, Moon,
  Film, Check, X, Power
} from 'lucide-react';
import TimeMachine from './TimeMachine';
import GhostWhisperer from './GhostWhisperer';
import MotionControlDJ from './MotionControlDJ';
import { useHapticBass } from '../hooks/useHapticBass';
import { useAnchorSpatialAudio } from '../hooks/useAnchorSpatialAudio';
import { VIDEO_CATEGORIES } from '../data/videoCategories';

const DJView: React.FC = () => {
  const { djState, setDjState, isPlaying, currentSong } = usePlayer();
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoFilter, setVideoFilter] = useState<'all' | 'cars' | 'nature' | 'music' | 'cyber' | 'space' | 'cozy' | 'retro'>('all');
  const { isHitting } = useHapticBass(djState.hapticBass ?? false);
  const { requestPermission: requestSpatialAudio } = useAnchorSpatialAudio(djState.spatialAudio ?? false);

  const isVideoActive = Boolean(djState.themeBackground && djState.themeBackground !== 'none' && !djState.nebulaMode);
  const activeCategory = VIDEO_CATEGORIES.find(c => c.id === djState.themeBackground) || VIDEO_CATEGORIES[0];

  // ─── Toggle switch ──────────────────────────────────────────────────────────
  const Toggle = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      onMouseDown={e => e.preventDefault()}
      aria-checked={active}
      role="switch"
      style={{
        width: '51px', height: '31px', borderRadius: '16px',
        background: active ? '#1db954' : 'rgba(255,255,255,0.18)',
        border: 'none', cursor: 'pointer', position: 'relative',
        flexShrink: 0,
        transition: 'background 0.3s cubic-bezier(0.4,0,0.2,1)',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: active ? '22px' : '2px',
        width: '27px', height: '27px',
        borderRadius: '50%', background: 'white',
        boxShadow: active ? '0 2px 8px rgba(29,185,84,0.4)' : '0 2px 6px rgba(0,0,0,0.3)',
        transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
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
    || (djState.speed ?? 10) !== 10 || djState.astralMode || djState.zeroGravity;

  return (
    <div className="main-view" style={{ padding: 0, background: 'transparent' }}>
      <div style={{ position: 'relative', zIndex: 10 }}>
        <style>{`
        @keyframes eq-pulse {
          0%, 100% { height: 6px; }
          50% { height: 28px; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="dj-header" style={{
        padding: '32px 24px 24px',
        display: 'flex', alignItems: 'center', gap: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        {/* Album art or placeholder */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={currentSong?.coverArt || (currentSong ? getCoverArtUrl(currentSong.audioId) : './logo.png')}
            onError={e => { e.currentTarget.src = './logo.png'; }}
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

        {/* ── TOP SECTION: Background Video Animation Studio (Spotify Styled) ─── */}
        <div style={{
          margin: '20px 24px 24px',
          padding: '22px 24px',
          borderRadius: '20px',
          background: isVideoActive 
            ? 'linear-gradient(135deg, rgba(29, 185, 84, 0.14) 0%, rgba(20, 20, 28, 0.85) 100%)' 
            : 'rgba(255, 255, 255, 0.03)',
          border: isVideoActive ? '1px solid rgba(29, 185, 84, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isVideoActive ? '0 12px 36px rgba(29, 185, 84, 0.2)' : '0 8px 24px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}>
          {/* Header row with Title and Status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: isVideoActive ? '#1db954' : 'rgba(255,255,255,0.08)',
                color: isVideoActive ? '#000000' : 'rgba(255,255,255,0.6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isVideoActive ? '0 0 20px rgba(29,185,84,0.5)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <Film size={22} strokeWidth={2.4} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'white' }}>
                    Background Video Studio
                  </h2>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '100px',
                    background: isVideoActive ? 'rgba(29, 185, 84, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: isVideoActive ? '#1db954' : 'rgba(255, 255, 255, 0.4)',
                    border: isVideoActive ? '1px solid rgba(29, 185, 84, 0.4)' : '1px solid transparent',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isVideoActive ? '#1db954' : 'rgba(255,255,255,0.3)', boxShadow: isVideoActive ? '0 0 8px #1db954' : 'none' }} />
                    {isVideoActive ? 'ACTIVE IN HOME & ALL ROOMS' : 'TURNED OFF'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                  Cinematic real video clips playing smoothly across Home, Search, Library, and DJ Studio
                </p>
              </div>
            </div>

            {/* Spotify Style Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  if (isVideoActive) {
                    setDjState({ themeBackground: 'none' });
                    localStorage.setItem('tunetastic_theme_bg', 'none');
                  } else {
                    const fallbackId = (activeCategory && activeCategory.id !== 'none') ? activeCategory.id : 'racing-cars';
                    setDjState({ themeBackground: fallbackId, nebulaMode: false });
                    localStorage.setItem('tunetastic_theme_bg', fallbackId);
                  }
                }}
                style={{
                  background: isVideoActive ? '#1db954' : 'white',
                  color: 'black',
                  padding: '12px 28px',
                  borderRadius: '9999px',
                  fontWeight: 800,
                  fontSize: '14px',
                  letterSpacing: '0.4px',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: isVideoActive ? '0 6px 24px rgba(29, 185, 84, 0.55)' : '0 4px 16px rgba(255,255,255,0.2)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.04)';
                  e.currentTarget.style.boxShadow = isVideoActive ? '0 8px 30px rgba(29, 185, 84, 0.7)' : '0 6px 20px rgba(255,255,255,0.35)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isVideoActive ? '0 6px 24px rgba(29, 185, 84, 0.55)' : '0 4px 16px rgba(255,255,255,0.2)';
                }}
              >
                <Power size={18} strokeWidth={2.8} />
                <span>{isVideoActive ? 'Turn Off Background Video' : 'Turn On Background Video'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowVideoModal(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '9999px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                <Sparkles size={16} color="var(--spotify-green)" />
                <span>All 20 Categories</span>
              </button>
            </div>
          </div>

          {/* Engine Mode Toggle: YouTube Stream vs Instant Offline */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '16px',
            flexWrap: 'wrap', gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Engine Mode:</span>
              <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '100px' }}>
                <button
                  type="button"
                  onClick={() => setDjState({ videoSourceMode: 'youtube' })}
                  style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                    background: (djState.videoSourceMode || 'youtube') === 'youtube' ? 'var(--spotify-green)' : 'transparent',
                    color: (djState.videoSourceMode || 'youtube') === 'youtube' ? '#000000' : 'rgba(255,255,255,0.6)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  YouTube 4K (Cropped / No Buttons)
                </button>
                <button
                  type="button"
                  onClick={() => setDjState({ videoSourceMode: 'instant' })}
                  style={{
                    padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 700,
                    background: djState.videoSourceMode === 'instant' ? 'var(--spotify-green)' : 'transparent',
                    color: djState.videoSourceMode === 'instant' ? '#000000' : 'rgba(255,255,255,0.6)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  Instant Offline (Zero Buffer / No Internet)
                </button>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Current theme: <strong style={{ color: 'white' }}>{activeCategory.name}</strong></span>
            </div>
          </div>

          {/* Quick Select Category Carousel Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {VIDEO_CATEGORIES.map(c => {
              const isSelected = isVideoActive && djState.themeBackground === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setDjState({ themeBackground: c.id, nebulaMode: false });
                    localStorage.setItem('tunetastic_theme_bg', c.id);
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '100px',
                    background: isSelected ? 'var(--spotify-green)' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? 'black' : 'white',
                    border: isSelected ? '1px solid var(--spotify-green)' : '1px solid rgba(255,255,255,0.1)',
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{c.icon}</span>
                  <span>{c.category}</span>
                </button>
              );
            })}
          </div>
        </div>

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

        <SectionHeader title="Next-Gen Experimental" />

        <Row
          icon={<Rocket size={20} />}
          title="Warp Drive"
          desc="Slow down time and stretch the stars into hyperspace"
          right={<Toggle active={djState.isWarping ?? false} onClick={() => setDjState({ isWarping: !djState.isWarping })} />}
        />

        <Row
          icon={<Moon size={20} />}
          title="Zero-Gravity Mode"
          desc="Floats the music in a massive cavern of space"
          right={<Toggle active={djState.zeroGravity ?? false} onClick={() => setDjState({ zeroGravity: !djState.zeroGravity })} />}
        />

        <Row
          icon={<Sparkles size={20} />}
          title="Nebula Starfield UI"
          desc="Immersive space visualizer background"
          right={<Toggle active={djState.nebulaMode ?? false} onClick={() => setDjState({ nebulaMode: !djState.nebulaMode, themeBackground: 'none' })} />}
        />

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

      {/* ── 20 Video Backgrounds Modal ─────────────────────────────── */}
      {showVideoModal && (
        <>
          <div 
            onClick={() => setShowVideoModal(false)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 9998,
              backdropFilter: 'blur(12px)',
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '94%', maxWidth: '880px',
            maxHeight: '88vh',
            background: '#141419',
            borderRadius: '20px',
            zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 32px 80px rgba(0,0,0,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '22px 26px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#1a1a22'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Film size={22} color="var(--spotify-green)" /> Background Video Animation (20 Real Clips)
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.55)' }}>
                  Real HD looping video streaming in the background of the entire app: Home, Search, Playlists & DJ Studio
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Direct Turn Off Button */}
                {isVideoActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setDjState({ themeBackground: 'none' });
                      localStorage.setItem('tunetastic_theme_bg', 'none');
                      setShowVideoModal(false);
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#ef4444',
                      padding: '8px 14px',
                      borderRadius: '100px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 700
                    }}
                  >
                    <Power size={14} /> Turn Off Video
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: 'none',
                    color: 'white', width: '34px', height: '34px',
                    borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div style={{
              padding: '12px 24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '8px', overflowX: 'auto',
              background: '#16161e'
            }}>
              {[
                { id: 'all', label: 'All 20 Clips' },
                { id: 'cars', label: '🏎️ Cars & Racing' },
                { id: 'nature', label: '🌲 Nature & Ocean' },
                { id: 'music', label: '🎵 Music Stage' },
                { id: 'cyber', label: '🌆 Cyberpunk & City' },
                { id: 'space', label: '🌌 Space & Sci-Fi' },
                { id: 'cozy', label: '☕ Chill & Lo-Fi' },
                { id: 'retro', label: '📼 Vinyl & Retro' },
              ].map(f => {
                const isSelected = videoFilter === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setVideoFilter(f.id as any)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 800 : 500,
                      background: isSelected ? 'white' : 'rgba(255,255,255,0.06)',
                      color: isSelected ? 'black' : 'rgba(255,255,255,0.7)',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* Video Categories Grid */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '14px',
              flex: 1
            }}>
              {VIDEO_CATEGORIES.filter(cat => {
                if (videoFilter === 'all') return true;
                if (videoFilter === 'cars') return cat.id.includes('racing') || cat.id.includes('city-timelapse');
                if (videoFilter === 'nature') return cat.id.includes('nature') || cat.id.includes('ocean') || cat.id.includes('mountain') || cat.id.includes('sunset') || cat.id.includes('clouds') || cat.id.includes('forest') || cat.id.includes('desert');
                if (videoFilter === 'music') return cat.id.includes('music');
                if (videoFilter === 'cyber') return cat.id.includes('cyberpunk') || cat.id.includes('city') || cat.id.includes('electric');
                if (videoFilter === 'space') return cat.id.includes('space') || cat.id.includes('warp') || cat.id.includes('aurora');
                if (videoFilter === 'cozy') return cat.id.includes('fireplace') || cat.id.includes('rain') || cat.id.includes('lofi');
                if (videoFilter === 'retro') return cat.id.includes('vinyl') || cat.id.includes('synthwave');
                return true;
              }).map(cat => {
                const isSelected = isVideoActive && djState.themeBackground === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setDjState({ themeBackground: cat.id, nebulaMode: false });
                      localStorage.setItem('tunetastic_theme_bg', cat.id);
                      setShowVideoModal(false);
                    }}
                    style={{
                      background: isSelected ? 'rgba(29,185,84,0.12)' : 'rgba(255,255,255,0.04)',
                      border: isSelected ? `2px solid var(--spotify-green)` : `1px solid rgba(255,255,255,0.08)`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex', flexDirection: 'column', gap: '10px',
                      boxShadow: isSelected ? '0 0 20px rgba(29,185,84,0.2)' : 'none'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.borderColor = cat.accentColor;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'none';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{cat.icon}</span>
                      {isSelected ? (
                        <span style={{
                          fontSize: '11px', fontWeight: 800, color: 'black',
                          background: 'var(--spotify-green)', padding: '3px 10px',
                          borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px',
                          boxShadow: '0 0 12px rgba(29,185,84,0.5)'
                        }}>
                          <Check size={12} strokeWidth={3} /> ACTIVE NOW
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px', fontWeight: 700, color: cat.accentColor,
                          background: `${cat.accentColor}18`, border: `1px solid ${cat.accentColor}44`,
                          padding: '2px 8px', borderRadius: '100px'
                        }}>
                          {cat.category}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'white' }}>
                        {cat.name}
                      </h4>
                      <p style={{ margin: '5px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.35 }}>
                        {cat.description}
                      </p>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        color: isSelected ? 'var(--spotify-green)' : 'rgba(255,255,255,0.35)',
                      }}>
                        {isSelected ? '● Streaming across app' : 'Click to stream →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DJView;
