"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Search, Navigation, X, MapPin } from "lucide-react";
import { feedPosts } from "@/data/mock-posts";
import { mockClusters } from "@/data/mock-clusters";
import { mockActivities } from "@/data/mock-activities";
import { FeedPost } from "@/lib/types";
import {
  createCheckInMarkerIcon,
  createClusterIcon,
  createIssueMarkerIcon,
  createSearchResultMarkerIcon,
  createActivityMarkerIcon,
} from "@/lib/marker-icons";
import L from "leaflet";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// ---- Dynamic imports for Leaflet-dependent components ----

const CheckInDetailSheet = dynamic(
  () => import("@/components/CheckInDetailSheet"),
  { ssr: false }
);

// ---- Constants ----
const DEFAULT_CENTER: [number, number] = [-7.5584, 110.8199]; // Gondang Manis
const DEFAULT_ZOOM = 16;
const GEOAPIFY_KEY = "4085f2be1bd8446197b7d0601b3a391f";

const geoapifyTile = `https://maps.geoapify.com/v1/tile/carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_KEY}`;

// ---- Helper: fly to location ----
function FlyToLocation({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  const called = useRef(false);

  useEffect(() => {
    if (!called.current) {
      called.current = true;
      map.flyTo(center, zoom ?? map.getZoom(), { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

// ---- Helper: Fit bounds to markers ----
function FitBoundsOnMount({ markers }: { markers: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(
      markers.map((m) => L.latLng(m[0], m[1]))
    );
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [map, markers]);

  return null;
}

// ---- Sub-components rendered inside MapContainer ----
function MapMarkers({
  onPostClick,
}: {
  onPostClick: (post: FeedPost) => void;
}) {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup | null>(null);
  const clusterMarkersRef = useRef<L.LayerGroup | null>(null);
  const issueMarkersRef = useRef<L.LayerGroup | null>(null);
  const activityMarkersRef = useRef<L.LayerGroup | null>(null);
  const searchMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Clean up previous markers
    markersRef.current?.clearLayers();
    clusterMarkersRef.current?.clearLayers();
    issueMarkersRef.current?.clearLayers();
    activityMarkersRef.current?.clearLayers();

    // Create layer groups
    markersRef.current = L.layerGroup().addTo(map);
    clusterMarkersRef.current = L.layerGroup().addTo(map);
    issueMarkersRef.current = L.layerGroup().addTo(map);
    activityMarkersRef.current = L.layerGroup().addTo(map);

    // Add check-in markers (single posts with location)
    const locatedPosts = feedPosts.filter(
      (p) => p.locationLatitude && p.locationLongitude
    );

    locatedPosts.forEach((post) => {
      const marker = L.marker(
        [post.locationLatitude!, post.locationLongitude!],
        {
          icon: createCheckInMarkerIcon(post.imageAsset || undefined, false),
        }
      );
      marker.on("click", () => onPostClick(post));
      markersRef.current?.addLayer(marker);
    });

    // Add issue cluster markers (heatmap style)
    mockClusters.forEach((cluster) => {
      const marker = L.marker(cluster.point, {
        icon: createIssueMarkerIcon(cluster.count),
      });
      clusterMarkersRef.current?.addLayer(marker);
    });

    // Add activity markers
    mockActivities.forEach((activity) => {
      const marker = L.marker(activity.point, {
        icon: createActivityMarkerIcon(activity.color),
      });
      marker.bindTooltip(activity.label, {
        direction: "top",
        offset: L.point(0, -20),
      });
      activityMarkersRef.current?.addLayer(marker);
    });

    return () => {
      markersRef.current?.clearLayers();
      clusterMarkersRef.current?.clearLayers();
      issueMarkersRef.current?.clearLayers();
      activityMarkersRef.current?.clearLayers();
    };
  }, [map, onPostClick]);

  return null;
}

// ---- SearchBar component ----
function MapSearchBarInternal({
  onSearchResult,
}: {
  onSearchResult: (lat: number, lng: number, label: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q);
      if (q.length < 3) {
        setSuggestions([]);
        return;
      }

      // Check if it's a coordinate format
      const coordMatch = q.match(
        /^(-?\d+\.?\d*)\s*[,;:\s]\s*(-?\d+\.?\d*)$/
      );
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        onSearchResult(lat, lng, `${lat}, ${lng}`);
        setSuggestions([]);
        return;
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(
              q
            )}`,
            { headers: { "User-Agent": "CirculWeb/1.0" } }
          );
          const data = await res.json();
          setSuggestions(data);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 420);
    },
    [onSearchResult]
  );

  const handleSelect = (item: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    onSearchResult(lat, lng, item.display_name);
    setQuery(item.display_name.split(",")[0]);
    setSuggestions([]);
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-[1000] max-w-md mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white rounded-xl shadow-lg px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari lokasi..."
            className="flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400 bg-transparent"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="ml-2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {suggestions.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSelect(item)}
                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                <span className="line-clamp-2">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="absolute top-full left-0 right-0 mt-1 text-center py-2 text-xs text-gray-400">
            Mencari...
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Locate button ----
function LocateButtonInternal({
  onLocate,
}: {
  onLocate: (lat: number, lng: number) => void;
}) {
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocate(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // Fallback to default location
        onLocate(DEFAULT_CENTER[0], DEFAULT_CENTER[1]);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <button
      onClick={handleLocate}
      className="bg-white rounded-xl shadow-lg p-3 hover:bg-gray-50 transition-colors"
      title="Pusatkan lokasi saya"
    >
      <Navigation className="w-5 h-5 text-gray-600" />
    </button>
  );
}

// ---- Main MapView component ----
export default function MapView() {
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{
    center: [number, number];
    zoom?: number;
  } | null>(null);
  const [viewportPosts, setViewportPosts] = useState<FeedPost[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  const handlePostClick = useCallback((post: FeedPost) => {
    setSelectedPost(post);
    setSheetOpen(true);
  }, []);

  const handleSearchResult = useCallback(
    (lat: number, lng: number, _label: string) => {
      setFlyTo({ center: [lat, lng], zoom: 17 });
    },
    []
  );

  const handleLocate = useCallback((lat: number, lng: number) => {
    setFlyTo({ center: [lat, lng], zoom: 16 });
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetOpen(false);
    setSelectedPost(null);
  }, []);

  // Collect all marker positions for initial bounds
  const allPositions: [number, number][] = feedPosts
    .filter((p) => p.locationLatitude && p.locationLongitude)
    .map((p) => [p.locationLatitude!, p.locationLongitude!]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url={geoapifyTile}
        />

        {/* Initial fit to bounds */}
        <FitBoundsOnMount markers={allPositions} />

        {/* Fly to location when search/locate is triggered */}
        {flyTo && <FlyToLocation center={flyTo.center} zoom={flyTo.zoom} />}

        {/* Markers */}
        <MapMarkers onPostClick={handlePostClick} />
      </MapContainer>

      {/* Search bar (overlay) */}
      <MapSearchBarInternal onSearchResult={handleSearchResult} />

      {/* Locate button (overlay, bottom-right) */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <LocateButtonInternal onLocate={handleLocate} />
      </div>

      {/* Bottom sheet for check-in detail */}
      {selectedPost && (
        <CheckInDetailSheet
          post={selectedPost}
          open={sheetOpen}
          onClose={handleSheetClose}
        />
      )}
    </div>
  );
}
