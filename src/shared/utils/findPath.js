import { calculateHaversineDistance } from "./haversine";

export function findPath(start, end, edges, nodes = {}) {
    const graph = {};

    // build bidirectional graph
    for (const edge of edges) {
        const a = Array.isArray(edge) ? edge[0] : edge.source;
        const b = Array.isArray(edge) ? edge[1] : edge.target;

        if (!graph[a]) graph[a] = [];
        if (!graph[b]) graph[b] = [];

        // Calculate distance if node coordinates are available
        let distance = 1; // fallback weight
        const nodeA = nodes[a]?.position || nodes[a];
        const nodeB = nodes[b]?.position || nodes[b];

        if (nodeA && nodeB) {
            // Outdoor nodes use geographic coordinates. Indoor nodes are also
            // stored in a locked Leaflet coordinate space, so a simple
            // Euclidean weight keeps the graph stable if the floor image is
            // replaced with a higher-resolution version.
            const looksLikeGps = Math.abs(nodeA[0]) <= 90 && Math.abs(nodeA[1]) <= 180;
            distance = looksLikeGps
                ? calculateHaversineDistance(nodeA[0], nodeA[1], nodeB[0], nodeB[1])
                : Math.hypot(nodeA[0] - nodeB[0], nodeA[1] - nodeB[1]);
        }

        // Apply a massive penalty for changing floors so the algorithm doesn't
        // take shortcuts through other floors when routing on the same floor.
        if (nodes[a]?.floor && nodes[b]?.floor && nodes[a].floor !== nodes[b].floor) {
            distance += 100000;
        }

        graph[a].push({ node: b, weight: distance });
        graph[b].push({ node: a, weight: distance });
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Initialize Dijkstra distances
    for (const node in graph) {
        distances[node] = Infinity;
        unvisited.add(node);
    }
    
    // Add start and end if not in edges
    if (!distances[start]) {
        distances[start] = Infinity;
        unvisited.add(start);
    }
    if (!distances[end]) {
        distances[end] = Infinity;
        unvisited.add(end);
    }
    
    distances[start] = 0;

    while (unvisited.size > 0) {
        // Find node with minimum distance
        let current = null;
        let minDistance = Infinity;
        for (const node of unvisited) {
            if (distances[node] < minDistance) {
                minDistance = distances[node];
                current = node;
            }
        }

        if (current === null) break; // All remaining nodes are inaccessible
        if (current === end) break; // We reached the destination

        unvisited.delete(current);

        const neighbors = graph[current] || [];
        for (const neighbor of neighbors) {
            if (!unvisited.has(neighbor.node)) continue;

            const newDistance = distances[current] + neighbor.weight;
            if (newDistance < distances[neighbor.node]) {
                distances[neighbor.node] = newDistance;
                previous[neighbor.node] = current;
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = end;
    
    if (previous[current] || current === start) {
        while (current) {
            path.unshift(current);
            current = previous[current];
        }
    }

    return path.length > 0 && path[0] === start ? path : [];
}
