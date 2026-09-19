import React, { useState } from 'react';
import { SunMedium, Clock } from 'lucide-react';
import { KioskLogo } from './KioskLogo';
import { ThemeToggle } from './ThemeToggle';
import { TRANSLATIONS } from '../../data/kiosk/translations';
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
      className={`screen active glass-dashboard-screen minimal-landing theme-${theme} ${isZoomingOut ? 'screen-exit-zoom' : ''}`}
      onClick={handleScreenTouch}
      style={{ backgroundImage: `url(${collegeBg})`, color: 'white' }}
      role="region" 
      aria-label="Welcome Landing Page"
    >
      <div className="glass-main-wrapper" style={{ justifyContent: 'space-between' }}>
        {/* Top Status Bar with Time, Weather & Light/Dark Switch */}
        <header className="landing-minimal-header" onClick={(e) => e.stopPropagation()}>
          <div className="landing-header-left">
            <div className="landing-weather-pill">
              <SunMedium size={18} className="pill-icon-weather" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill">
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

        {/* Center: Large Logo that Zooms Out on Touch */}
        <main className="landing-minimal-center">
          <div className={`landing-logo-scale-box ${isZoomingOut ? 'zoom-out-anim' : ''}`}>
            <KioskLogo size={340} animated={!isZoomingOut} />
          </div>
        </main>

        {/* Subtle Bottom Instruction */}
        <footer className="landing-minimal-footer">
          <p className="touch-hint-text" style={{ color: 'white' }}>{t.touchAnywhere || "Touch anywhere to explore Campus Compass"}</p>
        </footer>
      </div>
    </section>
  );
};

export default LandingScreen;
