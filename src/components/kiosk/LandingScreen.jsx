import React from 'react';
import { SunMedium, Clock, Compass } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';
import collegeBg from '../../assets/kiosk/college.png';

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
      style={{ 
        backgroundColor: '#F8F9FA'
      }}
    >
      <div className="glass-main-wrapper" style={{ justifyContent: 'space-between', height: '100%' }}>
        {/* Top Status Bar with Time, Weather & Light/Dark Switch */}
        <header className="landing-minimal-header" onClick={(e) => e.stopPropagation()}>
          <div className="landing-header-left">
            <div className="landing-weather-pill" style={{ background: '#1A1A1A', border: 'none', color: '#ffffff' }}>
              <SunMedium size={18} className="pill-icon-weather" color="#ffffff" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill" style={{ background: '#1A1A1A', border: 'none', color: '#ffffff' }}>
              <Clock size={18} className="pill-icon-time" color="#ffffff" />
              <span className="time-clock">{currentTime}</span>
            </div>
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

        {/* Center Content: Centered Logo + Pulsing Text */}
        <main className="landing-minimal-center">
          <div className="landing-logo-container">
            <img 
              src={logoImg} 
              alt="Campus Compass Logo" 
              className="landing-center-logo" 
            />
          </div>
          <button 
            onClick={onStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              background: '#1A1A1A',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9999px',
              padding: '20px 48px',
              fontSize: '1.25rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              marginTop: '1.5rem',
              letterSpacing: '0.02em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(2px) scale(0.98)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
            }}
          >
            <Compass size={28} strokeWidth={2.5} />
            <span>Explore Campus</span>
          </button>
        </main>

        {/* Footer */}
        <footer className="landing-minimal-footer">
        </footer>
      </div>
    </section>
  );
};

export default LandingScreen;
