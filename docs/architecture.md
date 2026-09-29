# Smart Campus Navigation - Architecture Documentation

## Overview
The Smart Campus application is a React-based navigation system designed for both physical kiosk terminals and mobile devices. It provides seamless indoor and outdoor routing across the campus, featuring an interactive map, location search, and QR code handoff from kiosk to mobile.

## Technology Stack
- **Frontend Framework**: React (v19) with Vite
- **Routing**: React Router DOM
- **Map Engine**: Leaflet & React-Leaflet
- **Styling**: TailwindCSS & Custom CSS (App.css, kiosk.css)
- **Backend/Database**: Supabase (for locations, nodes, edges, rooms, faculty data)
- **State Management**: React Context (`DatabaseContext.jsx`) & local state

## System Architecture

The application is architected around a central state machine in `App.jsx` that manages the user's navigation journey. 

### 1. Navigation State Machine (STEPS)
The routing flow is governed by the `STEPS` enum in `App.jsx`:
- `IDLE`: Default state, showing the landing screen or search interface.
- `OUTDOOR_ROUTE`: Calculating/displaying the path to a building entrance.
- `OUTDOOR_NAVIGATING`: Active outdoor navigation.
- `OUTDOOR_ARRIVED` / `GO_TO_ENTRANCE`: Approaching the building.
- `FLOOR_CHOICE`: Selecting the appropriate floor once inside.
- `FLOOR_NAVIGATION`: Active indoor navigation to the specific room/node.
- `COMPLETED`: Destination reached.

### 2. Core Modules

#### Routing & Pathfinding (`src/routing/`, `src/utils/`)
- **Graph Data**: The campus is modeled as a set of nodes and edges (stored in `src/data/` and Supabase). It includes `outdoorNodes`, `outdoorEdges`, and specific indoor graphs (e.g., `chavaraIndoorNodes`, `st-marys`).
- **Pathfinding Algorithm**: Uses Dijkstra's algorithm (implemented in `findPath.js`) to calculate the shortest path between nodes.
- **Geofencing & GPS**: `useCurrentLocation.js` hook manages geolocation. `geofence.js` and `isInsideCampus.js` handle logic for checking if a user is within building polygons or campus boundaries.

#### Data Layer (`src/context/DatabaseContext.jsx`)
- Provides a centralized store for all map data fetched from Supabase.
- Stores `locations`, `nodes`, `edges`, `rooms`, `searchItems`, and `bottomSheetData`.

#### UI Modes
The app adapts its UI based on the device and context:
- **Kiosk Mode**: Triggered on the physical terminal (`isMobileOrQrSession === false`). Features a full-screen map with a side panel (`KioskMapLayout`, `KioskSidePanel`), a floating search bar, and an inactivity timeout that resets to a `LandingScreen`.
- **Mobile Mode**: Triggered on phones or via scanned QR codes. Features mobile-optimized components like `BottomSheet`, `YDCard`, and direct navigation prompts.

### 3. Application Flow
1. **Initialization**: App loads, fetches data from Supabase (`DatabaseContext`), and determines the device mode (Kiosk vs Mobile).
2. **Search/Selection**: User selects a destination via `SearchBar`, `SearchChips`, or QR code URL parameters.
3. **Routing Decision**: 
   - If destination is outdoor: Calculate outdoor path from current location/kiosk to destination node.
   - If destination is indoor: 
     - Calculate outdoor path to the nearest building entrance.
     - Transition to indoor map mode.
     - Calculate indoor path from entrance to specific room/node.
4. **Navigation**: User follows the drawn path (`CampusMap`, `IndoorRoutingCard`).
5. **Handoff**: Kiosk displays a dynamic QR code (`KioskQRCode`) that transfers the current navigation session to a mobile device via URL parameters (`?dest=...&floor=...`).

### 4. Key Utilities
- `haversine.js`: Calculates physical distance between GPS coordinates.
- `findNearestNode.js`: Maps a user's GPS coordinate to the closest graph node for routing.
- `openGoogleMaps.js`: Fallback/external routing for getting to the campus.

## Directory Structure
- `/src/components`: UI components categorized by domain (`admin`, `common`, `map`, `kiosk`, `routing`).
- `/src/context`: React Context providers.
- `/src/data`: Hardcoded graph data, polygons, and fallback data.
- `/src/hooks`: Custom React hooks (e.g., `useCurrentLocation`).
- `/src/pages`: Top-level route pages (e.g., `ControlPanel`, `AdminLogin`).
- `/src/routing`: Router logic for indoor/outdoor path combination.
- `/src/utils`: Helper functions and algorithms.
