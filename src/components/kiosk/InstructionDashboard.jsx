import React, { useState } from 'react';
import { 
  Clock, 
  Menu,
  MapPin, 
  ArrowRight, 
  Users, 
  User, 
  Info, 
  Map as MapIcon,
  SunMedium,
  Volume2,
  VolumeX
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
      style={{ backgroundImage: `url(${collegeBg})` }}
    >
      <div className="glass-main-wrapper">
        {/* Top Navigation */}
        <header className="glass-top-nav">
          <div className="glass-brand" onClick={onGoHome} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src={logo} alt="Logo" style={{ height: '44px' }} />
            <span className="glass-brand-name" style={{ fontSize: '0.8rem', letterSpacing: '0.15em', fontWeight: '600' }}>SCAN . SEARCH . NAVIGATE</span>
          </div>

          <div className="glass-nav-right">
            <div className="glass-time-menu-pill">
              <span className="glass-time">{currentTime}</span>
              <div className="glass-menu-divider"></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SunMedium size={18} />
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.weather || '24°C'}</span>
              </div>
              <div className="glass-menu-divider"></div>
              <button 
                onClick={onToggleSound} 
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
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
              <MapIcon size={24} className="glass-btn-icon-left" />
              <span className="glass-btn-label">Explore Campus Map</span>
              <ArrowRight size={22} className="glass-btn-icon-right" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="glass-cards-grid">
          {/* Card 1: Classroom */}
          <div className="glass-card" onClick={() => handleCardClick('classrooms')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: '#819a84' }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                  <circle cx="7" cy="9" r="1.5" />
                  <circle cx="12" cy="9" r="1.5" />
                  <circle cx="17" cy="9" r="1.5" />
                </svg>
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Classroom</h3>
                <p className="glass-card-desc">Find your lecture halls and labs.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Card 2: Faculties */}
          <div className="glass-card" onClick={() => handleCardClick('faculty')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: '#5d859b' }}>
                <User size={28} />
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Faculties</h3>
                <p className="glass-card-desc">Locate professors and department cabins.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={20} />
            </div>
          </div>

          {/* Card 3: Outdoor Navigation */}
          <div className="glass-card" onClick={() => handleCardClick('outdoor')}>
            <div className="glass-card-content">
              <div className="glass-card-icon-wrap" style={{ background: '#598b85' }}>
                <MapPin size={28} />
              </div>
              <div className="glass-card-text-group">
                <h3 className="glass-card-title">Outdoor Navigation</h3>
                <p className="glass-card-desc">Get directions across the campus.</p>
              </div>
            </div>
            <div className="glass-card-arrow">
              <ArrowRight size={20} />
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
            <Info size={24} />
          </div>
          <div className="glass-tip-vertical-divider"></div>
          <div className="glass-tip-text-content">
            <h4 className="glass-tip-title">Quick Tip</h4>
            <p className="glass-tip-desc">Use the search bar or scan the QR codes around campus to find your destination.</p>
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
