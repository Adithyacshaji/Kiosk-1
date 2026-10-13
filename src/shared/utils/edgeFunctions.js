/**
 * edgeFunctions.js
 *
 * Thin wrappers around the Supabase Edge Functions for routing and geofencing.
 * Each function calls the edge function first; on any error it transparently
 * falls back to the existing local client-side logic.
 *
 * Pattern:
 *   const result = await routeIndoor(params, fallbackArgs);
 */

import { findPath } from './findPath';
import { detectNearbyBuilding } from './buildingPolygons';

// ── Indoor routing ────────────────────────────────────────────────────────────

/**
 * Compute an indoor path using local A*.
 *
 * @param {object} params
 *   - building {string}      "stmarys" | "chavara"
 *   - startNodeId {string}
 *   - endNodeId {string}
 *   - transportPref {string} "any" | "stairs" | "lift"
 * @param {object} fallbackArgs
 *   - startNode {string}
 *   - endNode {string}
 *   - edges {Array}
 *   - nodes {object}
 * @returns {{ path: string[], coordinates: [number,number][] }}
 */
export async function routeIndoor(params, fallbackArgs) {
  const { startNode, endNode, edges, nodes } = fallbackArgs;
  const path = findPath(startNode, endNode, edges, nodes);
  const coordinates = path.map((id) => nodes[id]?.position).filter(Boolean);
  return { path, coordinates };
}

// ── Outdoor routing ───────────────────────────────────────────────────────────

/**
 * Compute an outdoor path using local A*.
 *
 * @param {object} params
 *   - startNodeId {string}
 *   - endNodeId {string}
 * @param {object} fallbackArgs
 *   - startNode {string}
 *   - endNode {string}
 *   - edges {Array}
 *   - nodes {object}
 * @returns {{ path: string[], coordinates: [number,number][] }}
 */
export async function routeOutdoor(params, fallbackArgs) {
  const { startNode, endNode, edges, nodes } = fallbackArgs;
  const path = findPath(startNode, endNode, edges, nodes);
  const coordinates = path.map((id) => {
    const n = nodes[id];
    return n ? [n[0], n[1]] : null;
  }).filter(Boolean);
  return { path, coordinates };
}

// ── Geofence ──────────────────────────────────────────────────────────────────

/**
 * Check which campus zone a GPS coordinate is in via local polygon check.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {{ zone: string|null, displayName: string|null, confidence: string }}
 *   zone: "chavara" | "stmarys" | "campus" | null  (no "offcampus")
 */
export async function geofence(lat, lng) {
  const zone = detectNearbyBuilding(lat, lng);
  return { zone, displayName: null, confidence: 'low' };
}
