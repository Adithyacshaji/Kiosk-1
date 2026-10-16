import React, { useState, useMemo, useEffect } from 'react';
import { DirectoryHeader } from '../components/DirectoryHeader';
import {
  MapPin, Navigation, TreePine, Coffee, BookOpen,
  Dumbbell, Bus, Building2, Utensils, Landmark,
  ParkingCircle, Clock, Search, X,
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { KIOSK_CONFIG } from '../data/kioskData';

const getPoiIcon = (poi, size = 26) => {
  const name = (poi.name || '').toLowerCase();
  const cat = (poi.subcategory || poi.type || '').toLowerCase();
  if (name.includes('canteen') || name.includes('cafeteria') || cat.includes('food')) return <Utensils size={size} color="#ffffff" />;
  if (name.includes('library') || cat.includes('library')) return <BookOpen size={size} color="#ffffff" />;
  if (name.includes('gym') || name.includes('sport') || cat.includes('sport')) return <Dumbbell size={size} color="#ffffff" />;
  if (name.includes('bus') || name.includes('transport')) return <Bus size={size} color="#ffffff" />;
  if (name.includes('park') || name.includes('garden') || cat.includes('park')) return <TreePine size={size} color="#ffffff" />;
  if (name.includes('coffee') || name.includes('cafe')) return <Coffee size={size} color="#ffffff" />;
  if (name.includes('parking')) return <ParkingCircle size={size} color="#ffffff" />;
  if (name.includes('block') || name.includes('building') || name.includes('hall')) return <Building2 size={size} color="#ffffff" />;
  return <Landmark size={size} color="#ffffff" />;
};

export const OutdoorScreen = ({
  onBack,
  onGoHome,
  onSelectOutdoor,
  currentTime,
  theme = 'light',
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en',
  initialSearch = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const outdoorPois = KIOSK_CONFIG.pois.filter((poi) => poi.category === 'outdoor');

  const filteredPois = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return outdoorPois;
    return outdoorPois.filter(
      (poi) =>
        poi.name?.toLowerCase().includes(q) ||
        poi.description?.toLowerCase().includes(q) ||
        poi.subcategory?.toLowerCase().includes(q)
    );
  }, [outdoorPois, searchQuery]);

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

        {/* ── Search bar ── */}
        <div className="kiosk-dir-searchbar-strip">
          <div className="kiosk-dir-search-wrap">
            <Search size={20} className="kiosk-dir-search-icon" />
            <input
              className="kiosk-dir-search-input"
              type="text"
              placeholder="Search outdoor locations, buildings…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            {searchQuery && (
              <button className="kiosk-dir-search-clear" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <main
          className="directory-main-content"
          style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'none', overscrollBehaviorY: 'none' }}
        >
          <div className="outdoor-poi-grid">
            {filteredPois.map((poi, idx) => (
              <div key={idx} className="outdoor-poi-card" onClick={() => onSelectOutdoor(poi)}>
                <div className="outdoor-poi-icon" style={{ background: '#1A1A1A' }}>
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

            {filteredPois.length === 0 && (
              <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB' }}>
                <Search size={36} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: 700, color: '#1A1A1A' }}>No locations match "{searchQuery}"</p>
                <button onClick={() => setSearchQuery('')} style={{ marginTop: '0.8rem', padding: '0.5rem 1.2rem', borderRadius: 30, background: '#1A1A1A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Clear</button>
              </div>
            )}
          </div>
        </main>

        <footer className="kiosk-dir-footer">
          <MapPin size={15} color="#ffffff" />
          <span>Christ College of Engineering (Autonomous) · Outdoor Navigation</span>
        </footer>
      </div>
    </section>
  );
};

export default OutdoorScreen;
