import L from "leaflet";

/**
 * Locked indoor coordinate bounds — independent of floor PNG pixel dimensions.
 * ImageOverlay always maps to these bounds; swapping a higher-res image does
 * not shift node or edge positions.
 *
 * IMPORTANT: Do not change these values unless you intentionally re-calibrate
 * all INDOOR_NODES positions.
 */
export const LOCKED_INDOOR_BOUNDS_RAW = [
  // Original floor-plan calibration. These values align the existing
  // INDOOR_NODES with the PNG artwork and must remain unchanged when floor
  // images are replaced with higher-resolution exports.
  [10.35782, 76.21286],  // South-West
  [10.35796, 76.21300],  // North-East
];

export const LOCKED_INDOOR_BOUNDS = L.latLngBounds(
  LOCKED_INDOOR_BOUNDS_RAW[0],
  LOCKED_INDOOR_BOUNDS_RAW[1]
);

/** Logical grid size for optional CRS.Simple migration later. */
export const INDOOR_GRID = {
  width: 1000,
  height: 800,
};

/**
 * Convert a lat/lng position into normalized grid coords within locked bounds.
 * Useful if you migrate to CRS.Simple later.
 */
export function latLngToGrid(lat, lng) {
  const [[swLat, swLng], [neLat, neLng]] = LOCKED_INDOOR_BOUNDS_RAW;
  const y = ((lat - swLat) / (neLat - swLat)) * INDOOR_GRID.height;
  const x = ((lng - swLng) / (neLng - swLng)) * INDOOR_GRID.width;
  return [y, x];
}
