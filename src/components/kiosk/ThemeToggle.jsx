import React from 'react';
import { Sun, Moon, Volume2, VolumeX } from 'lucide-react';

export const ThemeToggle = ({ 
  theme = 'light', 
  onToggleTheme, 
  soundEnabled = true, 
  onToggleSound 
}) => {
  return (
    <div className="theme-toggle-bar">
      {/* Light / Dark Mode Toggle Button */}
      <button 
        className="btn-theme-switch"
        onClick={onToggleTheme}
        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        aria-label="Toggle Dark/Light Mode"
      >
        {theme === 'light' ? (
          <>
            <Moon size={18} className="theme-icon" />
            <span className="theme-label">Dark</span>
          </>
        ) : (
          <>
            <Sun size={18} className="theme-icon" />
            <span className="theme-label">Light</span>
          </>
        )}
      </button>

      {/* Sound Feedback Toggle */}
      {onToggleSound && (
        <button 
          className={`btn-sound-switch ${soundEnabled ? 'active' : ''}`}
          onClick={onToggleSound}
          title={soundEnabled ? 'Sound On' : 'Sound Muted'}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      )}
    </div>
  );
};

