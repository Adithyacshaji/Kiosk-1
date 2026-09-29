import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  ArrowRight, 
  User, 
  Info, 
  Map as MapIcon,
  SunMedium,
  Volume2,
  VolumeX,
  Compass,
  Sparkles
} from 'lucide-react';
import { MapGuideFlashcard } from './MapGuideFlashcard';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import collegeBg from '../../assets/kiosk/college.png';
import logo from '../../assets/kiosk/logo.png';

export const InstructionDashboard = ({ 
  onViewMap, 
  onGoHome, 
  onSelectService,
  onOpenClassrooms,
  onOpenFaculty,
  onOpenOutdoor,
  currentTime,
  language = 'en',
  soundEnabled,
  onToggleSound
}) => {
  const [isInstructionFlashcardOpen, setIsInstructionFlashcardOpen] = useState(false);
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleCardClick = (serviceId) => {
    if (serviceId === 'classrooms' && onOpenClassrooms) {
      onOpenClassrooms();
    } else if (serviceId === 'faculty' && onOpenFaculty) {
      onOpenFaculty();
    } else if (serviceId === 'outdoor' && onOpenOutdoor) {
      onOpenOutdoor();
    } else if (onSelectService) {
      onSelectService(serviceId, 0);
    } else {
      onViewMap();
    }
  };

  return (
    <section 
      id="screen-instructions" 
      className="screen active glass-dashboard-screen" 
      role="region" 
      aria-label="Campus Compass Services"
      style={{ backgroundImage: `linear-gradient(rgba(11, 17, 32, 0.55), rgba(11, 17, 32, 0.7)), url(${collegeBg})` }}
    >
      <div className="glass-main-wrapper">
        {/* Top Navigation */}
        <header className="glass-top-nav">
          <div className="glass-brand" onClick={onGoHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={logo} alt="Logo" style={{ height: '48px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }} />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span className="glass-brand-name">Campus Compass</span>
              <span style={{ fontSize: '0.7rem', color: '#90bbac', fontWeight: 700, letterSpacing: '0.12em', marginTop: '2px' }}>SCAN • SEARCH • NAVIGATE</span>
            </div>
          </div>

          <div className="glass-nav-right">
            <div className="glass-time-menu-pill">
              <span className="glass-time">{currentTime}</span>
              <div className="glass-menu-divider"></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <SunMedium size={18} color="#90bbac" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.weather || '24°C'}</span>
              </div>
              <div className="glass-menu-divider"></div>
              <button 
                onClick={onToggleSound} 
                title={soundEnabled ? "Mute Sound" : "Enable Sound"}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              >
                {soundEnabled ? <Volume2 size={20} color="#90bbac" /> : <VolumeX size={20} color="#e2e8f0" />}
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="glass-hero-center">
          <h1 className="glass-serif-title animate-welcome-text">
            <span className="serif-line italic">Welcome to</span>
            <span className="serif-line bold">Campus Compass</span>
          </h1>

          <div className="glass-cta-row">
            <button 
              className="btn-glass-explore"
              onClick={() => onViewMap()}
            >
              <Compass size={26} className="glass-btn-icon-left" color="#ffffff" />
              <span className="glass-btn-label">Explore Interactive Map</span>
              <ArrowRight size={24} className="glass-btn-icon-right" color="#ffffff" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="glass-cards-grid">
          {/* Card 1: Classroom */}
          <div className="glass-card" onClick={() => handleCardClick('classrooms')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: 'linear-gradient(135deg, #749c8e 0%, #4a7467 100%)' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <circle cx="7" cy="9" r="1.5" />
                  <circle cx="12" cy="9" r="1.5" />
                  <circle cx="17" cy="9" r="1.5" />
                </svg>
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Classrooms</h3>
                <p className="glass-card-desc">Find your lecture halls, batches & laboratories.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={22} color="#ffffff" />
            </div>
          </div>

          {/* Card 2: Faculties */}
          <div className="glass-card" onClick={() => handleCardClick('faculty')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: 'linear-gradient(135deg, #5b8ba3 0%, #3a6379 100%)' }}>
                <User size={28} strokeWidth={2.2} />
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Faculties</h3>
                <p className="glass-card-desc">Locate professors, HODs and department cabins.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={22} color="#ffffff" />
            </div>
          </div>

          {/* Card 3: Outdoor Navigation */}
          <div className="glass-card" onClick={() => handleCardClick('outdoor')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: 'linear-gradient(135deg, #b87d4b 0%, #8c5b30 100%)' }}>
                <MapPin size={28} strokeWidth={2.2} />
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Outdoor Navigation</h3>
                <p className="glass-card-desc">Get turn-by-turn directions across campus blocks & POIs.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={22} color="#ffffff" />
            </div>
          </div>
        </div>

        {/* Quick Tip Banner */}
        <div 
          className="glass-quick-tip-banner"
          onClick={() => setIsInstructionFlashcardOpen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="glass-tip-icon-badge">
            <Info size={24} color="#90bbac" />
          </div>
          <div className="glass-tip-vertical-divider"></div>
          <div className="glass-tip-text-content">
            <h4 className="glass-tip-title">Interactive Quick Guide</h4>
            <p className="glass-tip-desc">Select any destination card or use the live search bar on the map screen for turn-by-turn routes.</p>
          </div>
        </div>
      </div>

      <MapGuideFlashcard 
        isOpen={isInstructionFlashcardOpen}
        onClose={() => setIsInstructionFlashcardOpen(false)}
        onGoToMap={() => {
          setIsInstructionFlashcardOpen(false);
          onViewMap();
        }}
        language={language}
      />
    </section>
  );
};

export default InstructionDashboard;
