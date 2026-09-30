import React from 'react';
import { SunMedium, Clock } from 'lucide-react';

export const StatusPills = ({ weather, currentTime, darkVariant = false }) => {
  const pillStyle = darkVariant 
    ? { background: '#1A1A1A', border: 'none', color: '#ffffff' }
    : {};
    
  const iconColor = darkVariant ? "#ffffff" : "currentColor";

  return (
    <>
      <div className="landing-weather-pill" style={pillStyle}>
        <SunMedium size={18} className="pill-icon-weather" color={iconColor} />
        <span>{weather}</span>
      </div>
      <div className="landing-time-pill" style={pillStyle}>
        <Clock size={18} className="pill-icon-time" color={iconColor} />
        <span className="time-clock">{currentTime}</span>
      </div>
    </>
  );
};
