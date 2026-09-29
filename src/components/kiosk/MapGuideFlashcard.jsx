import React from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Navigation, 
  Compass, 
  Lightbulb,
  X,
  ChevronRight
} from 'lucide-react';
import { TRANSLATIONS } from '../../data/kiosk/translations';

export const MapGuideFlashcard = ({ 
  isOpen, 
  onClose, 
  onGoToMap,
  language = 'en' 
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const stepBadges = [
    { num: "1", bg: "#1A1A1A", text: "#FFFFFF", icon: <Search size={20} color="#1A1A1A" /> },
    { num: "2", bg: "#1A1A1A", text: "#FFFFFF", icon: <MapPin size={20} color="#1A1A1A" /> },
    { num: "3", bg: "#1A1A1A", text: "#FFFFFF", icon: <Navigation size={20} color="#1A1A1A" /> },
    { num: "4", bg: "#1A1A1A", text: "#FFFFFF", icon: <Compass size={20} color="#1A1A1A" /> }
  ];

  return (
    <div className="modal-backdrop open" onClick={onClose} role="dialog" aria-modal="true">
      <div className="campus-instruction-flashcard" onClick={(e) => e.stopPropagation()}>
        {/* Top Bar with Back/Close */}
        <div className="flashcard-top-nav">
          <button className="btn-flashcard-back" onClick={onClose}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <button className="btn-flashcard-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Title Group */}
        <div className="flashcard-heading">
          <h2>
            How to Use <span className="highlight-brand">Campus Compass</span>
          </h2>
          <p>{t.instructionModalSubtitle}</p>
        </div>

        {/* 4 Interactive Step Rows */}
        <div className="flashcard-steps-container">
          {t.steps.map((step, idx) => {
            const badge = stepBadges[idx];
            return (
              <div key={idx} className="campus-step-card">
                <div 
                  className="step-num-circle" 
                  style={{ backgroundColor: badge.bg, color: badge.text }}
                >
                  {badge.num}
                </div>
                <div className="step-icon-circle">
                  {badge.icon}
                </div>
                <div className="step-text-content">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tip Box */}
        <div className="flashcard-tip-box">
          <div className="tip-icon-wrapper">
            <Lightbulb size={22} color="#1A1A1A" />
          </div>
          <div className="tip-text">
            <strong>{t.tipTitle}:</strong> {t.tipDesc}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flashcard-actions-row">
          <button className="btn-flashcard-home" onClick={onClose}>
            <ArrowLeft size={18} />
            <span>{t.backToHome}</span>
          </button>
          {onGoToMap && (
            <button className="btn-flashcard-view-map" onClick={() => { onClose(); onGoToMap(); }}>
              <span>{t.viewMap}</span>
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapGuideFlashcard;
