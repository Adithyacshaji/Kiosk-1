import { NODES } from "../../data/graph";
import { calculateHaversineDistance } from "./haversine";

/** Outdoor graph node IDs for St Mary's Block's three distinct entrances. */
export const ST_MARYS_ENTRANCE_NODES = ["g", "b1", "b2"];

export function findBestStMarysEntranceByPath(startNode, edges, userLocation = null, customNodes = null) {
  const nodesToUse = customNodes || NODES;
  if (!startNode || !edges) {
    return findNearestStMarysEntrance(userLocation, nodesToUse);
  }

  // Lightweight Dijkstra for St Mary's entrances
  const graph = {};
  for (const edge of edges) {
    const a = Array.isArray(edge) ? edge[0] : edge.source;
    const b = Array.isArray(edge) ? edge[1] : edge.target;
    const posA = nodesToUse[a];
    const posB = nodesToUse[b];
    const w = posA && posB
      ? calculateHaversineDistance(posA[0], posA[1], posB[0], posB[1])
      : 1;
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push({ node: b, weight: w });
    graph[b].push({ node: a, weight: w });
  }

  const dist = {};
  const visited = new Set();
  for (const n in graph) dist[n] = Infinity;
  if (!(startNode in dist)) dist[startNode] = Infinity;
  dist[startNode] = 0;

  while (true) {
    let u = null, minD = Infinity;
    for (const n in dist) {
      if (!visited.has(n) && dist[n] < minD) { minD = dist[n]; u = n; }
    }
    if (u === null) break;
    visited.add(u);
    // early exit once all St Marys targets are settled
    if (ST_MARYS_ENTRANCE_NODES.every(n => visited.has(n))) break;
    for (const { node, weight } of (graph[u] || [])) {
      if (!visited.has(node)) {
        const nd = dist[u] + weight;
        if (nd < (dist[node] ?? Infinity)) dist[node] = nd;
      }
    }
  }

  let bestNodeId = "g";
  let bestDist = Infinity;
  for (const nodeId of ST_MARYS_ENTRANCE_NODES) {
    const d = dist[nodeId] ?? Infinity;
    if (d < bestDist) { bestDist = d; bestNodeId = nodeId; }
  }

  // If Dijkstra gave no useful result, fall back to GPS straight-line
  if (bestDist === Infinity) {
    return findNearestStMarysEntrance(userLocation, nodesToUse);
  }

  return { nodeId: bestNodeId, distanceMeters: bestDist, position: nodesToUse[bestNodeId] };
}

/**
 * Compare GPS distance from the user to all St Mary's entrances and return
 * the closest one as the pathfinding destination node.
 *
 * @param {{ lat: number, lng: number }} userLocation
 * @returns {{ nodeId: string, distanceMeters: number, position: [number, number] | undefined }}
 */
export function findNearestStMarysEntrance(userLocation, customNodes = null) {
  const nodesToUse = customNodes || NODES;
  if (!userLocation?.lat || !userLocation?.lng) {
    return { nodeId: "g", distanceMeters: Infinity, position: nodesToUse.g };
  }

  let bestNodeId = "g";
  let minDist = Infinity;

  for (const nodeId of ST_MARYS_ENTRANCE_NODES) {
    const pos = nodesToUse[nodeId];
    if (!pos) continue;

    const dist = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      pos[0],
      pos[1]
    );

    if (dist < minDist) {
      minDist = dist;
      bestNodeId = nodeId;
    }
  }

  return {
    nodeId: bestNodeId,
    distanceMeters: minDist,
    position: nodesToUse[bestNodeId],
  };
}

/** Outdoor graph node IDs for Chavara Block's two G-floor entrances. */
export const CHAVARA_ENTRANCE_NODES = ["chavara", "p3"];

/**
 * Compare GPS distance from the user to all Chavara entrances and return
 * the closest one.
 *
 * @param {{ lat: number, lng: number }} userLocation
 * @returns {{ nodeId: string, distanceMeters: number, position: [number, number] | undefined }}
 */
