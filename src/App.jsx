import { useState, useEffect, useRef, useMemo, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Home, Building } from "lucide-react";

const CampusMap = lazy(() => import("./components/map/CampusMap"));


import SearchBar from "./components/common/SearchBar";

import { findPath } from "./utils/findPath";
import { openGoogleMapsNavigation } from "./utils/openGoogleMaps";

import { useDatabase } from "./context/DatabaseContext";

import "./App.css";
import "./kiosk.css";

import { LandingScreen } from "./components/kiosk/LandingScreen";
import { InstructionDashboard } from "./components/kiosk/InstructionDashboard";
import { ClassroomsScreen } from "./components/kiosk/ClassroomsScreen";
import { FacultyScreen } from "./components/kiosk/FacultyScreen";
import { QrModal } from "./components/kiosk/QrModal";
import { InactivityModal } from "./components/kiosk/InactivityModal";
import { audioService } from "./utils/kiosk/audio";

import FloorSelector from "./components/map/FloorSelector";

import useCurrentLocation from "./hooks/useCurrentLocation";

import SearchChips from "./components/common/SearchChips";

import BottomSheet from "./components/common/BottomSheet";

import { isInsideCampus } from "./utils/isInsideCampus";

import { CAMPUS_ENTRANCE } from "./data/campus";

import { findNearestNode } from "./utils/findNearestNode";

import IndoorRoutingCard from "./components/routing/IndoorRoutingCard";

import { findNearestLocation } from "./utils/findNearestLocation";
import { findNearestQRLocation } from "./utils/findNearestQRLocation";
import { findNearestStMarysEntrance, findNearestBuildingEntrance, findNearestChavaraEntrance, findBestChavaraEntranceByPath } from "./utils/findNearestEntrance";
import { calculateHaversineDistance } from "./utils/haversine";
import { getDistanceToRoute } from "./utils/distanceToRoute";
import { FLOOR_IMAGES, CHAVARA_FLOOR_IMAGES } from "./data/floorImages";

import LoadingScreen from "./components/common/LoadingScreen";
import YDCard from "./components/common/YDCard";
import { getBuildingDisplayName } from "./utils/buildingPolygons";
import LocationAlertCard from "./components/common/LocationAlertCard";
import { SignalLow } from "lucide-react";
import { routeIndoor, routeOutdoor, geofence } from "./utils/edgeFunctions";
import OutsideCampusModal from "./components/common/OutsideCampusModal";
import DestinationInfoCard from "./components/common/DestinationInfoCard";

// ── Floor label formatter ──────────────────────────────────────────────────────
// Converts raw floor keys ("G", "1", "2", "3", "B1", "B2") to readable labels.
function formatFloor(floor) {
  if (!floor) return "Ground Floor";
  const f = String(floor).toUpperCase().trim();
  if (f === "G" || f === "0" || f === "GROUND") return "Ground Floor";
  if (f === "B1" || f === "BASEMENT1" || f === "BASEMENT 1") return "Basement 1";
  if (f === "B2" || f === "BASEMENT2" || f === "BASEMENT 2") return "Basement 2";
  const n = parseInt(f, 10);
  if (!isNaN(n)) {
    const suffix = n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th";
    return `${n}${suffix} Floor`;
  }
  return `${f} Floor`;
}

// Development / Debug toggles
const SHOW_SIMULATE_QR = false;

const STEPS = {

  IDLE: "IDLE",

  OUTDOOR_ROUTE: "OUTDOOR_ROUTE",

  OUTDOOR_NAVIGATING: "OUTDOOR_NAVIGATING",

  OUTDOOR_ARRIVED: "OUTDOOR_ARRIVED",

  GO_TO_ENTRANCE: "GO_TO_ENTRANCE",

  AT_BUILDING: "AT_BUILDING",

  FLOOR_CHOICE: "FLOOR_CHOICE",

  FLOOR_NAVIGATION: "FLOOR_NAVIGATION",

  COMPLETED: "COMPLETED",

  GO_TO_FLOOR: "GO_TO_FLOOR",

  REACHED_EXIT: "REACHED_EXIT",

  ASK_INSIDE_BUILDING: "ASK_INSIDE_BUILDING",

  SELECT_CURRENT_FLOOR: "SELECT_CURRENT_FLOOR",

  PICK_INDOOR_LOCATION: "PICK_INDOOR_LOCATION",

  INDOOR_SEARCH: "INDOOR_SEARCH",

  INDOOR_READY: "INDOOR_READY",

  OUTDOOR_REACHED: "OUTDOOR_REACHED",

};

const floorEntryMap = {

  B2: "b2",

  B1: "b1",

  G: "g",

  1: "g",

  2: "g",

};

const getOutdoorExitNode = (indoorExitNode) => {
  if (indoorExitNode === "entrance_G2") return "p3";
  if (indoorExitNode === "entrance_G1") return "chavara";
  if (indoorExitNode === "entrance_G") return "g";
  if (indoorExitNode === "entrance_B1") return "b1";
  if (indoorExitNode === "entrance_B2") return "b2";
  return null;
};

const indoorEntranceByFloor = {

  B2: "entrance_B2",

  B1: "entrance_B1",

  G: "entrance_G",

};

const outdoorEntranceFloor = {
  b2: "B2",
  b1: "B1",
  g: "G",
  chavara: "G",
  p3: "G",
};

function normalizeFloor(floor) {
  if (!floor) return "G";
  const fStr = floor.toString().toUpperCase().trim();
  if (fStr.startsWith("B")) return fStr; // Keep "B1", "B2" intact
  if (fStr.startsWith("G")) return "G";
  const match = fStr.match(/(\d+)/);
  if (match) return match[1]; // Extracts "1" from "F1", "5" from "5th Floor", etc.
  return floor;
}

function isChavaraBuilding(building) {
  if (!building) return false;
  const b = building.toLowerCase();
  return b.includes("chavara");
}

function getIndoorEntranceNode(building, outdoorEntrance, _userLoc = null) {
  if (isChavaraBuilding(building)) {
    // The outdoor pathfinding already routed to the nearest Chavara entrance
    // node (either "chavara" = Entrance 1, or "p3" = Entrance 2), so we
    // derive the indoor entrance directly from that instead of re-computing
    // GPS distance (which doesn't work in debug mode anyway).
    return outdoorEntrance === "p3" ? "entrance_G2" : "entrance_G1";
  }
  return indoorEntranceByFloor[outdoorEntranceFloor[outdoorEntrance] || "G"];
}

// ── GPS debug toggle ─────────────────────────────────────────────────────────
// Set to true while testing away from campus; set it back to false for real GPS.
const USE_DEBUG_LOCATION = true;
const USER_LOCATION = {
  lat:10.356260,
  lng: 76.212599,
};

// ── DEMO MODE ─────────────────────────────────────────────────────────────────
// When true: app starts on B1 indoor view (Exam Cell), search shows info card,
// "View Indoor Location" shows destination pin only — no routing UI shown.
// Set to false to restore the full outdoor navigation flow.
const DEMO_MODE = false;

// Fixed demo start: Exam Cell (N208) on St Mary's B1
const DEMO_START = {
  nearestNode: "SM208",
  name: "Exam Cell",
  floor: "B1",
  building: "stmarys",
  position: [10.357929, 76.212969],
};

// St Mary's Block main entrance – used for geofence proximity check
// Trigger "arrived at St Mary's?" prompt when within this many metres
const ST_MARYS_GEOFENCE_METERS = 30;
const ENTRANCE_CONFIRMATION_FIXES = 2;
const ST_MARYS_GPS_FALLBACK_METERS = 120;

// Outdoor destination proximity: show arrival card when this close to dest node
const OUTDOOR_ARRIVAL_GEOFENCE_METERS = 35;
const OUTDOOR_ARRIVAL_CONFIRMATION_FIXES = 2;

// Paste the published feedback form URL here when it is ready.
const FEEDBACK_FORM_URL = "https://docs.google.com/forms/d/1jv572SGp3e17tpvQmM-w1_EVgCc7j7MyJ1QrAQdf_zI/viewform";

function getPathCoordinates(path, nodes) {

  return path.map((node) => nodes[node]?.position || nodes[node]).filter(Boolean);

}

const routeLengthMeters = (path) => path.slice(1).reduce(
  (total, point, index) => total + calculateHaversineDistance(path[index][0], path[index][1], point[0], point[1]),
  0
);

