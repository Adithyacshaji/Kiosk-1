# Smart Campus Navigation - UI Components & Frontend Details

## UI Architecture Overview

The application frontend is structured into specific domains to handle the dual nature of the application (Kiosk vs. Mobile). UI components are primarily located in `src/components/`.

### 1. Kiosk Components (`src/components/kiosk/`)

These components are designed for the 32-inch horizontal touch display. They prioritize large touch targets, clear typography, and a split-screen layout.

- **`KioskMapLayout.jsx`**: The root layout wrapper for the kiosk interface. It manages a two-column design:
  - Left Column (62% width): Renders the interactive `CampusMap`.
  - Right Column (38% width): Renders the `KioskSidePanel` when a destination is selected.
- **`KioskSidePanel.jsx`**: The primary interaction hub once a location is chosen.
  - **Interactivity**: Contains buttons for "View Indoor Floor Map" (clickable only if the destination has indoor routing), "Search Another Location" (resets state), and a close button.
  - **Dynamic Content**: Displays location metadata (Building, Floor, Room Code) and dynamically renders icons/colors based on the category (e.g., green for Faculty, blue for Classrooms).
  - **QR Handoff**: Integrates `KioskQRCode` to generate a dynamic link for mobile handoff.
- **`KioskFloatingSearch.jsx`**: A floating search bar overlaid on the map. It expands into a full virtual keyboard interface.
- **`VirtualKeyboard.jsx`**: A custom on-screen keyboard tailored for kiosk touch interactions, handling search input without relying on the OS native keyboard.
- **`LandingScreen.jsx`**: The idle state screen showcasing campus visuals and a primary "Touch to Start" interaction.
- **`InactivityModal.jsx`**: A warning dialog that appears after 50 seconds of inactivity, counting down 10 seconds before resetting the kiosk to the `LandingScreen`.

### 2. Common Components (`src/components/common/`)

These are shared elements used across both mobile and kiosk views.

- **`SearchBar.jsx`**: The core search input. Includes auto-complete suggestions pulling from `SEARCH_ITEMS`, `locations`, `classrooms`, and `faculty`.
- **`SearchChips.jsx`**: Quick-filter buttons (e.g., "Faculty", "Labs", "Canteen") that instantly populate the search or filter the map view.
- **`BottomSheet.jsx`**: Crucial for the mobile experience. Slides up from the bottom to show location details, mimicking native map applications. 
- **`YDCard.jsx`** & **`DestinationInfoCard.jsx`**: Reusable cards displaying destination summaries, routing instructions, and estimated walking times.
- **`LoadingScreen.jsx`**: Handles initial app load and Supabase data fetching states.

### 3. Map Components (`src/components/map/`)

- **`CampusMap.jsx`**: The core Leaflet map instance. Handles rendering outdoor polygons, indoor floor plans (as image overlays), routing polylines, and user location markers.
- **`FloorSelector.jsx`**: A vertical UI widget allowing users to manually toggle between floors (G, 1, 2, 3, B1, B2) when viewing an indoor building.

### 4. Interactive Elements & Clickability

- **Buttons & Touch Targets**: All interactive elements (especially in the `kiosk/` folder) are styled with generous padding (minimum 44x44px touch target) and distinct active/hover states using TailwindCSS classes (e.g., `active:scale-95`, `hover:bg-gray-100`).
- **Map Interactions**: The Leaflet map supports pinch-to-zoom, panning, and tap-to-select on POI markers.
- **QR Codes**: The `KioskQRCode` component generates scannable codes. These are not clickable on the kiosk itself but serve as the bridge to mobile.
- **State Management**: Button clicks (like "Start Navigation" or "View Indoor Location") trigger state changes in `App.jsx`, altering the `navStep` and `mapMode` (OUTDOOR/INDOOR), which in turn unmounts/mounts corresponding UI panels.

## Styling System

- **TailwindCSS**: Primary utility framework used for rapid UI development.
- **Custom CSS**: 
  - `App.css`: Global styles and mobile-specific tweaks.
  - `kiosk.css`: Kiosk-specific layout rules, large typography definitions, and specific animations for panel sliding.
- **Theming**: The application supports a light/dark theme toggle, managed via state and CSS custom properties.

## Responsive Design Strategy

The application does not rely solely on CSS media queries. `App.jsx` actively detects the environment (`checkIsMobileOrPhoneSession()`) checking URL parameters (`?kiosk=true`) and User-Agent strings. 
- If mobile: Renders the map full screen with `BottomSheet` and `YDCard` overlays.
- If kiosk: Renders the `KioskMapLayout` split-screen interface.
