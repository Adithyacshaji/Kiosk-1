import React from 'react';
import { Accessibility, Contrast, Type, Volume2, VolumeX, Maximize } from 'lucide-react';

export const AccessibilityBar = ({ 
  accessibility, 
  onToggleAccessibility, 
  soundEnabled, 
  onToggleSound, 
  showFullscreen = false,
  compact = false 
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="accessibility-bar">
      <button 
        className={`btn-icon-touch ${accessibility.wheelchair ? 'active' : ''}`}
        onClick={() => onToggleAccessibility('wheelchair')}
        title="Lower Reach Accessibility Mode"
        aria-label="Wheelchair Lower Reach Mode"
      >
        <Accessibility size={18} style={{ marginRight: compact ? 0 : 4 }} />
        {!compact && <span>Lower UI</span>}
      </button>

      <button 
        className={`btn-icon-touch ${accessibility.highContrast ? 'active' : ''}`}
        onClick={() => onToggleAccessibility('highContrast')}
        title="High Contrast Mode"
        aria-label="High Contrast Mode"
      >
        <Contrast size={18} style={{ marginRight: compact ? 0 : 4 }} />
        {!compact && <span>Contrast</span>}
      </button>

      <button 
        className={`btn-icon-touch ${accessibility.largeText ? 'active' : ''}`}
        onClick={() => onToggleAccessibility('largeText')}
        title="Enlarge Text"
        aria-label="Enlarge Text"
      >
        <Type size={18} style={{ marginRight: compact ? 0 : 4 }} />
        {!compact && <span>Text +</span>}
      </button>

      <button 
        className={`btn-icon-touch ${soundEnabled ? 'active' : ''}`}
        onClick={onToggleSound}
        title="Sound Feedback"
        aria-label="Sound Feedback"
      >
        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>

      {showFullscreen && (
        <button 
          className="btn-icon-touch"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          aria-label="Toggle Fullscreen"
        >
          <Maximize size={18} />
        </button>
      )}
    </div>
  );
};

