import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { StatusPills } from './StatusPills';
import logoImg from '../../assets/kiosk/logo.png';

export const DirectoryHeader = ({
  title,
  onBack,
  onGoHome,
  currentTime,
  weather,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  backText = "Back"
}) => {
  return (
    <header className="directory-top-bar">
      <div className="dir-bar-left">
        <button className="btn-dir-back" onClick={onBack} title={backText}>
          <ArrowLeft size={20} />
          <span>{backText}</span>
        </button>
        <div className="dir-brand-badge" onClick={onGoHome}>
          <img src={logoImg} alt="Logo" className="dir-logo-mini" />
          <div className="dir-brand-text">
            <span className="dir-brand-name">Campus Compass</span>
            <span className="dir-brand-tag">{title}</span>
          </div>
        </div>
      </div>

      <div className="dir-bar-right">
        <StatusPills weather={weather} currentTime={currentTime} />
        <ThemeToggle 
          theme={theme}
          onToggleTheme={onToggleTheme}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
        <button className="btn-campus-home" onClick={onGoHome} title="Home">
          <Home size={20} />
        </button>
      </div>
    </header>
  );
};
