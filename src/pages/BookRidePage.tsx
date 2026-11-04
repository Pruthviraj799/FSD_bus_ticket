import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowRightLeft,
  Clock,
  ShieldCheck,
  Check,
  Sparkles,
  Ticket as TicketIcon,
  X,
  CreditCard,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTransit } from '../context/TransitContext';
import { BusRoute } from '../types/transit';
import { calculateTransitFare, FareBreakdown } from '../utils/fareCalculator';
import { PaymentGatewayModal } from '../components/payment/PaymentGatewayModal';

interface AvailableBusTrip {
  id: string;
  busNumber: string;
  routeId: string;
  routeNumber: string;
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  busType: 'AC Electric Volvo' | 'Premium AC' | 'Standard Express';
  fare: number;
  availableSeats: number;
  totalSeats: number;
  bookedSeats: string[];
}

export const BookRidePage: React.FC = () => {
  const { routes, user, activePass, bookTicket, setSelectedTicketForModal } = useTransit();

  const [source, setSource] = useState<string>('ISBT 17');
  const [destination, setDestination] = useState<string>('PGI Hospital');
  const [travelDate, setTravelDate] = useState<string>('2026-10-31');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [busTypeFilter, setBusTypeFilter] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  // Seat booking state
  const [selectedTrip, setSelectedTrip] = useState<AvailableBusTrip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Popular Chandigarh transit hubs
  const popularStops = [
    'ISBT 17',
    'PGI Hospital',
    'Sector 43 ISBT',
    'Railway Station',
    'IT Park',
    'Sector 17 Plaza',
    'Tribune Chowk',
    'Aerocity Airport',
  ];

  // Swap source & destination
  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Compute fares dynamically based on stops, distance and bus class
  const volvoFare = calculateTransitFare(source, destination, 'AC Electric Volvo', passengerCount, false);
  const standardFare = calculateTransitFare(source, destination, 'Standard Express', passengerCount, false);
  const premiumFare = calculateTransitFare(source, destination, 'Premium AC', passengerCount, false);

  // Generate dynamic bus schedules based on selected source & destination
  const mockSchedules: AvailableBusTrip[] = [
    {
      id: 'trip-1',
      busNumber: 'CTU-BUS-101',
      routeId: 'route-1a',
      routeNumber: 'Route 1A',
      source,
      destination,
      departureTime: '08:00 AM',
      arrivalTime: '08:24 AM',
      durationMinutes: 24,
      busType: 'AC Electric Volvo',
      fare: volvoFare.totalFare,
      availableSeats: 18,
      totalSeats: 40,
      bookedSeats: ['01A', '02B', '03A', '04B', '12A', '12B', '15A'],
    },
    {
      id: 'trip-2',
      busNumber: 'CTU-BUS-102',
      routeId: 'route-1a',
      routeNumber: 'Route 1A',
      source,
      destination,
      departureTime: '08:45 AM',
      arrivalTime: '09:10 AM',
      durationMinutes: 25,
      busType: 'Standard Express',
      fare: standardFare.totalFare,
      availableSeats: 24,
      totalSeats: 40,
      bookedSeats: ['05A', '06B', '10A'],
    },
    {
      id: 'trip-3',
      busNumber: 'CTU-BUS-205',
      routeId: 'route-2b',
      routeNumber: 'Route 2B',
      source,
      destination,
      departureTime: '09:30 AM',
      arrivalTime: '10:02 AM',
      durationMinutes: 32,
      busType: 'Premium AC',
      fare: premiumFare.totalFare,
      availableSeats: 11,
      totalSeats: 40,
      bookedSeats: ['01B', '02A', '07A', '08B', '09A', '11B', '14A', '14B'],
    },
    {
      id: 'trip-4',
      busNumber: 'CTU-BUS-308',
      routeId: 'route-3c',
      routeNumber: 'Route 3C',
      source,
      destination,
      departureTime: '10:15 AM',
      arrivalTime: '10:48 AM',
      durationMinutes: 33,
      busType: 'AC Electric Volvo',
      fare: volvoFare.totalFare,
      availableSeats: 29,
      totalSeats: 40,
      bookedSeats: ['03B', '04A'],
    },
  ];

  const filteredBuses = mockSchedules.filter((trip) => {
    if (busTypeFilter === 'all') return true;
    return trip.busType.toLowerCase().includes(busTypeFilter.toLowerCase());
  });

  // Calculate current trip fare breakdown
  const currentFareBreakdown = selectedTrip
    ? calculateTransitFare(source, destination, selectedTrip.busType, passengerCount, false)
    : null;

  // Complete seat selection & payment success callback
  const handlePaymentSuccess = (method: string, transactionId: string) => {
    if (!selectedTrip || !selectedSeat || !currentFareBreakdown) return;

    const formattedDate = new Date(travelDate).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const createdTicket = bookTicket({
      routeId: selectedTrip.routeId,
      routeNumber: selectedTrip.routeNumber,
      source: selectedTrip.source,
      destination: selectedTrip.destination,
      travelDate: formattedDate,
      departureTime: selectedTrip.departureTime,
      arrivalTime: selectedTrip.arrivalTime,
      busNumber: selectedTrip.busNumber,
      busType: selectedTrip.busType,
      seatNumber: selectedSeat,
      passengerName: user.name,
      fare: currentFareBreakdown.totalFare,
      paymentMethod: method,
      transactionId,
      fareBreakdown: currentFareBreakdown,
    });

    setIsPaymentModalOpen(false);
    setSelectedTrip(null);
    setSelectedSeat('');
    setSelectedTicketForModal(createdTicket);
  };

  // Generate 2x2 bus layout seats (1A, 1B, 1C, 1D up to 10 rows = 40 seats)
  const seatRows = Array.from({ length: 10 }, (_, i) => {
    const rowNum = String(i + 1).padStart(2, '0');
    return [`${rowNum}A`, `${rowNum}B`, `${rowNum}C`, `${rowNum}D`];
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Search Bar & Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Book a Bus Ride
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Search scheduled transit routes, choose your seat, and get instant digital tickets.
          </p>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          {/* Source Stop */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> From (Origin Stop)
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {popularStops.map((stop) => (
                <option key={stop} value={stop} disabled={stop === destination}>
                  {stop}
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              onClick={handleSwap}
              type="button"
              className="p-3 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition shadow-sm"
              title="Swap Stops"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Stop */}
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> To (Destination Stop)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {popularStops.map((stop) => (
                <option key={stop} value={stop} disabled={stop === source}>
                  {stop}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Travel Date
            </label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Filter Bar & Active Pass Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Bus Type:
            </span>
            {[
              { id: 'all', label: 'All Buses' },
              { id: 'volvo', label: 'Electric Volvo' },
              { id: 'premium', label: 'Premium AC' },
              { id: 'standard', label: 'Standard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBusTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  busTypeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-blue-800">
            <TicketIcon className="w-4 h-4 text-blue-600" />
            <span>CTU Ticket Pricing: ₹50 - ₹100 per seat (Taxes & Safe Transit Included)</span>
          </div>
        </div>
      </div>

      {/* Available Buses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Available Buses ({filteredBuses.length})
          </h3>
          <span className="text-xs text-slate-500">
            {source} ➔ {destination} • Showing real-time CTU schedules
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {filteredBuses.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
            >
              {/* Bus info & Type */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-extrabold text-slate-900">
                      {trip.busNumber}
                    </span>
                    <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                      {trip.routeNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {trip.busType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Operated by Chandigarh Transport Undertaking • GPS Monitored
                  </p>
                </div>
              </div>

              {/* Timing & Duration */}
              <div className="flex items-center gap-8 py-2 md:py-0 border-y md:border-y-0 border-slate-100">
                <div className="text-left">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 block leading-tight">
                    {trip.departureTime}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{trip.source}</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-bold text-slate-400 mb-0.5">
                    {trip.durationMinutes} min
                  </span>
                  <div className="w-20 h-0.5 bg-slate-200 relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 block leading-tight">
                    {trip.arrivalTime}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{trip.destination}</span>
                </div>
              </div>

              {/* Price & Seat Selection Action */}
              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-left md:text-right">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black text-slate-900">₹{trip.fare}</span>
                    <span className="text-[11px] font-semibold text-slate-400">/ seat</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 block">
                    {trip.availableSeats} seats left
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedTrip(trip);
                    setSelectedSeat('14A'); // default convenient seat
                  }}
                  className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                >
                  Select Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Seat Selection Modal */}
      {selectedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Select Your Bus Seat
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedTrip.busNumber} ({selectedTrip.busType}) • Departs {selectedTrip.departureTime}
                </p>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seat Map Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md border-2 border-slate-300 bg-white" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <span>Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-slate-200 border border-slate-300" />
                <span>Occupied</span>
              </div>
            </div>

            {/* Bus Cabin Blueprint */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 max-w-md mx-auto">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-dashed border-slate-300 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>Front • Entry Gate</span>
                <span className="p-1 px-2 bg-slate-200 rounded text-slate-700">Driver Cabin</span>
              </div>

              {/* 2x2 Seat Layout */}
              <div className="space-y-3">
                {seatRows.slice(0, 7).map((row, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    {/* Left 2 seats (Window + Aisle) */}
                    <div className="flex gap-2.5">
                      {row.slice(0, 2).map((seatId) => {
                        const isBooked = selectedTrip.bookedSeats.includes(seatId);
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                                : isBooked
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>

                    {/* Aisle */}
                    <div className="text-[10px] text-slate-300 font-mono tracking-widest">
                      AISLE
                    </div>

                    {/* Right 2 seats */}
                    <div className="flex gap-2.5">
                      {row.slice(2, 4).map((seatId) => {
                        const isBooked = selectedTrip.bookedSeats.includes(seatId);
                        const isSelected = selectedSeat === seatId;
                        return (
                          <button
                            key={seatId}
                            disabled={isBooked}
                            onClick={() => setSelectedSeat(seatId)}
                            className={`w-10 h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105'
                                : isBooked
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-white border-2 border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            {seatId}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Summary & Breakdown Preview */}
            {currentFareBreakdown && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Trip Fare Breakdown ({currentFareBreakdown.distanceKm} km • {selectedTrip.busType})
                  </span>
                  <span className="text-slate-400 font-normal">
                    {passengerCount} Passenger{passengerCount > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Base Fare</span>
                    <span className="font-extrabold text-slate-800">₹{currentFareBreakdown.baseRate}.00</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">Distance Charge</span>
                    <span className="font-extrabold text-slate-800">₹{currentFareBreakdown.baseDistanceFare}.00</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] text-slate-400 block font-medium">5% GST + Cess</span>
                    <span className="font-extrabold text-slate-800">
                      ₹{(currentFareBreakdown.gstTax + currentFareBreakdown.safetyCess).toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-200/60">
                    <span className="text-[10px] text-blue-600 block font-medium">Total Fare</span>
                    <span className="font-extrabold text-blue-900">
                      ₹{currentFareBreakdown.totalFare}.00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm & Proceed to Payment Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block font-medium">
                  Seat: <span className="font-bold text-slate-900">{selectedSeat || 'Please Select a Seat'}</span>
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  ₹{currentFareBreakdown?.totalFare || selectedTrip.fare}.00
                </span>
              </div>

              <button
                disabled={!selectedSeat}
                onClick={() => setIsPaymentModalOpen(true)}
                className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  Proceed to Payment (₹{currentFareBreakdown?.totalFare || selectedTrip.fare}.00)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Payment Gateway Modal */}
      {selectedTrip && currentFareBreakdown && (
        <PaymentGatewayModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          tripDetails={{
            busNumber: selectedTrip.busNumber,
            routeNumber: selectedTrip.routeNumber,
            source: selectedTrip.source,
            destination: selectedTrip.destination,
            departureTime: selectedTrip.departureTime,
            travelDate: travelDate,
            seatNumber: selectedSeat,
            busType: selectedTrip.busType,
          }}
          fareBreakdown={currentFareBreakdown}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
