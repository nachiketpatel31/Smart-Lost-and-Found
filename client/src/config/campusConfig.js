/**
 * GSFC University Campus Configuration (Frontend)
 */

export const CAMPUS_CONFIG = {
  universityName: 'GSFC University',
  
  // Center Coordinates for GSFC University
  center: {
    latitude: 22.3705,
    longitude: 73.1585
  },

  // Zoom Levels: Overview = 17, Item Close-up = 18.5
  defaultZoom: 17,
  itemZoom: 18.5,

  // Maximum allowed radius from campus center in kilometers (Geofence)
  maxRadiusKm: 3.5,

  // Navigation & Routing Configurations
  routing: {
    // Dedicated OpenStreetMap Pedestrian/Foot Routing Endpoint (FOSSGIS OSM Germany)
    pedestrianApiUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot/',
    // Backup driving API endpoint fallback
    osrmApiUrl: 'https://router.project-osrm.org/route/v1/driving/',
    // Distance threshold in meters for arrival detection
    arrivalThresholdMeters: 25,
    // Distance threshold in meters to trigger an API reroute request
    rerouteThresholdMeters: 25,
    // Pedestrian walking speed: ~1.25 m/s (4.5 km/h) for walking ETA
    walkingSpeedMps: 1.25
  },

  // Pre-configured Campus Buildings / Locations with default coordinates
  locations: [
    { name: 'Main Building', latitude: 22.3705, longitude: 73.1585 },
    { name: 'Library', latitude: 22.3708, longitude: 73.1582 },
    { name: 'Canteen', latitude: 22.3701, longitude: 73.1590 },
    { name: 'Computer Lab', latitude: 22.3712, longitude: 73.1588 },
    { name: 'Classroom', latitude: 22.3706, longitude: 73.1580 },
    { name: 'Laboratory', latitude: 22.3710, longitude: 73.1584 },
    { name: 'Parking Area', latitude: 22.3698, longitude: 73.1575 },
    { name: 'Hostel', latitude: 22.3720, longitude: 73.1600 },
    { name: 'Sports Ground', latitude: 22.3715, longitude: 73.1610 },
    { name: 'Security Office', latitude: 22.3695, longitude: 73.1570 },
    { name: 'Other', latitude: 22.3705, longitude: 73.1585 }
  ]
};

export function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinCampusGeofence(latitude, longitude) {
  if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
    return true;
  }

  const distance = getHaversineDistance(
    CAMPUS_CONFIG.center.latitude,
    CAMPUS_CONFIG.center.longitude,
    latitude,
    longitude
  );

  return distance <= CAMPUS_CONFIG.maxRadiusKm;
}
