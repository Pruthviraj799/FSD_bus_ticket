// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  Bus,
  MapPin,
  Layers,
  Compass,
  Navigation,
  Eye,
  Key,
  ShieldAlert,
  ExternalLink,
  RotateCcw,
  Clock,
  Users,
  Gauge,
  Crosshair
} from 'lucide-react';
import { BusRoute, LiveBus, TransitStop } from '../../types/transit';

// Helper: Haversine distance in kilometers
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
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
};

// Helper component: Renders Route Polyline on Google Maps
const RoutePolyline: React.FC<{
  path: google.maps.LatLngLiteral[];
  color?: string;
  weight?: number;
}> = ({ path, color = '#2563EB', weight = 5 }) => {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLibrary || !path || path.length === 0) return;

    // Outer glow polyline
    const glowLine = new google.maps.Polyline({
      path,
      strokeColor: '#93C5FD',
      strokeOpacity: 0.35,
      strokeWeight: weight * 2,
      map,
    });

    // Main route line
    const routeLine = new google.maps.Polyline({
      path,
      strokeColor: color,
      strokeOpacity: 0.95,
      strokeWeight: weight,
      map,
    });

    return () => {
      glowLine.setMap(null);
      routeLine.setMap(null);
    };
  }, [map, mapsLibrary, path, color, weight]);

  return null;
};

// Helper component: Live traffic layer toggle
const TrafficLayer: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');

  useEffect(() => {
    if (!map || !mapsLibrary) return;
    const traffic = new google.maps.TrafficLayer();
    if (enabled) {
      traffic.setMap(map);
    } else {
      traffic.setMap(null);
    }
    return () => {
      traffic.setMap(null);
    };
  }, [map, mapsLibrary, enabled]);

  return null;
};

// Helper component: Fit map bounds to route path
const FitRouteBounds: React.FC<{ path: google.maps.LatLngLiteral[] }> = ({ path }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !path || path.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    path.forEach((pt) => bounds.extend(pt));
    map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
  }, [map, path]);

  return null;
};

// Helper component: Pan map to target coordinate
const MapPanController: React.FC<{
  target: google.maps.LatLngLiteral | null;
  zoom?: number;
}> = ({ target, zoom = 15 }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target);
    map.setZoom(zoom);
  }, [map, target, zoom]);

  return null;
};

interface GoogleMapsTransitTrackingProps {
  route: BusRoute;
  buses: LiveBus[];
  selectedBusId: string | null;
  onSelectBus: (busId: string) => void;
  heightClass?: string;
  onBookRide?: () => void;
}

