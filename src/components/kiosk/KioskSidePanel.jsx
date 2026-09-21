import { useState, useRef } from 'react';
import {
  Building2,
  Layers,
  MapPin,
  Map,
  ArrowLeft,
  RotateCcw,
  Navigation,
  X,
  Compass,
  User,
  GraduationCap,
  Monitor,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import SearchBar from '../common/SearchBar';
import { KioskQRCode } from './KioskQRCode';

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
  if (!destination) return { icon: MapPin, color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' };

  const type = (destination.type || '').toLowerCase();
  const name = (destination.name || '').toLowerCase();
  const cat = (destination.category || '').toLowerCase();

  if (type === 'faculty' || cat === 'faculty') {
    return { icon: User, color: '#16a34a', bg: '#dcfce7', border: '#86efac' };
  }
  if (type === 'classroom' || cat === 'classrooms' || name.includes('class') || name.includes('hall') || name.includes('room')) {
    return { icon: GraduationCap, color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' };
  }
  if (name.includes('lab') || name.includes('computer') || name.includes('hardware')) {
    return { icon: Monitor, color: '#0d9488', bg: '#ccfbf1', border: '#5eead4' };
  }
  if (name.includes('canteen') || name.includes('cafe') || name.includes('cafeteria') || cat === 'cafeteria') {
    return { icon: Utensils, color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
  }
  if (type === 'building' || cat === 'buildings') {
    return { icon: Building2, color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' };
  }
  return { icon: MapPin, color: '#0284c7', bg: '#e0f2fe', border: '#7dd3fc' };
}

/**
 * KioskSidePanel
 *
 * Right-side interactive panel (30% width) for the kiosk map experience.
 * Styled with the frosted glass aesthetic and jewel-tone palette from the home dashboard.
 */
export function KioskSidePanel({
  viewState,
  destination,
  onSearch,
  onViewIndoor,
  onReset,
  onBackToInfo,
  currentFloor = 'G',
  isIndoorDest = false,
  theme = 'light',
}) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const clearSearchRef = useRef(null);

  // ── Destination metadata ─────────────────────────────────────────────────────
  const buildingRaw = (destination?.building || '').toLowerCase();
  const isChavara = buildingRaw.includes('chavara');
  const buildingName = destination ? (formatBuilding(destination.building) || (isChavara ? "St Chavara Block" : "St Mary's Block")) : '';
  const floorLabel = destination?.floor !== undefined && destination?.floor !== null ? formatFloor(destination.floor) : null;
  const roomId = destination?.indoorNode || destination?.room || destination?.id || null;
  const catMeta = getCategoryMeta(destination);
  const CategoryIcon = catMeta.icon;

  // ── Virtual keyboard rows ────────────────────────────────────────────────────
  const KB_ROWS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
    ['SPACE', 'DONE'],
  ];

  const handleKeyPress = (key) => {
    const input = document.querySelector('.kiosk-searchbar-wrap input');
    if (!input) return;
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    if (key === '⌫') {
      nativeInputValueSetter.call(input, input.value.slice(0, -1));
    } else if (key === 'SPACE') {
      nativeInputValueSetter.call(input, input.value + ' ');
    } else if (key === 'DONE') {
      setKeyboardOpen(false);
      input.blur();
      return;
    } else {
      nativeInputValueSetter.call(input, input.value + key);
    }
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // ── Panel: Search Mode ───────────────────────────────────────────────────────
  const renderSearch = () => (
    <div className="kiosk-panel-search">
      <div className="kiosk-panel-search-headline">
        <div className="kiosk-panel-search-icon-bubble">
          <Navigation size={26} className="kiosk-panel-headline-icon" />
        </div>
        <div className="kiosk-panel-headline-text">
          <div className="kiosk-panel-headline-title">Where to?</div>
          <div className="kiosk-panel-headline-sub">Search for any classroom, faculty, lab, or office</div>
        </div>
      </div>

      <div className="kiosk-searchbar-wrap">
        <SearchBar
          onSelect={(loc) => {
            setKeyboardOpen(false);
            onSearch(loc);
          }}
          currentFloor={currentFloor}
          isIndoorMode={false}
          clearRef={clearSearchRef}
        />
      </div>

      {/* Toggle On-Screen Keyboard */}
      <button
        className={`kiosk-keyboard-toggle ${keyboardOpen ? 'active' : ''}`}
        onClick={() => {
          setKeyboardOpen((v) => !v);
          if (!keyboardOpen) {
            const input = document.querySelector('.kiosk-searchbar-wrap input');
            input?.focus();
          }
        }}
      >
        <span>⌨</span>
        <span>{keyboardOpen ? 'Hide On-Screen Keyboard' : 'Open On-Screen Touch Keyboard'}</span>
      </button>

      {/* Virtual keyboard */}
      {keyboardOpen && (
        <div className="kiosk-vkb">
          {KB_ROWS.map((row, rIdx) => (
            <div key={rIdx} className="kiosk-vkb-row">
              {row.map((key) => {
                let cls = 'kiosk-vkb-key';
                if (key === 'SPACE') cls += ' kiosk-vkb-space';
                if (key === 'DONE') cls += ' kiosk-vkb-done';
                if (key === '⌫') cls += ' kiosk-vkb-backspace';
                return (
                  <button key={key} className={cls} onPointerDown={(e) => { e.preventDefault(); handleKeyPress(key); }}>
                    {key === 'SPACE' ? 'Space' : key === 'DONE' ? '✓ Done' : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Quick category chips */}
      {!keyboardOpen && (
        <div className="kiosk-quick-categories-section">
          <div className="kiosk-quick-section-label">Popular Destinations</div>
          <div className="kiosk-quick-chips-grid">
            {[
              { label: 'Classrooms', icon: GraduationCap, q: 'classroom', color: '#5d859b' },
              { label: 'Faculty', icon: User, q: 'faculty', color: '#819a84' },
              { label: 'Canteen', icon: Utensils, q: 'canteen', color: '#ca9557' },
              { label: 'Labs', icon: Monitor, q: 'lab', color: '#598b85' },
              { label: 'Washrooms', icon: MapPin, q: 'toilet', color: '#90bbac' },
              { label: 'Auditorium', icon: Building2, q: 'auditorium', color: '#5d859b' },
            ].map((chip) => {
              const IconComp = chip.icon;
              return (
                <button
                  key={chip.q}
                  className="kiosk-quick-chip-card"
                  onClick={() => {
                    const input = document.querySelector('.kiosk-searchbar-wrap input');
                    if (input) {
                      const nativeSet = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
                      nativeSet.call(input, chip.q);
                      input.dispatchEvent(new Event('input', { bubbles: true }));
                      input.focus();
                    }
                  }}
                >
                  <div className="kiosk-chip-icon-circle" style={{ color: chip.color, background: `${chip.color}22` }}>
                    <IconComp size={18} />
                  </div>
                  <span className="kiosk-chip-title">{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── Panel: Destination Info ──────────────────────────────────────────────────
  const renderInfo = () => (
    <div className="kiosk-panel-info">
      {/* Top Section */}
      <div className="kiosk-panel-info-main-content">
        {/* Top Header with Close Button */}
        <div className="kiosk-panel-info-topbar">
          <div className="kiosk-panel-dest-header-block">
            <div className="kiosk-panel-dest-icon-wrap" style={{ background: catMeta.bg, color: catMeta.color }}>
              <CategoryIcon size={24} color={catMeta.color} />
            </div>
            <div className="kiosk-panel-dest-title-box">
              <h2 className="kiosk-panel-dest-name">{destination?.name}</h2>
              <div className="kiosk-panel-dest-sub">
                {buildingName}{floorLabel ? ` · ${floorLabel}` : ''}
              </div>
            </div>
          </div>
          <button className="kiosk-panel-close-btn" onClick={onReset} title="Close info">
            <X size={18} />
          </button>
        </div>

        {/* 1-Column Information Rows (Light Clean Cards) */}
        <div className="kiosk-panel-info-rows-list">
          {/* Building */}
          {buildingName && (
            <div className="kiosk-info-row-card kiosk-card-building">
              <div className="kiosk-info-row-icon-wrap" style={{ background: '#e0f0fe', color: '#2563eb' }}>
                <Building2 size={22} />
              </div>
              <div className="kiosk-info-row-details">
                <span className="kiosk-info-row-label">BUILDING BLOCK</span>
                <span className="kiosk-info-row-value">{buildingName}</span>
              </div>
            </div>
          )}

          {/* Floor Level */}
          {floorLabel && (
            <div className="kiosk-info-row-card kiosk-card-floor">
              <div className="kiosk-info-row-icon-wrap" style={{ background: '#dcfce7', color: '#16a34a' }}>
                <Layers size={22} />
              </div>
              <div className="kiosk-info-row-details">
                <span className="kiosk-info-row-label">FLOOR LEVEL</span>
                <span className="kiosk-info-row-value">{floorLabel}</span>
              </div>
            </div>
          )}

          {/* Room / Code */}
          {roomId && (
            <div className="kiosk-info-row-card kiosk-card-room">
              <div className="kiosk-info-row-icon-wrap" style={{ background: '#fef3c7', color: '#d97706' }}>
                <MapPin size={22} />
              </div>
              <div className="kiosk-info-row-details">
                <span className="kiosk-info-row-label">ROOM / CODE</span>
                <span className="kiosk-info-row-value">{roomId}</span>
              </div>
            </div>
          )}
        </div>

        {/* Visual Wayfinding Guidance Card */}
        <div className="kiosk-outdoor-route-card">
          <div className="kiosk-route-step-badge">
            <Compass size={22} color="#15803d" />
          </div>
          <div className="kiosk-outdoor-route-text">
            <div className="kiosk-outdoor-route-title">
              {isChavara ? "Wayfinding Guidance" : (isIndoorDest ? "You are at St Mary's Block" : "Wayfinding Guidance")}
            </div>
            <div className="kiosk-outdoor-route-sub">
              {isChavara
                ? "Follow the highlighted outdoor pathway straight to St Chavara Block main entrance."
                : (isIndoorDest
                  ? "You are at St Mary's Block entrance. Proceed inside to the floor elevators or stairwell to reach your room."
                  : "Follow the highlighted walking path on the outdoor campus map to reach your destination.")}
            </div>
          </div>
        </div>


        {/* QR Code Section for all destinations (take directions on phone) */}
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
            <Map size={20} />
            <span className="kiosk-btn-main-text">View Indoor Floor Map & QR</span>
            <span className="kiosk-btn-arrow">
              <ChevronRight size={18} />
            </span>
          </button>
        )}

        <button className="kiosk-btn-new-search" onClick={onReset}>
          <RotateCcw size={18} color="#2563eb" />
          <span>New Destination Search</span>
        </button>
      </div>
    </div>

  );

  // ── Panel: Indoor + QR Mode ──────────────────────────────────────────────────
  const renderIndoor = () => (
    <div className="kiosk-panel-indoor">
      {/* Top bar navigation */}
      <div className="kiosk-panel-indoor-topbar">
        <button className="kiosk-panel-back-btn" onClick={onBackToInfo} title="Back to destination overview">
          <ArrowLeft size={18} />
          <span>Overview</span>
        </button>
        <button className="kiosk-panel-close-btn" onClick={onReset} title="Clear search">
          <X size={20} />
        </button>
      </div>

      {/* Destination Mini Summary Banner */}
      <div className="kiosk-panel-indoor-dest-mini">
        <div className="kiosk-indoor-mini-row">
          <div className="kiosk-panel-indoor-dest-name">{destination?.name}</div>
          <span className="kiosk-indoor-status-tag">Active on Map</span>
        </div>
        <div className="kiosk-panel-indoor-dest-meta">
          {buildingName && <span className="kiosk-dest-badge kiosk-dest-badge-building">{buildingName}</span>}
          {floorLabel && <span className="kiosk-dest-badge kiosk-dest-badge-floor">{floorLabel}</span>}
          {roomId && <span className="kiosk-dest-badge kiosk-dest-badge-room">Code: {roomId}</span>}
        </div>
      </div>

      {/* Scannable Real-time QR Code Component */}
      <KioskQRCode destination={destination} />

      {/* Return to outdoor map / search action */}
      <div className="kiosk-indoor-bottom-actions">
        <button className="kiosk-btn-back-overview" onClick={onBackToInfo}>
          <ArrowLeft size={16} />
          <span>Back to Route Overview</span>
        </button>
        <button className="kiosk-btn-reset-light" onClick={onReset}>
          <RotateCcw size={16} />
          <span>New Search</span>
        </button>
      </div>
    </div>
  );

  // ── Render container ──────────────────────────────────────────────────────────
  return (
    <aside className={`kiosk-side-panel theme-${theme}`}>
      <div className="kiosk-side-panel-scroll">
        {viewState === 'split-indoor' ? renderIndoor()
          : (viewState === 'split-outdoor' && destination) ? renderInfo()
            : renderSearch()}
      </div>
    </aside>
  );
}

export default KioskSidePanel;
