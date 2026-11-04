import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Bus,
  Clock,
  Users,
  Navigation,
  Compass,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Globe
} from 'lucide-react';
import L from 'leaflet';
import { useTransit } from '../context/TransitContext';
import { GoogleMapsTransitTracking } from '../components/tracking/GoogleMapsTransitTracking';

export const LiveTrackingPage: React.FC = () => {
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  const {
    routes,
    buses,
    selectedRouteId,
    setSelectedRouteId,
    selectedBusId,
    setSelectedBusId,
    setActiveTab,
  } = useTransit();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<{ [busId: string]: L.Marker }>({});

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const routeBuses = buses.filter((b) => b.routeId === currentRoute.id);
  const activeBus = routeBuses.find((b) => b.id === selectedBusId) || routeBuses[0] || buses[0];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const firstCoord = currentRoute.polylineCoordinates[0];
    const map = L.map(mapContainerRef.current, {
      center: firstCoord,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Route polyline & glow
    const polyline = L.polyline(currentRoute.polylineCoordinates, {
      color: '#2563EB',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    L.polyline(currentRoute.polylineCoordinates, {
      color: '#93C5FD',
      weight: 12,
      opacity: 0.35,
      lineCap: 'round',
    }).addTo(map);

    // Stops markers along route
    currentRoute.stops.forEach((stop, index) => {
      const isStart = index === 0;
      const isEnd = index === currentRoute.stops.length - 1;

      const stopIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full ${
              isStart
                ? 'bg-emerald-500'
                : isEnd
                ? 'bg-red-500'
                : 'bg-white border-2 border-blue-600'
            } shadow-md flex items-center justify-center text-xs font-bold ${
          isStart || isEnd ? 'text-white' : 'text-blue-600'
        }">
              ${index + 1}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([stop.lat, stop.lng], { icon: stopIcon })
        .addTo(map)
        .bindPopup(`<b>Stop ${index + 1}:</b> ${stop.name} (${stop.code})`);
    });

    // Render buses on this route
    const markers: { [busId: string]: L.Marker } = {};
    routeBuses.forEach((bus) => {
      const busDivIcon = L.divIcon({
        className: 'live-bus-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2.5 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="w-10 h-10 rounded-full bg-blue-600 border-[3px] border-white shadow-xl flex items-center justify-center text-white">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([bus.currentLat, bus.currentLng], { icon: busDivIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: inherit;">
            <p style="font-weight: 800; margin:0; font-size:13px;">${bus.busNumber}</p>
            <p style="margin:2px 0 0; font-size:11px; color:#64748B;">Near ${bus.nextStop}</p>
            <p style="margin:4px 0 0; font-size:11px; color:#2563EB; font-weight:700;">ETA: ${bus.etaMinutes} mins</p>
          </div>
        `);

      marker.on('click', () => {
        setSelectedBusId(bus.id);
      });

      markers[bus.id] = marker;
    });

    busMarkersRef.current = markers;
    map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedRouteId]);

  // Update bus marker locations as they move
  useEffect(() => {
    routeBuses.forEach((b) => {
      const marker = busMarkersRef.current[b.id];
      if (marker) {
        marker.setLatLng([b.currentLat, b.currentLng]);
      }
    });
  }, [routeBuses]);

  return (
    <div className="space-y-6 pb-12">
      {/* Route Selector & Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Live Fleet Tracking
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time GPS
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active city transit buses, stop ETAs, passenger occupancy, and GPS routes.
          </p>
        </div>

        {/* Route Selector & Map Engine Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Map Engine Switcher */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setMapEngine('google')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                mapEngine === 'google'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </button>
            <button
              type="button"
              onClick={() => setMapEngine('leaflet')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                mapEngine === 'leaflet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>OpenStreetMap</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Route:
            </label>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setSelectedBusId(null);
              }}
              className="bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeNumber}: {r.routeName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map & Live Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Transit Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-card p-4 sm:p-5 flex flex-col justify-between min-h-[460px] lg:min-h-[580px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-900">
                {currentRoute.routeName} ({currentRoute.distanceKm} km)
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {routeBuses.length} Active Bus{routeBuses.length > 1 ? 'es' : ''} on Route
            </span>
          </div>

          {mapEngine === 'google' ? (
            <GoogleMapsTransitTracking
              route={currentRoute}
              buses={routeBuses}
              selectedBusId={selectedBusId}
              onSelectBus={setSelectedBusId}
              onBookRide={() => setActiveTab('book')}
              heightClass="min-h-[420px] lg:min-h-[500px]"
            />
          ) : (
            <div className="relative w-full flex-1 rounded-2xl overflow-hidden border border-slate-100 min-h-[420px] lg:min-h-[500px]">
              <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

              {/* Quick Map Legend */}
              <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-100 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Origin
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Destination
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Active Bus
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Bus Fleet & Stop Progress (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Bus Card */}
          {activeBus && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                      {activeBus.busNumber}
                    </h4>
                    <p className="text-xs text-slate-400">{activeBus.busType}</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {activeBus.status}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 block font-medium">Next Station</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block truncate">
                    {activeBus.nextStop}
                  </span>
                </div>
                <div className="p-3 bg-blue-50/70 rounded-2xl">
                  <span className="text-blue-600 block font-medium">Estimated Arrival</span>
                  <span className="font-extrabold text-blue-900 text-sm mt-0.5 block">
                    {activeBus.etaMinutes} minutes
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 block font-medium">Live Speed</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {activeBus.speedKmH} km/h
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 block font-medium">Occupancy</span>
                  <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">
                    {activeBus.currentOccupancy} / {activeBus.capacity}
                  </span>
                </div>
              </div>

              {/* Progress Bar of Occupancy */}
              <div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                  <span>Passenger Capacity</span>
                  <span>{Math.round((activeBus.currentOccupancy / activeBus.capacity) * 100)}% Full</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{
                      width: `${(activeBus.currentOccupancy / activeBus.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={() => setActiveTab('book')}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Book a Seat on {currentRoute.routeNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Stop Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Route Stop Sequence ({currentRoute.stops.length} Stops)
            </h4>

            <div className="space-y-3 pt-1">
              {currentRoute.stops.map((stop, index) => {
                const isNext = stop.name === activeBus?.nextStop;
                return (
                  <div key={stop.id} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isNext
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < currentRoute.stops.length - 1 && (
                        <div className="w-0.5 h-6 bg-slate-200 mt-1" />
                      )}
                    </div>
                    <div className="flex-1 text-xs">
                      <p
                        className={`font-bold ${
                          isNext ? 'text-blue-600 font-extrabold' : 'text-slate-800'
                        }`}
                      >
                        {stop.name}
                      </p>
                      <p className="text-[10px] text-slate-400">Code: {stop.code}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
