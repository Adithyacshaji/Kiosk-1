import React from 'react';

export const InactivityModal = ({ isOpen, remainingSeconds, totalWarningSeconds = 10, onStay }) => {
  if (!isOpen) return null;

  const totalCircumference = 238.76;
  const progressOffset = totalCircumference - (remainingSeconds / totalWarningSeconds) * totalCircumference;

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true">
      <div className="kiosk-modal-box inactivity-modal-card">
        <div className="inactivity-circle-timer">
          <svg width="88" height="88" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" stroke="#E5E7EB" strokeWidth="6" fill="none" />
            <circle
              cx="45"
              cy="45"
              r="38"
              stroke="#1A1A1A"
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

        <div className="inactivity-text-group">
          <h3 className="inactivity-modal-title">Are you still using this kiosk?</h3>
          <p className="inactivity-modal-desc">
            Due to inactivity, the kiosk will automatically reset to the home screen to protect your privacy and welcome new visitors.
          </p>
        </div>

        <button
          className="btn-inactivity-stay"
          onClick={onStay}
        >
          <span>I'm Still Here</span>
        </button>
      </div>
    </div>
  );
};

