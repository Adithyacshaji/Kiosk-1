import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Clock, 
  HelpCircle, 
  Home, 
  Search, 
  X, 
  Keyboard, 
  LocateFixed, 
  Plus, 
  Minus, 
  Monitor,
  User,
  Building2,
  Navigation,
  Compass,
  MapPin,
  GraduationCap
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PoiDrawer } from './PoiDrawer';
import { NavigationRouteBanner } from './NavigationRouteBanner';
import { VirtualKeyboard } from './VirtualKeyboard';
import { MapGuideFlashcard } from './MapGuideFlashcard';
import { KIOSK_CONFIG } from '../../data/kiosk/kioskData';
import { TRANSLATIONS } from '../../data/kiosk/translations';
import logoImg from '../../assets/kiosk/logo.png';

const getCategoryIconComponent = (catId) => {
  switch (catId) {
    case 'classrooms': return <Monitor size={16} />;
    case 'faculty': return <User size={16} />;
    case 'buildings': return <Building2 size={16} />;
    case 'outdoor': return <Navigation size={16} />;
    default: return <Compass size={16} />;
  }
};

export const MapScreen = ({
  currentTime,
  currentFloor,
  onChangeFloor,
  selectedPoi,
  onSelectPoi,
  onClosePoiDrawer,
  onGoHome,
  onOpenQr,
  theme = 'light',
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  language = 'en',
  initialSearchQuery = '',
  initialCategory = 'all'
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const poiLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const floorOutlineLayerRef = useRef(null);
  const youAreHereMarkerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [activeRouteDestination, setActiveRouteDestination] = useState(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCoords = [KIOSK_CONFIG.kioskLocation.lat, KIOSK_CONFIG.kioskLocation.lng];
    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      minZoom: 15,
      maxZoom: 19
    });

    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    poiLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    floorOutlineLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer on Theme Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    const tileUrl = theme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    tileLayerRef.current = L.tileLayer(tileUrl, { maxZoom: 19, subdomains: 'abcd' }).addTo(mapInstanceRef.current);
  }, [theme]);

  // Update Floor Outlines and "You Are Here" Marker when Floor changes
  useEffect(() => {
    if (!mapInstanceRef.current || !floorOutlineLayerRef.current) return;

    floorOutlineLayerRef.current.clearLayers();
    const centerLat = KIOSK_CONFIG.kioskLocation.lat;
    const centerLng = KIOSK_CONFIG.kioskLocation.lng;

    const buildingCoords = [
      [centerLat + 0.0020, centerLng - 0.0030],
      [centerLat + 0.0022, centerLng + 0.0028],
      [centerLat - 0.0022, centerLng + 0.0030],
      [centerLat - 0.0024, centerLng - 0.0028]
    ];

    const atriumCoords = [
      [centerLat + 0.0008, centerLng - 0.0010],
      [centerLat + 0.0008, centerLng + 0.0010],
      [centerLat - 0.0008, centerLng + 0.0010],
      [centerLat - 0.0008, centerLng - 0.0010]
    ];

    L.polygon(buildingCoords, {
      color: '#0B4A8B',
      weight: 2.5,
      dashArray: '6, 6',
      fillColor: theme === 'dark' ? '#0D274A' : '#E8F1FA',
      fillOpacity: theme === 'dark' ? 0.6 : 0.45
    }).addTo(floorOutlineLayerRef.current);

    L.polygon(atriumCoords, {
      color: '#8DC63F',
      weight: 2,
      fillColor: '#8DC63F',
      fillOpacity: 0.3
    }).addTo(floorOutlineLayerRef.current);

    // "You Are Here" Marker with Leaf Pin theme
    if (currentFloor === KIOSK_CONFIG.kioskLocation.floor) {
      if (youAreHereMarkerRef.current) {
        mapInstanceRef.current.removeLayer(youAreHereMarkerRef.current);
      }
      const customIcon = L.divIcon({
        className: 'you-are-here-custom-icon',
        html: `
          <div class="you-are-here-marker" title="You Are Here (Kiosk #01)">
            <div class="you-are-here-pulse"></div>
            <div class="you-are-here-core"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      youAreHereMarkerRef.current = L.marker([KIOSK_CONFIG.kioskLocation.lat, KIOSK_CONFIG.kioskLocation.lng], {
        icon: customIcon,
        zIndexOffset: 1000
      }).addTo(mapInstanceRef.current);
    } else if (youAreHereMarkerRef.current) {
      mapInstanceRef.current.removeLayer(youAreHereMarkerRef.current);
      youAreHereMarkerRef.current = null;
    }
  }, [currentFloor, theme]);

  // Refresh Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !poiLayerRef.current) return;

    poiLayerRef.current.clearLayers();

    const filtered = KIOSK_CONFIG.pois.filter(poi => {
      const matchesFloor = poi.floor === currentFloor;
      const matchesCategory = activeCategory === 'all' || poi.category === activeCategory;
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = poi.name.toLowerCase().includes(q);
        const inDesc = poi.description.toLowerCase().includes(q);
        const inTags = poi.tags && poi.tags.some(t => t.toLowerCase().includes(q));
        matchesSearch = inName || inDesc || inTags;
      }
      return matchesFloor && matchesCategory && matchesSearch;
    });

    filtered.forEach(poi => {
      const cat = KIOSK_CONFIG.categories.find(c => c.id === poi.category) || { color: '#3B9EEA' };
      const isSelected = selectedPoi && selectedPoi.id === poi.id;

      const pinIcon = L.divIcon({
        className: 'custom-poi-icon-div',
        html: `
          <div class="kiosk-pin-marker ${isSelected ? 'highlighted' : ''}" 
               style="background: ${cat.color}; width: 36px; height: 36px; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(11, 74, 139, 0.35); border-radius: 50%;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${cat.color === '#8DC63F' ? '#0B4A8B' : '#FFFFFF'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([poi.lat, poi.lng], { icon: pinIcon }).addTo(poiLayerRef.current);
      marker.on('click', () => {
        onSelectPoi(poi);
      });
    });
  }, [currentFloor, activeCategory, searchQuery, selectedPoi, theme]);

  // Zoom & Pan to selected POI
  useEffect(() => {
    if (selectedPoi && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedPoi.lat, selectedPoi.lng], 18, { duration: 0.8 });
    }
  }, [selectedPoi]);

  // Recenter to Kiosk
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (currentFloor !== KIOSK_CONFIG.kioskLocation.floor) {
      onChangeFloor(KIOSK_CONFIG.kioskLocation.floor);
    }
    mapInstanceRef.current.flyTo([KIOSK_CONFIG.kioskLocation.lat, KIOSK_CONFIG.kioskLocation.lng], 18, { duration: 0.6 });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  // Draw walking route
  const handleGetDirections = (destinationPoi) => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    const startLat = KIOSK_CONFIG.kioskLocation.lat;
    const startLng = KIOSK_CONFIG.kioskLocation.lng;
    const endLat = destinationPoi.lat;
    const endLng = destinationPoi.lng;

    const midLat = (startLat + endLat) / 2 + (startLat > endLat ? -0.0002 : 0.0002);
    const midLng = startLng;

    const latlngs = [
      [startLat, startLng],
      [midLat, midLng],
      [endLat, endLng]
    ];

    const routePolyline = L.polyline(latlngs, {
      color: '#3B9EEA',
      weight: 6,
      opacity: 0.95,
      dashArray: '10, 10',
      lineCap: 'round'
    }).addTo(routeLayerRef.current);

    mapInstanceRef.current.fitBounds(routePolyline.getBounds(), { padding: [80, 80] });
    setActiveRouteDestination(destinationPoi);
    onClosePoiDrawer();
  };

  const handleClearRoute = () => {
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    setActiveRouteDestination(null);
  };

  // Keyboard touch input
  const handleVirtualKeyPress = (key) => {
    if (key === 'BACKSPACE') {
      setSearchQuery(prev => prev.slice(0, -1));
    } else if (key === 'CLEAR') {
      setSearchQuery('');
    } else if (key === 'SPACE') {
      setSearchQuery(prev => prev + ' ');
    } else {
      setSearchQuery(prev => prev + key);
    }
  };

  const activeFloorData = KIOSK_CONFIG.floors.find(f => f.id === currentFloor);

  return (
    <section id="screen-map" className={`screen active theme-${theme}`} role="region" aria-label="Interactive Map and Wayfinding">
      {/* Top Header Bar */}
      <header className="campus-header-bar">
        <div className="campus-brand-block" onClick={onGoHome} style={{ cursor: 'pointer' }}>
          <div className="campus-logo-badge">
            <img src={logoImg} alt="Campus Compass" className="header-logo-img" />
          </div>
          <div className="campus-title-group">
            <div className="brand-name-row">
              <span className="brand-text-main">Campus Compass</span>
            </div>
            <span className="brand-tagline-text">{t.brandTagline}</span>
          </div>
        </div>

        <div className="campus-header-right">
          <div className="college-crest-badge">
            <GraduationCap size={22} className="crest-icon" />
            <div className="crest-text">
              <span className="college-title">{t.collegeName}</span>
              <span className="college-sub">{t.floor}: {activeFloorData ? activeFloorData.name : 'Level 1'}</span>
            </div>
          </div>

          <div className="header-divider"></div>

          <div className="live-time-display">
            <Clock size={16} />
            <span className="time-clock">{currentTime}</span>
          </div>

          <ThemeToggle 
            theme={theme}
            onToggleTheme={onToggleTheme}
            soundEnabled={soundEnabled}
            onToggleSound={onToggleSound}
          />

          {/* Guide Flashcard Trigger Button */}
          <button 
            className="btn-campus-guide" 
            onClick={() => setIsGuideModalOpen(true)} 
            title={t.guide}
            aria-label="Open Map Instructions"
          >
            <HelpCircle size={18} />
            <span>{t.guide}</span>
          </button>

          <button className="btn-campus-home" onClick={onGoHome} title={t.home}>
            <Home size={18} />
          </button>
        </div>
      </header>

      {/* Map Layout */}
      <div className="map-layout-container">
        {/* Leaflet Canvas */}
        <div id="leaflet-map" ref={mapContainerRef}></div>

        {/* Top Floating Search & Category Pills */}
        <div className="map-floating-top">
          <div className="search-bar-wrapper">
            <Search size={20} color="var(--c-azure)" />
            <input
              type="text"
              className="search-input-field"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsKeyboardOpen(true)}
            />
            {searchQuery && (
              <button className="btn-clear-search visible" onClick={() => setSearchQuery('')}>
                <X size={18} />
              </button>
            )}
            <button
              className={`btn-keyboard-toggle ${isKeyboardOpen ? 'active' : ''}`}
              onClick={() => setIsKeyboardOpen(prev => !prev)}
            >
              <Keyboard size={16} />
              <span>{t.keyboard}</span>
            </button>
          </div>

          <div className="category-filter-scroll">
            {KIOSK_CONFIG.categories.map((cat) => (
              <button
                key={cat.id}
                className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {getCategoryIconComponent(cat.id)}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Floating Controls: Floor Selector, Recenter, Zoom */}
        <div className="map-floating-controls">
          <div className="floor-selector-panel">
            {KIOSK_CONFIG.floors.slice().reverse().map((floor) => (
              <button
                key={floor.id}
                className={`floor-btn ${floor.id === currentFloor ? 'active' : ''}`}
                onClick={() => onChangeFloor(floor.id)}
              >
                <span>{floor.shortName}</span>
                <span className="floor-label">{floor.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div className="map-action-btn-group">
            <button className="map-action-btn" onClick={handleRecenter} title="Recenter to You Are Here">
              <LocateFixed size={22} color="var(--c-azure)" />
            </button>
            <button className="map-action-btn" onClick={handleZoomIn} title="Zoom In">
              <Plus size={22} />
            </button>
            <button className="map-action-btn" onClick={handleZoomOut} title="Zoom Out">
              <Minus size={22} />
            </button>
          </div>
        </div>

        {/* POI Details Drawer */}
        <PoiDrawer
          poi={selectedPoi}
          isOpen={!!selectedPoi}
          onClose={onClosePoiDrawer}
          onGetDirections={handleGetDirections}
          onOpenQr={onOpenQr}
        />

        {/* Turn-by-Turn Wayfinding Banner */}
        <NavigationRouteBanner
          destinationPoi={activeRouteDestination}
          onClearRoute={handleClearRoute}
        />

        {/* Virtual On-Screen Touch Keyboard */}
        <VirtualKeyboard
          isOpen={isKeyboardOpen}
          onKeyPress={handleVirtualKeyPress}
          onClose={() => setIsKeyboardOpen(false)}
        />

        {/* Interactive Map Guide Flashcard Modal */}
        <MapGuideFlashcard
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          language={language}
        />
      </div>

      {/* Clean Bottom Bar */}
      <footer className="campus-bottom-footer">
        <div className="footer-left-info">
          <MapPin size={16} color="var(--c-azure)" />
          <span>Christ College of Engineering (Autonomous) | Irinjalakuda</span>
        </div>
        <div className="footer-right-motto">
          <span>"Smarter campus. A better you."</span>
        </div>
      </footer>
    </section>
  );
};

export default MapScreen;