function MainApp() {
  const {
    loading: dbLoading,
    locations,
    nodes: NODES,
    edges: EDGES,
    indoorNodes: INDOOR_NODES,
    indoorEdges: INDOOR_EDGES,
    chavaraIndoorNodes: CHAVARA_INDOOR_NODES,
    chavaraIndoorEdges: CHAVARA_INDOOR_EDGES,
    qrLocations: QR_LOCATIONS,
    bottomSheetData,
    searchItems: SEARCH_ITEMS,
    rooms = [],
  } = useDatabase();

  const [selectedLocation, setSelectedLocation] = useState(null);

  const [destination, setDestination] = useState(null);

  const [route, setRoute] = useState([]);

  const [currentScreen, setCurrentScreen] = useState('landing');
  const [theme, setTheme] = useState('light');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [qrModalPoi, setQrModalPoi] = useState(null);
  
  // Inactivity Safeguard (60s idle reset with 10s warning)
  const [isInactivityWarningOpen, setIsInactivityWarningOpen] = useState(false);
  const [remainingWarningSeconds, setRemainingWarningSeconds] = useState(10);
  const idleTimerRef = useRef(null);
  const warningIntervalRef = useRef(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    audioService.enabled = soundEnabled;
  }, [soundEnabled]);

  const resetToLanding = () => {
    setDestination(null);
    setQrModalPoi(null);
    setCurrentFloor("G");
    setCurrentScreen('landing');
    setIsInactivityWarningOpen(false);
  };

  const resetInactivityTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
    setIsInactivityWarningOpen(false);

    if (currentScreen !== 'landing') {
      const timeoutMs = 50000;
      idleTimerRef.current = setTimeout(() => {
        setRemainingWarningSeconds(10);
        setIsInactivityWarningOpen(true);

        warningIntervalRef.current = setInterval(() => {
          setRemainingWarningSeconds((prev) => {
            if (prev <= 1) {
              clearInterval(warningIntervalRef.current);
              resetToLanding();
              return 10;
            }
            return prev - 1;
          });
        }, 1000);
      }, timeoutMs);
    }
  };

  useEffect(() => {
    const onUserActivity = () => {
      if (currentScreen !== 'landing') {
        resetInactivityTimer();
      }
    };
    ['touchstart', 'mousedown', 'mousemove', 'keydown', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });
    resetInactivityTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
      ['touchstart', 'mousedown', 'mousemove', 'keydown', 'scroll'].forEach((evt) => {
        window.removeEventListener(evt, onUserActivity);
      });
    };
  }, [currentScreen]);

  const [currentFloor, setCurrentFloor] = useState(DEMO_MODE ? DEMO_START.floor : "G");
  const [mapMode, setMapMode] = useState(DEMO_MODE ? "INDOOR" : "OUTDOOR");

  // ── Demo mode state ──────────────────────────────────────────────────────
  const [showDestInfoCard, setShowDestInfoCard] = useState(false);
  const [destInfoTarget, setDestInfoTarget] = useState(null);

  const initialUrlChecked = useRef(false);

  useEffect(() => {
    if (!initialUrlChecked.current && !dbLoading && SEARCH_ITEMS && SEARCH_ITEMS.length > 0) {
      initialUrlChecked.current = true;
      const params = new URLSearchParams(window.location.search);
      const destId = params.get("dest");
      if (destId) {
        const found = SEARCH_ITEMS.find(item => item.id === destId || item.name === destId) ||
          locations.find(loc => loc.id === destId || loc.name === destId);
        if (found) {
          setDestination(found);
          setSelectedLocation(found);
          if (isIndoorDestination(found)) {
            setCurrentBuilding(isChavaraBuilding(found.building) ? "chavara" : "stmarys");
            setCurrentFloor(found.floor || "G");
            setMapMode("INDOOR");
            setNavStep(STEPS.INDOOR_READY);
          }
        }
      }
    }
  }, [dbLoading, SEARCH_ITEMS, locations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (mapMode === "INDOOR" && currentFloor) {
      params.set("floor", currentFloor);
    } else {
      params.delete("floor");
    }
    if (destination?.id || destination?.name) {
      params.set("dest", destination.id || destination.name);
    } else {
      params.delete("dest");
    }
    // Clean up empty query string sign
    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(window.history.state, "", newUrl);
  }, [currentFloor, destination, mapMode]);

  const [transportMode, setTransportMode] = useState(null);

  const [navStep, setNavStep] = useState(DEMO_MODE ? STEPS.INDOOR_READY : STEPS.IDLE);



  // const [usingGoogleMaps, setUsingGoogleMaps] = useState(false);

  const [indoorRoute, setIndoorRoute] = useState([]);

  const [indoorRouteNodes, setIndoorRouteNodes] = useState([]);
  const [indoorRouteIndex, setIndoorRouteIndex] = useState(0);

  // Reset index when route changes
  useEffect(() => {
    setIndoorRouteIndex(0);
  }, [indoorRouteNodes]);

  const handleNextIndoorStep = () => {
    setIndoorRouteIndex((prevIndex) => {
      const nextIndex = Math.min(prevIndex + 1, indoorRouteNodes.length - 1);

      // If we reached the final destination node
      if (nextIndex === indoorRouteNodes.length - 1) {
        setTimeout(() => setNavStep(STEPS.COMPLETED), 1500); // Complete navigation after a short delay
      }
      return nextIndex;
    });
  };

  const {
    location,
    accuracy,
    gpsStatus,
    getOneShotLocation,
    startTracking,
    stopTracking,
    subscribeToLocation,
    getLatestLocation,
    getApproximateLocation,
    gpsDistanceMeters,
  } = useCurrentLocation();

  const [isAppLoading, setIsAppLoading] = useState(true);
  const [minLoadingTimePassed, setMinLoadingTimePassed] = useState(false);



  // ── New workflow state ─────────────────────────────────────────────────────
  // Controls single search bar vs YD Card in outdoor mode.
  // true  = "Start Navigation" was clicked → show YD Card
  // false = initial state → show single SearchBar
  const [hasSearched, setHasSearched] = useState(false);

  // Building detected via GPS polygon check on initial load.
  // "chavara" | "stmarys" | null
  const [detectedBuilding, setDetectedBuilding] = useState(null);

  // When true, show the "Are you inside [Building]?" modal.
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [showAccuracyBadge, setShowAccuracyBadge] = useState(false);

  // Tracks whether the building check on load has already been run
  // so we don't show the modal again after the user dismisses it.
  const buildingCheckDoneRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinLoadingTimePassed(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    console.log("Current Location:", location);
    if ((location || USE_DEBUG_LOCATION || ["ok", "poor", "failed", "timeout"].includes(gpsStatus)) && minLoadingTimePassed) {
      const timer = setTimeout(async () => {
        setIsAppLoading(false);

        // Run building detection once, right when the loading screen hides
        if (!buildingCheckDoneRef.current) {
          const checkLoc = USE_DEBUG_LOCATION ? USER_LOCATION : (location || null);
          if (checkLoc?.lat && checkLoc?.lng) {
            // Try edge function first, fall back to local polygon
            const result = await geofence(checkLoc.lat, checkLoc.lng);
            const detected = result?.zone && result.zone !== 'campus' ? result.zone : null;
            if (detected) {
              buildingCheckDoneRef.current = true;
              setDetectedBuilding(detected);
              setShowBuildingModal(true);
            }
          }
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [location, gpsStatus, minLoadingTimePassed]);

  // Show subtle accuracy badge only when GPS is genuinely terrible (>80m)
  useEffect(() => {
    const VERY_LOW_THRESHOLD = 80;
    if (accuracy != null && accuracy > VERY_LOW_THRESHOLD && gpsStatus !== 'failed' && gpsStatus !== 'pending') {
      setShowAccuracyBadge(true);
      const timer = setTimeout(() => setShowAccuracyBadge(false), 4000);
      return () => clearTimeout(timer);
    } else {
      setShowAccuracyBadge(false);
    }
  }, [accuracy, gpsStatus]);

  // Auto-dismiss location alert when GPS comes back after user grants permission
  useEffect(() => {
    if (showLocationAlert && (gpsStatus === 'ok' || gpsStatus === 'poor')) {
      setShowLocationAlert(false);
    }
  }, [gpsStatus, showLocationAlert]);


  // console.log("Current Location:", currentLocation);

  const [sheetOpen, setSheetOpen] = useState(false);

  const [sheetTitle, setSheetTitle] = useState("");

  const [sheetData, setSheetData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [indoorUserLocation, setIndoorUserLocation] = useState(
    DEMO_MODE
      ? { position: DEMO_START.position, nearestNode: DEMO_START.nearestNode, floor: DEMO_START.floor }
      : null
  );

  const [indoorStart, setIndoorStart] = useState(
    DEMO_MODE
      ? { name: DEMO_START.name, nearestNode: DEMO_START.nearestNode, floor: DEMO_START.floor }
      : null
  );

  const [indoorDestination, setIndoorDestination] = useState(null);

  const [isOutdoorNavigating, setIsOutdoorNavigating] = useState(false);

  const [lastNearestNode, setLastNearestNode] = useState(null);

  const [scannedQR, setScannedQR] = useState(null);

  const [outdoorStartNode, setOutdoorStartNode] = useState(null);


  const getExitNode = (floor, targetOverride = null) => {
    if (currentBuilding === "chavara") {
      const activeDest = targetOverride || indoorDestination || destination;
      const bldNormalized = (activeDest?.building || "").toLowerCase().replace(/[^a-z]/g, "");
      const isMary = bldNormalized.includes("stmary");
      if (isMary) {
        return "entrance_G2";
      }

      const destPos = activeDest?.position || (activeDest?.routeNode ? NODES[activeDest.routeNode] : null) || (activeDest?.id ? NODES[activeDest.id] : null);
      if (destPos) {
        const distG1 = calculateHaversineDistance(
          destPos[0],
          destPos[1],
          CHAVARA_INDOOR_NODES.entrance_G1.position[0],
          CHAVARA_INDOOR_NODES.entrance_G1.position[1]
        );
        const distG2 = calculateHaversineDistance(
          destPos[0],
          destPos[1],
          CHAVARA_INDOOR_NODES.entrance_G2.position[0],
          CHAVARA_INDOOR_NODES.entrance_G2.position[1]
        );
        return distG1 < distG2 ? "entrance_G1" : "entrance_G2";
      }
      return selectedEntrance === "p3" ? "entrance_G2" : "entrance_G1";
    }
    return `entrance_${floor}`;
  };

  const [remainingRoute, setRemainingRoute] = useState([]);
  const [nearestDebugNode, setNearestDebugNode] = useState(null);
  const [navigationMessage, setNavigationMessage] = useState("");
  const [fixedUserLocation, setFixedUserLocation] = useState(null);
  const [snappedLocation, setSnappedLocation] = useState(null);
  const [outdoorTarget, setOutdoorTarget] = useState(null);
  const [showNavigationCard, setShowNavigationCard] = useState(false);
  const [manualIndoorMode, setManualIndoorMode] = useState(false);
  const [selectedEntrance, setSelectedEntrance] = useState(null);
  const [indoorArrivalReady, setIndoorArrivalReady] = useState(false);
  const [indoorEtaSeconds, setIndoorEtaSeconds] = useState(0);
  const gpsFallbackShown = useRef(false);
  const navigationSession = useRef(false);
  const navigationStateRef = useRef({ navStep, destination, selectedEntrance });
  const entranceMilestoneRef = useRef({ reached: false, consecutiveFixes: 0 });
  const outdoorArrivalRef = useRef({ reached: false, consecutiveFixes: 0 });
  const offRouteRef = useRef(0);
  const [qrSimOpen, setQrSimOpen] = useState(false);
  const [assumedIndoorMode, setAssumedIndoorMode] = useState(false);
  const [selectedVerticalPrefix, setSelectedVerticalPrefix] = useState(null);
  // Outside-campus preview state
  const [outsideCampusTarget, setOutsideCampusTarget] = useState(null);

  // When debug mode is on, use fixed campus location; otherwise live GPS
  const locationToUse = USE_DEBUG_LOCATION
    ? USER_LOCATION
    : snappedLocation || location;
  const [currentBuilding, setCurrentBuilding] = useState(DEMO_MODE ? "stmarys" : "stmarys");



  // ── Normalize indoor graph to resolve spaces & case mismatches dynamically ──
  const normalizedIndoorData = useMemo(() => {
    const rawNodes = currentBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
    const rawEdges = currentBuilding === "chavara" ? CHAVARA_INDOOR_EDGES : INDOOR_EDGES;

    const keyMap = {};
    Object.keys(rawNodes).forEach((key) => {
      keyMap[key.trim().toLowerCase()] = key;
    });

    const normalizeKey = (key) => {
      if (!key) return key;
      const clean = key.trim().toLowerCase();
      return keyMap[clean] || key.trim();
    };

    const normalizedNodes = {};
    Object.entries(rawNodes).forEach(([key, node]) => {
      const cleanKey = normalizeKey(key);
      normalizedNodes[cleanKey] = {
        ...node,
        id: cleanKey,
      };
    });

    const normalizedEdges = rawEdges.map((edge) => {
      const a = Array.isArray(edge) ? edge[0] : edge.source;
      const b = Array.isArray(edge) ? edge[1] : edge.target;
      return [normalizeKey(a), normalizeKey(b)];
    });

    return { normalizedNodes, normalizedEdges, normalizeKey };
  }, [currentBuilding, INDOOR_NODES, CHAVARA_INDOOR_NODES, rooms]);

  const ACTIVE_INDOOR_NODES = normalizedIndoorData.normalizedNodes;
  const ACTIVE_INDOOR_EDGES = normalizedIndoorData.normalizedEdges;
  const normalizeIndoorKey = normalizedIndoorData.normalizeKey;

  const ACTIVE_FLOOR_IMAGES =
    currentBuilding === "chavara"
      ? CHAVARA_FLOOR_IMAGES
      : FLOOR_IMAGES;

  // Keep the stream-facing state machine in refs. A live fix can update the
  // marker every time, but it only updates the app after a debounced milestone.
  useEffect(() => {
    navigationStateRef.current = { navStep, destination, selectedEntrance };
  }, [navStep, destination, selectedEntrance]);

  useEffect(() => subscribeToLocation((position) => {
    const state = navigationStateRef.current;
    if (entranceMilestoneRef.current.reached || state.navStep !== STEPS.OUTDOOR_NAVIGATING || !isIndoorDestination(state.destination) || !state.selectedEntrance || !NODES[state.selectedEntrance]) return;

    const [lat, lng] = NODES[state.selectedEntrance];
    const distance = gpsDistanceMeters(position, { lat, lng });
    entranceMilestoneRef.current.consecutiveFixes = distance <= ST_MARYS_GEOFENCE_METERS
      ? entranceMilestoneRef.current.consecutiveFixes + 1
      : 0;

    if (entranceMilestoneRef.current.consecutiveFixes < ENTRANCE_CONFIRMATION_FIXES) return;
    entranceMilestoneRef.current.reached = true;
    setNavStep((step) => step === STEPS.OUTDOOR_NAVIGATING ? STEPS.AT_BUILDING : step);
    setShowNavigationCard(true);
  }), [subscribeToLocation, gpsDistanceMeters]);

  // Outdoor destination proximity — automatically show the arrival card when
  // the user walks within OUTDOOR_ARRIVAL_GEOFENCE_METERS of the destination.
  useEffect(() => subscribeToLocation((position) => {
    const state = navigationStateRef.current;
    if (outdoorArrivalRef.current.reached) return;
    if (state.navStep !== STEPS.OUTDOOR_NAVIGATING) return;
    if (isIndoorDestination(state.destination)) return; // handled by the indoor geofence above
    if (!state.destination) return;

    const destNodeId = state.destination.routeNode || state.destination.id;
    const destNode = destNodeId ? NODES[destNodeId] : null;
    if (!destNode) return;

    const [lat, lng] = destNode;
    const distance = gpsDistanceMeters(position, { lat, lng });
    outdoorArrivalRef.current.consecutiveFixes = distance <= OUTDOOR_ARRIVAL_GEOFENCE_METERS
      ? outdoorArrivalRef.current.consecutiveFixes + 1
      : 0;

    if (outdoorArrivalRef.current.consecutiveFixes < OUTDOOR_ARRIVAL_CONFIRMATION_FIXES) return;
    outdoorArrivalRef.current.reached = true;
    setNavStep((step) => step === STEPS.OUTDOOR_NAVIGATING ? STEPS.OUTDOOR_ARRIVED : step);
    setShowNavigationCard(true);
  }), [subscribeToLocation, gpsDistanceMeters]);

  const triggerIndoorFallback = () => {
    gpsFallbackShown.current = true;

    if (gpsStatus === "failed") {
      setShowLocationAlert(true);
      return;
    }

    const approximateLocation = getApproximateLocation() || getLatestLocation() || location || {
      lat: NODES?.entrance?.[0] || 10.354064,
      lng: NODES?.entrance?.[1] || 76.212318,
    };
    const nearestNode = findNearestNode(approximateLocation, NODES);
    const nearestStMarysEntrance = findNearestStMarysEntrance(approximateLocation, NODES);
    const nearestChavaraEntrance = findNearestChavaraEntrance(approximateLocation, NODES);
    // If testing manually from home, the distance might be huge, so we force a building if needed
    // We'll just assume they are near Chavara for the sake of the test if they are very far
    const nearStMarys = nearestStMarysEntrance.distanceMeters <= ST_MARYS_GPS_FALLBACK_METERS;
    let nearChavara = nearestChavaraEntrance.distanceMeters <= ST_MARYS_GPS_FALLBACK_METERS;

    if (!nearStMarys && !nearChavara) {
      nearChavara = true; // Fallback for manual testing
    }

    setSnappedLocation(approximateLocation);
    setOutdoorStartNode(nearestNode);
    setMapCenter({ id: `fallback-${Date.now()}`, position: [approximateLocation.lat, approximateLocation.lng] });
    if ((nearStMarys || nearChavara) && (!destination || isIndoorDestination(destination))) {
      const entranceNodeId = nearChavara ? nearestChavaraEntrance.nodeId : nearestStMarysEntrance.nodeId;
      setSelectedEntrance(entranceNodeId);

      setDetectedBuilding(nearChavara ? "chavara" : "stmarys");
      setShowBuildingModal(true);
    } else if (destination && navStep === STEPS.OUTDOOR_ROUTE) {
      startOutdoorNavigation(nearestNode, approximateLocation);
    }
  };

  const handleMyLocationClick = () => {
    if (locationToUse) return true;
    gpsFallbackShown.current = false;
    triggerIndoorFallback();
    return false;
  };

  // St Mary's is the only mapped indoor building. Everywhere else falls back
  // to the nearest outdoor graph node instead of opening an indoor prompt.
  useEffect(() => {
    if (navStep === STEPS.IDLE && !destination) {
      setShowLocationAlert(false);
      setShowBuildingModal(false);
      return;
    }
    if (USE_DEBUG_LOCATION || gpsFallbackShown.current || mapMode === "INDOOR") return;
    if (!['timeout', 'failed'].includes(gpsStatus)) return;
    triggerIndoorFallback();
  }, [gpsStatus, mapMode, destination, navStep, getApproximateLocation, getLatestLocation, location]);

  // Indoor routes cannot depend on GPS. Use the graph path length and a
  // conservative walking speed (1.2 m/s) to show the arrival confirmation at
  // a plausible time rather than immediately.
  useEffect(() => {
    const isIndoorRoute = mapMode === "INDOOR" && navStep === STEPS.FLOOR_NAVIGATION && indoorRoute.length > 1;
    if (!isIndoorRoute) {
      setIndoorArrivalReady(false);
      setIndoorEtaSeconds(0);
      return undefined;
    }
    const estimatedSeconds = USE_DEBUG_LOCATION
      ? 2
      : Math.min(120, Math.max(8, Math.round(routeLengthMeters(indoorRoute) / 1.2)));
    setIndoorArrivalReady(false);
    setIndoorEtaSeconds(estimatedSeconds);
    const timer = window.setTimeout(() => setIndoorArrivalReady(true), estimatedSeconds * 1000);
    return () => window.clearTimeout(timer);
  }, [mapMode, navStep, indoorRoute]);

  // Ref to imperatively clear the demo-mode search bar
  const demoSearchClearRef = useRef(null);

  useEffect(() => {
    const onPopState = () => {
      if (window.__POPPING_SEARCH || window.__SEARCH_OPEN) {
        return; // Ignore popstate if the search dropdown is managing its own history state
      }

      // ── DEMO MODE layered back flow ────────────────────────────────────────
      if (DEMO_MODE) {
        // Layer 1: search bar has text → clear it and stay on the page
        if (demoSearchClearRef.current && typeof demoSearchClearRef.current === 'function') {
          // We call the clear fn and check if there was actually something to clear
          // by reading a flag the SearchBar sets on the ref
          const hadContent = demoSearchClearRef.current._hasContent?.();
          if (hadContent) {
            demoSearchClearRef.current();
            // Push a new history entry so the next back has something to consume
            window.history.pushState({ demoBack: 'cleared' }, '');
            return;
          }
        }

        // Layer 2: destination info card is open → dismiss it
        if (showDestInfoCard) {
          setShowDestInfoCard(false);
          setDestInfoTarget(null);
          window.history.pushState({ demoBack: 'card-dismissed' }, '');
          return;
        }

        // Layer 3: a destination pin is shown → reset back to Exam Cell home
        if (destination) {
          setDestination(null);
          setSelectedLocation(null);
          setCurrentFloor(DEMO_START.floor);
          setCurrentBuilding('stmarys');
          setMapMode('INDOOR');
          setNavStep(STEPS.INDOOR_READY);
          setMapCenter({ id: 'demo-start', position: DEMO_START.position });
          window.history.pushState({ demoBack: 'home' }, '');
          return;
        }

        // Layer 4: clean state → let the browser navigate away naturally
        // (don't pushState, let this popstate propagate to the browser)
        return;
      }
      // ── END DEMO MODE ──────────────────────────────────────────────────────

      // A system Back press ends the active route and returns to the clean
      // outdoor map. The next Back press is then handled by the browser/app
      // shell and returns to the page from which Campus RouteX was opened.
      if (sheetOpen) {
        setSheetOpen(false);
        setSelectedDepartment(null);
        return;
      }
      // The first Back press while following an indoor route returns to the
      // indoor route selector. A subsequent Back press can then leave the
      // building and return to the outdoor map.
      if (mapMode === "INDOOR" && navStep !== STEPS.INDOOR_READY) {
        setIndoorRoute([]);
        setIndoorRouteNodes([]);
        setIndoorDestination(null);
        setDestination(null);
        setShowNavigationCard(false);
        setNavStep(STEPS.INDOOR_READY);
        return;
      }
      if (navigationSession.current) {
        navigationSession.current = false;
        resetNavigation();
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [sheetOpen, mapMode, navStep, showDestInfoCard, destination]);

  useEffect(() => {

    if (!fixedUserLocation && location) {

      setFixedUserLocation(location);

      console.log(
        "Fixed user location:",
        location
      );

    }

  }, [location]);
  useEffect(() => {
    if (!locationToUse) return;

    const pointsToSearch = locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      position: loc.position,
      node: loc.routeNode
    }));
    const nearest = findNearestLocation(locationToUse, pointsToSearch);

    console.log("Nearest location:", nearest);

    setNearestDebugNode(nearest);

  }, [locationToUse]);
  const pushState = (newStep) => {
    // One browser entry represents the whole route, rather than every button
    // press. This mirrors native map apps and keeps Back predictable.
    if (!navigationSession.current) {
      navigationSession.current = true;
      if (window.history.state?.campusRouteX === "sheet") {
        window.history.replaceState({ campusRouteX: "navigation" }, "", window.location.pathname);
      } else {
        window.history.pushState({ campusRouteX: "navigation" }, "", window.location.pathname);
      }
    }
    setNavStep(newStep);
  };

  const resetNavigation = () => {
    entranceMilestoneRef.current = { reached: false, consecutiveFixes: 0 };
    outdoorArrivalRef.current = { reached: false, consecutiveFixes: 0 };

    setSelectedLocation(null);

    setRoute([]);

    setRemainingRoute([]);

    setDestination(null);

    setIndoorDestination(null);

    setCurrentFloor("G");

    setTransportMode(null);

    setNavStep(STEPS.IDLE);

    setMapMode("OUTDOOR");

    setIndoorRoute([]);

    setIndoorRouteNodes([]);

    setIndoorStart(null);

    setIndoorUserLocation(null);

    setIsOutdoorNavigating(false);

    setLastNearestNode(null);

    setScannedQR(null);

    setOutdoorStartNode(null);

    // Reset the search UI back to the single search bar
    setHasSearched(false);

    // Reset demo state
    if (DEMO_MODE) {
      setShowDestInfoCard(false);
      setDestInfoTarget(null);
      setIndoorUserLocation({ position: DEMO_START.position, nearestNode: DEMO_START.nearestNode, floor: DEMO_START.floor });
      setIndoorStart({ name: DEMO_START.name, nearestNode: DEMO_START.nearestNode, floor: DEMO_START.floor });
      setCurrentFloor(DEMO_START.floor);
      setMapMode("INDOOR");
      setCurrentBuilding("stmarys");
      setNavStep(STEPS.INDOOR_READY);
    }

  };


  const finishNavigation = () => {
    // Keep the indoor floor plan open after completion. The active navigation
    // history entry remains, so the system Back button is what returns the
    // user to the clean outdoor map.
    setShowNavigationCard(false);
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setIndoorDestination(null);
    if (mapMode === "INDOOR") {
      setDestination(null);
      setNavStep(STEPS.INDOOR_READY);
      return;
    }
    setRoute([]);
    setRemainingRoute([]);
    setDestination(null);
    setIsOutdoorNavigating(false);
    setOutdoorStartNode(null);
    setNavStep(STEPS.IDLE);
  };

  const openFeedbackForm = () => {
    if (FEEDBACK_FORM_URL) window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer");
  };

  const previewOutdoorRoute = async (target) => {
    const startLocation = USE_DEBUG_LOCATION
      ? USER_LOCATION
      : snappedLocation || fixedUserLocation || locationToUse;
    let endNode = target?.routeNode || target?.id;

    if (target?.location === "chavara") endNode = "chavara";
    if (isIndoorDestination(target)) {
      const isChav = isChavaraBuilding(target.building) || target.routeNode === "chavara";
      if (isChav) {
        // Use the outdoor graph to pick the entrance whose actual road path is
        // shorter — this must match what startOutdoorNavigation will route to.
        const nearestStartNode = findNearestNode(
          startLocation || { lat: NODES?.entrance?.[0] || 10.354064, lng: NODES?.entrance?.[1] || 76.212318 },
          NODES
        );
        endNode = findBestChavaraEntranceByPath(
          nearestStartNode,
          EDGES,
          startLocation,
          NODES
        ).nodeId;
      } else {
        endNode = findNearestStMarysEntrance(
          startLocation || { lat: NODES?.entrance?.[0] || 10.354064, lng: NODES?.entrance?.[1] || 76.212318 },
          NODES
        ).nodeId;
      }
      setSelectedEntrance(endNode);
    }

    // Determine the map center position to focus on the destination
    let destPos = target?.position;
    if (!destPos && endNode && NODES[endNode]) {
      destPos = NODES[endNode];
    } else if (!destPos && target?.id && NODES[target.id]) {
      destPos = NODES[target.id];
    }

    // Calculate the route path immediately and set it so the user sees it when selecting the destination
    if (startLocation) {
      const nearestNode = findNearestNode(startLocation, NODES);
      let end;

      if (target?.type === "faculty" || target?.type === "location") {
        end = target.routeNode;
      } else if (target?.type === "room") {
        const isChavRoom = isChavaraBuilding(target.building) || target.routeNode === "chavara";
        end = isChavRoom
          ? findBestChavaraEntranceByPath(nearestNode, EDGES, startLocation, NODES).nodeId
          : findNearestBuildingEntrance(startLocation, target.building || target.routeNode, NODES, nearestNode, EDGES).nodeId;
      } else {
        end = target?.routeNode || target?.id;
      }

      if (isIndoorDestination(target)) {
        const isChav = isChavaraBuilding(target.building) || target.routeNode === "chavara";
        if (isChav) {
          end = findBestChavaraEntranceByPath(nearestNode, EDGES, startLocation, NODES).nodeId;
        } else {
          end = findNearestBuildingEntrance(startLocation, target.building || target.routeNode, NODES, nearestNode, EDGES).nodeId;
        }
      }

            const { path: nodePath, coordinates: graphRoute } = await routeOutdoor(
        { startNodeId: nearestNode, endNodeId: end },
        { startNode: nearestNode, endNode: end, edges: EDGES, nodes: NODES }
      );
            
      const userPos = [startLocation.lat, startLocation.lng];
      const fullRoute = graphRoute.length > 0 ? [userPos, ...graphRoute] : graphRoute;
      setRoute(fullRoute);
      if (destPos) {
        setMapCenter({ id: `dest-focus-${Date.now()}`, position: destPos });
      }
    } else {
      setRoute([]);
    }
  };

  const startOutdoorNavigation = async (startNode = null, startLocation = null, targetDestination = null) => {
    entranceMilestoneRef.current = { reached: false, consecutiveFixes: 0 };
    outdoorArrivalRef.current = { reached: false, consecutiveFixes: 0 };

    const activeDestination = targetDestination || destination;

    console.log("START CLICKED");
    const routeStartLocation = startLocation || (USE_DEBUG_LOCATION
      ? locationToUse
      : snappedLocation || fixedUserLocation || locationToUse);
    if (!startNode && !routeStartLocation) {
      alert("Location unavailable. Please enable GPS.");
      return;
    }

    if (!startNode && !isInsideCampus(routeStartLocation)) {
      setRoute([]);
      setIsOutdoorNavigating(true);
      pushState(STEPS.OUTDOOR_NAVIGATING);
      return;
    }

    const nearestNode =
      startNode ||
      outdoorStartNode ||
      findNearestNode(routeStartLocation, NODES);

    let end;

    if (activeDestination?.type === "faculty" || activeDestination?.type === "location") {
      end = activeDestination.routeNode;
    } else if (activeDestination?.type === "room") {
      const isChavRoom = isChavaraBuilding(activeDestination.building) || activeDestination.routeNode === "chavara";
      end = isChavRoom
        ? findBestChavaraEntranceByPath(nearestNode, EDGES, routeStartLocation, NODES).nodeId
        : findNearestBuildingEntrance(routeStartLocation, activeDestination.building || activeDestination.routeNode, NODES, nearestNode, EDGES).nodeId;
      setSelectedEntrance(end);
    } else {
      end = activeDestination?.routeNode || activeDestination?.id;
    }

    let entranceSearchLocation = startNode ? NODES[startNode] : routeStartLocation;
    if (Array.isArray(entranceSearchLocation)) {
      entranceSearchLocation = { lat: entranceSearchLocation[0], lng: entranceSearchLocation[1] };
    }

    if (isIndoorDestination(activeDestination) && entranceSearchLocation) {
      const isChav = isChavaraBuilding(activeDestination.building) || activeDestination.routeNode === "chavara";
      if (isChav) {
        end = findBestChavaraEntranceByPath(
          nearestNode,
          EDGES,
          entranceSearchLocation,
          NODES
        ).nodeId;
      } else {
        end = findNearestBuildingEntrance(entranceSearchLocation, activeDestination.building || activeDestination.routeNode, NODES, nearestNode, EDGES).nodeId;
      }
      setSelectedEntrance(end);
    }

    console.log("End node:", end);

        const { path: nodePath, coordinates: graphRoute } = await routeOutdoor(
      { startNodeId: nearestNode, endNodeId: end },
      { startNode: nearestNode, endNode: end, edges: EDGES, nodes: NODES }
    );
    
    console.log("PATH RESULT:", nodePath);
    console.log("graphRoute:", graphRoute);

    // Prepend user's actual position so the route line starts exactly at the user dot
    const userPos = routeStartLocation
      ? [routeStartLocation.lat, routeStartLocation.lng]
      : null;
    const fullRoute = userPos && graphRoute.length > 0
      ? [userPos, ...graphRoute]
      : graphRoute;

    setRoute(fullRoute);
    setIsOutdoorNavigating(true);
    // Convert the single search bar to the YD Card now that navigation is live
    setHasSearched(true);
    pushState(STEPS.OUTDOOR_NAVIGATING);
    if (userPos) {
      setMapCenter({ id: `user-focus-${Date.now()}`, position: userPos });
    }
  };

  // Automatic rerouting if off path
  useEffect(() => subscribeToLocation((position) => {
    const state = navigationStateRef.current;
    if (state.navStep !== STEPS.OUTDOOR_NAVIGATING) {
      offRouteRef.current = 0;
      return;
    }
    if (!route || route.length < 2) return;

    // Do not reroute if the user is already near their destination/entrance.
    // This prevents conflicting with the "Have you arrived?" cards.
    let isNearDestination = false;
    if (state.destination) {
      if (isIndoorDestination(state.destination) && state.selectedEntrance && NODES[state.selectedEntrance]) {
        const [lat, lng] = NODES[state.selectedEntrance];
        isNearDestination = gpsDistanceMeters(position, { lat, lng }) <= ST_MARYS_GEOFENCE_METERS;
      } else {
        const destNodeId = state.destination.routeNode || state.destination.id;
        const destNode = destNodeId ? NODES[destNodeId] : null;
        if (destNode) {
          const [lat, lng] = destNode;
          isNearDestination = gpsDistanceMeters(position, { lat, lng }) <= OUTDOOR_ARRIVAL_GEOFENCE_METERS;
        }
      }
    }

    if (isNearDestination) {
      offRouteRef.current = 0;
      return;
    }

    const { distanceMeters } = getDistanceToRoute(route, position);
    if (distanceMeters > 10) {
      offRouteRef.current += 1;
      if (offRouteRef.current >= 2) {
        console.log("User off route by", distanceMeters, "m. Recalculating...");
        offRouteRef.current = 0;
        startOutdoorNavigation(null, position);
      }
    } else {
      offRouteRef.current = 0;
    }
  }), [subscribeToLocation, route, gpsDistanceMeters]);


  const continueFromOutdoorEntrance = async () => {
    // For cross-building nav: selectedEntrance is set by startOutdoorNavigation.
    // Derive a fallback from the outdoor route endpoint if it's somehow missing.
    const effectiveEntrance = selectedEntrance || (
      isChavaraBuilding(destination?.building)
        ? "chavara"
        : (outdoorEntranceFloor["g"] ? "g" : "g")
    );
    const entryFloor = outdoorEntranceFloor[effectiveEntrance] || "G";
    const startNode = getIndoorEntranceNode(destination?.building, effectiveEntrance, locationToUse);
    const endNode = destination?.indoorNode || destination?.id;
    if (!startNode || !endNode) return;

    const targetBuilding = isChavaraBuilding(destination?.building) ? "chavara" : "stmarys";

    // Switch state for map rendering
    setCurrentBuilding(targetBuilding);

    const targetNodes = targetBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
    const targetEdges = targetBuilding === "chavara" ? CHAVARA_INDOOR_EDGES : INDOOR_EDGES;

    const targetKeyMap = targetBuilding === "chavara" ? {
      "stairs a": "stairsa", "stairs b": "stairsb", "lift a": "lifta", "lift b": "liftb"
    } : {
      "stair a": "stair", "stair b": "stair2", "lift": "lift"
    };

    const normKey = (k) => {
      if (!k) return "";
      const clean = k.trim().toLowerCase();
      return targetKeyMap[clean] || k.trim();
    };

    const tempNodes = {};
    Object.entries(targetNodes).forEach(([key, val]) => {
      const clean = normKey(key);
      tempNodes[clean] = { ...val, id: clean };
    });

    const tempEdges = targetEdges.map((edge) => {
      const a = Array.isArray(edge) ? edge[0] : edge.source;
      const b = Array.isArray(edge) ? edge[1] : edge.target;
      return [normKey(a), normKey(b)];
    });

    const cleanStartNode = normKey(startNode);
    const cleanEndNode = normKey(endNode);

    const start = {
      name: tempNodes[cleanStartNode]?.label || `${entryFloor} entrance`,
      nearestNode: cleanStartNode,
      floor: entryFloor,
    };
    setIndoorStart(start);
    setIndoorUserLocation({
      position: tempNodes[cleanStartNode].position,
      nearestNode: cleanStartNode,
      floor: entryFloor,
    });
    setCurrentFloor(entryFloor);
    setMapMode("INDOOR");

    // Stay on the entrance floor if the destination is there; otherwise use
    // the existing stairs/lift workflow from this exact entrance.
    if (entryFloor !== normalizeFloor(destination?.floor)) {
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

        const { path: indoorPath } = await routeIndoor(
      { building: targetBuilding, startNodeId: cleanStartNode, endNodeId: cleanEndNode },
      { startNode: cleanStartNode, endNode: cleanEndNode, edges: tempEdges, nodes: tempNodes }
    );
    
    setIndoorRouteNodes(indoorPath);
    setIndoorRoute(getPathCoordinates(indoorPath, tempNodes));
    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const startVerticalNavigation = async (mode) => {
    console.log("startVerticalNavigation");
    console.log("mode:", mode);
    console.log("indoorStart:", indoorStart);
    console.log("currentFloor:", currentFloor);
    const startNode = indoorUserLocation?.nearestNode || indoorStart?.nearestNode;

    if (!startNode) return;

    pushState(STEPS.GO_TO_FLOOR);
    
    const activeIndoorDestination = indoorDestination || destination;
    const destBuildingNormalized = isChavaraBuilding(activeIndoorDestination?.building || activeIndoorDestination?.routeNode) ? "chavara" : "stmarys";
    const isDifferentBuilding = currentBuilding !== destBuildingNormalized;
    const isIndoorDest = Boolean(activeIndoorDestination?.floor) && !isDifferentBuilding;
    const targetFloor = isIndoorDest ? normalizeFloor(activeIndoorDestination.floor) : "G";

    let bestEndNode = null;
    let bestPath = [];
    let shortestDist = Infinity;

    const getPathDistance = (path) => {
      let dist = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = ACTIVE_INDOOR_NODES[normalizeIndoorKey(path[i])]?.position;
        const p2 = ACTIVE_INDOOR_NODES[normalizeIndoorKey(path[i + 1])]?.position;
        if (p1 && p2) dist += Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
        else dist += 1;
      }
      return dist;
    };

    if (currentBuilding === "chavara") {
      let candidatePairs = [];
      if (mode === "lift") {
        candidatePairs = [
          [`liftA_${currentFloor}`, `liftA_${targetFloor}`, "liftA"],
          [`liftB_${currentFloor}`, `liftB_${targetFloor}`, "liftB"],
          [`liftC_${currentFloor}`, `liftC_${targetFloor}`, "liftC"],
        ];
      } else {
        const startStairsAPrefix = ["G", "1", "2"].includes(currentFloor.toString()) ? "ch_stairsA" : "stairsA";
        const targetStairsAPrefix = ["G", "1", "2"].includes(targetFloor.toString()) ? "ch_stairsA" : "stairsA";
        const startStairsBPrefix = ["G", "1", "2"].includes(currentFloor.toString()) ? "ch_stairsB" : "stairsB";
        const targetStairsBPrefix = ["G", "1", "2"].includes(targetFloor.toString()) ? "ch_stairsB" : "stairsB";

        candidatePairs = [
          [`${startStairsAPrefix}_${currentFloor}`, `${targetStairsAPrefix}_${targetFloor}`, "stairsA"],
          [`${startStairsBPrefix}_${currentFloor}`, `${targetStairsBPrefix}_${targetFloor}`, "stairsB"],
        ];
      }

      for (const [candidateNode, targetCandidate, prefixId] of candidatePairs) {
        if (ACTIVE_INDOOR_NODES[normalizeIndoorKey(candidateNode)] && ACTIVE_INDOOR_NODES[normalizeIndoorKey(targetCandidate)]) {
          // (We fall back to sync routing here for the candidate search since it iterates through many options quickly)
          const candidatePath = findPath(
            normalizeIndoorKey(startNode),
            normalizeIndoorKey(candidateNode),
            ACTIVE_INDOOR_EDGES,
            ACTIVE_INDOOR_NODES
          );
          if (candidatePath.length > 0) {
            const dist = getPathDistance(candidatePath);
            if (dist < shortestDist) {
              shortestDist = dist;
              bestEndNode = candidateNode;
              bestPath = candidatePath;
              setSelectedVerticalPrefix(prefixId);
            }
          }
        }
      }
    }

    setTransportMode(mode);

    const endNode = bestEndNode || (
      mode === "lift"
        ? (currentBuilding === "chavara" ? `liftA_${currentFloor}` : `lift_${currentFloor}`)
        : getStairNodeForBuilding(currentFloor, targetFloor, currentBuilding)
    );

    let path = bestPath;
    if (!bestEndNode) {
            const result = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: normalizeIndoorKey(startNode), endNodeId: normalizeIndoorKey(endNode) },
        { startNode: normalizeIndoorKey(startNode), endNode: normalizeIndoorKey(endNode), edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      path = result.path;
          }

    console.log("PATH:", path);
    setIndoorRouteNodes(path);

    // If starting from a room, omit the room node from the drawn path so the line starts at the corridor
    let displayPath = path;
    if (path.length > 1) {
      const firstNode = path[0];
      const secondNode = path[1];
      const firstIsCorridor = firstNode.startsWith("co_") || firstNode.startsWith("ch_co_") || firstNode.startsWith("c_") || firstNode.startsWith("stairs") || firstNode.startsWith("lift") || firstNode.startsWith("entrance");
      const secondIsCorridor = secondNode.startsWith("co_") || secondNode.startsWith("ch_co_") || secondNode.startsWith("c_");
      
      if (!firstIsCorridor && secondIsCorridor) {
        displayPath = path.slice(1);
      }
    }

    setIndoorRoute(getPathCoordinates(displayPath, ACTIVE_INDOOR_NODES));
    setMapMode("INDOOR");
  };

  const continueOnDestinationFloor = async () => {
    const activeIndoorDestination = indoorDestination || destination;
    if (!activeIndoorDestination) return;

    const destBuildingNormalized = isChavaraBuilding(activeIndoorDestination.building || activeIndoorDestination.routeNode) ? "chavara" : "stmarys";
    const isDifferentBuilding = currentBuilding !== destBuildingNormalized;
    const isIndoorDestination = Boolean(activeIndoorDestination.floor) && !isDifferentBuilding;

    if (!isIndoorDestination) {
      // Outdoor destination
      // We came from F1/F2
      let startNode;
      if (currentBuilding === "chavara") {
        let basePrefix = selectedVerticalPrefix;
        if (!basePrefix) {
          basePrefix = transportMode === "lift" ? "liftA" : "stairsA";
        }
        if (basePrefix.startsWith("stairs") || basePrefix.startsWith("ch_stairs")) {
          basePrefix = basePrefix.endsWith("B") ? "ch_stairsB" : "ch_stairsA";
        }
        startNode = `${basePrefix}_G`;
      } else {
        startNode =
          transportMode === "lift"
            ? "lift_G"
            : getStairNodeForBuilding("G", "G", currentBuilding);
      }

      // User has reached Ground Floor
      setCurrentFloor("G");

      setIndoorStart({
        name: ACTIVE_INDOOR_NODES[normalizeIndoorKey(startNode)]?.label || startNode,
        nearestNode: startNode,
      });

      setIndoorUserLocation({
        position: ACTIVE_INDOOR_NODES[normalizeIndoorKey(startNode)].position,
        nearestNode: startNode,
        floor: "G",
      });

      pushState(STEPS.FLOOR_NAVIGATION);
      
      const exitNode = getExitNode("G", activeIndoorDestination);
            const { path } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: normalizeIndoorKey(startNode), endNodeId: normalizeIndoorKey(exitNode) },
        { startNode: normalizeIndoorKey(startNode), endNode: normalizeIndoorKey(exitNode), edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
      setIndoorRouteNodes(path);
      setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
      setMapMode("INDOOR");

      if (path.length <= 2) {
        setTimeout(() => {
          setIndoorRoute([]);
          setIndoorRouteNodes([]);
          switchToOutdoorNavigation();
        }, 0);
        return;
      }
      return;
    }

    const targetFloor = normalizeFloor(activeIndoorDestination.floor);

    // Existing room navigation
    let startNode;
    if (currentBuilding === "chavara") {
      let basePrefix = selectedVerticalPrefix;
      if (!basePrefix) {
        basePrefix = transportMode === "lift" ? "liftA" : "stairsA";
      }
      if (basePrefix.startsWith("stairs") || basePrefix.startsWith("ch_stairs")) {
        const isChPrefix = ["G", "1", "2"].includes(targetFloor.toString());
        basePrefix = isChPrefix
          ? (basePrefix.endsWith("B") ? "ch_stairsB" : "ch_stairsA")
          : (basePrefix.endsWith("B") ? "stairsB" : "stairsA");
      }
      startNode = `${basePrefix}_${targetFloor}`;
    } else {
      startNode = transportMode === "lift"
        ? `lift_${targetFloor}`
        : getStairNodeForBuilding(targetFloor, currentFloor, currentBuilding);
    }

    setCurrentFloor(targetFloor);
    console.log("Chosen start node:", startNode);

    setIndoorStart({
      name: ACTIVE_INDOOR_NODES[normalizeIndoorKey(startNode)]?.label || startNode,
      nearestNode: startNode,
      floor: targetFloor,
    });

    pushState(STEPS.FLOOR_NAVIGATION);
    
    const endIndoorNode = activeIndoorDestination.indoorNode || activeIndoorDestination.id;
          const { path: path } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: normalizeIndoorKey(startNode), endNodeId: normalizeIndoorKey(endIndoorNode) },
        { startNode: normalizeIndoorKey(startNode), endNode: normalizeIndoorKey(endIndoorNode), edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
    setMapMode("INDOOR");

    if (path.length <= 2) {
      setTimeout(() => {
        markIndoorDestinationReached(activeIndoorDestination);
      }, 0);
      return;
    }
  };

  const [mapCenter, setMapCenter] = useState(
    DEMO_MODE ? { id: "demo-start", position: DEMO_START.position } : null
  );

  // ── Demo mode: search handler & view-indoor handler ─────────────────────
  /**
   * Called when a search result is selected in DEMO_MODE.
   * Instead of routing, shows the DestinationInfoCard.
   */
  const handleDemoSearch = (location) => {
    setDestInfoTarget(location);
    setShowDestInfoCard(true);
  };

  /**
   * Called when the user clicks "View Indoor Location" on DestinationInfoCard.
   * Switches to the destination's building/floor and places only the red pin.
   * No route is calculated or drawn.
   */
  const handleViewIndoorDestination = () => {
    if (!destInfoTarget) return;
    const loc = destInfoTarget;
    const targetBuilding = (loc.building || "").toLowerCase().includes("chavara") ? "chavara" : "stmarys";
    const rawFloor = loc.floor ? String(loc.floor).toUpperCase() : "G";
    const targetFloor = rawFloor.startsWith("B") ? rawFloor : (rawFloor === "G" || rawFloor === "GROUND" ? "G" : rawFloor);

    // Set destination for the red pin marker in CampusMap
    setDestination(loc);
    setSelectedLocation(loc);

    // Clear any existing routes (show pin only, no path)
    setRoute([]);
    setIndoorRoute([]);
    setIndoorRouteNodes([]);

    // Switch to the target building/floor in indoor mode
    setCurrentBuilding(targetBuilding);
    setCurrentFloor(targetFloor);
    setMapMode("INDOOR");
    setNavStep(STEPS.IDLE);

    // Center the map on the destination node
    const activeNodes = targetBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
    const nodeId = loc.indoorNode || loc.id;
    const node = activeNodes[nodeId];
    if (node?.position) {
      setMapCenter({ id: `demo-dest-${Date.now()}`, position: node.position });
    }

    // Dismiss the info card
    setShowDestInfoCard(false);
    setDestInfoTarget(null);
  };
  const openBottomSheet = (title, data) => {
    setSheetTitle(title);
    setSheetData(data);
    setSelectedDepartment(null);
    setSheetOpen(true);

    window.history.pushState(
      { campusRouteX: "sheet" },
      "",
      window.location.pathname
    );
  };

  const closeBottomSheet = () => {
    setSheetOpen(false);
    setSelectedDepartment(null);
    if (window.history.state?.campusRouteX === "sheet") window.history.back();
  };
  const handleSelectCategory = (categoryId) => {
    if (categoryId === "departments") {
      const academicDepts = (bottomSheetData.departments || []).filter(
        d => !d.name?.toLowerCase().includes("administration")
      );
      setSheetData(academicDepts);
      setSelectedDepartment(null);
      openBottomSheet("Departments", academicDepts);
    } else if (categoryId === "faculty") {
      setSheetData(bottomSheetData.departments);
      setSelectedDepartment(null);
      openBottomSheet("Faculty", bottomSheetData.departments);
    } else if (categoryId === "cafeteria") {
      setSheetData(bottomSheetData.cafeteria);
      setSelectedDepartment(null);
      openBottomSheet("Cafeteria", bottomSheetData.cafeteria);
    } else if (categoryId === "library") {
      setSheetData(bottomSheetData.library);
      setSelectedDepartment(null);
      openBottomSheet("Library", bottomSheetData.library);
    } else if (categoryId === "labs") {
      setSheetData(bottomSheetData.labs || []);
      setSelectedDepartment(null);
      openBottomSheet("Labs", bottomSheetData.labs || []);
    } else if (categoryId === "parking") {
      setSheetData(bottomSheetData.parking || []);
      setSelectedDepartment(null);
      openBottomSheet("Parking", bottomSheetData.parking || []);
    } else if (categoryId === "washrooms") {
      setSheetData(bottomSheetData.washrooms || []);
      setSelectedDepartment(null);
      openBottomSheet("Washrooms", bottomSheetData.washrooms || []);
    } else if (categoryId === "classrooms") {
      setSheetData(bottomSheetData.classrooms || []);
      setSelectedDepartment(null);
      openBottomSheet("Classrooms", bottomSheetData.classrooms || []);
    } else {
      setSheetData(null);
      setSelectedDepartment(null);
      openBottomSheet("", null);
    }
  };
  const runManualIndoorRoute = async (source, target) => {
    const isDestChav = isChavaraBuilding(target.building) || target.routeNode === "chavara";
    const isCurrentChav = currentBuilding === "chavara";
    const isDifferentBuilding = isDestChav !== isCurrentChav;
    const isOutdoor = target.outdoor !== undefined ? target.outdoor : isDifferentBuilding;

    if (isOutdoor) {
      // Cross-building: keep type "room" so startOutdoorNavigation uses the
      // entrance-finding branch and sets selectedEntrance correctly.
      const destEntranceNode = isChavaraBuilding(target.building) ? "chavara" : "g";
      const outdoorDestination = {
        id: target.indoorNode || target.id,
        name: target.name,
        type: target.type || "room",
        routeNode: target.type === "location" || target.type === "faculty" ? (target.routeNode || target.id) : destEntranceNode,
        floor: target.floor,
        building: target.building,
        indoorNode: target.indoorNode || target.id,
      };
      const srcFloor = source.floor || "G";
      setIndoorStart({ name: source.name, nearestNode: source.id, floor: srcFloor });
      setIndoorUserLocation({
        position: ACTIVE_INDOOR_NODES[normalizeIndoorKey(source.id)].position,
        nearestNode: source.id,
        floor: srcFloor,
      });
      setDestination(outdoorDestination);
      setIndoorDestination(outdoorDestination);
      setCurrentFloor(srcFloor);
      setMapMode("INDOOR");

      // If on a floor without an exit, ask lift/stairs first.
      // Chavara has exits only on G; St. Mary's has exits on G, B1, B2.
      const needsFloorChangeToExit = currentBuilding === "chavara"
        ? srcFloor !== "G"
        : ["1", "2"].includes(srcFloor);

      if (needsFloorChangeToExit) {
        pushState(STEPS.FLOOR_CHOICE);
        return;
      }

      // Ground floor — calculate the indoor path to the available exit.
      const exitNode = getExitNode(srcFloor, outdoorDestination); // "entrance_G"
      if (source.id === exitNode) {
        // Already at the exit: immediately continue with the outdoor route.
        setIndoorRouteNodes([]);
        setIndoorRoute([]);
        // Let the newly selected outdoor destination commit before creating
        // its route.
        window.requestAnimationFrame(() => switchToOutdoorNavigation());
        return;
      }

            pushState(STEPS.FLOOR_NAVIGATION);
      
      const { path: pathToExit } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: normalizeIndoorKey(source.id), endNodeId: normalizeIndoorKey(exitNode) },
        { startNode: normalizeIndoorKey(source.id), endNode: normalizeIndoorKey(exitNode), edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
      if (pathToExit.length) {
        setIndoorRouteNodes(pathToExit);
        setIndoorRoute(getPathCoordinates(pathToExit, ACTIVE_INDOOR_NODES));
      }
      // Follow the indoor path first. The single exit confirmation is shown
      // only after this route reaches an available exit on this floor.
      pushState(STEPS.FLOOR_NAVIGATION);
      return;
    }

    // The selectable labels can carry stale or display-only floor metadata.
    // Route decisions must come from the actual indoor graph nodes instead.
    // resolvedNodeId is the actual indoor graph node set by buildIndoorOptions;
    // fall back to id for backwards compatibility.
    const sourceNodeId = normalizeIndoorKey(source.resolvedNodeId || source.id);
    const targetNodeId = normalizeIndoorKey(target.resolvedNodeId || target.id);
    const sourceFloor = normalizeFloor(ACTIVE_INDOOR_NODES[sourceNodeId]?.floor || source.floor);
    const targetFloor = normalizeFloor(ACTIVE_INDOOR_NODES[targetNodeId]?.floor || target.floor);
    const selectedTarget = { ...target, type: "room", floor: targetFloor };
    setIndoorStart({ name: source.name, nearestNode: sourceNodeId, floor: sourceFloor });
    setIndoorDestination(selectedTarget);
    setIndoorUserLocation({
      position: ACTIVE_INDOOR_NODES[sourceNodeId].position,
      nearestNode: sourceNodeId,
      floor: sourceFloor
    });
    setCurrentFloor(sourceFloor);
    setMapMode("INDOOR");
    if (sourceFloor !== targetFloor) {
      setIndoorRouteNodes([]);
      setIndoorRoute([]);
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

          const { path: path } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: sourceNodeId, endNodeId: targetNodeId },
        { startNode: sourceNodeId, endNode: targetNodeId, edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
    if (!path.length) {
      alert("Could not find a route between these indoor locations. The map data might be disconnected.");
      return;
    }

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));
    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const markIndoorDestinationReached = (reachedNode) => {
    const actualNode = ACTIVE_INDOOR_NODES[normalizeIndoorKey(reachedNode.id)];
    if (!actualNode?.position) return;

    // Completing an indoor route makes the room the user's next start point.
    // This keeps every subsequent indoor search anchored at the destination.
    const resolvedFloor = normalizeFloor(actualNode.floor || reachedNode.floor);
    const resolvedName = actualNode.label || reachedNode.name || reachedNode.id;
    setIndoorStart({ name: resolvedName, nearestNode: reachedNode.id, floor: resolvedFloor });
    setIndoorUserLocation({ position: actualNode.position, nearestNode: reachedNode.id, floor: resolvedFloor });
    setIndoorDestination(null);
    setDestination({ id: reachedNode.id, name: resolvedName, floor: resolvedFloor, type: "room" });
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setCurrentFloor(resolvedFloor);
    setShowNavigationCard(true);
    pushState(STEPS.COMPLETED);
  };

  console.log(indoorUserLocation);

  const startIndoorNavigation = async () => {

    if (!indoorStart || !indoorDestination) return;



    // Destination is on the same floor

    if (currentFloor === indoorDestination.floor) {
      pushState(STEPS.FLOOR_NAVIGATION);

      const { path: path } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: indoorStart.nearestNode, endNodeId: indoorDestination.id },
        { startNode: indoorStart.nearestNode, endNode: indoorDestination.id, edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
      setIndoorRouteNodes(path);

      setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));



      pushState(STEPS.FLOOR_NAVIGATION);
      setIsCalculatingRoute(false);
      return;

    }



    // Destination is on another floor

    pushState(STEPS.FLOOR_CHOICE);

  };

  const startIndoorToOutdoorNavigation = async () => {
    console.log("Indoor -> Outdoor");
    console.log("Current floor:", currentFloor);

    if (!indoorStart || !destination) {
      console.log("Missing indoorStart or destination");
      return;
    }
    const needsFloorChangeToExit = currentBuilding === "chavara"
      ? currentFloor !== "G"
      : ["1", "2"].includes(currentFloor);

    if (needsFloorChangeToExit) {
      pushState(STEPS.FLOOR_CHOICE);
      return;
    }

    const exitNode = getExitNode(currentFloor, indoorDestination || destination);
    console.log("Exit node:", exitNode);

    if (indoorStart.nearestNode === exitNode) {
      console.log("Already at exit");
      switchToOutdoorNavigation();
      return;
    }

          const { path: path } = await routeIndoor(
        { building: isChavaraBuilding(currentBuilding) ? "chavara" : "stmarys", startNodeId: indoorStart.nearestNode, endNodeId: exitNode },
        { startNode: indoorStart.nearestNode, endNode: exitNode, edges: ACTIVE_INDOOR_EDGES, nodes: ACTIVE_INDOOR_NODES }
      );
      
    console.log("Indoor path:", path);

    setIndoorRouteNodes(path);
    setIndoorRoute(getPathCoordinates(path, ACTIVE_INDOOR_NODES));

    const startPosition = ACTIVE_INDOOR_NODES[normalizeIndoorKey(indoorStart.nearestNode)]?.position;
    if (startPosition) {
      setIndoorUserLocation({
        position: startPosition,
        nearestNode: indoorStart.nearestNode,
        floor: currentFloor,
      });
    }

    pushState(STEPS.FLOOR_NAVIGATION);
  };

  const switchToOutdoorNavigation = () => {
    const reachedExitNode = indoorRouteNodes[indoorRouteNodes.length - 1] || indoorStart?.nearestNode;
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setMapMode("OUTDOOR");

    const exitNode = getOutdoorExitNode(reachedExitNode) || floorEntryMap[currentFloor] || "g";
    console.log("switchToOutdoorNavigation: exitNode =", exitNode, "reachedExitNode =", reachedExitNode, "destination =", destination);

    // Build the outdoor route. We pass the exitNode as the start so the
    // pathfinder begins at the building exit rather than the GPS position.
    // startOutdoorNavigation calls pushState(STEPS.AT_BUILDING) internally,
    // so we do NOT override navStep here.
    startOutdoorNavigation(exitNode);
  };

  useEffect(() => {
    if (mapMode !== "INDOOR" || !indoorRouteNodes?.length || !indoorStart?.nearestNode) return;

    const activeNodeId = indoorRouteNodes[indoorRouteIndex];
    if (!activeNodeId) return;

    const activeNode = ACTIVE_INDOOR_NODES[normalizeIndoorKey(activeNodeId)];

    if (!activeNode?.position) return;

    const currentNodeId = indoorUserLocation?.nearestNode;
    if (!currentNodeId || currentNodeId !== activeNodeId) {
      setIndoorUserLocation({
        position: activeNode.position,
        nearestNode: activeNodeId,
        floor: activeNode.floor,
      });
      // Automatically switch map floor view if user transitions to a node on another floor
      if (currentFloor !== activeNode.floor && activeNode.floor !== "ALL") {
        setCurrentFloor(activeNode.floor);
      }
    }
  }, [mapMode, indoorRouteNodes, indoorRouteIndex, indoorStart?.nearestNode, indoorUserLocation?.nearestNode, currentFloor]);

  const areSamePosition = (a, b) => {
    if (!a || !b) return true;
    return Math.abs(a[0] - b[0]) < 0.000001 && Math.abs(a[1] - b[1]) < 0.000001;
  };
  const handleQRScan = (qrData) => {
    pushState(navStep);

    setScannedQR(qrData);


    // Outdoor QR
    if (qrData.type === "OUTDOOR") {

      setMapMode("OUTDOOR");

      setOutdoorStartNode(qrData.startNode);


      // Fix user location at QR position
      const qrNode = NODES[qrData.startNode];

      if (qrNode) {

        const position = qrNode.position || qrNode;

        setSnappedLocation({
          lat: position[0],
          lng: position[1],
        });


        setMapCenter({
          id: qrData.id,
          position: position,
        });

      }


      if (destination) {
        startOutdoorNavigation(qrData.startNode, { lat: position[0], lng: position[1] }, destination);
      } else {
        setNavStep(STEPS.IDLE);
      }

      return;
    }



    // Indoor QR
    const qrBuilding = qrData.building || (qrData.id?.includes("chavara") ? "chavara" : "stmarys");
    setCurrentBuilding(qrBuilding);

    setMapMode("INDOOR");

    setCurrentFloor(qrData.floor);


    setIndoorStart({

      name: qrData.name,

      nearestNode: qrData.startNode,

      floor: qrData.floor,

    });



    const targetNodes = qrBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
    const indoorPosition =
      targetNodes[qrData.startNode]?.position || ACTIVE_INDOOR_NODES[normalizeIndoorKey(qrData.startNode)]?.position;


    setIndoorUserLocation({

      position: indoorPosition,

      nearestNode: normalizeIndoorKey(qrData.startNode),

      floor: qrData.floor,

    });


    setMapCenter({

      id: qrData.id,

      position: indoorPosition,

    });

    setNavStep(STEPS.INDOOR_READY);
  };


  console.log("indoorStart:", indoorStart);

  useEffect(() => {
    if (DEMO_MODE) {
      // Push one history entry on load so the first Back press is absorbed
      // by the app's popstate handler instead of closing the browser tab/app.
      window.history.pushState({ demoBack: 'home' }, '');
    } else {
      window.history.replaceState(
        { campusRouteX: "outdoor" },
        "",
        window.location.pathname
      );
    }
  }, []);
  const changeFloor = (floor) => {
    pushState(navStep);
    setCurrentFloor(floor);
  };

  const isUserFloor =
    indoorUserLocation?.floor === currentFloor;

  const isDestinationFloor =
    normalizeFloor(destination?.floor) === currentFloor;


  const detectQRLocation = async () => {

    try {

      const gpsLocation = await getOneShotLocation();

      console.log("REAL GPS:", gpsLocation);


      const nearestQR =
        findNearestQRLocation(gpsLocation);


      console.log("Nearest QR:", nearestQR);


      if (nearestQR) {

        const snapped = {
          lat: nearestQR.position[0],
          lng: nearestQR.position[1]
        };


        console.log("Snapped user location:", snapped);


        // show user at QR position
        setSnappedLocation(snapped);


        // use this node for routing
        setOutdoorStartNode(
          nearestQR.startNode
        );


        setMapCenter({
          id: nearestQR.id,
          position: [
            nearestQR.position[0],
            nearestQR.position[1]
          ]
        });


        // stop GPS only after QR detection
        stopTracking();

      }

    }
    catch (error) {
      console.log(error);
    }

  };

  useEffect(() => {
    console.log("UPDATED SNAPPED LOCATION:", snappedLocation);
  }, [snappedLocation]);

  // QR detection is triggered only by explicit QR code scans (handleQRScan),
  // NOT on mount — auto-running it snaps the user dot to a QR position and
  // stops the GPS watch, preventing real location tracking.
  // useEffect(() => {
  //   if (USE_DEBUG_LOCATION) return;
  //   detectQRLocation();
  // }, []);
  const handleSelectLocation = async (location) => {
    pushState(navStep);
    if (
      mapMode === "INDOOR" &&
      indoorUserLocation &&
      currentFloor !== indoorUserLocation.floor
    ) {
      setCurrentFloor(indoorUserLocation.floor);
      if (ACTIVE_INDOOR_NODES[normalizeIndoorKey(indoorUserLocation.nearestNode)]) {
        setIndoorStart({
          name: ACTIVE_INDOOR_NODES[normalizeIndoorKey(indoorUserLocation.nearestNode)].label,
          nearestNode: indoorUserLocation.nearestNode,
          floor: indoorUserLocation.floor,
        });
      }
    }

    // Faculty without room number fallback
    if (location.type === "faculty" && !location.room) {
      const chavaraLocation = {
        id: "chavara",
        name: location.department,
        type: "location",
        routeNode: "chavara",
        block: "St Chavara Block",
        message: "This department is located on the 2nd floor of St Chavara Block.",
      };
      setSelectedLocation(chavaraLocation);
      setDestination(chavaraLocation);
      if (mapMode !== "INDOOR") {
        setMapMode("OUTDOOR");
        setNavStep(STEPS.IDLE);
      } else {
        setNavStep(STEPS.IDLE);
      }
      // ── Outside campus: just show destination pin, no nav card ──
      const currentGPS = snappedLocation || fixedUserLocation || locationToUse;
      if (!isInsideCampus(currentGPS)) {
        setRoute([]);
        setShowNavigationCard(false);
        setNavStep(STEPS.IDLE);
        const destPos = NODES["chavara"];
        if (destPos) setMapCenter({ id: `dest-focus-${Date.now()}`, position: destPos });
        return;
      }
      setShowNavigationCard(true);
      return;
    }

    setRoute([]);
    setIndoorRoute([]);
    setIndoorRouteNodes([]);
    setIsOutdoorNavigating(false);
    setLastNearestNode(null);

    // ── OUTSIDE CAMPUS HANDLING ─────────────────────────────────────────────
    // When the user's GPS shows they are not on campus, normal routing isn't
    // possible (no start node available). Instead:
    //   • Outdoor destination → just drop a red pin and center the map.
    //   • Indoor destination  → show the preview modal, then switch to the
    //                           matching floor plan with the destination pin only if confirmed.
    const currentGPS = snappedLocation || fixedUserLocation || locationToUse;
    if (!isInsideCampus(currentGPS)) {
      setShowNavigationCard(false);
      setNavStep(STEPS.IDLE);
      if (isIndoorDestination(location)) {
        // Show the indoor preview modal without switching mapMode yet
        setOutsideCampusTarget(location);
      } else {
        // Outdoor destination: pin only, no route
        setSelectedLocation(location);
        setDestination(location);
        setIndoorDestination(location);
        const destPos =
          location.position ||
          (location.routeNode ? NODES[location.routeNode] : null) ||
          (location.id ? NODES[location.id] : null);
        if (destPos) {
          setMapCenter({ id: `dest-focus-${Date.now()}`, position: destPos });
        }
      }
      return;
    }
    // ── END OUTSIDE CAMPUS ──────────────────────────────────────────────────

    setSelectedLocation(location);
    setDestination(location);
    setIndoorDestination(location);

    const shouldUseIndoorFlow =
      mapMode === "INDOOR" || scannedQR?.type === "INDOOR";

    if (shouldUseIndoorFlow) {
      setMapMode("INDOOR");
      const sourceNode = indoorUserLocation?.nearestNode || indoorStart?.nearestNode;
      if (sourceNode) {
        const isDestChav = isChavaraBuilding(location.building) || location.routeNode === "chavara";
        const isCurrentChav = currentBuilding === "chavara";
        const isDifferentBuilding = isDestChav !== isCurrentChav;
        const sourceOpt = {
          id: sourceNode,
          name: indoorStart?.name || ACTIVE_INDOOR_NODES[normalizeIndoorKey(sourceNode)]?.label || sourceNode,
          floor: currentFloor
        };
        const targetOpt = {
          id: location.indoorNode || location.id,
          name: location.name,
          type: location.type,
          floor: location.floor,
          building: location.building,
          outdoor: isDifferentBuilding,
          routeNode: location.routeNode || location.id,
          indoorNode: location.indoorNode || location.id,
        };
        await runManualIndoorRoute(sourceOpt, targetOpt);
        // navStep is now FLOOR_NAVIGATION (or FLOOR_CHOICE) — card auto-shows
      } else {
        setShowNavigationCard(true);
        setNavStep(STEPS.INDOOR_READY);
      }
    } else {
      setMapMode("OUTDOOR");
      // ⭐ Decide outdoor destination building
      if (location.building && location.building.toLowerCase().includes("stmarys")) {
        setOutdoorTarget("stmarys_entrance");
      }
      else if (isChavaraBuilding(location.building)) {
        setOutdoorTarget("chavara");
      }
      else if (location.building === "canteen") {
        setOutdoorTarget("canteen");
      }
      await previewOutdoorRoute(location);
      setShowNavigationCard(true);
      setNavStep(STEPS.OUTDOOR_ROUTE);
    }
  };

  console.log({
    navStep,
    OUTDOOR_ROUTE: STEPS.OUTDOOR_ROUTE,
    isOutdoorNavigating,
    mapMode,
    destination,
  });




  const hasBottomCard = (showNavigationCard && (
    navStep === STEPS.AT_BUILDING ||
    navStep === STEPS.COMPLETED
  )) || (
      destination && navStep === STEPS.OUTDOOR_ROUTE
    );

  const activeIndoorDest = indoorDestination || destination;
  const destBuildingNormalized = isChavaraBuilding(activeIndoorDest?.building || activeIndoorDest?.routeNode) ? "chavara" : "stmarys";
  const isDifferentBldg = currentBuilding !== destBuildingNormalized;
  const isLocalIndoorDest = Boolean(activeIndoorDest?.floor) && !isDifferentBldg;
  const displayTargetFloor = isLocalIndoorDest ? normalizeFloor(activeIndoorDest.floor) : "G";

  if (currentScreen !== 'map') {
    return (
      <div id="kiosk-app" className={`app-root theme-${theme}`}>
        {currentScreen === 'landing' && (
          <LandingScreen
            onStart={() => {
              audioService.playClick();
              setCurrentScreen('instructions');
            }}
            currentTime={currentTime}
            theme={theme}
            onToggleTheme={() => {
              audioService.playClick();
              setTheme(prev => prev === 'light' ? 'dark' : 'light');
            }}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              setSoundEnabled(prev => {
                if (!prev) audioService.playClick();
                return !prev;
              });
            }}
            language="en"
          />
        )}
        {currentScreen === 'instructions' && (
          <InstructionDashboard
            onViewMap={() => {
              audioService.playClick();
              setCurrentScreen('map');
            }}
            onGoHome={() => setCurrentScreen('landing')}
            onSelectService={(category, floor = 1) => {
              audioService.playClick();
              setCurrentFloor(floor);
              setCurrentScreen('map');
            }}
            onOpenClassrooms={() => {
              audioService.playClick();
              setCurrentScreen('classrooms');
            }}
            onOpenFaculty={() => {
              audioService.playClick();
              setCurrentScreen('faculty');
            }}
            currentTime={currentTime}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
            language="en"
          />
        )}
        {currentScreen === 'classrooms' && (
          <ClassroomsScreen
            classrooms={bottomSheetData.classrooms}
            onBack={() => setCurrentScreen('instructions')}
            onGoHome={() => setCurrentScreen('landing')}
            onSelectClassroom={(cls) => {
              audioService.playClick();
              setDestination(cls);
              if (isIndoorDestination(cls)) {
                setCurrentBuilding(isChavaraBuilding(cls.building) ? "chavara" : "stmarys");
                setCurrentFloor(cls.floor || "G");
                setMapMode("INDOOR");
                setNavStep(STEPS.INDOOR_READY);
              }
              setCurrentScreen('map');
            }}
            currentTime={currentTime}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
            language="en"
          />
        )}
        {currentScreen === 'faculty' && (
          <FacultyScreen
            departments={bottomSheetData.departments}
            onBack={() => setCurrentScreen('instructions')}
            onGoHome={() => setCurrentScreen('landing')}
            onSelectFaculty={(fac) => {
              audioService.playClick();
              setDestination(fac);
              if (isIndoorDestination(fac)) {
                setCurrentBuilding(isChavaraBuilding(fac.building) ? "chavara" : "stmarys");
                setCurrentFloor(fac.floor || "G");
                setMapMode("INDOOR");
                setNavStep(STEPS.INDOOR_READY);
              }
              setCurrentScreen('map');
            }}
            currentTime={currentTime}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
            language="en"
          />
        )}
        <QrModal
          isOpen={!!qrModalPoi}
          poi={qrModalPoi}
          onClose={() => setQrModalPoi(null)}
        />
        <InactivityModal
          isOpen={isInactivityWarningOpen}
          remainingSeconds={remainingWarningSeconds}
          totalWarningSeconds={10}
          onStay={() => {
            audioService.playClick();
            setIsInactivityWarningOpen(false);
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
          }}
        />
      </div>
    );
  }

  return (

    <main className="app-shell flex flex-col h-screen overflow-hidden bg-gray-100">
      <LoadingScreen
        isLoading={isAppLoading || dbLoading}
        gpsStatus={gpsStatus}
        onExplore={() => setIsAppLoading(false)}
      />

      {/* ── Map Container Wrapper ────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-white z-1300">
        
        {currentScreen === 'map' && (
          <button 
            className="kiosk-map-home-btn"
            title="Return to Welcome Screen"
            onClick={() => {
              audioService.playClick();
              resetToLanding();
            }}
          >
            <Home size={30} color="#ffffff" />
          </button>
        )}

        {/* ── QR Simulator (dev/testing) ───────────────────────────────────── */}

        {SHOW_SIMULATE_QR && <div className="qr-simulator-container">
          <button
            className="qr-simulator-toggle"
            onClick={() => setQrSimOpen((o) => !o)}
            title="QR location simulator"
            aria-label="Toggle QR location simulator"
          >
            📍 {qrSimOpen ? "Close" : "Simulate QR"}
          </button>

          {qrSimOpen && (
            <div className="qr-simulator-panel">
              <h4>📱 Simulate QR Scan</h4>
              <p className="panel-desc">
                Tap a location to jump there instantly — same as scanning a physical QR code on campus.
              </p>
              <button className="qr-simulate-btn" style={{ marginBottom: "10px", background: "#fef08a", color: "#854d0e" }} onClick={() => {
                gpsFallbackShown.current = false;
                setQrSimOpen(false);
                triggerIndoorFallback();
              }}>
                <span className="qr-icon">⚠️</span>
                <span className="qr-btn-text"><strong>Test Poor GPS Fallback</strong></span>
              </button>
              <div className="qr-buttons">
                {QR_LOCATIONS.map((qr) => (
                  <button
                    key={qr.id}
                    className="qr-simulate-btn"
                    onClick={() => {
                      setQrSimOpen(false);
                      handleQRScan(qr);
                    }}
                  >
                    <span className="qr-icon">
                      {qr.type === "INDOOR" ? "🏢" : "🗺️"}
                    </span>
                    <span className="qr-btn-text">
                      <strong>{qr.name}</strong>
                      <small>
                        {qr.type === "INDOOR"
                          ? `Indoor · Floor ${qr.floor}`
                          : "Outdoor"
                        } · node: {qr.startNode}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>}

        {/* ── Floating Search & Chips Overlay ─────────────────────────────────── */}
        <div className="absolute top-[env(safe-area-inset-top,16px)] left-0 right-0 flex flex-col z-1500 pointer-events-none mt-2">

          {/* DEMO MODE: show a simple search bar in indoor mode, skip YDCard */}
          {DEMO_MODE && mapMode === "INDOOR" && (
            <SearchBar
              currentFloor={currentFloor}
              isIndoorMode={true}
              clearRef={demoSearchClearRef}
              onSelect={(location) => {
                handleDemoSearch(location);
              }}
            />
          )}

          {/* INDOOR MODE (non-demo): always show YD Card */}
          {!DEMO_MODE && mapMode === "INDOOR" && [STEPS.IDLE, STEPS.INDOOR_READY, STEPS.COMPLETED].includes(navStep) && (
            <YDCard
              mode="indoor"
              currentFloor={currentFloor}
              activeIndoorNodes={ACTIVE_INDOOR_NODES}
              initialSource={indoorStart || indoorUserLocation}
              initialDestination={indoorDestination}
              onRoute={runManualIndoorRoute}
              onOutdoorNavigation={() => {
                if (destination && !isIndoorDestination(destination)) {
                  startIndoorToOutdoorNavigation();
                  return;
                }
                setIndoorRoute([]);
                setIndoorRouteNodes([]);
                setMapMode("OUTDOOR");
                setNavStep(STEPS.IDLE);
              }}
              onSourceSelect={(item) => {
                setAssumedIndoorMode(false);
                const floor = item.floor || "G";
                setCurrentFloor(floor);
                const rawNodeId = item.indoorNode || item.id || item.routeNode;
                const nodeId = Object.keys(ACTIVE_INDOOR_NODES).find(k => k.toLowerCase() === (rawNodeId || "").toLowerCase()) || rawNodeId;
                const node = ACTIVE_INDOOR_NODES[nodeId];
                if (node) {
                  setIndoorUserLocation({ position: node.position, nearestNode: nodeId, floor });
                  setIndoorStart({ name: item.name, nearestNode: nodeId, floor });
                }
              }}
              hintMessage={assumedIndoorMode ? "Enter your current location" : "Tap here to set your start location"}
            />
          )}

          {/* OUTDOOR MODE: single SearchBar (hasSearched=false) OR YD Card (hasSearched=true) */}
          {mapMode !== "INDOOR" && (
            <>
              {hasSearched ? (
                /* YD Card — shown after "Start Navigation" clicked */
                <YDCard
                  mode="outdoor"
                  currentFloor={currentFloor}
                  gpsLocationLabel="📍 Your Location"
                  outdoorDestinationName={destination?.name || destination?.id || ""}
                  onOutdoorSelect={(location) => {
                    setHasSearched(false);
                    const department = bottomSheetData.departments.find(
                      dept => dept.name === location.department
                    );
                    const faculty = department?.faculties.find(
                      f => f.name === location.name
                    );
                    if (location.type === "faculty" && faculty?.room) {
                      setSheetTitle("Faculty");
                      openBottomSheet("Faculty", bottomSheetData.departments);
                      setSheetOpen(true);
                      setSelectedDepartment({ ...department, faculties: [faculty] });
                    } else {
                      handleSelectLocation(location);
                    }
                  }}
                />
              ) : (
                /* Single search bar — initial outdoor state */
                <SearchBar
                  currentFloor={currentFloor}
                  isIndoorMode={false}
                  onSelect={(location) => {
                    const department = bottomSheetData.departments.find(
                      dept => dept.name === location.department
                    );
                    const faculty = department?.faculties.find(
                      f => f.name === location.name
                    );
                    if (location.type === "faculty" && faculty?.room) {
                      setSheetTitle("Faculty");
                      openBottomSheet("Faculty", bottomSheetData.departments);
                      setSheetOpen(true);
                      setSelectedDepartment({ ...department, faculties: [faculty] });
                    } else {
                      handleSelectLocation(location);
                    }
                  }}
                />
              )}
              {mapMode === "OUTDOOR" && navStep === STEPS.IDLE && !hasSearched && (
                <SearchChips onSelectCategory={handleSelectCategory} />
              )}
            </>
          )}

        </div>






        <Suspense fallback={
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500 font-semibold z-1300">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading Map View...
          </div>
        }>
          <CampusMap
            selectedLocation={selectedLocation}
            currentLocation={locationToUse}
            subscribeToLocation={subscribeToLocation}
            route={route}
            indoorRouteNodes={indoorRouteNodes}
            indoorRouteIndex={indoorRouteIndex}
            onNextIndoorStep={handleNextIndoorStep}
            currentFloor={currentFloor}
            mapMode={mapMode}
            destination={destination}
            mapCenter={mapCenter}
            indoorUserLocation={indoorUserLocation}
            setIndoorUserLocation={setIndoorUserLocation}
            indoorStart={indoorStart}
            setIndoorStart={setIndoorStart}
            isOutdoorNavigating={isOutdoorNavigating}
            useDebugLocation={USE_DEBUG_LOCATION}
            activeFloorImages={ACTIVE_FLOOR_IMAGES}
            activeIndoorNodes={ACTIVE_INDOOR_NODES}
            isIndoorNavigating={navStep === STEPS.FLOOR_NAVIGATION}
            onMyLocationClick={handleMyLocationClick}
            onSelectLocation={handleSelectLocation}
            hasBottomCard={hasBottomCard}
            sheetOpen={sheetOpen}
            onEnterBuilding={() => {
              const loc = USE_DEBUG_LOCATION ? USER_LOCATION : (location || null);
              if (!loc) return;

              const locLat = loc.lat !== undefined ? loc.lat : loc[0];
              const locLng = loc.lng !== undefined ? loc.lng : loc[1];

              const outdoorEntrances = ["b2", "b1", "g", "chavara", "p3"];
              let nearestEntrance = "g";
              let nearestDist = Infinity;

              outdoorEntrances.forEach((id) => {
                const node = NODES[id];
                if (!node || node.length < 2) return;
                const dx = node[0] - locLat;
                const dy = node[1] - locLng;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) {
                  nearestDist = dist;
                  nearestEntrance = id;
                }
              });

              const isChavara = nearestEntrance === "chavara" || nearestEntrance === "p3";
              const targetBuilding = isChavara ? "chavara" : "stmarys";
              const targetFloor = outdoorEntranceFloor[nearestEntrance] || "G";

              setMapMode("INDOOR");
              setCurrentBuilding(targetBuilding);
              setCurrentFloor(targetFloor);
              setManualIndoorMode(true);
            }}
          />
        </Suspense>

        {/* ── Indoor Home Button — always visible in indoor mode ────────────────── */}
        {mapMode === "INDOOR" && (
          <button
            id="indoor-home-btn"
            aria-label="Back to outdoor map"
            title="Back to outdoor map"
            onClick={() => {
              setIndoorRoute([]);
              setIndoorRouteNodes([]);
              setMapMode("OUTDOOR");
              setNavStep(STEPS.IDLE);
              setHasSearched(false);
            }}
            style={{
              position: "absolute",
              bottom: 28,
              right: 18,
              zIndex: 1500,
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
            <Home size={20} color="#2563eb" strokeWidth={2.2} />
            <span style={{ fontSize: 9, fontWeight: 700, color: "#2563eb", letterSpacing: 0.2 }}>
              Map
            </span>
          </button>
        )}





        {/* ── Indoor routing — now handled by YDCard in the overlay above ─────── */}

        {/* ── DEMO MODE: Destination Info Card ───────────────────────────────── */}
        {DEMO_MODE && showDestInfoCard && destInfoTarget && (
          <DestinationInfoCard
            destination={destInfoTarget}
            onViewIndoor={handleViewIndoorDestination}
            onClose={() => {
              setShowDestInfoCard(false);
              setDestInfoTarget(null);
            }}
          />
        )}

        {/* Outside Campus Indoor Preview Modal */}
        {outsideCampusTarget && (
          <OutsideCampusModal
            destination={outsideCampusTarget}
            onViewIndoor={() => {
              const loc = outsideCampusTarget;
              const targetBuilding = isChavaraBuilding(loc.building || loc.id || loc.routeNode) ? "chavara" : "stmarys";
              const targetFloor = normalizeFloor(loc.floor) || "G";
              setOutsideCampusTarget(null);
              setSelectedLocation(loc);
              setDestination(loc);
              setIndoorDestination(loc);
              setCurrentBuilding(targetBuilding);
              setCurrentFloor(targetFloor);
              setMapMode("INDOOR");
              setNavStep(STEPS.IDLE);
              setRoute([]);
              setIndoorRoute([]);
              setIndoorRouteNodes([]);
              setShowNavigationCard(false);
              // Center the indoor map on the destination node
              const activeNodes = targetBuilding === "chavara" ? CHAVARA_INDOOR_NODES : INDOOR_NODES;
              const nodeId = loc.indoorNode || loc.id;
              const node = activeNodes[nodeId];
              if (node?.position) {
                setMapCenter({ id: `indoor-dest-${Date.now()}`, position: node.position });
              }
            }}
            onClose={() => {
              setOutsideCampusTarget(null);
            }}
          />
        )}

        {/* ── Building Detection Modal (on-load GPS polygon check) ─────────────── */}
        {!DEMO_MODE && showBuildingModal && detectedBuilding && (

          <>
            <div className="modal-backdrop" />
            <section className="navigation-card building-modal">
              <div className="building-modal-icon">🏛️</div>
              <h3 className="building-modal-title">
                Are you inside <strong>{getBuildingDisplayName(detectedBuilding)}</strong>?
              </h3>
              <p className="building-modal-sub">
                We detected you may be near or inside {getBuildingDisplayName(detectedBuilding)}.
              </p>
              <div className="button-row">
                <button
                  className="primary-action"
                  onClick={() => {
                    setShowBuildingModal(false);
                    stopTracking();
                    setCurrentBuilding(detectedBuilding);
                    setAssumedIndoorMode(true);
                    setIndoorStart(null);
                    setIndoorUserLocation(null);
                    setMapMode("INDOOR");

                    const entranceNodeId = selectedEntrance || (detectedBuilding === "chavara" ? "chavara" : "g");
                    const entryFloor = outdoorEntranceFloor[entranceNodeId] || "G";
                    setCurrentFloor(entryFloor);

                    setManualIndoorMode(true);
                    setSelectedVerticalPrefix(null);
                    setRoute([]);
                    setNavStep(STEPS.INDOOR_READY);
                  }}
                >
                  Yes, I&rsquo;m inside
                </button>
                <button
                  className="secondary-action"
                  onClick={() => {
                    setShowBuildingModal(false);
                    // Snap user to nearest outdoor node to avoid placing them
                    // inside the building footprint.
                    const loc = USE_DEBUG_LOCATION ? USER_LOCATION : (location || null);
                    if (loc) {
                      const nearestNode = findNearestNode(loc, NODES);
                      setOutdoorStartNode(nearestNode);
                      setSnappedLocation(loc);
                    }
                    setMapMode("OUTDOOR");
                    setNavStep(STEPS.IDLE);
                  }}
                >
                  No, I&rsquo;m outside
                </button>
              </div>
            </section>
          </>
        )}

        {/* Subtle GPS accuracy badge — only visible when signal is very poor (>80m) */}
        {showAccuracyBadge && !showLocationAlert && (
          <div className="gps-accuracy-badge">
            <SignalLow size={12} />
            <span>Weak GPS signal</span>
          </div>
        )}

        {/* Location permission alert card */}
        {showLocationAlert && (
          <LocationAlertCard
            onRetry={async () => {
              gpsFallbackShown.current = false;
              startTracking();
              // Poll for up to 6s to see if permission was granted
              await new Promise((resolve) => setTimeout(resolve, 6000));
            }}
          />
        )}




        <BottomSheet

          open={sheetOpen}

          onClose={() => {
            closeBottomSheet();
          }}

          title={sheetTitle}

          data={sheetData}

          selectedDepartment={selectedDepartment}

          setSelectedDepartment={setSelectedDepartment}

          onSelectCategory={handleSelectCategory}

          onNavigate={handleSelectLocation}

        />





        <FloorSelector
          currentFloor={currentFloor}
          setCurrentFloor={changeFloor}
          mapMode={mapMode}
          destination={destination}
          activeFloorImages={ACTIVE_FLOOR_IMAGES}
        />



        {
          navStep === STEPS.OUTDOOR_ROUTE &&
          !isOutdoorNavigating && (
            <NavigationCard>
              <p>
                Destination: <strong>{destination?.name || destination?.id || "Selected Location"}</strong>
              </p>
              <div className="button-row">
                <button
                  className="primary-action"
                  onClick={() => {
                    console.log("Destination before start:", destination);
                    startOutdoorNavigation();
                  }}
                >
                  Start navigation
                </button>


              </div>
            </NavigationCard>
          )
        }
        {
          showNavigationCard &&
          navStep === STEPS.AT_BUILDING &&
          isIndoorDestination(destination) &&
          (
            <NavigationCard>
              <p>
                Have you reached the <strong>{outdoorEntranceFloor[selectedEntrance] || "Ground"} floor entrance</strong> of <strong>{isChavaraBuilding(destination?.building) ? "St Chavara Block" : "St Mary's Block"}</strong>?
              </p>
              <div className="button-row">
                <button
                  className="primary-action"
                  onClick={() => {
                    continueFromOutdoorEntrance();
                  }}
                >
                  I reached
                </button>
                <button
                  className="secondary-action"
                  onClick={() =>
                    setNavStep(STEPS.OUTDOOR_ROUTE)
                  }
                >
                  Not yet
                </button>
              </div>
            </NavigationCard>
          )
        }
        {
          showNavigationCard &&
          navStep === STEPS.COMPLETED &&
          destination && (

            <NavigationCard className="arrival-card">

              <div className="arrival-header">

                <div className="arrival-icon">
                  🎉
                </div>

                <div>
                  <h3>Destination Reached</h3>

                  <p>
                    {destination?.name || destination?.id || "Location"}
                  </p>
                </div>

              </div>


              <p className="feedback-text">
                How was your navigation experience?
              </p>


              <div className="arrival-actions">

                <button
                  className="primary-action"
                  onClick={finishNavigation}
                >
                  Finish
                </button>


                <button
                  className="feedback-btn"
                  onClick={openFeedbackForm}
                >
                  📝 Feedback
                </button>

              </div>

            </NavigationCard>

          )
        }


        {

          navStep === STEPS.FLOOR_CHOICE && (

            <NavigationCard>

              <p>
                {isLocalIndoorDest
                  ? (
                    <>
                      How do you want to go to the{" "}
                      <strong>{formatFloor(displayTargetFloor)}</strong>?
                    </>
                  )
                  : (
                    <>
                      You are on the <strong>{formatFloor(currentFloor)}</strong>. How do you want to reach the <strong>Ground Floor</strong> exit?
                    </>
                  )}
              </p>

              <div className="button-row">

                <button
                  className="primary-action"
                  onClick={() => startVerticalNavigation("stairs")}
                >
                  🪜 Stairs
                </button>

                <button
                  className="primary-action"
                  onClick={() => startVerticalNavigation("lift")}
                >
                  Lift
                </button>

              </div>

            </NavigationCard>

          )

        }



        {

          navStep === STEPS.GO_TO_FLOOR && (

            <NavigationCard>

              <p>
                {isLocalIndoorDest
                  ? <>Proceed to the <strong>{transportMode}</strong> and go to the <strong>{formatFloor(displayTargetFloor)}</strong>.</>
                  : <>Head to the <strong>{transportMode}</strong> and go down to the <strong>Ground Floor</strong> exit.</>
                }
              </p>

              <button className="primary-action" onClick={continueOnDestinationFloor}>
                {isLocalIndoorDest
                  ? `I Reached Floor ${displayTargetFloor}`
                  : "Reached Ground Floor"
                }
              </button>

            </NavigationCard>

          )

        }

        {mapMode === "INDOOR" && navStep === STEPS.FLOOR_NAVIGATION &&
          indoorArrivalReady &&
          isUserFloor && (
            currentFloor === indoorUserLocation?.floor && (() => {
              const activeIndoorTarget = indoorDestination || destination;
              const destBuildingNormalized = isChavaraBuilding(activeIndoorTarget?.building || activeIndoorTarget?.routeNode) ? "chavara" : "stmarys";
              const isDifferentBuilding = currentBuilding !== destBuildingNormalized;
              const isOutdoorDest = !isIndoorDestination(activeIndoorTarget) || isDifferentBuilding;
              const reachedNodeId = indoorRouteNodes.at(-1) || activeIndoorTarget?.indoorNode || activeIndoorTarget?.id;

              return (
                <NavigationCard>
                  <p>
                    {isOutdoorDest
                      ? <>You should now be near the <strong>building exit</strong>. Please confirm that you have arrived.</>
                      : <>You should now be near <strong>{activeIndoorTarget?.name || activeIndoorTarget?.id}</strong>. Please confirm that you have arrived.</>
                    }
                  </p>

                  <button
                    className="primary-action"
                    onClick={() => {
                      if (isOutdoorDest) {
                        setIndoorRoute([]);
                        setIndoorRouteNodes([]);
                        // User reached the available exit — hand off directly
                        // to outdoor navigation. This keeps one confirmation
                        // card in the indoor-to-outdoor flow.
                        switchToOutdoorNavigation();
                      } else {
                        markIndoorDestinationReached({
                          id: reachedNodeId,
                          name: activeIndoorTarget?.name || reachedNodeId,
                          floor: activeIndoorTarget?.floor,
                        });
                      }
                      // setTimeout(() => {
                      //   setShowNavigationCard(true);
                      // }, 3000);
                    }}
                  >
                    {isOutdoorDest ? "I have reached the exit" : "I reached"}
                  </button>
                </NavigationCard>
              );
            })()
          )}

        {
          showNavigationCard &&
          navStep === STEPS.AT_BUILDING &&
          !isIndoorDestination(destination) && (
            <NavigationCard>
              <p>
                Follow the highlighted route to{" "}
                <strong>{destination?.name || destination?.id}</strong>.
              </p>

              <button
                className="primary-action"
                onClick={() => {
                  pushState(STEPS.OUTDOOR_ARRIVED);
                }}
              >
                I reached
              </button>
            </NavigationCard>
          )
        }
        {
          showNavigationCard &&
          navStep === STEPS.OUTDOOR_ARRIVED &&
          !isIndoorDestination(destination) && (
            <NavigationCard>
              <p>
                You have arrived near <strong>{destination?.name || destination?.id}</strong>.
              </p>
              <button
                className="primary-action"
                onClick={() => {
                  pushState(STEPS.OUTDOOR_REACHED);
                }}
              >
                I reached
              </button>
            </NavigationCard>
          )
        }
        {
          showNavigationCard &&
          navStep === STEPS.OUTDOOR_REACHED &&
          !isIndoorDestination(destination) && (

            <NavigationCard className="arrival-card">

              <div className="arrival-header">

                <div className="arrival-icon">
                  🎉
                </div>

                <div>
                  <h3>Destination Reached</h3>
                  <p>{destination?.name || destination?.id}</p>
                </div>

              </div>

              <p className="feedback-text">
                How was your navigation experience?
              </p>

              <div className="arrival-actions">

                <button
                  className="primary-action"
                  onClick={finishNavigation}
                >
                  ✅ Finish
                </button>

                <button
                  className="feedback-btn"
                  onClick={openFeedbackForm}
                >
                  📝 Feedback
                </button>

              </div>

            </NavigationCard>

          )
        }

        {false && mapMode === "INDOOR" && navStep === STEPS.INDOOR_READY && (
          <NavigationCard>
            <p>
              {destination?.type === "room" || destination?.type === "faculty"
                ? <>Navigate to <strong>{destination?.name || destination?.id}</strong><br /><small>Indoor route</small></>
                : <>Navigate to <strong>{destination?.name || destination?.id}</strong><br /><small>Outdoor destination – you are inside the building</small></>
              }
            </p>
            <button
              className="primary-action"
              onClick={() => {
                if (destination?.type === "room" || destination?.type === "faculty") {
                  startIndoorNavigation();
                } else {
                  startIndoorToOutdoorNavigation();
                }
              }}
            >
              Start Navigation
            </button>
          </NavigationCard>
        )}

      </div>

    </main >

  );


  function NavigationCard({ children }) {

    return <section className="navigation-card">{children}</section>;

  }
}
function getStairNode(currentFloor, destinationFloor) {
  // If the user is on B2, only Stair B exists.
  if (currentFloor === "B2") {
    return "stairsB_B2";
  }

  // If the destination is B2, everyone must arrive through Stair B.
  if (destinationFloor === "B2") {
    switch (currentFloor) {
      case "B1":
        return "stairsB_B1";
      case "G":
        return "stairsB_G";
      case "1":
        return "stairsB_1";
      case "2":
        return "stairsB_2";
      default:
        return `stairsB_${currentFloor}`;
    }
  }

  // Otherwise use Stair A on the CURRENT floor.
  switch (currentFloor) {
    case "B1":
      return "stairsA_B1";
    case "G":
      return "stairsA_G";
    case "1":
      return "stairsA_1";
    case "2":
      return "stairsA_2";
    default:
      return `stairsA_${currentFloor}`;
  }
}
function isIndoorDestination(destination) {
  if (!destination) return false;

  // Pure outdoor landmark / building markers on the outdoor map
  if (
    destination.id === "chavara" ||
    destination.id === "st-marys-block" ||
    destination.id === "entrance" ||
    destination.id === "canteen" ||
    destination.id === "cafe" ||
    destination.id === "cafe1" ||
    destination.id === "cafe-2" ||
    destination.id === "auditorium" ||
    destination.id === "joseph" ||
    (destination.type === "location" && !destination.floor && !destination.indoorNode) ||
    (destination.type === "facility" && !destination.floor && !destination.indoorNode) ||
    (destination.type === "building" && !destination.floor && !destination.indoorNode)
  ) {
    return false;
  }

  if (destination.type === "room" || destination.type === "faculty" || destination.indoorNode) {
    return true;
  }

  const isStMarys =
    destination.building === "stmarys" ||
    destination.building === "St Mary's Block" ||
    destination.routeNode === "st-marys-block";

  const isChavara =
    isChavaraBuilding(destination.building) ||
    destination.routeNode === "chavara";

  if (isStMarys || isChavara) {
    return Boolean(destination.floor || destination.indoorNode || destination.room);
  }

  const f = destination.floor ? destination.floor.toString().toUpperCase() : "";
  return f.startsWith("B2") || f.startsWith("B1") || f.startsWith("G") || /^[1-6]/.test(f);
}

function getStairNodeForBuilding(currentFloor, destinationFloor, building) {
  if (building === "chavara") {
    const isChPrefix = ["G", "1", "2"].includes(currentFloor.toString());
    return isChPrefix ? `ch_stairsA_${currentFloor}` : `stairsA_${currentFloor}`;
  }
  return getStairNode(currentFloor, destinationFloor);
}

// Admin lazy imports to prevent map bundle bloat
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ControlPanel = lazy(() => import("./pages/ControlPanel"));

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen isLoading={true} />}>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/*" element={<ControlPanel />} />
      </Routes>
    </Suspense>
  );
}
