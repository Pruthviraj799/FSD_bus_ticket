import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  QrCode,
  Wallet,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Smartphone,
  Info,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Camera
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { FareBreakdown } from '../../utils/fareCalculator';
import { useTransit } from '../../context/TransitContext';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripDetails: {
    busNumber: string;
    routeNumber: string;
    source: string;
    destination: string;
    departureTime: string;
    travelDate: string;
    seatNumber: string;
    busType: string;
  };
  fareBreakdown: FareBreakdown;
  onPaymentSuccess: (method: string, transactionId: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  tripDetails,
  fareBreakdown,
  onPaymentSuccess,
}) => {
  const { user, rechargeWallet, activePass, setIsScanToPayOpen } = useTransit();

  const [activeMethod, setActiveMethod] = useState<'upi' | 'card' | 'wallet' | 'pass'>('upi');

  // UPI State
  const [upiId, setUpiId] = useState('pruthviraj@okhdfcbank');
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(300); // 5 minutes

  // Card State
  const [cardNumber, setCardNumber] = useState('4532 8921 7842 9012');
  const [cardHolder, setCardHolder] = useState(user.name.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('389');
  const [saveCard, setSaveCard] = useState(true);

  // OTP 3D-Secure simulation modal
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('724915');

  // Breakdown visibility
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  // Top-up wallet in-modal state
  const [topUpAmount, setTopUpAmount] = useState<number>(100);

  // Generate real QR code for UPI
  useEffect(() => {
    if (isOpen) {
      const upiUrl = `upi://pay?pa=smartmove.transit@axisbank&pn=SmartMove%20Transit&am=${fareBreakdown.totalFare}&cu=INR&tn=BusTicket_${tripDetails.seatNumber}`;
      QRCode.toDataURL(
        upiUrl,
        {
          width: 220,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        },
        (err, url) => {
          if (!err && url) setUpiQrDataUrl(url);
        }
      );
    }
  }, [isOpen, fareBreakdown.totalFare, tripDetails.seatNumber]);

  // Countdown timer for UPI session
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleExecutePayment = (chosenMethod: string) => {
    setIsProcessing(true);
    setProcessingStep('Connecting to secure banking gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing payment with issuer bank...');
    }, 700);

    setTimeout(() => {
      setProcessingStep('Payment authorized! Generating digital e-ticket...');
    }, 1400);

    setTimeout(() => {
      const txnId = `TXN-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      setIsProcessing(false);
      setShowOtpScreen(false);

      // Confetti celebration
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      onPaymentSuccess(chosenMethod, txnId);
      onClose();
    }, 2100);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Launch 3D-secure simulated OTP verification
    setShowOtpScreen(true);
  };

  const handleWalletPay = () => {
    if (user.walletBalance < fareBreakdown.totalFare) {
      alert('Insufficient wallet balance. Please top up below.');
      return;
    }
    handleExecutePayment('SmartMove Wallet');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 my-6">
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
              <Lock className="w-6 h-6 text-blue-600 absolute inset-0 m-auto" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">Processing Secure Payment</h4>
              <p className="text-xs text-blue-600 font-semibold mt-1 animate-pulse">
                {processingStep}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit Encrypted Bank Level Security</span>
            </div>
          </div>
        )}

        {/* 3D Secure OTP Modal Simulation */}
        {showOtpScreen && !isProcessing && (
          <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">3D Secure Card Verification</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the 6-digit one-time password sent to registered mobile <span className="font-bold text-slate-800">******3210</span>
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Enter OTP Code (Test Code: 724915)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center text-xl font-mono font-extrabold tracking-widest text-slate-900 bg-white border border-slate-200 rounded-xl py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOtpScreen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleExecutePayment('Visa / RuPay Card')}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  Verify & Pay ₹{fareBreakdown.totalFare}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 px-2 rounded-md bg-white/20 text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">
              SmartMove Pay Gateway
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> PCI-DSS Certified
            </span>
          </div>

          <div className="flex items-end justify-between mt-3">
            <div>
              <p className="text-xs text-blue-100 font-medium">Payable Transit Fare</p>
              <h3 className="text-3xl font-extrabold tracking-tight">
                ₹{fareBreakdown.totalFare}.00
              </h3>
            </div>
            <div className="text-right text-xs text-blue-100">
              <span className="block font-bold text-white text-sm">
                Seat {tripDetails.seatNumber}
              </span>
              <span>{tripDetails.busNumber} • {tripDetails.busType}</span>
            </div>
          </div>

          {/* Quick Route Strip */}
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-50">
            <span className="font-semibold">{tripDetails.source}</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-75" />
            <span className="font-semibold">{tripDetails.destination}</span>
            <span className="opacity-80">({fareBreakdown.distanceKm} km)</span>
          </div>
        </div>

        {/* Fare Breakdown Expandable Bar */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-2.5">
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-blue-600 transition"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Fare Calculation Breakdown ({fareBreakdown.distanceKm} km, {tripDetails.busType})
            </span>
            {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showBreakdown && (
            <div className="mt-3 pt-3 border-t border-slate-200 text-xs space-y-1.5 text-slate-600 animate-in fade-in">
              <div className="flex justify-between">
                <span>Base Service Fare ({tripDetails.busType})</span>
                <span className="font-semibold text-slate-800">₹{fareBreakdown.baseRate}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Distance Charge ({fareBreakdown.distanceKm} km × ₹{fareBreakdown.distanceRate}/km)</span>
                <span className="font-semibold text-slate-800">₹{fareBreakdown.baseDistanceFare}.00</span>
              </div>
              <div className="flex justify-between">
                <span>Passenger Safety & Clean Air Cess</span>
                <span className="font-semibold text-slate-800">₹{fareBreakdown.safetyCess.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Govt. GST (5% Passenger Transport)</span>
                <span className="font-semibold text-slate-800">₹{fareBreakdown.gstTax.toFixed(2)}</span>
              </div>
              {fareBreakdown.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Digital Pass Commuter Subsidy (100% OFF)</span>
                  <span>-₹{fareBreakdown.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-200 font-extrabold text-slate-900 text-sm">
                <span>Net Total Amount</span>
                <span>₹{fareBreakdown.totalFare}.00</span>
              </div>
            </div>
          )}
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveMethod('upi')}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                activeMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold">UPI / QR</span>
            </button>

            <button
              onClick={() => setActiveMethod('card')}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                activeMethod === 'card'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-bold">Debit / Card</span>
            </button>

            <button
              onClick={() => setActiveMethod('wallet')}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                activeMethod === 'wallet'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-bold">Wallet (₹{user.walletBalance.toFixed(0)})</span>
            </button>
          </div>

          {/* TAB 1: UPI & QR Code */}
          {activeMethod === 'upi' && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                {/* Dynamic QR Code */}
                <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-200 text-center shrink-0">
                  {upiQrDataUrl ? (
                    <img src={upiQrDataUrl} alt="UPI QR Code" className="w-32 h-32 rounded-xl" />
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-400">
                      Loading QR...
                    </div>
                  )}
                  <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                    Scan to pay ₹{fareBreakdown.totalFare}
                  </span>
                </div>

                {/* Instructions & timer */}
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">Session expires in:</span>
                    <span className="font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {formatSeconds(countdown)}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Open any UPI App on your phone — <span className="font-bold text-slate-800">Google Pay, PhonePe, Paytm, BHIM</span> — and scan the QR code.
                  </p>

                  <div className="pt-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Or Enter UPI VPA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleExecutePayment('UPI / GPay')}
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Simulator Button */}
              <button
                onClick={() => handleExecutePayment('UPI / GPay')}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulate Instant UPI Payment (₹{fareBreakdown.totalFare}.00)</span>
              </button>

              {/* Or Scan & Pay with Camera Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setIsScanToPayOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Or Scan QR using Device Camera to Pay</span>
              </button>
            </div>
          )}

          {/* TAB 2: Credit / Debit Card */}
          {activeMethod === 'card' && (
            <form onSubmit={handleCardSubmit} className="space-y-4 pt-1 animate-in fade-in">
              {/* Virtual ATM Card Display */}
              <div className="relative rounded-2xl p-5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white shadow-xl overflow-hidden border border-slate-700">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex justify-between items-center mb-6">
                  <div className="w-10 h-7 rounded-md bg-amber-400/80 flex items-center justify-center text-[10px] font-bold text-slate-900 shadow-inner">
                    CHIP
                  </div>
                  <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
                    RuPay / Visa
                  </span>
                </div>

                <div className="font-mono text-base sm:text-lg tracking-widest text-slate-100 mb-4 font-bold">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex justify-between items-end text-xs text-slate-300">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-semibold">
                      Cardholder
                    </span>
                    <span className="font-bold text-slate-100">{cardHolder || 'PASSENGER'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider block text-slate-400 font-semibold">
                      Expires
                    </span>
                    <span className="font-bold text-slate-100">{cardExpiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4532 8921 7842 9012"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      CVV / CVC
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer text-slate-600 pt-1">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Save this card securely per RBI tokenization standards</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{fareBreakdown.totalFare}.00 via Secure Card</span>
              </button>
            </form>
          )}

          {/* TAB 3: SmartMove Transit Wallet */}
          {activeMethod === 'wallet' && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Available Transit Wallet Balance
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    ₹{user.walletBalance.toFixed(2)}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>

              {user.walletBalance < fareBreakdown.totalFare ? (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Insufficient balance. Required: ₹{fareBreakdown.totalFare}. Shortfall: ₹{(fareBreakdown.totalFare - user.walletBalance).toFixed(2)}.</span>
                  </div>

                  {/* Quick Top up */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Quick Wallet Top-Up</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[100, 200, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            rechargeWallet(amt);
                            alert(`₹${amt} added to your SmartMove Wallet!`);
                          }}
                          className="py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition"
                        >
                          +₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Sufficient balance available. ₹{fareBreakdown.totalFare} will be deducted from your wallet. Remaining balance: ₹{(user.walletBalance - fareBreakdown.totalFare).toFixed(2)}.</span>
                  </div>

                  <button
                    onClick={handleWalletPay}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Pay ₹{fareBreakdown.totalFare}.00 from Wallet</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Digital Commuter Pass */}
          {activeMethod === 'pass' && (
            <div className="space-y-4 pt-1 animate-in fade-in">
              {activePass ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                        {activePass.planType}
                      </span>
                      <span className="text-xs font-bold text-emerald-200">Active Pass</span>
                    </div>
                    <h4 className="text-lg font-extrabold">{activePass.planName}</h4>
                    <p className="text-xs text-emerald-100">
                      Valid until <span className="font-bold text-white">{activePass.validUntil}</span> • Unlimited City Transit Rides
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Pass benefit applied! You owe ₹0.00 for this journey.</span>
                  </div>

                  <button
                    onClick={() => handleExecutePayment('Transit Pass')}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm Free Ride with Pass (₹0.00)</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-800">No Active Pass Found</h4>
                  <p className="text-xs text-slate-500">
                    Get an unlimited monthly or annual pass from the Digital Passes page to travel for free.
                  </p>
                  <button
                    onClick={() => setActiveMethod('upi')}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
                  >
                    Pay with UPI Instead
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
