import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { StatusPills } from './StatusPills';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';
import landingBg from '../../assets/kiosk/landing-bg.jpg';

export const LandingScreen = ({ 
  onStart, 
  currentTime, 
  theme = 'light', 
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <section 
      id="screen-landing" 
      className={`screen active minimal-landing theme-${theme}`}
      role="region" 
      aria-label="Welcome Landing Page"
    >
      {/* ── DESKTOP VIEW: full-screen bg image, click anywhere to start ── */}
      <div
        className="landing-desktop-fullbg"
        onClick={onStart}
        role="button"
        aria-label="Tap anywhere to start"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStart(); }}
        style={{ backgroundImage: `url(${landingBg})` }}
      >
        {/* Top-right: weather, time, sound only */}
        <div className="landing-desktop-topbar" onClick={(e) => e.stopPropagation()}>
          <div className="landing-desktop-pills">
            <StatusPills weather={t.weather || '24°C'} currentTime={currentTime} darkVariant={false} />
          </div>
          <ThemeToggle
            theme={theme}
            onToggleTheme={onToggleTheme}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />
        </div>
      </div>

      {/* ── MOBILE VIEW: existing UI unchanged ── */}
      <div className="landing-onboarding-wrapper landing-mobile-only">
        
        {/* Top Status & Controls */}
        <header className="landing-top-bar" onClick={(e) => e.stopPropagation()}>
          <div className="landing-header-left">
            <StatusPills weather={t.weather || '24°C'} currentTime={currentTime} darkVariant={true} />
          </div>
          <div className="landing-header-right">
            <ThemeToggle 
              theme={theme}
              onToggleTheme={onToggleTheme}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
            />
          </div>
        </header>

        {/* Text Header Content */}
        <div className="landing-text-header">
          <h1 className="landing-title">Welcome</h1>
          <p className="landing-subtitle">to Campus Compass, we're glad you are here.</p>
        </div>

        {/* Center Illustration */}
        <main className="landing-illustration-container">
          <img 
            src={logoImg} 
            alt="Campus Compass Illustration" 
            className="landing-illustration" 
          />
        </main>

        {/* Bottom Controls */}
        <footer className="landing-bottom-controls">
          <div className="landing-indicators">
            <div className="indicator active"></div>
            <div className="indicator"></div>
            <div className="indicator"></div>
          </div>
          
          <button 
            className="btn-onboarding-start"
            onClick={onStart}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            }}
          >
            <span>Let's get started</span>
          </button>
        </footer>
        
      </div>
    </section>
  );
};

export default LandingScreen;