export function findNearestChavaraEntrance(userLocation, customNodes = null) {
  const nodesToUse = customNodes || NODES;
  if (!userLocation?.lat || !userLocation?.lng) {
    return { nodeId: "chavara", distanceMeters: Infinity, position: nodesToUse.chavara };
  }

  let bestNodeId = "chavara";
  let minDist = Infinity;

  for (const nodeId of CHAVARA_ENTRANCE_NODES) {
    const pos = nodesToUse[nodeId];
    if (!pos) continue;

    const dist = calculateHaversineDistance(
      userLocation.lat,
      userLocation.lng,
      pos[0],
      pos[1]
    );

    if (dist < minDist) {
      minDist = dist;
      bestNodeId = nodeId;
    }
  }

  return {
    nodeId: bestNodeId,
    distanceMeters: minDist,
    position: nodesToUse[bestNodeId],
  };
}

/**
 * Pick the Chavara entrance whose **graph path** from `startNode` is shorter.
 * This matches exactly what the outdoor Dijkstra routing will choose, so the
 * outdoor route end-node and the indoor start-node always agree.
 *
 * Falls back to straight-line GPS distance when the graph path cannot be found.
 *
 * @param {string} startNode  – nearest outdoor graph node to the user
 * @param {string[]} edges    – outdoor EDGES array
 * @param {{ lat: number, lng: number } | null} userLocation – used as fallback
 * @returns {{ nodeId: string, distanceMeters: number }}
 */
export function findBestChavaraEntranceByPath(startNode, edges, userLocation = null, customNodes = null) {
  const nodesToUse = customNodes || NODES;
  if (!startNode || !edges) {
    return findNearestChavaraEntrance(userLocation, nodesToUse);
  }

  // Lightweight Dijkstra for just the two Chavara entrances
  const graph = {};
  for (const edge of edges) {
    const a = Array.isArray(edge) ? edge[0] : edge.source;
    const b = Array.isArray(edge) ? edge[1] : edge.target;
    const posA = nodesToUse[a];
    const posB = nodesToUse[b];
    const w = posA && posB
      ? calculateHaversineDistance(posA[0], posA[1], posB[0], posB[1])
      : 1;
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    graph[a].push({ node: b, weight: w });
    graph[b].push({ node: a, weight: w });
  }

  const dist = {};
  const visited = new Set();
  for (const n in graph) dist[n] = Infinity;
  if (!(startNode in dist)) dist[startNode] = Infinity;
  dist[startNode] = 0;

  while (true) {
    // pick unvisited node with min dist
    let u = null, minD = Infinity;
    for (const n in dist) {
      if (!visited.has(n) && dist[n] < minD) { minD = dist[n]; u = n; }
    }
    if (u === null) break;
    visited.add(u);
    // early exit once both Chavara targets are settled
    if (CHAVARA_ENTRANCE_NODES.every(n => visited.has(n))) break;
    for (const { node, weight } of (graph[u] || [])) {
      if (!visited.has(node)) {
        const nd = dist[u] + weight;
        if (nd < (dist[node] ?? Infinity)) dist[node] = nd;
      }
    }
  }

  let bestNodeId = "chavara";
  let bestDist = Infinity;
  for (const nodeId of CHAVARA_ENTRANCE_NODES) {
    const d = dist[nodeId] ?? Infinity;
    if (d < bestDist) { bestDist = d; bestNodeId = nodeId; }
  }

  // If Dijkstra gave no useful result, fall back to GPS straight-line
  if (bestDist === Infinity) {
    return findNearestChavaraEntrance(userLocation, nodesToUse);
  }

  return { nodeId: bestNodeId, distanceMeters: bestDist, position: nodesToUse[bestNodeId] };
}

/**
 * Find the nearest entrance for a specific building block, preferring graph paths if edges are provided.
 *
 * @param {{ lat: number, lng: number } | null} userLocation
 * @param {string} building
 * @param {string} startNode
 * @param {string[]} edges
 */
export function findNearestBuildingEntrance(userLocation, building, customNodes = null, startNode = null, edges = null) {
  const isChavara = building && building.toLowerCase().includes("chavara");
  
  if (startNode && edges) {
    return isChavara 
      ? findBestChavaraEntranceByPath(startNode, edges, userLocation, customNodes)
      : findBestStMarysEntranceByPath(startNode, edges, userLocation, customNodes);
  }

  return isChavara 
    ? findNearestChavaraEntrance(userLocation, customNodes)
    : findNearestStMarysEntrance(userLocation, customNodes);
}