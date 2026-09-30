import React from 'react';
import { DirectoryHeader } from './DirectoryHeader';
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
    if (name.includes('canteen') || name.includes('cafeteria') || cat.includes('food')) return <Utensils size={26} color="#ffffff" />;
    if (name.includes('library') || cat.includes('library')) return <BookOpen size={26} color="#ffffff" />;
    if (name.includes('gym') || name.includes('sport') || cat.includes('sport')) return <Dumbbell size={26} color="#ffffff" />;
    if (name.includes('bus') || name.includes('transport')) return <Bus size={26} color="#ffffff" />;
    if (name.includes('park') || name.includes('garden') || cat.includes('park')) return <TreePine size={26} color="#ffffff" />;
    if (name.includes('coffee') || name.includes('cafe')) return <Coffee size={26} color="#ffffff" />;
    if (name.includes('parking')) return <ParkingCircle size={26} color="#ffffff" />;
    if (name.includes('block') || name.includes('building') || name.includes('hall')) return <Building2 size={26} color="#ffffff" />;
    return <Landmark size={26} color="#ffffff" />;
  };

  return (
    <section 
      id="screen-outdoor" 
      className={`screen active directory-screen theme-${theme}`} 
      style={{ backgroundColor: 'transparent', color: '#1A1A1A' }}
      role="region" 
      aria-label="Outdoor Directory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>
        <DirectoryHeader 
          title="OUTDOOR NAVIGATION"
          onBack={onBack}
          onGoHome={onGoHome}
          currentTime={currentTime}
          weather={t.weather || '24°C'}
          theme={theme}
          onToggleTheme={onToggleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          backText="Back"
        />

        <main className="directory-main-content" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem 1.5rem', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.4rem)', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.02em', margin: 0 }}>
              Explore Outdoor Locations
            </h1>
            <p style={{ fontSize: '1.1rem', color: '#4B5563' }}>
              Select a destination to start navigation
            </p>
          </div>

          <div className="outdoor-poi-grid">
            {outdoorPois.map((poi, idx) => (
                <div key={idx} className="outdoor-poi-card" onClick={() => onSelectOutdoor(poi)}>
                  <div className="outdoor-poi-icon" style={{ background: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                    {getPoiIcon(poi)}
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
            ))}
          </div>
        </main>

        <footer style={{ background: '#1A1A1A', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontSize: '0.8rem', flexShrink: 0, textAlign: 'center', flexWrap: 'wrap' }}>
          <MapPin size={16} color="#ffffff" />
          <span>Christ College of Engineering (Autonomous) | Outdoor Navigation</span>
        </footer>
      </div>
    </section>
  );
};

export default OutdoorScreen;
