import React from 'react';

export const InactivityModal = ({ isOpen, remainingSeconds, totalWarningSeconds = 10, onStay }) => {
  if (!isOpen) return null;

  const totalCircumference = 238.76;
  const progressOffset = totalCircumference - (remainingSeconds / totalWarningSeconds) * totalCircumference;

  return (
    <div className="modal-backdrop open">
      <div className="kiosk-modal-box">
        <div className="inactivity-circle-timer">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="none" />
            <circle
              cx="45"
              cy="45"
              r="38"
              stroke="#06B6D4"
              strokeWidth="6"
              fill="none"
              strokeDasharray={totalCircumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 1s linear'
              }}
            />
          </svg>
          <span className="inactivity-countdown-num">{remainingSeconds}</span>
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Are you still using this kiosk?</h3>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Due to inactivity, the kiosk will automatically reset to the home screen to protect your privacy and welcome new visitors.
        </p>
        <button
          className="btn-view-map-hero"
          style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
          onClick={onStay}
        >
          <span>I'm Still Here</span>
        </button>
      </div>
    </div>
  );
};

