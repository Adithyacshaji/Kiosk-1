import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { StatusPills } from './StatusPills';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';

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

      {/* ── DESKTOP VIEW: full-screen component-based design ── */}
      <div
        className="landing-desktop-scene"
        onClick={onStart}
        role="button"
        aria-label="Tap anywhere to start"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onStart(); }}
      >
        {/* Subtle grid pattern overlay */}
        <div className="landing-desktop-grid" aria-hidden="true" />

        {/* Top-right: weather, time, sound — stop propagation so they don't trigger onStart */}
        <div className="landing-desktop-topbar" onClick={(e) => e.stopPropagation()}>
          <div className="landing-desktop-pills">
            <StatusPills weather={t.weather || '24°C'} currentTime={currentTime} darkVariant={true} />
          </div>
          <ThemeToggle
            theme={theme}
            onToggleTheme={onToggleTheme}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />
        </div>

        {/* Center content */}
        <div className="landing-desktop-center">
          {/* Logo illustration without background box */}
          <div className="landing-desktop-logo-wrapper">
            <img
              src={logoImg}
              alt="Campus Compass Logo"
              className="landing-desktop-logo"
              draggable={false}
            />
          </div>

          {/* CTA pill */}
          <div className="landing-cta-pill">
            <span className="landing-cta-text">TOUCH ANYWHERE TO VIEW MAP</span>
          </div>

          {/* Subtitle */}
          <p className="landing-desktop-subtitle">Explore Campus &bull; Find Your Way</p>
        </div>
      </div>

      {/* ── MOBILE VIEW: existing UI unchanged ── */}
      <div className="landing-onboarding-wrapper landing-mobile-only"
        style={{ backgroundColor: '#F8F9FA' }}
      >
        
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
