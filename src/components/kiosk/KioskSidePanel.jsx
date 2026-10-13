import {
  Building2,
  Layers,
  MapPin,
  Map,
  ArrowLeft,
  RotateCcw,
  X,
  User,
  GraduationCap,
  Monitor,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { KioskQRCode } from './KioskQRCode';
import { getFacultyPhoto } from '../../utils/facultyPhotos';

// ── Floor label helper ─────────────────────────────────────────────────────────
function formatFloor(floor) {
  if (!floor && floor !== 0) return 'Ground Floor';
  const f = String(floor).toUpperCase().trim();
  if (f === 'G' || f === '0' || f === 'GROUND') return 'Ground Floor';
  if (f === 'B1') return 'Basement 1';
  if (f === 'B2') return 'Basement 2';
  const n = parseInt(f, 10);
  if (!isNaN(n)) {
    const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
    return `${n}${suffix} Floor`;
  }
  return `${f} Floor`;
}

function formatBuilding(building) {
  if (!building) return '';
  const b = String(building).toLowerCase();
  if (b.includes('chavara')) return "St Chavara Block";
  if (b.includes('stmary') || b.includes('st-mary') || b.includes('st_mary') || b.includes('mary')) return "St Mary's Block";
  if (b.includes('joseph')) return "St Joseph's Block";
  return building;
}

function getCategoryMeta(destination) {
  const defaultMeta = { icon: MapPin, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  if (!destination) return defaultMeta;

  const type = (destination.type || '').toLowerCase();
  const name = (destination.name || '').toLowerCase();
  const cat = (destination.category || '').toLowerCase();

  if (type === 'faculty' || cat === 'faculty') {
    return { icon: User, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  }
  if (type === 'classroom' || cat === 'classrooms' || name.includes('class') || name.includes('hall') || name.includes('room')) {
    return { icon: GraduationCap, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  }
  if (name.includes('lab') || name.includes('computer') || name.includes('hardware')) {
    return { icon: Monitor, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  }
  if (name.includes('canteen') || name.includes('cafe') || name.includes('cafeteria') || cat === 'cafeteria') {
    return { icon: Utensils, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  }
  if (type === 'building' || cat === 'buildings') {
    return { icon: Building2, color: '#1A1A1A', bg: '#F3F4F6', border: '#E5E7EB' };
  }
  return defaultMeta;
}

/**
 * KioskSidePanel
 *
 * Right-side interactive panel for selected destination info & QR code navigation.
 */
export function KioskSidePanel({
  viewState,
  destination,
  onViewIndoor,
  onReset,
  onBackToInfo,
  isIndoorDest = false,
  theme = 'light',
  isMobileCollapsed,
  setIsMobileCollapsed,
}) {
  if (!destination) return null;

  // ── Destination metadata ─────────────────────────────────────────────────────
  const isOutdoor = destination?.category === 'outdoor' || destination?.type === 'location' || (!destination?.floor && !destination?.indoorNode && !destination?.room);
  const buildingRaw = (destination?.building || '').toLowerCase();
  const isChavara = buildingRaw.includes('chavara');
  const buildingName = isOutdoor ? '' : (destination ? (formatBuilding(destination.building) || (isChavara ? "St Chavara Block" : "St Mary's Block")) : '');
  const floorLabel = !isOutdoor && destination?.floor !== undefined && destination?.floor !== null && destination?.floor !== 0 ? formatFloor(destination.floor) : null;
  const roomId = isOutdoor ? null : (destination?.indoorNode || destination?.room || null);
  const catMeta = getCategoryMeta(destination);
  const CategoryIcon = catMeta.icon;

  // ── Panel: Destination Info ──────────────────────────────────────────────────
  const renderInfo = () => {
    const isFaculty = destination?.type === 'faculty' || destination?.category === 'faculty';
    const photoPath = isFaculty ? (destination?.image_url || destination?.photo || getFacultyPhoto(destination?.name, destination?.department || buildingName)) : null;

    return (
      <div className="kiosk-panel-info">
        {/* Main Content Area */}
        <div className="kiosk-panel-info-main-content">
          {/* Header Bar */}
          <div className="kiosk-panel-info-topbar">
            <div className="kiosk-panel-dest-header-block">
              <div 
                className="kiosk-panel-dest-icon-wrap" 
                style={{ 
                  background: photoPath ? 'transparent' : catMeta.bg, 
                  color: catMeta.color,
                  overflow: 'hidden',
                  padding: 0
                }}
              >
                {photoPath ? (
                  <img 
                    src={photoPath} 
                    alt={destination?.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const svg = e.target.parentElement.querySelector('svg');
                      if (svg) svg.style.display = 'block';
                    }}
                  />
                ) : null}
                <CategoryIcon size={24} color={catMeta.color} style={{ display: photoPath ? 'none' : 'block' }} />
              </div>
              <div className="kiosk-panel-dest-title-box">
                <h2 className="kiosk-panel-dest-name">{destination?.name}</h2>
                <div className="kiosk-panel-dest-sub">
                  {isOutdoor ? "Campus Outdoor Destination" : `${buildingName}${floorLabel ? ` · ${floorLabel}` : ''}`}
                </div>
              </div>
            </div>
            <button className="kiosk-panel-close-btn" onClick={onReset} title="Close location panel">
              <X size={18} />
            </button>
          </div>

          {/* Location Attributes Grid */}
          <div className="kiosk-panel-info-rows-list">
            {buildingName && (
              <div className="kiosk-info-row-card kiosk-card-building">
                <div className="kiosk-info-row-icon-wrap" style={{ background: '#F3F4F6', color: '#1A1A1A' }}>
                  <Building2 size={20} />
                </div>
                <div className="kiosk-info-row-details">
                  <span className="kiosk-info-row-label">BUILDING</span>
                  <span className="kiosk-info-row-value">{buildingName}</span>
                </div>
              </div>
            )}

            {floorLabel && (
              <div className="kiosk-info-row-card kiosk-card-floor">
                <div className="kiosk-info-row-icon-wrap" style={{ background: '#F3F4F6', color: '#1A1A1A' }}>
                  <Layers size={20} />
                </div>
                <div className="kiosk-info-row-details">
                  <span className="kiosk-info-row-label">FLOOR LEVEL</span>
                  <span className="kiosk-info-row-value">{floorLabel}</span>
                </div>
              </div>
            )}

            {roomId && (
              <div className="kiosk-info-row-card kiosk-card-room">
                <div className="kiosk-info-row-icon-wrap" style={{ background: '#F3F4F6', color: '#1A1A1A' }}>
                  <MapPin size={20} />
                </div>
                <div className="kiosk-info-row-details">
                  <span className="kiosk-info-row-label">ROOM / CODE</span>
                  <span className="kiosk-info-row-value">{roomId}</span>
                </div>
              </div>
            )}
          </div>

          {/* Mobile QR Code Section */}
          <div style={{ marginTop: 8 }}>
            <KioskQRCode destination={destination} />
          </div>
        </div>

        {/* Bottom Actions Area */}
        <div className="kiosk-panel-cta-group">
          {isIndoorDest && (
            <button
              id="kiosk-view-indoor-btn"
              className="kiosk-btn-view-indoor"
              onClick={onViewIndoor}
            >
              <Map size={18} />
              <span className="kiosk-btn-main-text">View Indoor Floor Map</span>
              <span className="kiosk-btn-arrow">
                <ChevronRight size={18} />
              </span>
            </button>
          )}

          <button className="kiosk-btn-new-search" onClick={onReset}>
            <RotateCcw size={16} color="#1A1A1A" />
            <span>Search Another Location</span>
          </button>
        </div>
      </div>
    );
  };

  // ── Panel: Indoor Mode ───────────────────────────────────────────────────────
  const renderIndoor = () => (
    <div className="kiosk-panel-indoor">
      {/* Top bar navigation */}
      <div className="kiosk-panel-indoor-topbar">
        <button className="kiosk-panel-back-btn" onClick={onBackToInfo} title="Back to overview">
          <ArrowLeft size={16} />
          <span>Route Overview</span>
        </button>
        <button className="kiosk-panel-close-btn" onClick={onReset} title="Clear selection">
          <X size={18} />
        </button>
      </div>

      {/* Destination Mini Summary */}
      <div className="kiosk-panel-indoor-dest-mini">
        <div className="kiosk-indoor-mini-row">
          <div className="kiosk-panel-indoor-dest-name">{destination?.name}</div>
          <span className="kiosk-indoor-status-tag">Indoor View</span>
        </div>
        <div className="kiosk-panel-indoor-dest-meta">
          {buildingName && <span className="kiosk-dest-badge kiosk-dest-badge-building">{buildingName}</span>}
          {floorLabel && <span className="kiosk-dest-badge kiosk-dest-badge-floor">{floorLabel}</span>}
          {roomId && <span className="kiosk-dest-badge kiosk-dest-badge-room">Room: {roomId}</span>}
        </div>
      </div>

      {/* Mobile QR Code Component */}
      <KioskQRCode destination={destination} />

      {/* Bottom actions */}
      <div className="kiosk-indoor-bottom-actions">
        <button className="kiosk-btn-back-overview" onClick={onBackToInfo}>
          <ArrowLeft size={16} />
          <span>Back to Route Overview</span>
        </button>
        <button className="kiosk-btn-new-search" style={{ marginTop: 4 }} onClick={onReset}>
          <RotateCcw size={16} color="#1A1A1A" />
          <span style={{ color: '#1A1A1A' }}>Search Another Location</span>
        </button>
      </div>
    </div>
  );

  // ── Render container ──────────────────────────────────────────────────────────
  return (
    <aside className={`kiosk-side-panel theme-${theme}`}>
      {/* Mobile drag handle / collapse toggle (visible only via CSS on mobile) */}
      <div 
        className="kiosk-mobile-handle" 
        onClick={() => setIsMobileCollapsed && setIsMobileCollapsed(!isMobileCollapsed)}
      >
        <div className="kiosk-mobile-handle-bar" />
        {isMobileCollapsed && (
          <span className="kiosk-mobile-handle-text">
            {destination?.name || 'Selected Destination'} (Tap to expand)
          </span>
        )}
      </div>
      
      <div className="kiosk-side-panel-scroll">
        {viewState === 'split-indoor' ? renderIndoor() : renderInfo()}
      </div>
    </aside>
  );
}

export default KioskSidePanel;
