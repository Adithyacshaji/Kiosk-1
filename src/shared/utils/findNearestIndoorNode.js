import { INDOOR_NODES } from "../../data/indoorNodes";

function distance(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export function findNearestIndoorNode(position, floor, customIndoorNodes = null) {
  let nearest = null;
  let min = Infinity;
  const nodesToSearch = customIndoorNodes || INDOOR_NODES;

  Object.entries(nodesToSearch).forEach(([id, node]) => {
    if (node.floor !== floor) return;

    const d = distance(position, node.position);

    if (d < min) {
      min = d;
      nearest = id;
    }
  });

  return nearest;
}