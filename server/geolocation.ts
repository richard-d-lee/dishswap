// Geolocation utilities for distance calculations
export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  point1: Location,
  point2: Location
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter items by distance from a reference point
 */
export function filterByDistance<T extends { latitude: number | null; longitude: number | null }>(
  items: T[],
  referencePoint: Location,
  maxDistanceKm: number
): Array<T & { distance: number }> {
  return items
    .filter((item) => item.latitude !== null && item.longitude !== null)
    .map((item) => ({
      ...item,
      distance: calculateDistance(referencePoint, {
        latitude: item.latitude!,
        longitude: item.longitude!,
      }),
    }))
    .filter((item) => item.distance <= maxDistanceKm)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get bounding box coordinates for a given point and radius
 * Useful for database queries to filter by approximate location
 */
export function getBoundingBox(
  center: Location,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} {
  const latDelta = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lonDelta = radiusKm / (111.32 * Math.cos(toRadians(center.latitude)));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLon: center.longitude - lonDelta,
    maxLon: center.longitude + lonDelta,
  };
}
