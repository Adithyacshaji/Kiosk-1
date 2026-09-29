import React from 'react';
import { 
  ArrowLeft, 
  Home, 
  Clock, 
  SunMedium, 
  MapPin, 
  Navigation,
  TreePine,
  Coffee,
  BookOpen,
  Dumbbell,
  Bus,
  Building2,
  Utensils,
  Landmark,
  ParkingCircle,
  ChevronRight
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

  const getPoiIcon = (poi) => {
    const name = (poi.name || '').toLowerCase();
    const cat = (poi.subcategory || poi.type || '').toLowerCase();
    if (name.includes('canteen') || name.includes('cafeteria') || cat.includes('food')) return { icon: <Utensils size={26} />, color: 'linear-gradient(135deg, #e07c54 0%, #b85c32 100%)' };
    if (name.includes('library') || cat.includes('library')) return { icon: <BookOpen size={26} />, color: 'linear-gradient(135deg, #5d859b 0%, #3a6379 100%)' };
    if (name.includes('gym') || name.includes('sport') || cat.includes('sport')) return { icon: <Dumbbell size={26} />, color: 'linear-gradient(135deg, #819a84 0%, #4a7467 100%)' };
    if (name.includes('bus') || name.includes('transport')) return { icon: <Bus size={26} />, color: 'linear-gradient(135deg, #8b7db5 0%, #5c4e8a 100%)' };
    if (name.includes('park') || name.includes('garden') || cat.includes('park')) return { icon: <TreePine size={26} />, color: 'linear-gradient(135deg, #598b85 0%, #3a6b65 100%)' };
    if (name.includes('coffee') || name.includes('cafe')) return { icon: <Coffee size={26} />, color: 'linear-gradient(135deg, #c2956e 0%, #8b6040 100%)' };
    if (name.includes('parking')) return { icon: <ParkingCircle size={26} />, color: 'linear-gradient(135deg, #6b8cad 0%, #3a5d7e 100%)' };
    if (name.includes('block') || name.includes('building') || name.includes('hall')) return { icon: <Building2 size={26} />, color: 'linear-gradient(135deg, #749c8e 0%, #4a7467 100%)' };
    return { icon: <Landmark size={26} />, color: 'linear-gradient(135deg, #b87d4b 0%, #8c5b30 100%)' };
  };

  return (
    <section 
      id="screen-outdoor" 
      className={`screen active directory-screen glass-dashboard-screen theme-${theme}`} 
      style={{ backgroundImage: `linear-gradient(rgba(10, 16, 28, 0.6), rgba(10, 16, 28, 0.72)), url(${collegeBg})`, color: 'white' }}
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

          <div className="outdoor-poi-grid">
            {outdoorPois.map((poi, idx) => {
              const { icon, color } = getPoiIcon(poi);
              return (
                <div key={idx} className="outdoor-poi-card" onClick={() => onSelectOutdoor(poi)}>
                  <div className="outdoor-poi-icon" style={{ background: color }}>
                    {icon}
                  </div>
                  <div className="outdoor-poi-info">
                    <h3 className="outdoor-poi-name">{poi.name}</h3>
                    {poi.description && <p className="outdoor-poi-desc">{poi.description}</p>}
                    <div className="outdoor-poi-hours">
                      <Clock size={12} />
                      <span>{poi.hours || 'Always Open'}</span>
                    </div>
                  </div>
                  <div className="outdoor-poi-navigate">
                    <button className="btn-poi-navigate">
                      <Navigation size={16} />
                      <span>Go</span>
                    </button>
                  </div>
                </div>
              );
            })}
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
