import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import {
  ImageOverlay,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  Tooltip,
  TileLayer,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotate";
import L from "leaflet";
import { CAMPUS_BOUNDS } from "../../data/locations";
import { useDatabase } from "../../context/DatabaseContext";
import { FLOOR_IMAGES, CHAVARA_FLOOR_IMAGES } from "../../data/floorImages";

import { findNearestIndoorNode } from "../../utils/findNearestIndoorNode";
import { calculateHaversineDistance } from "../../utils/haversine";
import { getDistanceToRoute } from "../../utils/distanceToRoute";


// ─── Debug flags ──────────────────────────────────────────────────────────────
const SHOW_INDOOR_DEBUG_MARKERS = false; // Show all indoor nodes as markers for debugging
const SHOW_INDOOR_DEBUG_TOOLS = false;
const INITIAL_OUTDOOR_MARKER_IDS = [
  "chavara",
  "canteen",
  "st-marys-block",
  "cafe",
  "cafe1",
  "cafe-2",
  "joseph",
];

// ─── Zoom constants ───────────────────────────────────────────────────────────
const OUTDOOR_ZOOM = {  
  default: 17,
  min: 17.5,
  max: 19.1,
  maxNative: 19,
};
function getIndoorZoomConfig(building) {
  if (building === "chavara") {
    return {
      min: 21.4,
      max: 25.0,
      overview: 20.0,
    };
  }
  // St. Mary's indoor zoom (slightly closer to fit its smaller footprint)
  return {
    min: 21.8,
    max: 25.5,
    overview: 21.5,
  };
}

function normalizeFloor(floor) {
  if (!floor) return "G";
  const fStr = floor.toString().toUpperCase().trim();
  if (fStr.startsWith("B")) return fStr;
  if (fStr.startsWith("G")) return "G";
  const match = fStr.match(/(\d+)/);
  if (match) return match[1];
  return floor;
}

// ─── Buildings list ───────────────────────────────────────────────────────────
const BUILDINGS = [
  { name: "St Chavara\nBlock", position: [10.355803, 76.212607] },
  { name: "St Mary's\nBlock", position: [10.357831, 76.212684] },
  { name: "Canteen", position: [10.357311, 76.212615] },
  { name: "Open\nAuditorium", position: [10.356543, 76.212435] },
  { name: "Cafe", position: [10.355634, 76.212088] },
  { name: "Christ Cafe", position: [10.357574, 76.213379] },
  { name: "St Joseph's\nBlock", position: [10.358869, 76.212778] },
  { name: "Amphitheatre", position: [10.358051, 76.213301] },
];
// ─── Campus Feature Data ──────────────────────────────────────────────────────
const GREEN_AREAS = [
  {
    id: "lawn-mid-west",
    positions: [
      [10.358571, 76.21273], [10.358582, 76.213004],
      [10.359046, 76.213009], [10.359094, 76.212601],
      [10.358925, 76.212607], [10.358925, 76.212478],
      [10.358783, 76.212483], [10.358761, 76.212644],
    ],
  },
  {
    id: "lawn-chavara-side",
    positions: [
      [10.355565, 76.212459], [10.35557, 76.212711],
      [10.356272, 76.212716], [10.356282, 76.212443],
    ],
  },
  {
    id: "lawn-north",
    positions: [
      [10.35756, 76.212521], [10.357661, 76.212843],
      [10.357808, 76.212982], [10.358008, 76.21292],
      [10.358076, 76.212748], [10.357992, 76.212367],
    ],
  },
];
const PARKING_AREAS = [
  {
    id: "lawn-stmarys-side",
    positions: [
      [10.355781, 76.212029], [10.35577, 76.212185],
      [10.355596, 76.212169], [10.355612, 76.212013],
    ],
  },
  {
    id: "parking-north",
    positions: [
      [10.357233, 76.212617], [10.357249, 76.212692],
      [10.357502, 76.212639], [10.35745, 76.212456],
    ],
  },
];

// ─── Bearing calculation ──────────────────────────────────────────────────────
/**
 * Returns the compass bearing (degrees, 0 = north, clockwise) from point A to B.
 * Both points are [lat, lng] arrays.
 */
function getBearing(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function makeArrowIcon(bearing, turnDiff = 0, mapBearing = 0) {
  let svgHtml;
  const displayBearing = (bearing - mapBearing + 360) % 360;

  if (Math.abs(turnDiff) < 5) {
    // straight
    svgHtml = `<div class="route-arrow" style="transform: rotate(${displayBearing}deg); transform-origin: 16px 16px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
        <path d="M16 4 L16 28 M11 10 L16 4 L21 10" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="1"/>
      </svg>
    </div>`;
  } else {
    // Convert angle to radians for math
    const rad = (turnDiff * Math.PI) / 180;

    // Origin/Corner
    const cx = 16, cy = 16;

    // Curve radius
    const R = 5;

    // Incoming line ends at P1 (16, 16 + R)
    const p1y = 16 + R;

    // Outgoing direction vector (0 deg is UP, positive is clockwise)
    const vx = Math.sin(rad);
    const vy = -Math.cos(rad);

    // Curve ends at P2 (distance R along outgoing vector)
    const p2x = cx + R * vx;
    const p2y = cy + R * vy;

    // Outgoing shaft ends at P3 (distance L along outgoing vector)
    const L = 12; // length of outgoing shaft
    const p3x = cx + L * vx;
    const p3y = cy + L * vy;

    // Arrowhead points
    const barbLength = 6.5;
    const barbRad1 = rad + (145 * Math.PI / 180);
    const barbRad2 = rad - (145 * Math.PI / 180);

    const barb1x = p3x + barbLength * Math.sin(barbRad1);
    const barb1y = p3y - Math.cos(barbRad1) * barbLength;

    const barb2x = p3x + barbLength * Math.sin(barbRad2);
    const barb2y = p3y - Math.cos(barbRad2) * barbLength;

    svgHtml = `<div class="route-arrow" style="transform: rotate(${displayBearing}deg); transform-origin: 16px 16px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none">
        <path d="M 16,28 L 16,${p1y} Q 16,16 ${p2x},${p2y} L ${p3x},${p3y}" stroke="white" stroke-width="3" stroke-linecap="round" fill="none" opacity="1"/>
        <path d="M ${barb1x},${barb1y} L ${p3x},${p3y} L ${barb2x},${barb2y}" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="1"/>
      </svg>
    </div>`;
  }

  return L.divIcon({
    className: "route-arrow-icon",
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function getPremiumIcon(category, name, zoomLevel = 17.5) {
  let color = "#10b981"; // Default Emerald Green (non-blue to keep user dot unique)
  let innerHtml = '<circle cx="12" cy="12" r="5" fill="white"/>';

  const catStr = (category || "").toLowerCase();

  if (catStr.includes("food") || catStr.includes("cafe") || catStr.includes("canteen") || catStr.includes("cafe-2")) {
    color = "#f97316"; // Orange
    innerHtml = '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="white"/>';
  } else if (catStr.includes("library")) {
    color = "#8b5cf6"; // Purple
    innerHtml = '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" fill="white"/>';
  } else if (catStr.includes("parking")) {
    color = "#64748b"; // Slate for parking
    innerHtml = '<path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z" fill="white"/>';
  } else if (catStr.includes("medical")) {
    color = "#ef4444"; // Red
    innerHtml = '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" fill="white"/>';
  } else if (catStr.includes("washroom") || catStr.includes("toilet")) {
    color = "#eab308"; // Yellow
    innerHtml = '<circle cx="12" cy="12" r="5" fill="white"/>';
  } else {
    // Default building
    innerHtml = '<path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="white"/>';
  }

  // Calculate icon size based on current zoom level (Default size: 32px at 17.5 zoom)
  let size = 32;
  if (zoomLevel <= 16.5) size = 20;
  else if (zoomLevel >= 19) size = 38;
  else {
    size = 20 + ((zoomLevel - 16.5) / (19 - 16.5)) * (38 - 20);
  }
  const innerSize = Math.max(14, Math.floor(size - 6));
  const svgSize = Math.max(8, Math.floor(innerSize * 0.54));

  return L.divIcon({
    className: "premium-marker",
    html: `
      <div style="background-color: white; height: ${size}px; width: ${size}px; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; border: 1px solid #f3f4f6;">
        <div style="background-color: ${color}; width: ${innerSize}px; height: ${innerSize}px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${svgSize}" height="${svgSize}">${innerHtml}</svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const destinationIcon = L.divIcon({
  className: "destination-dot",
  html: `<div class="destination-pin-wrap">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="26" height="35">
      <path d="M18 2C10.3 2 4 8.2 4 16c0 10.5 14 28.5 14 28.5S32 26.5 32 16C32 8.2 25.7 2 18 2Z" fill="#ef4444" stroke="white" stroke-width="2"/>
      <circle cx="18" cy="16" r="7" fill="white"/>
      <circle cx="18" cy="16" r="3.2" fill="#ef4444"/>
    </svg>
  </div>`,
  iconSize: [26, 35],
  iconAnchor: [13, 35],
  popupAnchor: [0, -35],
});

function makeUserIcon(heading) {
  const hasHeading = heading !== null && !isNaN(heading);
  return L.divIcon({
    className: "user-location-marker",
    html: `
      <div class="user-dot-wrap">
        ${hasHeading ? `
          <div class="user-heading-beam" style="transform: rotate(${heading}deg)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80" style="display: block;">
              <path d="M 50,100 L 15,10 A 40,40 0 0,1 85,10 Z" fill="url(#beamGradient)"/>
              <defs>
                <linearGradient id="beamGradient" x1="0.5" y1="1" x2="0.5" y2="0">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.45"/>
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        ` : ""}
        <div class="relative w-5 h-5 bg-primary border-[3px] border-white rounded-full shadow-[0_2px_10px_rgb(37,99,235,0.5)] z-2 flex items-center justify-center">
          ${hasHeading ? `<div class="user-heading-arrow" style="transform: rotate(${heading}deg)">&#9650;</div>` : ""}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

const indoorUserIcon = makeUserIcon(null); // Indoor uses the same blue pulse now

const indoorDestinationIcon = destinationIcon; // Same destination marker

// ─── Room-label icon ─────────────────────────────────────────────────────────
// Node ID prefixes that are routing/infrastructure nodes — skip labels for these.
const LABEL_SKIP_PREFIXES = [
  "co_", "entrance_",
  "stairsA_", "stairsB_", "stairsC_", "ch_stairs",
  "liftA_", "liftB_", "liftC_", "lift_", "stair",
];

function shouldShowLabel(id, node) {
  const idLower = (id || "").toLowerCase();
  // If the user explicitly set a label in the DB, always show it —
  // overrides skip-prefix rules and the label-equals-id check.
  if (node.label) return true;
  // For nodes without a label, skip corridor / infrastructure nodes
  if (LABEL_SKIP_PREFIXES.some((p) => idLower.startsWith(p.toLowerCase()))) return false;
  // Rooms without a label: show the ID if it looks like a room number (e.g. N301, N401)
  if (/^[A-Z]\d{3,4}$/.test(id)) return true;
  return false;
}

function filterOverlappingLabels(nodes, zoom) {
  const sorted = [...nodes].sort((a, b) => {
    // Prioritize custom/longer labels over generic alphanumeric room numbers
    const aHasCustom = a[1].label && a[1].label !== a[0];
    const bHasCustom = b[1].label && b[1].label !== b[0];
    if (aHasCustom && !bHasCustom) return -1;
    if (!aHasCustom && bHasCustom) return 1;
    return 0;
  });

  // Bypass filtering so ALL labels added by the user remain perfectly visible
  return sorted;
}

function makeRoomLabelIcon(label, zoomLevel, nodeId) {
  // Determine building based on node ID (Chavara usually starts with F)
  const isChavara = nodeId && (nodeId.startsWith("F") || nodeId.includes("chavara"));
  
  // --- CHANGE THESE SIZES AS NEEDED ---
  const chavaraBaseSize = 8.5;
  const stMarysBaseSize = 8.5;
  // ------------------------------------

  // Fixed sizes regardless of zoom level
  const fontSize = isChavara ? chavaraBaseSize : stMarysBaseSize;
  const py = 2;
  const px = 5;
  const iconW = Math.round(fontSize * 14); // Give it a bit more width so it doesn't wrap unnecessarily
  const iconH = Math.round(fontSize * 3);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        white-space: pre-line;
        font-size: ${fontSize}px;
        font-family: 'Inter', 'Segoe UI', sans-serif;
        font-weight: 800;
        color: #000000;
        background: transparent;
        padding: ${py}px ${px}px;
        pointer-events: none;
        max-width: ${iconW}px;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        line-height: 1.1;
      ">${(label || "").replace(/(?:\\r\\n|\\r|\\n|\\\\n)/g, '<br/>')}</div>
    `,
    iconSize: [iconW, iconH],
    iconAnchor: [iconW / 2, iconH / 2],
  });
}

const routeEndpointIcon = L.divIcon({
  className: "route-endpoint-icon",
  html: '<div class="w-4.5 h-4.5 border-4 border-white rounded-full bg-red-500 shadow-[0_1px_5px_rgb(0,0,0,0.35)]" aria-label="Route endpoint"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});


// ─── Arrow markers along a path ───────────────────────────────────────────────
// Helper to calculate simple planar distance in meters for path filtering
function getDistance(a, b) {
  const latScale = 111320;
  const lngScale = latScale * Math.cos(a[0] * Math.PI / 180);
  const dy = (b[0] - a[0]) * latScale;
  const dx = (b[1] - a[1]) * lngScale;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generates arrow DivIcon markers only at turnings along a lat/lng path.
 */
function buildArrowMarkers(path, minDistance = 15) {
  if (!path || path.length < 3) return [];
  const arrows = [];
  const start = path[0];
  const end = path[path.length - 1];

  for (let i = 1; i < path.length - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const next = path[i + 1];

    const bearing1 = getBearing(prev, curr);
    const bearing2 = getBearing(curr, next);

    // Calculate angle difference
    let diff = Math.abs(bearing2 - bearing1);
    if (diff > 180) diff = 360 - diff;

    // Angle change > 25 degrees defines a turning/bend
    if (diff > 25) {
      // Filter out points too close to user start or destination
      if (getDistance(start, curr) > minDistance && getDistance(end, curr) > minDistance) {
        let turnDiff = bearing2 - bearing1;
        if (turnDiff > 180) turnDiff -= 360;
        if (turnDiff < -180) turnDiff += 360;

        arrows.push({
          position: curr,
          bearing: bearing1, // Align with the incoming path segment
          turnDiff: turnDiff,
          key: `arr-turn-${i}`,
        });
      }
    }
  }

  // If there are no turnings but the path is long, show one arrow in the middle
  if (arrows.length === 0 && path.length >= 2) {
    const midIdx = Math.floor(path.length / 2);
    const a = path[midIdx - 1];
    const b = path[midIdx];
    const midPoint = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (getDistance(start, midPoint) > minDistance && getDistance(end, midPoint) > minDistance) {
      arrows.push({
        position: midPoint,
        bearing: getBearing(a, b),
        turnDiff: 0,
        key: `arr-mid`,
      });
    }
  }

  return arrows;
}

const getBuildingLocationId = (name) => {
  const clean = name.replace(/\n/g, ' ').toLowerCase();
  if (clean.includes("chavara")) return "chavara";
  if (clean.includes("st mary's") || clean.includes("st marys")) return "st-marys-block";
  if (clean.includes("canteen")) return "canteen";
  if (clean.includes("open auditorium")) return "auditorium";
  if (clean.includes("christ cafe")) return "cafe1";
  if (clean.includes("cafe")) return "cafe";
  if (clean.includes("st joseph")) return "joseph";
  if (clean.includes("amphitheatre")) return "amphi";
  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────
function CampusMap({
  selectedLocation,
  currentLocation,
  heading = null,
  subscribeToLocation,
  route = [],
  indoorRouteNodes = [],
  currentFloor,
  mapMode,
  destination,
  mapCenter,
  indoorUserLocation,
  setIndoorUserLocation,
  setIndoorStart,
  isOutdoorNavigating = false,
  isIndoorNavigating = false,
  indoorRouteIndex = 0,
  onNextIndoorStep,
  useDebugLocation = false,
  activeFloorImages,
  activeIndoorNodes,
  onMyLocationClick,
  onSelectLocation,
  hasBottomCard = false,
  sheetOpen = false,
  onEnterBuilding = null,
}) {
  const { locations: LOCATIONS } = useDatabase();
  const [mapBearing, setMapBearing] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(OUTDOOR_ZOOM.default);

  // Compute visible indoor route segments filtered to contiguous chunks on current floor
  const visibleIndoorSegments = [];
  let currentSegment = [];
  const remainingNodes = indoorRouteNodes.slice(indoorRouteIndex);
  
  for (const id of remainingNodes) {
    if (activeIndoorNodes[id]?.floor === currentFloor) {
      currentSegment.push(activeIndoorNodes[id].position);
    } else {
      if (currentSegment.length > 0) {
        visibleIndoorSegments.push(currentSegment);
        currentSegment = [];
      }
    }
  }
  if (currentSegment.length > 0) {
    visibleIndoorSegments.push(currentSegment);
  }

  // Flatten for bounds calculation and other uses that just need points
  const visibleIndoorRoute = visibleIndoorSegments.flat();

  const visibleOutdoorMarkers = LOCATIONS.filter((loc) =>
    INITIAL_OUTDOOR_MARKER_IDS.includes(loc.id)
  );

  // Destination marker: show a pin at the fixed route endpoint (last node
  // of the *full* planned route) so it stays in place while the trimmed
  // route shrinks behind the user. When there is no route (e.g. user is
  // outside campus), fall back to the destination's own position so the
  // red pin still appears at the selected location.
  const routeDestinationPos =
    route.length > 0
      ? route[route.length - 1]
      : destination?.position ||
        (destination?.id && LOCATIONS.find((l) => l.id === destination.id)?.position) ||
        (destination?.routeNode && LOCATIONS.find((l) => l.id === destination.routeNode)?.position) ||
        (selectedLocation?.position) ||
        (selectedLocation?.id && LOCATIONS.find((l) => l.id === selectedLocation.id)?.position) ||
        null;
  const destinationMarkerName =
    (selectedLocation && LOCATIONS.find((loc) => loc.id === selectedLocation?.id)?.name) ||
    destination?.name ||
    selectedLocation?.name ||
    null;

  // Build arrow markers for each segment
  const indoorArrows = visibleIndoorSegments.flatMap(segment => buildArrowMarkers(segment, 2));

  // "You are here" toast completely disabled per user request

  return (
    <MapContainer
      key={mapMode === "INDOOR" ? "indoor-map" : "outdoor-map"}
      center={[10.354098, 76.212307]}
      zoom={OUTDOOR_ZOOM.default}
      maxBounds={
        mapMode === "OUTDOOR"
          ? (route.length < 2 ? CAMPUS_BOUNDS : null)
          : activeFloorImages[currentFloor]?.bounds
            ? L.latLngBounds(activeFloorImages[currentFloor].bounds).pad(0.5)
            : null
      }
      maxBoundsViscosity={1.0}
      minZoom={OUTDOOR_ZOOM.min}
      maxZoom={OUTDOOR_ZOOM.max}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom
      doubleClickZoom
      touchZoom
      pinchZoom
      zoomSnap={0}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={60}
      rotate={mapMode === "INDOOR"}
      rotateControl={false}
      boxZoom={false}
      bounceAtZoomLimits={false}
      className={`campus-map ${mapMode === "INDOOR" ? "campus-map--indoor" : ""}`}
    >
      {/* Attribution */}
      <div
        style={{
          position: "absolute",
          bottom: "5px",
          right: "5px",
          backgroundColor: "rgba(255,255,255,0.7)",
          padding: "2px 5px",
          fontSize: "11px",
          fontFamily: "sans-serif",
          zIndex: 1000,
          borderRadius: "3px",
        }}
      >
        &copy; OpenStreetMap contributors &copy; CARTO
      </div>

      {/* ── Indoor Zoom Control (Bottom Left) ── */}
      {mapMode === "INDOOR" && (
        <ZoomControl position="bottomleft" />
      )}

      {/* Map zoom + rotation manager */}
      <MapZoomManager
        mapMode={mapMode}
        currentFloor={currentFloor}
        route={route}
        visibleIndoorRoute={visibleIndoorRoute}
        indoorUserLocation={indoorUserLocation}
        activeFloorImages={activeFloorImages}
        activeIndoorNodes={activeIndoorNodes}
      />
      <MapEventBridge mapMode={mapMode} />
      <MapRotationListener onChange={setMapBearing} />
      <MapZoomListener onChange={setZoomLevel} />
      {/* GPS auto-center on first fix; smooth pan during active navigation */}
      <LocationManager
        subscribeToLocation={subscribeToLocation}
        isOutdoorNavigating={isOutdoorNavigating}
        useDebugLocation={useDebugLocation}
        currentLocation={currentLocation}
        mapMode={mapMode}
      />

      {/* ── OUTDOOR MODE ───────────────────────────────────────────────── */}
      {mapMode === "OUTDOOR" && (
        <>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            url={`https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png?key=${import.meta.env.VITE_CARTO_API_KEY || 'cb1_2k3m_1_096928bf1a4c35a96e157888'}`}
            maxNativeZoom={OUTDOOR_ZOOM.maxNative}
            maxZoom={OUTDOOR_ZOOM.max}
            keepBuffer={4}
            updateWhenZooming={false}
            updateWhenIdle
          />

          {/* Green lawn zones */}
          {GREEN_AREAS.map((area) => (
            <Polygon
              key={area.id}
              positions={area.positions}
              color="#2e7d32"
              weight={1}
              opacity={0.35}
              fillColor="#a5d6a7"
              fillOpacity={0.42}
            />
          ))}

          {/* Parking areas */}
          {PARKING_AREAS.map((p) => (
            <Polygon
              key={p.id}
              positions={p.positions}
              color="#78909c"
              weight={1}
              opacity={0.5}
              fillColor="#78909c"
              fillOpacity={0.5}
            />
          ))}

          <LiveOutdoorFeatures
            subscribeToLocation={subscribeToLocation}
            currentLocation={currentLocation}
            initialHeading={heading}
            route={route}
            mapBearing={mapBearing}
          />

          {/* Outdoor location dots */}
          {visibleOutdoorMarkers.map((location) => (
            <LocationMarker
              key={location.id}
              location={location}
              selectedLocation={selectedLocation}
              icon={getPremiumIcon(location.type || location.category || location.id, location.name || location.title, zoomLevel)}
              onSelect={onSelectLocation}
            />
          ))}

          {/* Destination marker: fixed pin at route endpoint */}
          {routeDestinationPos && (
            <Marker
              key={`dest-pin-${routeDestinationPos}`}
              position={routeDestinationPos}
              icon={destinationIcon}
              zIndexOffset={900}
            >
              {destinationMarkerName && (
                <Popup><strong>{destinationMarkerName}</strong></Popup>
              )}
            </Marker>
          )}
        </>
      )}

      {/* Building labels — always visible */}
      {BUILDINGS.map((building, index) => {
        // Fixed font size as per user request (no dynamic scaling on zoom)
        const fontSize = 12;

        const locId = getBuildingLocationId(building.name);
        const correspondingLoc = locId ? LOCATIONS.find(l => l.id === locId) : null;

        return (
          <Marker
            key={index}
            position={building.position}
            icon={L.divIcon({
              className: `building-label ${correspondingLoc ? 'cursor-pointer' : ''}`,
              html: `<div style="font-size: ${fontSize}px; font-weight: 700; color: #1e293b; background: transparent; text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 2px 4px rgba(0,0,0,0.3); padding: 3px 8px; text-align: center;">${building.name.replace(/\n/g, '<br/>')}</div>`,
              iconSize: [120, 42],
              iconAnchor: [60, 21],
            })}
            eventHandlers={{
              click: () => {
                if (correspondingLoc && onSelectLocation) {
                  onSelectLocation(correspondingLoc);
                }
              }
            }}
          />
        );
      })}

      {/* ── INDOOR MODE ────────────────────────────────────────────────── */}
      {mapMode === "INDOOR" && activeFloorImages[currentFloor] && (
        <>
          <ImageOverlay
            key={currentFloor}
            className="floor-image-overlay-transition"
            url={activeFloorImages[currentFloor].url}
            bounds={activeFloorImages[currentFloor].bounds}
            opacity={1}
            interactive
            eventHandlers={{
              click: ({ latlng }) => {
                console.log(
                  `[${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}]`
                );
              },
            }}
          />

          {/* Room name labels — rotate with the floor plan image */}
          {filterOverlappingLabels(
            Object.entries(activeIndoorNodes).filter(([id, node]) =>
              (node.floor === currentFloor || node.floor === "ALL") &&
              shouldShowLabel(id, node)
            ),
            zoomLevel
          ).map(([id, node]) => (
            <Marker
              key={`label-${id}`}
              position={node.labelPosition || node.position}
              icon={makeRoomLabelIcon(node.label || id, zoomLevel, id)}
              interactive={false}
              zIndexOffset={50}
            />
          ))}

          {/* Debug node markers */}
          {(SHOW_INDOOR_DEBUG_MARKERS || SHOW_INDOOR_DEBUG_TOOLS) &&
            Object.entries(activeIndoorNodes)
              .filter(
                ([, node]) =>
                  node.floor === currentFloor || node.floor === "ALL"
              )
              .map(([id, node]) => (
                <Marker key={id} position={node.position} opacity={0.85}>
                  <Popup>
                    <strong>{node.label || id}</strong>
                    <br />
                    {node.position[0]}, {node.position[1]}
                  </Popup>
                </Marker>
              ))}

          {/* Indoor route polyline + arrows */}
          {visibleIndoorSegments.length > 0 && (
            <>
              {visibleIndoorSegments.map((segment, idx) => (
                <Fragment key={idx}>
                  {/* Outer Glow / shadow */}
                  <Polyline
                    positions={segment}
                    color="#0F1D45"
                    weight={8}
                    opacity={0.3}
                    lineCap="round"
                    lineJoin="round"
                  />
                  {/* Main vibrant blue route */}
                  <Polyline
                    positions={segment}
                    color="#3B82F6"
                    weight={6}
                    opacity={1}
                    lineCap="round"
                    lineJoin="round"
                  />
                </Fragment>
              ))}
              
              {/* Directional arrows */}
              {indoorArrows.map((a) => (
                <Marker
                  key={a.key}
                  position={a.position}
                  icon={makeArrowIcon(a.bearing, a.turnDiff, mapBearing)}
                  interactive={false}
                />
              ))}
              {/* Show endpoint red dot at the end of the path on the current floor */}
              {visibleIndoorRoute.length > 0 && (
                <Marker position={visibleIndoorRoute[visibleIndoorRoute.length - 1]} icon={routeEndpointIcon} interactive={false} zIndexOffset={800} />
              )}
            </>
          )}

          {/* Indoor user marker */}
          <LiveIndoorUserMarker
            indoorUserLocation={indoorUserLocation}
            currentFloor={currentFloor}
            subscribeToLocation={subscribeToLocation}
            initialHeading={heading}
            activeIndoorNodes={activeIndoorNodes}
            setIndoorUserLocation={setIndoorUserLocation}
            setIndoorStart={setIndoorStart}
          />

          {/* Indoor destination marker */}
          {(() => {
            if (!destination) return null;
            const targetNodeId = destination.indoorNode || destination.id || destination.routeNode;
            const destFloorNorm = normalizeFloor(destination.floor);
            const isMatchingFloor =
              String(destination.floor).toUpperCase() === String(currentFloor).toUpperCase() ||
              String(destFloorNorm).toUpperCase() === String(currentFloor).toUpperCase();
            const targetNode = activeIndoorNodes[targetNodeId] || activeIndoorNodes[destination.id];

            if (isMatchingFloor && targetNode?.position) {
              return (
                <Marker
                  key={`indoor-dest-${targetNodeId}-${currentFloor}`}
                  position={targetNode.position}
                  icon={indoorDestinationIcon}
                  zIndexOffset={900}
                >
                  <Popup>
                    <strong>{destination.name}</strong>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })()}
        </>
      )}

      {/* Floating Map Controls overlay */}
      <CustomMapControls
        mapMode={mapMode}
        currentLocation={currentLocation}
        onMyLocationClick={onMyLocationClick}
        hasBottomCard={hasBottomCard}
        sheetOpen={sheetOpen}
        onEnterBuilding={onEnterBuilding}
      />

      {/* Fly-to helpers */}
      <FlyToLocation location={mapCenter} mapMode={mapMode} activeFloorImages={activeFloorImages} />
    </MapContainer>
  );
}

// Finds the closest point on the planned polyline and drops the already passed
// segments. Equirectangular coordinates are accurate at campus scale.
function trimRouteFromLocation(route, location) {
  if (!location || route.length < 2) return route;
  
  const { point, distanceMeters, segmentIndex } = getDistanceToRoute(route, location);

  // Do not distort the route if the user is far away from it (for example a
  // poor GPS reading or an intentional detour).
  if (distanceMeters > 8) return route;
  
  return [point, ...route.slice(segmentIndex + 1)];
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function FlyToLocation({ location, mapMode, activeFloorImages }) {
  const map = useMap();
  useEffect(() => {
    if (!location?.position) return;
    const id = requestAnimationFrame(() => {
      if (mapMode === "OUTDOOR") {
        // Never zoom out when the user asks for their location.  This makes the
        // control behave like a native map "my location" FAB.
        map.flyTo(location.position, Math.max(map.getZoom(), OUTDOOR_ZOOM.default), { duration: 0.8 });
      } else {
        // Indoor smooth focus zoom
        const isChav = activeFloorImages === CHAVARA_FLOOR_IMAGES;
        const zoomCfg = getIndoorZoomConfig(isChav ? "chavara" : "stmarys");
        map.flyTo(location.position, Math.max(map.getZoom(), zoomCfg.overview + 0.75), { duration: 0.8 });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [location?.id, location?.position, map, mapMode, activeFloorImages]);
  return null;
}

function MapZoomManager({
  mapMode,
  currentFloor,
  route,
  visibleIndoorRoute = [],
  indoorUserLocation,
  activeFloorImages,
  activeIndoorNodes,
}) {
  const map = useMap();
  const prevModeRef = useRef(mapMode);
  const prevFloorRef = useRef(currentFloor);
  const prevImagesRef = useRef(activeFloorImages);
  const lastModeRef = useRef(mapMode);

  const isChav = activeFloorImages === CHAVARA_FLOOR_IMAGES;
  const zoomCfg = getIndoorZoomConfig(isChav ? "chavara" : "stmarys");

  // Update zoom/bounds when mode or floor changes
  useEffect(() => {
    const wasIndoor = lastModeRef.current === "INDOOR";
    lastModeRef.current = mapMode;

    if (mapMode === "OUTDOOR") {
      map.setMinZoom(OUTDOOR_ZOOM.min);
      map.setMaxZoom(OUTDOOR_ZOOM.max);
      if (map.dragging) map.dragging.enable();
      
      // Clear maxBounds during routing to allow map movement and avoid layer shifting
      if (route.length < 2) {
        map.setMaxBounds(CAMPUS_BOUNDS);
      } else {
        map.setMaxBounds(null);
      }

      // Smooth zoom back to campus overview when resetting/exiting indoor mode
      if (wasIndoor && route.length < 2) {
        if (map.setBearing) {
          map.setBearing(0, { animate: true, duration: 0.8 });
        }
        map.flyTo([10.3575, 76.2127], OUTDOOR_ZOOM.default, {
          animate: true,
          duration: 1.0,
        });
      }
    } else {
      map.setMinZoom(zoomCfg.min);
      map.setMaxZoom(zoomCfg.max);
      if (map.dragging) map.dragging.enable();
      if (activeFloorImages[currentFloor]) {
        // Enforce solid boundary constraints around the indoor floor plan
        map.setMaxBounds(activeFloorImages[currentFloor].bounds);
      } else {
        map.setMaxBounds(null);
      }
    }
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, mapMode, currentFloor, activeFloorImages, route, zoomCfg]);

  // When entering indoor mode, changing floor, or switching buildings: fit the full floor image
  useEffect(() => {
    const modeChanged = prevModeRef.current !== mapMode;
    const floorChanged = prevFloorRef.current !== currentFloor;
    const imagesChanged = prevImagesRef.current !== activeFloorImages;
    prevModeRef.current = mapMode;
    prevFloorRef.current = currentFloor;
    prevImagesRef.current = activeFloorImages;

    if (mapMode !== "INDOOR") return;
    if (!activeFloorImages[currentFloor]) return;

    if (modeChanged || imagesChanged || floorChanged) {
      requestAnimationFrame(() => {
        map.fitBounds(activeFloorImages[currentFloor].bounds, {
          padding: [8, 24], // 8px horizontal padding fits mobile screens tightly; 24px vertical padding centers it
          maxZoom: zoomCfg.overview + 0.5,
          animate: true,
          duration: 1.0,
        });
      });
    }
  }, [map, mapMode, currentFloor, activeFloorImages, zoomCfg]);

  // Fit outdoor route bounds
  useEffect(() => {
    if (mapMode !== "OUTDOOR" || route.length < 2) return;
    map.fitBounds(route, {
      paddingTopLeft: [32, 96],
      paddingBottomRight: [32, 160],
      maxZoom: 20,
      animate: true,
      duration: 1.2,
    });
  }, [map, mapMode, route]);

  // Helper to calculate the bounding box center of all nodes on a floor
  const getFloorNodesCenter = (floor) => {
    const floorNodes = Object.values(activeIndoorNodes).filter(
      (n) => n.floor === floor
    );
    if (floorNodes.length === 0) return [10.35789, 76.21293]; // fallback to ST_MARYS_BOUNDS center

    const lats = floorNodes.map((n) => n.position[0]);
    const lngs = floorNodes.map((n) => n.position[1]);

    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  };

  // Indoor rotation — place the user at the BOTTOM of the screen.
  //
  // Rules (based on which side of the floor the user is on):
  //   User at BOTTOM (south)  → no rotation       (setBearing  0°)
  //   User at LEFT   (west)   → rotate 90° right   (setBearing 90°, east at top)
  //   User at TOP    (north)  → rotate 180°         (setBearing 180°)
  //   User at RIGHT  (east)   → rotate 90° left     (setBearing 270°, west at top)
  //
  // We determine the side by computing the bearing from the center of the node grid
  // to the user and splitting into four equal 90° sectors.
  useEffect(() => {
    if (!map.setBearing) return;

    if (mapMode === "INDOOR") {
      const userPos = indoorUserLocation?.position || (visibleIndoorRoute.length > 0 ? visibleIndoorRoute[0] : null);

      if (!userPos) {
        map.setBearing(0, { animate: false });
        return;
      }

      if (visibleIndoorRoute.length >= 2) {
        // Path-based rotation: put the direction of the next node EXACTLY at the TOP of the screen (Track-Up mode)
        const nextNode = visibleIndoorRoute[1];
        const pathBearing = getBearing(userPos, nextNode);
        const exactBearing = (360 - pathBearing) % 360;

        // Smooth rotation
        map.setBearing(exactBearing, { animate: true, duration: 1.5 });
      } else {
        map.setBearing(0, { animate: true });
      }
    } else {
      // Outdoor — reset to north-up
      map.setBearing(0, { animate: false });
    }
  }, [map, mapMode, visibleIndoorRoute, indoorUserLocation]);

  return null;
}

/** Keeps Leaflet's canvas sized correctly after a mode/overlay transition. */
function MapEventBridge({ mapMode }) {
  const map = useMap();
  useMapEvents({
    load() {
      map.invalidateSize();
    },
  });
  useEffect(() => {
    requestAnimationFrame(() => map.invalidateSize());
  }, [map, mapMode]);
  return null;
}

/** Listens to Leaflet rotation events to update state. */
function MapRotationListener({ onChange }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const handleRotate = () => {
      onChange(map.getBearing() || 0);
    };
    map.on("rotate", handleRotate);
    // Initial fetch
    onChange(map.getBearing() || 0);
    return () => {
      map.off("rotate", handleRotate);
    };
  }, [map, onChange]);
  return null;
}

/** Listens to map zoom events and reports zoom level back. */
function MapZoomListener({ onChange }) {
  const map = useMap();
  useMapEvents({
    zoomend: () => {
      onChange(map.getZoom());
    }
  });
  useEffect(() => {
    onChange(map.getZoom());
  }, [map, onChange]);
  return null;
}

function LocationMarker({ location, selectedLocation, icon, onSelect }) {
  const markerRef = useRef(null);
  useEffect(() => {
    if (selectedLocation?.id === location.id) {
      markerRef.current?.openPopup();
    }
  }, [selectedLocation, location.id]);
  return (
    <Marker 
      ref={markerRef} 
      position={location.position} 
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onSelect) onSelect(location);
        }
      }}
    >
      <Popup>
        <div 
          onClick={() => {
            if (onSelect) onSelect(location);
          }}
          style={{ cursor: "pointer", fontWeight: "bold", color: "#2563eb" }}
        >
          {location.name}
        </div>
      </Popup>
    </Marker>
  );
}

/**
 * LocationManager — lives inside MapContainer so it has access to the Leaflet
 * map instance via useMap().
 *
 * Behaviour:
 *  1. On the very first GPS fix, fly the outdoor map to the user's position
 *     so the blue dot is immediately visible (even at the default campus zoom).
 *  2. While isOutdoorNavigating is true:
 *     - Rotates the map to face the direction of travel (bearing-up mode)
 *     - Offsets the camera 15m ahead of the user so the path ahead is visible
 *     - Uses smooth flyTo instead of panTo for a Google Maps-like feel
 *  3. When not navigating, map stays north-up and doesn't auto-follow.
 */
function LocationManager({ subscribeToLocation, isOutdoorNavigating, useDebugLocation, currentLocation, mapMode }) {
  const map = useMap();
  const initializedRef = useRef(false);
  const isNavigatingRef = useRef(isOutdoorNavigating);
  const mapModeRef = useRef(mapMode);

  // Keep refs current on every render without re-subscribing
  useEffect(() => {
    isNavigatingRef.current = isOutdoorNavigating;
    if (!isOutdoorNavigating) {
      // Restore north-up orientation when navigation ends
      if (map.setBearing) {
        map.setBearing(0, { animate: true, duration: 0.6 });
      }
    } else if (currentLocation && mapModeRef.current === "OUTDOOR") {
      // Just started navigating! Fly to user immediately
      map.flyTo(
        [currentLocation.lat, currentLocation.lng],
        Math.max(map.getZoom(), OUTDOOR_ZOOM.default),
        { duration: 1.0 }
      );
    }
  }, [isOutdoorNavigating, map]); // Removed currentLocation to prevent re-firing on every location update, only on mode toggle

  useEffect(() => { mapModeRef.current = mapMode; }, [mapMode]);

  // For debug mode, auto-center once on the fixed location
  useEffect(() => {
    if (!useDebugLocation || !currentLocation || initializedRef.current) return;
    if (mapModeRef.current !== "OUTDOOR") return;
    initializedRef.current = true;
    requestAnimationFrame(() => {
      map.flyTo(
        [currentLocation.lat, currentLocation.lng],
        Math.max(map.getZoom(), OUTDOOR_ZOOM.default),
        { duration: 1.0 }
      );
    });
  }, [map, useDebugLocation, currentLocation]);

  // For live GPS, auto-center on first fix and pan during navigation
  useEffect(() => {
    if (!subscribeToLocation || useDebugLocation) return undefined;
    const unsubscribe = subscribeToLocation((position, meta) => {
      if (mapModeRef.current !== "OUTDOOR") return;

      if (!initializedRef.current) {
        // First ever fix — fly to user so the blue dot is visible immediately
        initializedRef.current = true;
        map.flyTo(
          [position.lat, position.lng],
          Math.max(map.getZoom(), OUTDOOR_ZOOM.default),
          { duration: 1.2 }
        );
        return;
      }

      if (!isNavigatingRef.current) return;

      // As requested: movement of user do not effect the map components other than path.
      // Automatic map panning and rotation are disabled here so that the map
      // doesn't jump around or fight manual user panning during navigation.

    });
    return () => unsubscribe();
  }, [subscribeToLocation, mapMode, map, useDebugLocation]);

  return null;
}

function LiveIndoorUserMarker({ indoorUserLocation, currentFloor, subscribeToLocation, initialHeading, activeIndoorNodes, setIndoorUserLocation, setIndoorStart }) {
  const [liveHeading, setLiveHeading] = useState(initialHeading || 0);

  useEffect(() => {
    if (!subscribeToLocation) return undefined;
    return subscribeToLocation((position, metadata) => {
      if (metadata?.heading !== null && !Number.isNaN(metadata?.heading)) {
        setLiveHeading(metadata.heading);
      }
    });
  }, [subscribeToLocation]);

  if (!indoorUserLocation || indoorUserLocation.floor !== currentFloor) return null;

  return (
    <Marker
      position={indoorUserLocation.position}
      icon={makeUserIcon(liveHeading)}
      draggable={false}
      zIndexOffset={1000}
      eventHandlers={{
        dragend: (e) => {
          const latlng = e.target.getLatLng();
          const position = [latlng.lat, latlng.lng];
          const nearestNode = findNearestIndoorNode(
            position,
            currentFloor
          );
          setIndoorUserLocation({ position, nearestNode });
          setIndoorStart({
            name: activeIndoorNodes[nearestNode]?.label || nearestNode,
            nearestNode,
          });
        },
      }}
    >
      <Popup>You are here</Popup>
    </Marker>
  );
}

function LiveOutdoorFeatures({ subscribeToLocation, currentLocation, initialHeading, route, mapBearing }) {
  const [liveLocation, setLiveLocation] = useState(currentLocation);
  const [liveHeading, setLiveHeading] = useState(initialHeading || 0);

  useEffect(() => {
    if (!subscribeToLocation) return undefined;
    return subscribeToLocation((position, metadata) => {
      setLiveLocation(position);
      if (metadata?.heading !== null && !Number.isNaN(metadata?.heading)) {
        setLiveHeading(metadata.heading);
      }
    });
  }, [subscribeToLocation]);

  const visibleOutdoorRoute = useMemo(
    () => trimRouteFromLocation(route, liveLocation),
    [route, liveLocation]
  );
  
  const markerPos = useMemo(() => {
    if (!liveLocation) return null;
    if (route && route.length >= 2) {
      const { point, distanceMeters } = getDistanceToRoute(route, liveLocation);
      if (distanceMeters <= 8) {
        return point;
      }
    }
    return [liveLocation.lat, liveLocation.lng];
  }, [liveLocation, route]);
  
  const outdoorArrows = buildArrowMarkers(visibleOutdoorRoute, 15);
  const outdoorUserIconDynamic = makeUserIcon(liveHeading);

  return (
    <>
      {visibleOutdoorRoute.length > 0 && (
        <>
          <Polyline positions={visibleOutdoorRoute} color="#1E3A8A" weight={17} opacity={0.15} lineCap="round" lineJoin="round" />
          <Polyline positions={visibleOutdoorRoute} color="#1E3A8A" weight={14} opacity={0.3} lineCap="round" lineJoin="round" />
          <Polyline positions={visibleOutdoorRoute} color="#3B82F6" weight={10} opacity={1} lineCap="round" lineJoin="round" />
          <Polyline positions={visibleOutdoorRoute} color="#93C5FD" weight={3.5} opacity={0.9} lineCap="round" lineJoin="round" />
          {outdoorArrows.map((a) => (
            <Marker key={a.key} position={a.position} icon={makeArrowIcon(a.bearing, a.turnDiff, mapBearing)} interactive={false} />
          ))}
          <Marker position={visibleOutdoorRoute[visibleOutdoorRoute.length - 1]} icon={routeEndpointIcon} interactive={false} zIndexOffset={800} />
        </>
      )}

      {markerPos && (
        <Marker position={markerPos} icon={outdoorUserIconDynamic} zIndexOffset={1000}>
        </Marker>
      )}
    </>
  );
}

export default CampusMap;

// ─── Floating Map Controls ──────────────────────────────────────────────────
import { Building } from "lucide-react"; // Make sure Building is imported

function CustomMapControls({ mapMode, currentLocation, onMyLocationClick, hasBottomCard, sheetOpen, onEnterBuilding }) {
  const map = useMap();

  if (mapMode === "INDOOR") return null;

  // Compute base bottom offset in pixels (40px clears the copyright text at bottom: 5px)
  const baseBottom = sheetOpen ? 340 : (hasBottomCard ? 195 : 40);

  return (
    <div 
      className="absolute right-4 z-1400 pointer-events-none transition-all duration-300 flex flex-col items-center gap-4"
      style={{ bottom: `${baseBottom}px` }}
    >
      {/* My Location and Zoom grouped together */}
      <div className="flex flex-col gap-4">
        <button
          onClick={(e) => {
            e.preventDefault();
            const doRecenter = () => {
              map.flyTo([currentLocation.lat, currentLocation.lng], Math.max(map.getZoom(), OUTDOOR_ZOOM.default), { duration: 0.8 });
              if (map.setBearing) {
                map.setBearing(0, { animate: true, duration: 0.8 });
              }
            };

            if (onMyLocationClick) {
              const hasLocation = onMyLocationClick();
              if (hasLocation && currentLocation) {
                doRecenter();
              }
            } else if (currentLocation) {
              doRecenter();
            }
          }}
          className="pointer-events-auto bg-white/95 backdrop-blur-md w-11 h-11 rounded-full shadow-[0_4px_16px_rgb(0,0,0,0.1)] border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-700"
          title="My Location"
        >
          <div className="w-4.5 h-4.5 rounded-full border-2 border-gray-700 relative flex items-center justify-center"><div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div></div>
        </button>

        <div className="pointer-events-auto flex flex-col bg-white/95 backdrop-blur-md rounded-[20px] shadow-[0_4px_16px_rgb(0,0,0,0.1)] border border-gray-100 overflow-hidden">
          <button
            onClick={(e) => { e.preventDefault(); map.zoomIn(); }}
            className="w-11 h-10.5 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-700 border-b border-gray-100 text-[22px] font-light"
          >+</button>
          <button
            onClick={(e) => { e.preventDefault(); map.zoomOut(); }}
            className="w-11 h-10.5 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-700 text-[26px] font-light pb-1"
          >−</button>
        </div>
      </div>

      {/* Indoor Button at the bottom */}
      {onEnterBuilding && (
        <button
          id="outdoor-enter-btn"
          aria-label="Enter nearest building"
          title="Enter nearest building"
          onClick={onEnterBuilding}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            cursor: "pointer",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            transition: "transform 0.15s, box-shadow 0.15s",
            pointerEvents: "auto",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.08)";
            e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.08)";
          }}
        >
          <Building size={20} color="#059669" strokeWidth={2.2} />
          <span style={{ fontSize: 9, fontWeight: 700, color: "#059669", letterSpacing: 0.2 }}>
            Indoor
          </span>
        </button>
      )}
    </div>
  );
}
