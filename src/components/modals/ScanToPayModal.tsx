import React, { useState, useRef, useEffect } from 'react';
import {
  QrCode,
  Camera,
  X,
  Flashlight,
  SwitchCamera,
  CheckCircle2,
  Sparkles,
  Bus,
  MapPin,
  CreditCard,
  Wallet,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Upload,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTransit } from '../../context/TransitContext';
import { calculateTransitFare } from '../../utils/fareCalculator';

interface ScannedTransitPayload {
  busNumber: string;
  routeNumber: string;
  routeId: string;
  source: string;
  destination: string;
  busType: 'AC Electric Volvo' | 'Premium AC' | 'Standard Express';
  fare: number;
  seatNumber: string;
  departureTime: string;
  arrivalTime: string;
}

export const ScanToPayModal: React.FC = () => {
  const {
    isScanToPayOpen,
    setIsScanToPayOpen,
    user,
    activePass,
    bookTicket,
    setSelectedTicketForModal,
    rechargeWallet
  } = useTransit();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Scanned ride state
  const [scannedTrip, setScannedTrip] = useState<ScannedTransitPayload | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi' | 'card'>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Play pleasant acoustic feedback chime on scan success
  const playScanChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // AudioContext not allowed or muted
    }
  };

  // Start Camera Stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopCamera();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      startBarcodeDetection();
    } catch (err: any) {
      console.warn('Camera stream could not be started:', err);
      setCameraError(
        'Camera access was denied or is unavailable. You can use the Quick Test Scanners below or upload an image.'
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera Stream
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Barcode / QR detection loop using native browser API if available
  const startBarcodeDetection = () => {
    if (!('BarcodeDetector' in window)) return;

    try {
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13'],
      });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2 || scannedTrip) return;

        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            handleDetectedCode(rawValue);
          }
        } catch {
          // ignore detection tick frame error
        }
      }, 500);
    } catch {
      // BarcodeDetector constructor error
    }
  };

  // Trigger camera when modal opens
  useEffect(() => {
    if (isScanToPayOpen && !scannedTrip) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScanToPayOpen, facingMode]);

  // Handle successful QR detection
  const handleDetectedCode = (codeStr: string) => {
    playScanChime();
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
    });

    // Default or parsed values
    let payload: ScannedTransitPayload;

    try {
      const parsed = JSON.parse(codeStr);
      payload = {
        busNumber: parsed.bus || 'CTU-BUS-101',
        routeNumber: parsed.routeNumber || 'Route 1A',
        routeId: parsed.routeId || 'route-1a',
        source: parsed.source || 'ISBT 17',
        destination: parsed.destination || 'PGI Hospital',
        busType: parsed.busType || 'AC Electric Volvo',
        fare: parsed.fare || 45,
        seatNumber: parsed.seat || '07A',
        departureTime: parsed.time || 'Immediate Boarding',
        arrivalTime: parsed.arrival || '25 Mins',
      };
    } catch {
      // Fallback: If it's a raw string or test QR
      payload = {
        busNumber: 'CTU-BUS-101',
        routeNumber: 'Route 1A',
        routeId: 'route-1a',
        source: 'ISBT 17',
        destination: 'PGI Hospital',
        busType: 'AC Electric Volvo',
        fare: 45,
        seatNumber: `0${Math.floor(Math.random() * 8) + 1}B`,
        departureTime: 'Immediate Boarding',
        arrivalTime: '25 Mins',
      };
    }

    setScannedTrip(payload);
    stopCamera();
  };

  // Quick Preset Scenarios for instant zero-friction testing
  const handleQuickPreset = (presetType: 'bus101' | 'stop17' | 'conductor' | 'airport') => {
    playScanChime();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.5 },
    });

    if (presetType === 'bus101') {
      setScannedTrip({
        busNumber: 'CTU-BUS-101',
        routeNumber: 'Route 1A',
        routeId: 'route-1a',
        source: 'ISBT 17',
        destination: 'PGI Hospital',
        busType: 'AC Electric Volvo',
        fare: 45,
        seatNumber: '04A',
        departureTime: 'Now Boarding',
        arrivalTime: '08:25 AM',
      });
    } else if (presetType === 'stop17') {
      setScannedTrip({
        busNumber: 'CTU-BUS-102',
        routeNumber: 'Route 1A',
        routeId: 'route-1a',
        source: 'ISBT 17',
        destination: 'Sector 22 Market',
        busType: 'Standard Express',
        fare: 25,
        seatNumber: '09B',
        departureTime: '08:45 AM',
        arrivalTime: '09:05 AM',
      });
    } else if (presetType === 'conductor') {
      setScannedTrip({
        busNumber: 'CTU-BUS-205',
        routeNumber: 'Route 2B',
        routeId: 'route-2b',
        source: 'Sector 43 ISBT',
        destination: 'IT Park Chandigarh',
        busType: 'Premium AC',
        fare: 60,
        seatNumber: '11A',
        departureTime: 'Now Boarding',
        arrivalTime: '10:02 AM',
      });
    } else {
      setScannedTrip({
        busNumber: 'CTU-BUS-308',
        routeNumber: 'Route 3C',
        routeId: 'route-3c',
        source: 'Railway Station',
        destination: 'Aerocity Airport',
        busType: 'AC Electric Volvo',
        fare: 75,
        seatNumber: '02B',
        departureTime: '10:15 AM',
        arrivalTime: '10:48 AM',
      });
    }
    stopCamera();
  };

  // Handle Image File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate reading QR from uploaded image
    handleQuickPreset('bus101');
  };

  // Execute Ticket Payment & Generate Ticket
  const handlePayAndGenerateTicket = () => {
    if (!scannedTrip) return;

    if (paymentMethod === 'wallet' && user.walletBalance < scannedTrip.fare) {
      alert('Insufficient wallet balance. Please top up or switch payment method.');
      return;
    }

    setIsProcessing(true);
    setProcessingStatus('Connecting to SmartMove Transit Payment Engine...');

    setTimeout(() => {
      setProcessingStatus('Verifying bus boarding code & seat allocation...');
    }, 600);

    setTimeout(() => {
      setProcessingStatus('Payment authorized! Issuing verified digital ticket...');
    }, 1200);

    setTimeout(() => {
      const formattedDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const fareBreakdown = calculateTransitFare(
        scannedTrip.source,
        scannedTrip.destination,
        scannedTrip.busType,
        1,
        !!activePass
      );

      const createdTicket = bookTicket({
        routeId: scannedTrip.routeId,
        routeNumber: scannedTrip.routeNumber,
        source: scannedTrip.source,
        destination: scannedTrip.destination,
        travelDate: formattedDate,
        departureTime: scannedTrip.departureTime,
        arrivalTime: scannedTrip.arrivalTime,
        busNumber: scannedTrip.busNumber,
        busType: scannedTrip.busType,
        seatNumber: scannedTrip.seatNumber,
        passengerName: user.name,
        fare: scannedTrip.fare,
        paymentMethod:
          paymentMethod === 'wallet'
            ? 'SmartMove Wallet'
            : paymentMethod === 'upi'
            ? 'UPI / GPay'
            : 'Visa / RuPay Card',
        transactionId: `TXN-SCAN-${Math.floor(100000 + Math.random() * 900000)}`,
        fareBreakdown,
      });

      setIsProcessing(false);
      setIsScanToPayOpen(false);
      setScannedTrip(null);

      // Open digital ticket view immediately
      setSelectedTicketForModal(createdTicket);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1800);
  };

  if (!isScanToPayOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Processing State Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Processing Scan & Pay</h4>
              <p className="text-xs text-blue-600 font-semibold mt-1 animate-pulse">
                {processingStatus}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Digital Boarding Pass Generation</span>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Scan & Pay for Bus Ticket
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Live Scanner
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Point at Bus QR, Conductor POS, or Transit Hub code
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              setIsScanToPayOpen(false);
              setScannedTrip(null);
            }}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {!scannedTrip ? (
            <>
              {/* Camera Scanner Viewfinder */}
              <div className="relative w-full h-[260px] sm:h-[300px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                {/* Camera Video Stream */}
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                />

                {/* Camera error message / fallback screen */}
                {(!isCameraActive || cameraError) && (
                  <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 text-blue-400 flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">
                        {cameraError ? 'Camera Simulation Mode' : 'Initializing Camera...'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                        {cameraError || 'Please allow camera access in your browser to scan live physical QR codes.'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startCamera()}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Try Again</span>
                      </button>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload QR Image</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Animated Scanner Reticle & Laser */}
                {isCameraActive && (
                  <div className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-2xl border-2 border-white/20 flex items-center justify-center pointer-events-none z-10">
                    {/* Corner Guides */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />

                    {/* Animated Scanning Laser Line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] animate-pulse top-1/2 -translate-y-1/2" />

                    {/* Center Target Icon */}
                    <QrCode className="w-8 h-8 text-white/30" />
                  </div>
                )}

                {/* Floating Viewfinder Controls */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                  <button
                    onClick={() =>
                      setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
                    }
                    className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                    title="Flip Camera"
                  >
                    <SwitchCamera className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsTorchOn(!isTorchOn)}
                    className={`p-1.5 rounded-lg transition ${
                      isTorchOn ? 'bg-amber-400 text-slate-900' : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    title="Toggle Flash"
                  >
                    <Flashlight className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom Guide Text */}
                <div className="absolute bottom-3 inset-x-3 z-20 text-center">
                  <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-slate-200 border border-white/10 shadow-lg">
                    Align the QR code within the frame to pay
                  </span>
                </div>
              </div>

              {/* Hidden file input for image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Instant Quick-Test Scanners (No physical QR needed) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Quick-Test Scan Buttons (One-Click)
                  </span>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload QR</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <button
                    onClick={() => handleQuickPreset('bus101')}
                    className="p-3 rounded-2xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200/80 transition flex items-start gap-2.5 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-blue-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                      <Bus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        CTU Bus 101 Terminal
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Route 1A • ISBT 17 ➔ PGI
                      </span>
                      <span className="text-xs font-black text-blue-600 block mt-1">₹45.00</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickPreset('stop17')}
                    className="p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100 border border-emerald-200/80 transition flex items-start gap-2.5 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        ISBT 17 Stand QR
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Route 1A • Local Express
                      </span>
                      <span className="text-xs font-black text-emerald-600 block mt-1">₹25.00</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickPreset('conductor')}
                    className="p-3 rounded-2xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200/80 transition flex items-start gap-2.5 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-purple-600 text-white shrink-0 group-hover:scale-105 transition-transform">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        Conductor Handheld POS
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Route 2B • Sec 43 ➔ IT Park
                      </span>
                      <span className="text-xs font-black text-purple-600 block mt-1">₹60.00</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleQuickPreset('airport')}
                    className="p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100 border border-amber-200/80 transition flex items-start gap-2.5 text-left group"
                  >
                    <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                        Airport Express Volvo
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Route 3C • Station ➔ Airport
                      </span>
                      <span className="text-xs font-black text-amber-600 block mt-1">₹75.00</span>
                    </div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Scanned QR Code Result & Instant Payment Sheet */
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      QR Code Successfully Scanned!
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Bus & transit parameters matched and verified
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setScannedTrip(null);
                    startCamera();
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  Scan Another
                </button>
              </div>

              {/* Scanned Trip Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white text-xs font-extrabold">
                      {scannedTrip.routeNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {scannedTrip.busNumber}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {scannedTrip.busType}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">From</span>
                    <span className="font-extrabold text-slate-900">{scannedTrip.source}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">To</span>
                    <span className="font-extrabold text-slate-900">{scannedTrip.destination}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Assigned Seat
                    </span>
                    <span className="font-extrabold text-blue-600">{scannedTrip.seatNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Departure
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {scannedTrip.departureTime}
                    </span>
                  </div>
                </div>

                {/* Payable Fare Tag */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Total Ticket Fare</span>
                  <span className="text-2xl font-black text-slate-900">₹{scannedTrip.fare}.00</span>
                </div>
              </div>

              {/* Choose Payment Method */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'wallet'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px]">Wallet (₹{user.walletBalance})</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'upi'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span className="text-[11px]">UPI / GPay</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      paymentMethod === 'card'
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px]">Debit/Card</span>
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScannedTrip(null);
                    startCamera();
                  }}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Rescan
                </button>
                <button
                  type="button"
                  onClick={handlePayAndGenerateTicket}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
                >
                  <span>Pay ₹{scannedTrip.fare}.00 & Generate Ticket</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

