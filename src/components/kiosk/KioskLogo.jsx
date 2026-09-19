import React from 'react';
import logoImg from '../../assets/kiosk/logo.png';

export const KioskLogo = ({ size = 240, animated = true }) => {
  return (
    <div className="logo-container" style={{ width: size + 40, height: size + 40 }}>
      {animated && <div className="logo-glow-hexagon"></div>}
      <img
        src={logoImg}
        alt="Campus Compass Logo"
        className={`kiosk-logo-img ${animated ? 'animated' : ''}`}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </div>
  );
};

export const MiniBrandHeader = ({ 
  subtitle = "Interactive Directory & Wayfinding",
  title = "Campus Compass"
}) => {
  return (
    <div className="brand-mini">
      <div className="mini-logo-wrapper">
        <img src={logoImg} alt="Logo" className="logo-icon-img" />
      </div>
      <div>
        <div className="brand-title"><h2>{title}</h2></div>
        <span className="kiosk-badge">{subtitle}</span>
      </div>
    </div>
  );
};
