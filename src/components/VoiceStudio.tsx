import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Trash2, Plus, Check, ChevronDown, ChevronUp, User, Info, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

// Sentences to read aloud during recording
const RECORDING_PROMPTS = [
  "Hello! This is my voice recording for TuneTastic.",
  "I love music and this is how I sound when I sing!",
  "La la la la la la la!",
  "One two three four, this is my voice score!",
  "Ooh yeah, let's go, the beat is hot!",
  "My voice is my music, let it play forever.",
  "Do re mi fa sol la ti do!",
];

interface VoiceAvatar {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  createdAt: string;
}

const VoiceStudio: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState<'intro' | 'naming' | 'recording' | 'preview' | 'done'>('intro');
  const [avatars, setAvatars] = useState<VoiceAvatar[]>([]);
  const [activeAvatarId, setActiveAvatarId] = useState<string | null>(null);
  const [newAvatarName, setNewAvatarName] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSinging, setIsSinging] = useState(false);

  const { isPlaying, setDjState } = usePlayer();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const promptTimerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceLoopRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeAvatar = avatars.find(a => a.id === activeAvatarId) || null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewBlob(blob);
        setPreviewUrl(url);
        setStep('preview');
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setPromptIndex(0);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      promptTimerRef.current = window.setInterval(() => {
        setPromptIndex(p => (p + 1) % RECORDING_PROMPTS.length);
      }, 4000);

    } catch (err) {
      alert('Microphone permission is needed to record your voice! Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (promptTimerRef.current) clearInterval(promptTimerRef.current);
    }
  };

  const saveAvatar = () => {
    if (!previewBlob || !previewUrl) return;
    const name = newAvatarName.trim() || `Voice ${avatars.length + 1}`;
    const newAvatar: VoiceAvatar = {
      id: Date.now().toString(),
      name,
      blob: previewBlob,
      url: previewUrl,
      createdAt: new Date().toLocaleTimeString(),
    };
    const updated = [...avatars, newAvatar];
    setAvatars(updated);
    setActiveAvatarId(newAvatar.id);
    setStep('done');
    setPreviewBlob(null);
    setPreviewUrl(null);
    setNewAvatarName('');
  };

  const deleteAvatar = (id: string) => {
    const updated = avatars.filter(a => a.id !== id);
    setAvatars(updated);
    if (activeAvatarId === id) setActiveAvatarId(updated[0]?.id || null);
  };

  const playPreview = () => {
    if (!previewUrl) return;
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
      setIsPlayingPreview(false);
      return;
    }
    const audio = new Audio(previewUrl);
    previewAudioRef.current = audio;
    audio.play();
    setIsPlayingPreview(true);
    audio.onended = () => {
      setIsPlayingPreview(false);
      previewAudioRef.current = null;
    };
  };

  const playAvatar = (avatar: VoiceAvatar) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    const audio = new Audio(avatar.url);
    previewAudioRef.current = audio;
    audio.play();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const startSinging = () => {
    if (!activeAvatar) return;
    if (voiceLoopRef.current) { voiceLoopRef.current.pause(); voiceLoopRef.current = null; }
    const audio = new Audio(activeAvatar.url);
    audio.loop = true;
    audio.playbackRate = 1.0;
    audio.volume = 0.9;
    audio.play();
    voiceLoopRef.current = audio;
    // Cut original vocals so user's voice stands out
    setDjState({ karaoke: true });
    setIsSinging(true);
  };

  const stopSinging = () => {
    if (voiceLoopRef.current) {
      voiceLoopRef.current.pause();
      voiceLoopRef.current = null;
    }
    // Restore original vocals
    setDjState({ karaoke: false });
    setIsSinging(false);
  };

  useEffect(() => {
    // Auto-stop singing when song stops
    if (!isPlaying && isSinging) stopSinging();
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (promptTimerRef.current) clearInterval(promptTimerRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
      voiceLoopRef.current?.pause();
    };
  }, []);

  // DJ Studio style subcomponents
  const SectionLabel = ({ text }: { text: string }) => (
    <p style={{
      margin: 0, padding: '12px 0 6px',
      fontSize: '12px', fontWeight: 700,
      color: 'rgba(255,255,255,0.4)',
      textTransform: 'uppercase', letterSpacing: '1.5px',
    }}>{text}</p>
  );

  const Toggle = ({ active, onClick, color = '#FF2D55' }: { active: boolean; onClick: () => void; color?: string }) => (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={active}
      style={{
        width: '51px', height: '31px', borderRadius: '16px',
        background: active ? color : 'rgba(255,255,255,0.18)',
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

  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: isSinging ? 'rgba(255,45,85,0.06)' : activeAvatar ? 'rgba(29,185,84,0.04)' : 'transparent' }}>
      {/* Header row — always visible, same style as DJ Studio rows */}
      <button
        onClick={() => setIsExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '16px',
          padding: '14px 24px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ color: isSinging ? '#FF2D55' : '#FF2D55', flexShrink: 0 }}><Mic size={20} /></div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'white' }}>Voice Avatar Studio</p>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: isSinging ? '#FF2D55' : 'rgba(255,255,255,0.45)' }}>
            {isSinging ? `🔴 Singing in "${activeAvatar?.name}"` : activeAvatar ? `🎙️ Active: ${activeAvatar.name}` : 'Record your voice & use it as your avatar'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {avatars.length > 0 && (
            <span style={{ fontSize: '12px', background: '#FF2D55', color: 'white', borderRadius: '100px', padding: '2px 8px', fontWeight: 700 }}>
              {avatars.length} voice{avatars.length > 1 ? 's' : ''}
            </span>
          )}
          <div style={{ color: 'rgba(255,255,255,0.4)' }}>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {isExpanded && (
        <div style={{ padding: '0 24px 24px' }}>

          {/* ── HOW IT WORKS INFO BOX ── */}
          <div style={{
            background: 'rgba(255,255,255,0.05)', borderRadius: '12px',
            padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px'
          }}>
            <Info size={18} style={{ color: '#4fc3f7', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ margin: '0 0 6px', fontWeight: 700, fontSize: '13px', color: '#4fc3f7' }}>How it works (3 easy steps!)</p>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                1️⃣ <b>Record</b> — Click record and read the sentences that appear on screen.<br/>
                2️⃣ <b>Save</b> — Give your recording a name (like "My Singing Voice").<br/>
                3️⃣ <b>Sing!</b> — Play any song, then hit <b>"Sing in My Voice"</b> to overlay your recorded voice on the song! Switch avatars anytime!
              </p>
            </div>
          </div>

          {/* ── SAVED AVATARS ── */}
          {avatars.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                My Voice Avatars
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {avatars.map(avatar => (
                  <div key={avatar.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '10px',
                    background: activeAvatarId === avatar.id ? 'rgba(29,185,84,0.15)' : 'rgba(255,255,255,0.05)',
                    border: activeAvatarId === avatar.id ? '1px solid rgba(29,185,84,0.4)' : '1px solid transparent',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onClick={() => setActiveAvatarId(avatar.id)}
                  >
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: activeAvatarId === avatar.id ? 'var(--spotify-green)' : 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <User size={18} style={{ color: activeAvatarId === avatar.id ? 'black' : 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'white' }}>{avatar.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Recorded at {avatar.createdAt}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={(e) => { e.stopPropagation(); playAvatar(avatar); }}
                        style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={14} style={{ color: 'white' }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteAvatar(avatar.id); }}
                        style={{ background: 'rgba(255,45,85,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={14} style={{ color: '#FF2D55' }} />
                      </button>
                    </div>
                    {activeAvatarId === avatar.id && (
                      <Check size={16} style={{ color: 'var(--spotify-green)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* ── SING IN MY VOICE (DJ STUDIO STYLE ROW) ── */}
              {activeAvatar && (
                <>
                  <SectionLabel text="Sing in My Voice" />
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 0',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    opacity: (!isPlaying && !isSinging) ? 0.4 : 1,
                    transition: 'opacity 0.2s'
                  }}>
                    <div style={{ color: isSinging ? '#FF2D55' : 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                      <Volume2 size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'white' }}>
                        Sing in My Voice
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>
                        {isSinging
                          ? `🔴 Live — original vocals cut, your voice is playing!`
                          : isPlaying
                          ? `Using "${activeAvatar.name}" — tap to activate`
                          : 'Play a song first to enable this'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                      {isSinging && (
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px' }}>
                          {Array(6).fill(0).map((_, i) => (
                            <div key={i} style={{
                              width: '3px', borderRadius: '2px', background: '#FF2D55',
                              animation: `eq-pulse ${0.4 + (i % 3) * 0.15}s infinite alternate ease-in-out`,
                              animationDelay: `${i * 0.06}s`,
                            }} />
                          ))}
                        </div>
                      )}
                      <Toggle
                        active={isSinging}
                        onClick={() => (isPlaying || isSinging) ? (isSinging ? stopSinging() : startSinging()) : undefined}
                        color="#FF2D55"
                      />
                    </div>
                  </div>
                  {isSinging && (
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'rgba(255,45,85,0.7)', lineHeight: 1.5 }}>
                      💡 Original vocals are muted. Your recorded voice is playing on loop over the song's beat!
                    </p>
                  )}
                </>
              )}

            </div>
          )}

          {/* ── RECORDING AREA ── */}
          {(step === 'intro' || step === 'done') && (
            <button
              onClick={() => setStep('naming')}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: '2px dashed rgba(255,45,85,0.4)',
                background: 'rgba(255,45,85,0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                color: '#FF2D55', fontWeight: 700, fontSize: '15px', transition: 'all 0.2s'
              }}
              onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,45,85,0.12)')}
              onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,45,85,0.05)')}
            >
              <Plus size={20} /> Add New Voice Avatar
            </button>
          )}

          {step === 'naming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, fontWeight: 600, color: 'white', fontSize: '15px' }}>Step 1: Name your voice</p>
              <input
                value={newAvatarName}
                onChange={e => setNewAvatarName(e.target.value)}
                placeholder='e.g. "My Singing Voice" or "Epic Voice"'
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: '15px', boxSizing: 'border-box'
                }}
                onKeyDown={e => { if (e.key === 'Enter') setStep('recording'); }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setStep('intro')} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'none', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={() => setStep('recording')} style={{ flex: 2, padding: '12px', borderRadius: '10px', border: 'none', background: '#FF2D55', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '15px' }}>
                  Next → Start Recording
                </button>
              </div>
            </div>
          )}

          {step === 'recording' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '8px 0' }}>
              {/* Recording Prompt */}
              <div style={{
                width: '100%', padding: '20px', borderRadius: '16px',
                background: isRecording ? 'rgba(255,45,85,0.1)' : 'rgba(255,255,255,0.04)',
                border: isRecording ? '1px solid rgba(255,45,85,0.4)' : '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center', minHeight: '80px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
              }}>
                {!isRecording ? (
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                    Press Record below, then read the text that appears here!
                  </p>
                ) : (
                  <>
                    <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'rgba(255,45,85,0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      📢 Read this out loud:
                    </p>
                    <p style={{
                      margin: 0, fontSize: '20px', fontWeight: 800, color: 'white',
                      lineHeight: 1.4, animation: 'fadeIn 0.4s ease',
                    }}>
                      "{RECORDING_PROMPTS[promptIndex]}"
                    </p>
                  </>
                )}
              </div>
              <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>

              {/* Timer */}
              {isRecording && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF2D55', animation: 'pulse 1s infinite' }} />
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'white', fontFamily: 'monospace' }}>{formatTime(recordingTime)}</span>
                </div>
              )}

              {/* Record Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                style={{
                  width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: isRecording ? 'rgba(255,45,85,0.2)' : '#FF2D55',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isRecording ? '0 0 0 6px rgba(255,45,85,0.2)' : '0 8px 24px rgba(255,45,85,0.4)',
                  transition: 'all 0.2s',
                }}
              >
                {isRecording
                  ? <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: '#FF2D55' }} />
                  : <Mic size={32} style={{ color: 'white' }} />
                }
              </button>
              <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                {isRecording ? 'Click the square to stop recording' : 'Click the mic to start recording'}
              </p>
              <button onClick={() => setStep('intro')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px' }}>
                Cancel
              </button>
            </div>
          )}

          {step === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'white', fontSize: '16px' }}>🎉 Recording done! Preview it.</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={playPreview} style={{
                  flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                  background: isPlayingPreview ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', color: 'white',
                  cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  {isPlayingPreview ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Play Preview</>}
                </button>
                <button onClick={() => { setStep('recording'); setPreviewBlob(null); setPreviewUrl(null); }} style={{
                  flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,45,85,0.4)',
                  background: 'rgba(255,45,85,0.08)', color: '#FF2D55', cursor: 'pointer', fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                  <Mic size={18} /> Re-record
                </button>
              </div>
              <button onClick={saveAvatar} style={{
                width: '100%', padding: '16px', borderRadius: '12px', border: 'none',
                background: 'var(--spotify-green)', color: 'black', cursor: 'pointer', fontWeight: 800, fontSize: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}>
                <Check size={20} /> Save as "{newAvatarName || `Voice ${avatars.length + 1}`}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceStudio;
