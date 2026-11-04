import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Bus,
  Users,
  Search,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTransit } from '../context/TransitContext';
import { Ticket } from '../types/transit';

export const StaffDashboardPage: React.FC = () => {
  const { validateTicketByStaff, tickets, buses } = useTransit();
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error' | null;
    message: string;
    ticket?: Ticket;
  }>({ type: null, message: '' });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const activeBus = buses[0]; // CTU-BUS-101
  const boardedTickets = tickets.filter((t) => t.status === 'Boarded');

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Camera access could not be initialized or permission was denied. You can use the Quick Test Scanner buttons below!');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleValidate = (code: string) => {
    if (!code.trim()) return;
    const res = validateTicketByStaff(code.trim());

    if (res.success) {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      setScanResult({
        type: 'success',
        message: res.message,
        ticket: res.ticket,
      });
    } else if (res.ticket?.status === 'Boarded') {
      setScanResult({
        type: 'warning',
        message: res.message,
        ticket: res.ticket,
      });
    } else {
      setScanResult({
        type: 'error',
        message: res.message,
        ticket: res.ticket,
      });
    }

    setManualCode('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Staff Validator Terminal
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Conductor Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Scan digital passenger QR codes, validate commuter passes, and manage bus boarding.
            </p>
          </div>
        </div>

        {/* Assigned Bus Pill */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3">
          <Bus className="w-5 h-5 text-blue-600" />
          <div className="text-xs">
            <span className="text-slate-400 block font-medium">Assigned Vehicle</span>
            <span className="font-extrabold text-slate-900">
              {activeBus.busNumber} • {activeBus.routeNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* QR Scanner Tool (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Live Camera QR Scanner
              </h3>
              <button
                onClick={isCameraActive ? stopCamera : startCamera}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isCameraActive
                    ? 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCameraActive ? 'Stop Camera' : 'Start Device Camera'}</span>
              </button>
            </div>

            {/* Video Viewport / Viewfinder */}
            <div className="relative w-full h-64 sm:h-72 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              {isCameraActive ? (
                <video ref={videoRef} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-2">
                  <QrCode className="w-16 h-16 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Camera is currently off. Click 'Start Device Camera' or use Quick Test below.
                  </p>
                </div>
              )}

              {/* Viewfinder Target Frame Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/60 rounded-2xl relative shadow-2xl">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-blue-400 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-blue-400 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-blue-400 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-blue-400 rounded-br" />
                  <div className="absolute inset-x-0 h-0.5 bg-blue-400/80 shadow-[0_0_8px_#38bdf8] animate-pulse top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Manual Ticket ID Lookup */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Manual Ticket / Pass ID Validator
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="e.g. CTU-TKT-2026-12552 or PASS-2026-78901"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  onClick={() => handleValidate(manualCode)}
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Simulated 1-Click Scan Test Buttons */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Quick Test Scanner (Instant Simulation)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleValidate('CTU-TKT-2026-12552')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Scan Ticket: CTU-TKT-2026-12552
                </button>
                <button
                  onClick={() => handleValidate('PASS-2026-78901')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  Scan Digital Pass
                </button>
                <button
                  onClick={() => handleValidate('INVALID-FAKE-TICKET-999')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 text-xs font-bold transition"
                >
                  Scan Invalid Ticket
                </button>
              </div>
            </div>

            {/* Validation Result Notification Banner */}
            {scanResult.type && (
              <div
                className={`p-4 rounded-2xl border text-xs animate-in fade-in ${
                  scanResult.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : scanResult.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : scanResult.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-extrabold text-sm capitalize">
                      {scanResult.type === 'success'
                        ? 'Boarding Approved'
                        : scanResult.type === 'warning'
                        ? 'Duplicate Warning'
                        : 'Invalid Ticket'}
                    </h4>
                    <p className="mt-0.5 leading-relaxed font-medium">{scanResult.message}</p>
                    {scanResult.ticket && (
                      <p className="mt-1 text-[11px] font-mono opacity-80">
                        Seat: {scanResult.ticket.seatNumber} • Bus: {scanResult.ticket.busNumber} • Route: {scanResult.ticket.routeNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Passenger Boarding Manifest (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Passenger Manifest
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                Trip: CTU-101
              </span>
            </div>

            {/* Capacity Meter */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-800">
                <span>Current Occupancy</span>
                <span>{32 + boardedTickets.length} / {activeBus.capacity} Boarded</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, ((32 + boardedTickets.length) / activeBus.capacity) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* List of Scanned / Boarded Passengers */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recently Validated On Board ({boardedTickets.length})
              </h4>

              {boardedTickets.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  No tickets validated yet on this active trip.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {boardedTickets.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-extrabold text-slate-900">{t.passengerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {t.ticketId} • Seat {t.seatNumber}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-800">
                        Boarded
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
