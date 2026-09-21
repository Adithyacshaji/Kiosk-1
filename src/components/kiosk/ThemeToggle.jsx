import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export const ThemeToggle = ({ 
  soundEnabled = true, 
  onToggleSound 
}) => {
  return (
    <div className="theme-toggle-bar">


      {/* Sound Feedback Toggle */}
      {onToggleSound && (
        <button 
          className={`btn-sound-switch ${soundEnabled ? 'active' : ''}`}
          onClick={onToggleSound}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          aria-label="Toggle Sound"
          style={{ boxShadow: '0 0 15px rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.4)' }}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}
    </div>
  );
};