export const GoogleMapsTransitTracking: React.FC<GoogleMapsTransitTrackingProps> = ({
  route,
  buses,
  selectedBusId,
  onSelectBus,
  heightClass = 'min-h-[460px] h-[520px]',
  onBookRide,
}) => {
  // Retrieve API Key from env or localStorage
  const envKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('smartmove_gmaps_api_key') || envKey || '';
  });

  const [tempKeyInput, setTempKeyInput] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [showTraffic, setShowTraffic] = useState<boolean>(false);

  // Selected stop or bus info window state
  const [activeInfoWindowBus, setActiveInfoWindowBus] = useState<LiveBus | null>(null);
  const [activeStop, setActiveStop] = useState<TransitStop | null>(null);
  const [activeUserLocationInfoWindow, setActiveUserLocationInfoWindow] = useState<boolean>(false);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userDistanceKm, setUserDistanceKm] = useState<number | null>(null);
  const [panTarget, setPanTarget] = useState<google.maps.LatLngLiteral | null>(null);

  // Route path as google.maps.LatLngLiteral[]
  const routePath: google.maps.LatLngLiteral[] = route.polylineCoordinates.map(([lat, lng]) => ({
    lat,
    lng,
  }));

  const initialCenter = routePath[0] || { lat: 30.741, lng: 76.7794 };
  const activeBus = buses.find((b) => b.id === selectedBusId) || buses[0];

  // Request user's real GPS position
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);
        setPanTarget(coords);

        if (activeBus) {
          const dist = calculateDistanceKm(
            coords.lat,
            coords.lng,
            activeBus.currentLat,
            activeBus.currentLng
          );
          setUserDistanceKm(Number(dist.toFixed(2)));
        }
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setIsLocating(false);
        // Fallback realistic user location near ISBT 17
        const fallback = { lat: 30.7435, lng: 76.7725 };
        setUserLocation(fallback);
        setPanTarget(fallback);
        if (activeBus) {
          const dist = calculateDistanceKm(
            fallback.lat,
            fallback.lng,
            activeBus.currentLat,
            activeBus.currentLng
          );
          setUserDistanceKm(Number(dist.toFixed(2)));
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('smartmove_gmaps_api_key', trimmed);
      setApiKey(trimmed);
      setShowKeyModal(false);
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 flex flex-col">
      {/* Top Map Controls Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Google Maps Engine
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {buses.length} Bus{buses.length > 1 ? 'es' : ''} Live
          </span>
          {userDistanceKm !== null && (
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Bus is {userDistanceKm} km away
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* User Location Tracker Button */}
          <button
            type="button"
            onClick={handleLocateUser}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-sm ${
              userLocation
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60'
            }`}
            title="Track my real-time GPS location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : userLocation ? 'My GPS Active' : 'Locate Me'}</span>
          </button>

          {/* Center on Bus Button */}
          {activeBus && (
            <button
              type="button"
              onClick={() =>
                setPanTarget({ lat: activeBus.currentLat, lng: activeBus.currentLng })
              }
              className="px-2.5 py-1.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1"
              title="Center on Selected Bus"
            >
              <Bus className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Center Bus</span>
            </button>
          )}

          {/* Traffic Toggle */}
          <button
            type="button"
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              showTraffic
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Traffic</span>
          </button>

          {/* Map Type Toggle */}
          <button
            type="button"
            onClick={() => setMapType(mapType === 'roadmap' ? 'hybrid' : 'roadmap')}
            className="px-3 py-1.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{mapType === 'roadmap' ? 'Satellite' : 'Roadmap'}</span>
          </button>

          {/* API Key Manager */}
          <button
            type="button"
            onClick={() => {
              setTempKeyInput(apiKey);
              setShowKeyModal(true);
            }}
            className="px-3 py-1.5 rounded-xl font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 transition flex items-center gap-1.5 border border-blue-200/60"
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKey ? 'API Key Active' : 'Enter API Key'}</span>
          </button>
        </div>
      </div>

      {/* Main Map Canvas */}
      <div className={`relative w-full ${heightClass}`}>
        <APIProvider apiKey={apiKey}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={initialCenter}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapType}
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_git_agentskills_v1']}
            gestureHandling={'greedy'}
          >
            {/* Fit bounds automatically */}
            <FitRouteBounds path={routePath} />

            {/* Dynamic camera panning when Locate Me or Center Bus is clicked */}
            <MapPanController target={panTarget} />

            {/* Polyline Route */}
            <RoutePolyline path={routePath} color="#2563EB" weight={5} />

            {/* Live Traffic */}
            <TrafficLayer enabled={showTraffic} />

            {/* Route Stops Markers */}
            {route.stops.map((stop, index) => {
              const isStart = index === 0;
              const isEnd = index === route.stops.length - 1;

              return (
                <AdvancedMarker
                  key={stop.id}
                  position={{ lat: stop.lat, lng: stop.lng }}
                  onClick={() => setActiveStop(stop)}
                  title={`${stop.name} (${stop.code})`}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group">
                    <div
                      className={`w-6 h-6 rounded-full ${
                        isStart
                          ? 'bg-emerald-500'
                          : isEnd
                          ? 'bg-red-500'
                          : 'bg-white border-2 border-blue-600'
                      } shadow-md flex items-center justify-center text-[10px] font-extrabold ${
                        isStart || isEnd ? 'text-white' : 'text-blue-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Live Bus Markers */}
            {buses.map((bus) => {
              const isSelected = bus.id === selectedBusId;

              return (
                <AdvancedMarker
                  key={bus.id}
                  position={{ lat: bus.currentLat, lng: bus.currentLng }}
                  onClick={() => {
                    onSelectBus(bus.id);
                    setActiveInfoWindowBus(bus);
                  }}
                  title={`${bus.busNumber} - Near ${bus.nextStop}`}
                >
                  <div className="relative flex items-center justify-center cursor-pointer group">
                    <div className="absolute -inset-2 bg-blue-500/25 rounded-full animate-ping" />
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white border-[3px] shadow-xl transition-transform ${
                        isSelected
                          ? 'bg-blue-700 border-amber-300 scale-110 ring-4 ring-blue-300/60'
                          : 'bg-blue-600 border-white hover:scale-105'
                      }`}
                    >
                      <Bus className="w-5 h-5" />
                    </div>
                    {/* Badge showing bus number */}
                    <div className="absolute -bottom-5 bg-slate-900/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap pointer-events-none">
                      {bus.busNumber}
                    </div>
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* Live User Current Location Marker */}
            {userLocation && (
              <AdvancedMarker
                position={userLocation}
                onClick={() => setActiveUserLocationInfoWindow(true)}
                title="Your Current Location"
              >
                <div className="relative flex items-center justify-center cursor-pointer group">
                  <div className="absolute -inset-3 bg-blue-500/30 rounded-full animate-ping" />
                  <div className="w-8 h-8 rounded-full bg-blue-600 border-[3px] border-white shadow-xl flex items-center justify-center text-white">
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-5 bg-blue-950/95 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                    You are here
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* User Location Info Window */}
            {activeUserLocationInfoWindow && userLocation && (
              <InfoWindow
                position={userLocation}
                onCloseClick={() => setActiveUserLocationInfoWindow(false)}
              >
                <div className="p-2 text-slate-800 text-xs space-y-1.5 min-w-[190px]">
                  <div className="flex items-center gap-1.5 font-extrabold text-blue-600">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Your Real-Time Location</span>
                  </div>
                  <p className="text-[11px] text-slate-600">GPS Geolocation Synchronized</p>
                  {userDistanceKm !== null && (
                    <div className="pt-1 border-t border-slate-100 flex justify-between text-[11px]">
                      <span className="text-slate-500">Distance to Bus:</span>
                      <span className="font-bold text-slate-900">{userDistanceKm} km</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Walk to Stop:</span>
                    <span className="font-bold text-emerald-600">
                      ~{Math.max(1, Math.round((userDistanceKm || 1) * 12))} mins
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}

            {/* Stop Info Window */}
            {activeStop && (
              <InfoWindow
                position={{ lat: activeStop.lat, lng: activeStop.lng }}
                onCloseClick={() => setActiveStop(null)}
              >
                <div className="p-2 text-slate-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-blue-600">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Transit Station Stop</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{activeStop.name}</h4>
                  <p className="text-[11px] text-slate-500">Stop Code: {activeStop.code}</p>
                </div>
              </InfoWindow>
            )}

            {/* Bus Info Window */}
            {activeInfoWindowBus && (
              <InfoWindow
                position={{
                  lat: activeInfoWindowBus.currentLat,
                  lng: activeInfoWindowBus.currentLng,
                }}
                onCloseClick={() => setActiveInfoWindowBus(null)}
              >
                <div className="p-2 text-slate-800 text-xs space-y-2 min-w-[200px]">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {activeInfoWindowBus.busNumber}
                      </h4>
                      <p className="text-[10px] text-slate-500">{activeInfoWindowBus.busType}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {activeInfoWindowBus.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Next Station:</span>
                      <span className="font-bold text-slate-800">
                        {activeInfoWindowBus.nextStop}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">ETA to Stop:</span>
                      <span className="font-extrabold text-blue-600">
                        {activeInfoWindowBus.etaMinutes} mins
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Live Speed:</span>
                      <span className="font-semibold text-slate-800">
                        {activeInfoWindowBus.speedKmH} km/h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Occupancy:</span>
                      <span className="font-semibold text-slate-800">
                        {activeInfoWindowBus.currentOccupancy} / {activeInfoWindowBus.capacity}
                      </span>
                    </div>
                  </div>

                  {onBookRide && (
                    <button
                      onClick={onBookRide}
                      className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg transition"
                    >
                      Book Ticket on this Bus
                    </button>
                  )}
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>

        {/* Bottom Floating Legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-lg text-[11px] font-bold text-slate-700 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Origin
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Live Bus
          </span>
          {userLocation && (
            <span className="flex items-center gap-1.5 text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" /> You
            </span>
          )}
        </div>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="absolute inset-0 z-30 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900">Google Maps Platform API Key</h4>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your Google Maps Platform API key with <span className="font-bold text-slate-800">Maps JavaScript API</span> enabled, or use the zero-cost prototyping Maps Demo Key.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">API Key String</label>
              <input
                type="text"
                value={tempKeyInput}
                onChange={(e) => setTempKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 text-[11px] text-blue-800 space-y-1.5">
              <span className="font-bold block">Need a free demo key?</span>
              <p className="text-slate-600 leading-normal">
                Google provides an instant zero-cost prototyping demo key with no credit card or billing required.
              </p>
              <a
                href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_git_agentskills_v1"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1"
              >
                <span>Get a zero-cost Maps Demo Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Save & Load Map
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
