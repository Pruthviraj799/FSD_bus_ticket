import React, { useEffect, useRef, useState } from 'react';
import { MapPin, ArrowRight, Bus, Clock, Users, Navigation, Compass, Crosshair, Key } from 'lucide-react';
import L from 'leaflet';
import { useTransit } from '../../context/TransitContext';

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

export const LiveTrackingCard: React.FC = () => {
  const { routes, buses, setActiveTab, setSelectedRouteId, setSelectedBusId } = useTransit();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [userDistanceKm, setUserDistanceKm] = useState<number | null>(null);

  // Target Route 1A and Bus 101 as in screenshot
  const route1A = routes.find((r) => r.id === 'route-1a') || routes[0];
  const bus101 = buses.find((b) => b.id === 'bus-101') || buses[0];

  // Request user's real GPS position
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setIsLocating(false);

        // Distance from user to bus
        const dist = calculateDistanceKm(
          coords[0],
          coords[1],
          bus101.currentLat,
          bus101.currentLng
        );
        setUserDistanceKm(Number(dist.toFixed(2)));

        if (mapInstanceRef.current) {
          // Render or update user marker
          updateUserMarkerOnMap(coords, pos.coords.accuracy || 50);

          // Fit bounds to show both user and bus
          const bounds = L.latLngBounds([coords, [bus101.currentLat, bus101.currentLng]]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      },
      (err) => {
        console.warn('Geolocation error or denied:', err);
        setIsLocating(false);
        // Fallback realistic user location near ISBT 17 for demonstration
        const fallbackCoords: [number, number] = [30.7435, 76.7725];
        setUserCoords(fallbackCoords);
        const dist = calculateDistanceKm(
          fallbackCoords[0],
          fallbackCoords[1],
          bus101.currentLat,
          bus101.currentLng
        );
        setUserDistanceKm(Number(dist.toFixed(2)));
        if (mapInstanceRef.current) {
          updateUserMarkerOnMap(fallbackCoords, 60);
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const updateUserMarkerOnMap = (coords: [number, number], accuracyMeters: number) => {
    if (!mapInstanceRef.current) return;

    const userIcon = L.divIcon({
      className: 'custom-user-live-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute -inset-3 bg-blue-500/25 rounded-full animate-ping"></div>
          <div class="w-6 h-6 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <div class="w-2 h-2 rounded-full bg-white"></div>
          </div>
          <div class="absolute -bottom-5 bg-blue-900/90 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-sm">
            You
          </div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(coords);
    } else {
      const userMarker = L.marker(coords, { icon: userIcon }).addTo(mapInstanceRef.current);
      userMarker.bindPopup(`<b>Your Current Location</b><br/>Near Route 1A`);
      userMarkerRef.current = userMarker;
    }

    if (userCircleRef.current) {
      userCircleRef.current.setLatLng(coords);
      userCircleRef.current.setRadius(accuracyMeters);
    } else {
      userCircleRef.current = L.circle(coords, {
        radius: accuracyMeters,
        color: '#3B82F6',
        fillColor: '#93C5FD',
        fillOpacity: 0.15,
        weight: 1.5,
      }).addTo(mapInstanceRef.current);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map centered between ISBT 17 and PGI
    const map = L.map(mapContainerRef.current, {
      center: [30.755, 76.776],
      zoom: 13.4,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean, crisp OpenStreetMap tiles without any Carto API key watermark
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Add minimal zoom control to top-left
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Polyline for Route 1A
    const polyline = L.polyline(route1A.polylineCoordinates, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Glow underlay polyline
    L.polyline(route1A.polylineCoordinates, {
      color: '#93C5FD',
      weight: 10,
      opacity: 0.4,
      lineCap: 'round',
    }).addTo(map);

    // Green Origin Marker (ISBT 17)
    const originCoords = route1A.polylineCoordinates[0];
    const originIcon = L.divIcon({
      className: 'custom-origin-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center text-white">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker(originCoords, { icon: originIcon }).addTo(map).bindPopup('<b>Origin:</b> ISBT 17');

    // Red Destination Marker (PGI Hospital)
    const destCoords = route1A.polylineCoordinates[route1A.polylineCoordinates.length - 1];
    const destIcon = L.divIcon({
      className: 'custom-dest-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-7 h-7 rounded-full bg-red-500 border-2 border-white shadow-md flex items-center justify-center text-white">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });
    L.marker(destCoords, { icon: destIcon }).addTo(map).bindPopup('<b>Destination:</b> PGI Hospital');

    // Blue Live Moving Bus Marker (as seen in screenshot with blue circle badge and bus symbol)
    const busIcon = L.divIcon({
      className: 'custom-bus-icon',
      html: `
        <div class="relative flex items-center justify-center group cursor-pointer">
          <div class="absolute -inset-2 bg-blue-500/20 rounded-full animate-ping"></div>
          <div class="w-9 h-9 rounded-full bg-blue-600 border-[3px] border-white shadow-lg flex items-center justify-center text-white">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"/>
              <path d="M15 6v6"/>
              <path d="M2 12h19.6"/>
              <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.5-1-1-1H3c-.6 0-1 .4-1 1 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
              <circle cx="7" cy="18" r="2"/>
              <path d="M9 18h5"/>
              <circle cx="16" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const busMarker = L.marker([bus101.currentLat, bus101.currentLng], { icon: busIcon }).addTo(map);
    busMarker.bindPopup(`<b>${bus101.busNumber}</b><br/>ETA: ${bus101.etaMinutes} min to ${bus101.nextStop}`);
    busMarkerRef.current = busMarker;

    map.fitBounds(polyline.getBounds(), { padding: [30, 30] });
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Smoothly update bus marker location when coordinates change
  useEffect(() => {
    if (busMarkerRef.current) {
      busMarkerRef.current.setLatLng([bus101.currentLat, bus101.currentLng]);
    }
    // Update distance to user if user coordinates exist
    if (userCoords) {
      const dist = calculateDistanceKm(
        userCoords[0],
        userCoords[1],
        bus101.currentLat,
        bus101.currentLng
      );
      setUserDistanceKm(Number(dist.toFixed(2)));
    }
  }, [bus101.currentLat, bus101.currentLng, userCoords]);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
            Live Bus Tracking
          </h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Locate User Button */}
          <button
            onClick={handleLocateUser}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
              userCoords
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Track my real-time GPS location"
          >
            <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Locating...' : userCoords ? 'Location Active' : 'Locate Me'}</span>
          </button>

          <button
            onClick={() => {
              setSelectedRouteId('route-1a');
              setSelectedBusId('bus-101');
              setActiveTab('tracking');
            }}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition group ml-1"
          >
            <span>View Full Map</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Map Area with Floating Route Details Badge */}
      <div className="relative w-full h-[260px] sm:h-[280px] rounded-2xl overflow-hidden border border-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Route Card matching screenshot */}
        <div className="absolute top-3.5 right-3.5 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100/80 max-w-[210px] sm:max-w-[230px] space-y-3 pointer-events-auto">
          {/* Status pill */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
            {userDistanceKm !== null && (
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {userDistanceKm} km away
              </span>
            )}
          </div>

          {/* Route info */}
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 mt-0.5">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">
                {route1A.routeNumber}
              </p>
              <p className="text-[11px] font-medium text-slate-500 leading-tight mt-0.5 truncate">
                {route1A.source} ➔ {route1A.destination}
              </p>
            </div>
          </div>

          {/* ETA & Occupancy */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-none">ETA</span>
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {bus101.etaMinutes} min
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <div>
                <span className="text-[10px] text-slate-400 block leading-none">Occupancy</span>
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {bus101.currentOccupancy} / {bus101.capacity} ({Math.round((bus101.currentOccupancy / bus101.capacity) * 100)}%)
                </span>
              </div>
            </div>

            {userCoords && (
              <div className="flex items-center gap-2 pt-1 border-t border-slate-100/80">
                <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[10px] font-semibold text-slate-600">
                  Walk ~{Math.max(1, Math.round((userDistanceKm || 1) * 12))} min to nearest stop
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
