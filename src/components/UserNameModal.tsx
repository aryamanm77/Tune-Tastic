import React, { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { User, Check, X } from 'lucide-react';

export const UserNameModal: React.FC = () => {
  const { userName, setUserName, isNameModalOpen, setIsNameModalOpen } = usePlayer();
  const [nameInput, setNameInput] = useState(userName || '');

  useEffect(() => {
    if (isNameModalOpen) {
      setNameInput(userName || '');
    }
  }, [isNameModalOpen, userName]);

  if (!isNameModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = nameInput.trim();
    if (finalName) {
      setUserName(finalName);
    }
    setIsNameModalOpen(false);
  };

  const handleSkip = () => {
    if (!userName) {
      // Don't save placeholder in storage, leave empty or guest
      setUserName('');
    }
    setIsNameModalOpen(false);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.25s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && userName) {
          setIsNameModalOpen(false);
        }
      }}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, #181822 0%, #0d0d14 100%)',
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '28px',
          padding: '36px 32px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.8), 0 0 40px rgba(29, 185, 84, 0.15)',
          textAlign: 'center',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {userName && (
          <button
            onClick={() => setIsNameModalOpen(false)}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Glow Avatar / Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1db954 0%, #10b981 100%)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 32px rgba(29, 185, 84, 0.55)',
            color: 'black',
          }}
        >
          {nameInput.trim() ? (
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'white' }}>
              {nameInput.trim()[0].toUpperCase()}
            </span>
          ) : (
            <User size={34} strokeWidth={2.5} color="white" />
          )}
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
          {userName ? 'Update Your Name' : 'Welcome to TuneTastic!'}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.5 }}>
          {userName
            ? 'Change your display name for live greetings and personal sessions.'
            : 'What should we call you? Enter your name to personalize your live greeting and music sanctuary.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <input
              type="text"
              autoFocus
              maxLength={30}
              placeholder="Enter your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid var(--spotify-green)',
                color: 'white',
                fontSize: '17px',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: '0 0 20px rgba(29, 185, 84, 0.25)',
                textAlign: 'center',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'var(--spotify-green)',
                color: 'black',
                padding: '14px',
                borderRadius: '9999px',
                fontSize: '15px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(29, 185, 84, 0.45)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <span>{userName ? 'Save Name' : 'Continue to Music'}</span>
              <Check size={18} strokeWidth={3} />
            </button>

            {!userName && (
              <button
                type="button"
                onClick={handleSkip}
                style={{
                  background: 'none',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: '13px',
                  padding: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)')}
              >
                Skip for now
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserNameModal;
