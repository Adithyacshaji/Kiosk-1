import React from 'react';
import { X, Layers, Clock, Footprints, Navigation, QrCode } from 'lucide-react';
import { KIOSK_CONFIG } from '../../data/kiosk/kioskData';

export const PoiDrawer = ({ 
  poi, 
  isOpen, 
  onClose, 
  onGetDirections, 
  onOpenQr 
}) => {
  if (!poi) return null;

  const category = KIOSK_CONFIG.categories.find(c => c.id === poi.category);

  return (
    <div className={`poi-detail-drawer ${isOpen ? 'open' : ''}`}>
      <div className="poi-drawer-header">
        <div>
          <span 
            className="poi-drawer-badge" 
            style={{ 
              background: category ? `${category.color}25` : 'rgba(6, 182, 212, 0.2)',
              color: category ? category.color : 'var(--accent-cyan)'
            }}
          >
            {category ? category.label : poi.category}
          </span>
          <h3 className="poi-drawer-title">{poi.name}</h3>
        </div>
        <button className="btn-close-drawer" onClick={onClose} aria-label="Close details">
          <X size={16} />
        </button>
      </div>

      <div className="poi-meta-row">
        <div className="poi-meta-item">
          <Layers size={14} color="var(--accent-cyan)" />
          <span>Level {poi.floor}</span>
        </div>
        <div className="poi-meta-item">
          <Clock size={14} color="var(--accent-amber)" />
          <span>{poi.hours || 'Open Today'}</span>
        </div>
        <div className="poi-meta-item">
          <Footprints size={14} color="var(--accent-emerald)" />
          <span>~{poi.estimatedWalkSeconds}s walk</span>
        </div>
      </div>

      <p className="poi-description">{poi.description}</p>

      <div className="poi-drawer-actions">
        <button className="btn-get-directions" onClick={() => onGetDirections(poi)}>
          <Navigation size={18} />
          <span>Get Walking Route</span>
        </button>
        <button className="btn-qr-sync" onClick={() => onOpenQr(poi)} title="Send Directions to Smartphone">
          <QrCode size={20} />
        </button>
      </div>
    </div>
  );
};

