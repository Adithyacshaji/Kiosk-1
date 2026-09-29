import React from 'react';
import { SunMedium, Clock } from 'lucide-react';
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

  const handleScreenTouch = () => {
    onStart();
  };

  return (
    <section 
      id="screen-landing" 
      className={`screen active minimal-landing theme-${theme}`}
      onClick={handleScreenTouch}
      role="region" 
      aria-label="Welcome Landing Page"
      style={{ 
        backgroundImage: `linear-gradient(rgba(11, 17, 32, 0.75), rgba(11, 17, 32, 0.85)), url(${collegeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="glass-main-wrapper" style={{ justifyContent: 'space-between', height: '100%' }}>
        {/* Top Status Bar with Time, Weather & Light/Dark Switch */}
        <header className="landing-minimal-header" onClick={(e) => e.stopPropagation()}>
          <div className="landing-header-left">
            <div className="landing-weather-pill" style={{ boxShadow: '0 0 15px rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <SunMedium size={18} className="pill-icon-weather" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill" style={{ boxShadow: '0 0 15px rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <Clock size={18} className="pill-icon-time" />
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
          <p className="landing-pulsing-text">
            Tap anywhere to explore campus
          </p>
        </main>

        {/* Footer */}
        <footer className="landing-minimal-footer">
        </footer>
      </div>
    </section>
  );
};

export default LandingScreen;
