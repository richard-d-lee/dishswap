/**
 * Google Maps API Integration
 * 
 * Direct integration with Google Maps APIs using your own API key.
 * No proxy - connects directly to Google's services.
 */

export type TravelMode = "driving" | "walking" | "bicycling" | "transit";
export type MapType = "roadmap" | "satellite" | "terrain" | "hybrid";

export type LatLng = {
  lat: number;
  lng: number;
};

export type DirectionsResult = {
  routes: Array<{
    legs: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      start_address: string;
      end_address: string;
      start_location: LatLng;
      end_location: LatLng;
      steps: Array<{
        distance: { text: string; value: number };
        duration: { text: string; value: number };
        html_instructions: string;
        travel_mode: string;
        start_location: LatLng;
        end_location: LatLng;
      }>;
    }>;
    overview_polyline: { points: string };
    summary: string;
    warnings: string[];
    waypoint_order: number[];
  }>;
  status: string;
};

export type GeocodingResult = {
  results: Array<{
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    formatted_address: string;
    geometry: {
      location: LatLng;
      location_type: string;
      viewport: {
        northeast: LatLng;
        southwest: LatLng;
      };
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
};

export type PlacesSearchResult = {
  results: Array<{
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
    rating?: number;
    user_ratings_total?: number;
    business_status?: string;
    types: string[];
  }>;
  status: string;
};

function getGoogleMapsApiKey(): string {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured");
  }
  return apiKey;
}

/**
 * Make requests to Google Maps APIs
 * @param endpoint - The API endpoint (e.g., "/maps/api/geocode/json")
 * @param params - Query parameters for the request
 * @returns The API response
 */
export async function makeRequest<T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const apiKey = getGoogleMapsApiKey();
  const baseUrl = "https://maps.googleapis.com";
  
  const url = new URL(`${baseUrl}${endpoint}`);
  url.searchParams.append("key", apiKey);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Google Maps API request failed (${response.status} ${response.statusText}): ${errorText}`
    );
  }

  return (await response.json()) as T;
}

/**
 * Geocode an address to coordinates
 * @param address - The address to geocode
 * @returns Geocoding result with coordinates
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  return makeRequest<GeocodingResult>("/maps/api/geocode/json", { address });
}

/**
 * Reverse geocode coordinates to an address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Geocoding result with address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  return makeRequest<GeocodingResult>("/maps/api/geocode/json", {
    latlng: `${lat},${lng}`,
  });
}

/**
 * Get directions between two locations
 * @param origin - Starting location (address or "lat,lng")
 * @param destination - Ending location (address or "lat,lng")
 * @param mode - Travel mode (default: "driving")
 * @returns Directions result with route information
 */
export async function getDirections(
  origin: string,
  destination: string,
  mode: TravelMode = "driving"
): Promise<DirectionsResult> {
  return makeRequest<DirectionsResult>("/maps/api/directions/json", {
    origin,
    destination,
    mode,
  });
}

/**
 * Search for places by text query
 * @param query - Search query
 * @param location - Optional center point for search ("lat,lng")
 * @param radius - Optional search radius in meters
 * @returns Places search result
 */
export async function searchPlaces(
  query: string,
  location?: string,
  radius?: number
): Promise<PlacesSearchResult> {
  const params: Record<string, unknown> = { query };
  if (location) params.location = location;
  if (radius) params.radius = radius;
  
  return makeRequest<PlacesSearchResult>("/maps/api/place/textsearch/json", params);
}
