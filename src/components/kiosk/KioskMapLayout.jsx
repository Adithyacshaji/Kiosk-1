import { Suspense } from 'react';
import { Home, Clock, MapPin } from 'lucide-react';
import { KioskSidePanel } from './KioskSidePanel';
import logoImg from '../../assets/kiosk/logo.png';

/**
 * KioskMapLayout
 *
 * Top-level layout for the 32-inch horizontal kiosk map experience.
 * Renders a full-width header, then a two-column body:
 *   LEFT  (62%) — CampusMap component (passed as `mapSlot` render prop)
 *   RIGHT (38%) — KioskSidePanel
 *
 * Props:
 *   kioskViewState  – 'fullscreen' | 'split-outdoor' | 'split-indoor'
 *   destination     – selected destination item or null
 *   isIndoorDest    – boolean
 *   onSearch        – (location) => void
 *   onViewIndoor    – () => void
 *   onReset         – () => void
 *   onBackToInfo    – () => void
 *   onGoHome        – () => void  (returns to LandingScreen)
 *   currentTime     – string e.g. "09:30"
 *   currentFloor    – string e.g. "G"
 *   theme           – 'light' | 'dark'
 *   mapSlot         – React node: the CampusMap (pre-configured in App.jsx)
 */
export function KioskMapLayout({
  kioskViewState,
  destination,
  isIndoorDest,
  onSearch,
  onViewIndoor,
  onReset,
  onBackToInfo,
  onGoHome,
  currentTime,
  currentFloor,
  theme = 'light',
  mapSlot,
}) {
  const isSplit = kioskViewState === 'split-outdoor' || kioskViewState === 'split-indoor';

  return (
    <div className={`kiosk-map-root theme-${theme}`}>
      {/* ── Body: Map + Side Panel ──────────────────────────────────────────── */}
      <div className={`kiosk-map-body ${isSplit ? 'kiosk-split' : 'kiosk-fullscreen-map'}`}>
        {/* LEFT — Map Column */}
        <div className={`kiosk-map-col ${isSplit ? 'kiosk-map-col-split' : 'kiosk-map-col-full'}`}>
          {/* Map renders here — passed as a pre-configured node from App.jsx */}
          <div className="kiosk-map-inner">
            <Suspense fallback={
              <div className="kiosk-map-loading">
                <div className="kiosk-map-loading-spinner" />
                <span>Loading Map…</span>
              </div>
            }>
              {mapSlot}
            </Suspense>
          </div>
        </div>

        {/* RIGHT — Side Panel (visible only in split states) */}
        {isSplit && (
          <div className="kiosk-panel-col">
            <KioskSidePanel
              viewState={kioskViewState}
              destination={destination}
              isIndoorDest={isIndoorDest}
              onSearch={onSearch}
              onViewIndoor={onViewIndoor}
              onReset={onReset}
              onBackToInfo={onBackToInfo}
              currentFloor={currentFloor}
              theme={theme}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default KioskMapLayout;
