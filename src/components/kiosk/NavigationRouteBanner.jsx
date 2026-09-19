import React from 'react';
import { Navigation } from 'lucide-react';

export const NavigationRouteBanner = ({ destinationPoi, onClearRoute }) => {
  if (!destinationPoi) return null;

  return (
    <div className="nav-route-banner active">
      <div className="route-info-left">
        <div className="route-icon-pulse">
          <Navigation size={22} />
        </div>
        <div className="route-stats">
          <h4>Route to {destinationPoi.name}</h4>
          <p>
            Est. Walk: {destinationPoi.estimatedWalkSeconds}s • {destinationPoi.wheelchairAccessible ? 'Accessible Step-Free Path' : 'Standard Path'}
          </p>
        </div>
      </div>
      <button className="btn-end-route" onClick={onClearRoute}>
        <span>Clear Route</span>
      </button>
    </div>
  );
};

