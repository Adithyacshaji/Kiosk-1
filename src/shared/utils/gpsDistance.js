/**
 * Haversine distance in meters between two { lat, lng } points.
 */
export function gpsDistanceMeters(a, b) {
    if (!a || !b) return Infinity;
  
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
  
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }