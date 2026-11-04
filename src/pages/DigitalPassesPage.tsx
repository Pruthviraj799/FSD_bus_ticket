import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Sparkles, ShieldCheck, Zap, Calendar, ArrowRight, QrCode } from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { useTransit } from '../context/TransitContext';
import { DigitalPass } from '../types/transit';

export const DigitalPassesPage: React.FC = () => {
  const { passes, activePass, purchasePass, user } = useTransit();
  const [activePassQr, setActivePassQr] = useState<string>('');
  const [selectedPlanToBuy, setSelectedPlanToBuy] = useState<{
    name: string;
    type: DigitalPass['planType'];
    price: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (activePass) {
      QRCode.toDataURL(
        activePass.qrData,
        {
          width: 180,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        },
        (err, url) => {
          if (!err && url) setActivePassQr(url);
        }
      );
    }
  }, [activePass]);

  const plansCatalog = [
    {
      name: 'Student SmartPass',
      type: 'Student' as const,
      price: 399,
      period: 'Monthly',
      features: ['Unlimited Non-AC & AC city routes', 'Requires verified student ID', '50% fare subsidy'],
      color: 'border-blue-200 bg-blue-50/40',
      badge: 'Popular for Students',
    },
    {
      name: 'Daily Commuter Monthly',
      type: 'Daily Commuter' as const,
      price: 850,
      period: 'Monthly',
      features: ['Unlimited rides across all CTU city lines', 'No peak-hour surcharge', 'Average ₹1,420 monthly savings'],
      color: 'border-emerald-200 bg-emerald-50/40',
      badge: 'Best Value',
    },
    {
      name: 'Airport & Express SuperPass',
      type: 'SuperPass' as const,
      price: 1299,
      period: 'Monthly',
      features: ['All city lines + Airport Express Route 10', 'Priority AC Volvo booking', 'Luggage allowance included'],
      color: 'border-purple-200 bg-purple-50/40',
      badge: 'Express Travel',
    },
    {
      name: 'Annual Green Citizen Pass',
      type: 'Green Annual' as const,
      price: 7999,
      period: 'Annual',
      features: ['365 days unlimited city transit', '2 months completely free', 'Complimentary Public Bike Share integration'],
      color: 'border-amber-200 bg-amber-50/40',
      badge: 'Maximum Savings',
    },
  ];

  const handleBuy = () => {
    if (!selectedPlanToBuy) return;
    setIsProcessing(true);
    setTimeout(() => {
      purchasePass(selectedPlanToBuy.name, selectedPlanToBuy.type, selectedPlanToBuy.price);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
      setIsProcessing(false);
      setSelectedPlanToBuy(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          SmartMove Digital Passes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Enjoy unlimited city transit rides, contactless boarding, and save up to ₹1,500 every month.
        </p>
      </div>

      {/* Active Pass Section */}
      {activePass ? (
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-md">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                  ● Active Commuter Subscription
                </span>
                <span className="text-xs text-blue-200 font-mono">{activePass.passId}</span>
              </div>

              <div>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  {activePass.planName}
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 mt-1">
                  Card Holder: <span className="font-bold text-white">{user.name}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
                  <span className="text-[10px] text-blue-200 block">Valid Until</span>
                  <span className="font-bold text-white text-xs">{activePass.validUntil}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
                  <span className="text-[10px] text-blue-200 block">Trips Taken</span>
                  <span className="font-bold text-white text-xs">{activePass.ridesTaken} Rides</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5">
                  <span className="text-[10px] text-blue-200 block">Savings</span>
                  <span className="font-bold text-emerald-300 text-xs">₹{activePass.monthlySavings}</span>
                </div>
              </div>
            </div>

            {/* QR Verification for Conductor */}
            <div className="flex flex-col items-center bg-white p-3.5 rounded-2xl shadow-lg shrink-0">
              {activePassQr ? (
                <img src={activePassQr} alt="Pass QR" className="w-28 h-28" />
              ) : (
                <div className="w-28 h-28 bg-slate-100 rounded-lg animate-pulse" />
              )}
              <span className="text-[10px] font-bold text-slate-800 mt-2 flex items-center gap-1">
                <QrCode className="w-3 h-3 text-blue-600" /> Conductor Verification QR
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 rounded-3xl p-6 border border-amber-200 text-amber-900">
          <p className="text-sm font-bold">No Active Digital Pass found.</p>
          <p className="text-xs mt-0.5">Subscribe to an unlimited city pass below to unlock zero-fare travel!</p>
        </div>
      )}

      {/* Available Plans Catalog */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight px-1">
          Available Subscription Plans
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plansCatalog.map((plan) => {
            const isCurrentlyActive = activePass?.planName === plan.name;
            return (
              <div
                key={plan.name}
                className={`rounded-3xl border p-6 flex flex-col justify-between transition-all bg-white shadow-card hover:shadow-card-hover ${plan.color}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white shadow-sm text-slate-700">
                      {plan.badge}
                    </span>
                    {isCurrentlyActive && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        Active Plan
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 leading-tight">
                      {plan.name}
                    </h4>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-extrabold text-slate-900">₹{plan.price}</span>
                      <span className="text-xs text-slate-500">/{plan.period.toLowerCase()}</span>
                    </div>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <button
                    disabled={isCurrentlyActive}
                    onClick={() =>
                      setSelectedPlanToBuy({
                        name: plan.name,
                        type: plan.type,
                        price: plan.price,
                      })
                    }
                    className={`w-full py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                      isCurrentlyActive
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
                    }`}
                  >
                    <span>{isCurrentlyActive ? 'Current Plan' : `Subscribe for ₹${plan.price}`}</span>
                    {!isCurrentlyActive && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Purchase Modal */}
      {selectedPlanToBuy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95">
            <h4 className="text-base font-extrabold text-slate-900">
              Confirm Pass Subscription
            </h4>
            <div className="p-4 bg-slate-50 rounded-2xl text-xs space-y-1.5 border border-slate-100">
              <p className="font-bold text-slate-900">{selectedPlanToBuy.name}</p>
              <p className="text-slate-500">Duration: 30 days unlimited transit</p>
              <p className="text-base font-extrabold text-blue-600 pt-1">
                Total: ₹{selectedPlanToBuy.price}.00
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedPlanToBuy(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleBuy}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
              >
                {isProcessing ? 'Activating...' : 'Pay & Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
