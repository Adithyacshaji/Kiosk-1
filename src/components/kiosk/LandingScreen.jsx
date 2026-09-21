import React, { useState } from 'react';
import { SunMedium, Clock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TRANSLATIONS } from '../../data/kiosk/translations';
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
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleScreenTouch = () => {
    if (isZoomingOut) return;
    setIsZoomingOut(true);
    setTimeout(() => {
      onStart();
    }, 400);
  };

  return (
    <section 
      id="screen-landing" 
      className={`screen active minimal-landing theme-${theme} ${isZoomingOut ? 'screen-exit-zoom' : ''}`}
      onClick={handleScreenTouch}
      style={{ 
        backgroundImage: `url(${landingBg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white' 
      }}
      role="region" 
      aria-label="Welcome Landing Page"
    >
      <div className="glass-main-wrapper" style={{ justifyContent: 'space-between' }}>
        {/* Top Status Bar with Time, Weather & Light/Dark Switch */}
        <header className="landing-minimal-header" onClick={(e) => e.stopPropagation()}>
          <div className="landing-header-left">
            <div className="landing-weather-pill" style={{ boxShadow: '0 0 15px rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)' }}>
              <SunMedium size={18} className="pill-icon-weather" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill" style={{ boxShadow: '0 0 15px rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)' }}>
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

        {/* The center content is now baked into the background image directly */}
        <main className="landing-minimal-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-3vh' }}>
          {/* Empty main to preserve layout spacing if needed, or just let background handle it */}
        </main>

        {/* Subtle Bottom Instruction */}
        <footer className="landing-minimal-footer">
        </footer>
      </div>
    </section>
  );
};

export default LandingScreen;
