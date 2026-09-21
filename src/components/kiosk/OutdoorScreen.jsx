import React from 'react';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  SunMedium, 
  MapPin, 
  Navigation,
  TreePine
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';
import collegeBg from '../../assets/kiosk/college.png';
import { KIOSK_CONFIG } from '../../data/kiosk/kioskData';

export const OutdoorScreen = ({
  onBack,
  onGoHome,
  onSelectOutdoor,
  currentTime,
  theme = 'light',
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const outdoorPois = KIOSK_CONFIG.pois.filter(poi => poi.category === 'outdoor');

  return (
    <section 
      id="screen-outdoor" 
      className={`screen active directory-screen glass-dashboard-screen theme-${theme}`} 
      style={{ backgroundImage: `url(${collegeBg})`, color: 'white' }}
      role="region" 
      aria-label="Outdoor Directory"
    >
      <div className="glass-main-wrapper directory-glass-wrapper">
        <header className="directory-top-bar">
          <div className="dir-bar-left">
            <button className="btn-dir-back" onClick={onBack} title="Back">
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="dir-brand-badge" onClick={onGoHome}>
              <img src={logoImg} alt="Logo" className="dir-logo-mini" />
              <div className="dir-brand-text">
                <span className="dir-brand-name">Campus Compass</span>
                <span className="dir-brand-tag">OUTDOOR NAVIGATION</span>
              </div>
            </div>
          </div>

          <div className="dir-bar-right">
            <div className="landing-weather-pill">
              <SunMedium size={16} className="pill-icon-weather" />
              <span>{t.weather || '24°C'}</span>
            </div>
            <div className="landing-time-pill">
              <Clock size={16} className="pill-icon-time" />
              <span className="time-clock">{currentTime}</span>
            </div>
            <ThemeToggle 
              theme={theme}
              onToggleTheme={onToggleTheme}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
            />
            <button className="btn-campus-home" onClick={onGoHome} title={t.home}>
              <Home size={18} />
            </button>
          </div>
        </header>

        <main className="directory-main-content" style={{ gap: '1.25rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
              Explore Outdoor Locations
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Select a destination to start navigation
            </p>
          </div>

          <div className="faculty-grid">
            {outdoorPois.map((poi, idx) => (
              <div key={idx} className="faculty-card" onClick={() => onSelectOutdoor(poi)}>
                <div className="fac-card-left">
                  <div className="fac-avatar" style={{ background: 'rgba(150, 124, 110, 0.15)', color: '#967C6E' }}>
                    <MapPin size={28} />
                  </div>
                  <div className="fac-info">
                    <h3 className="fac-name">{poi.name}</h3>
                    <p className="fac-role">{poi.description}</p>
                    
                    <div className="fac-meta-group">
                      <div className="fac-meta-item">
                        <Clock size={14} className="meta-icon" />
                        <span>{poi.hours || 'Always Open'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="fac-card-right">
                  <button className="btn-fac-navigate" onClick={(e) => { e.stopPropagation(); onSelectOutdoor(poi); }}>
                    <Navigation size={18} />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <footer className="campus-bottom-footer">
          <div className="footer-left-info">
            <MapPin size={16} color="#90bbac" />
            <span>Christ College of Engineering (Autonomous) | Outdoor Navigation</span>
          </div>
          <div className="footer-right-motto">
            <span>"Smarter campus. A better you."</span>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default OutdoorScreen;
