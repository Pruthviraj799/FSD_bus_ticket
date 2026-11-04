import React, { useEffect, useState } from 'react';
import { X, Printer, Download, MapPin, Calendar, Clock, Bus, CheckCircle2, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { useTransit } from '../../context/TransitContext';

export const TicketModal: React.FC = () => {
  const { selectedTicketForModal, setSelectedTicketForModal, cancelTicket } = useTransit();
  const [qrUrl, setQrUrl] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (selectedTicketForModal) {
      QRCode.toDataURL(
        selectedTicketForModal.qrData,
        {
          width: 220,
          margin: 1,
          color: { dark: '#0F172A', light: '#FFFFFF' },
        },
        (err, url) => {
          if (!err && url) setQrUrl(url);
        }
      );
    }
  }, [selectedTicketForModal]);

  if (!selectedTicketForModal) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this ticket? 100% fare will be refunded to your SmartMove Wallet.')) {
      setIsCancelling(true);
      setTimeout(() => {
        cancelTicket(selectedTicketForModal.ticketId);
        setIsCancelling(false);
        setSelectedTicketForModal(null);
      }, 500);
    }
  };

  const isConfirmed = selectedTicketForModal.status === 'Confirmed';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 my-8">
        {/* Close Button */}
        <button
          onClick={() => setSelectedTicketForModal(null)}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Ticket Area */}
        <div id="printable-ticket" className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">SmartMove Transit Pass</h3>
                <p className="text-xs text-slate-400">Official E-Boarding Ticket • Chandigarh Transport</p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                selectedTicketForModal.status === 'Confirmed'
                  ? 'bg-emerald-100 text-emerald-700'
                  : selectedTicketForModal.status === 'Boarded'
                  ? 'bg-blue-100 text-blue-700'
                  : selectedTicketForModal.status === 'Cancelled'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {selectedTicketForModal.status}
            </span>
          </div>

          {/* Ticket ID & Passenger Banner */}
          <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Ticket Identifier
              </span>
              <p className="text-base font-extrabold text-slate-900 font-mono tracking-wider">
                {selectedTicketForModal.ticketId}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Passenger Name
              </span>
              <p className="text-sm font-bold text-slate-800">
                {selectedTicketForModal.passengerName}
              </p>
            </div>
          </div>

          {/* Route Stop Details */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100/70">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Origin Boarding Stop
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                {selectedTicketForModal.source}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Departs at <span className="font-bold text-slate-700">{selectedTicketForModal.departureTime}</span>
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100/70">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Destination Stop
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-1">
                {selectedTicketForModal.destination}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Arrival approx <span className="font-bold text-slate-700">{selectedTicketForModal.arrivalTime}</span>
              </p>
            </div>
          </div>

          {/* Bus & Journey Metadata Grid */}
          <div className="grid grid-cols-4 gap-2 text-center py-3 border-y border-dashed border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Travel Date</span>
              <span className="text-xs font-bold text-slate-800">{selectedTicketForModal.travelDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Bus Fleet #</span>
              <span className="text-xs font-bold text-slate-800">{selectedTicketForModal.busNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Seat Number</span>
              <span className="text-sm font-extrabold text-blue-600">{selectedTicketForModal.seatNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Total Fare</span>
              <span className="text-sm font-extrabold text-slate-900">₹{selectedTicketForModal.fare}</span>
            </div>
          </div>

          {/* Payment & Transaction Banner */}
          <div className="bg-slate-50/80 rounded-2xl px-4 py-2.5 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-semibold text-slate-400">Payment:</span>
              <span className="font-bold text-blue-600">
                {selectedTicketForModal.paymentMethod || 'UPI / GPay'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-slate-500">
              <span className="font-sans font-semibold text-slate-400">Txn Ref:</span>
              <span className="font-bold text-slate-800">
                {selectedTicketForModal.transactionId || 'TXN-2026-39393'}
              </span>
            </div>
          </div>

          {/* QR Code and Validation Notice */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scannable Digital E-Ticket
              </span>
              <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
                Scan this QR code using the conductor's terminal upon boarding.
                Ticket is non-transferable.
              </p>
              <p className="text-[10px] text-slate-400">
                Booked on: {selectedTicketForModal.bookingTime}
              </p>
            </div>

            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
              {qrUrl ? (
                <img src={qrUrl} alt="E-Ticket QR" className="w-28 h-28" />
              ) : (
                <div className="w-28 h-28 bg-slate-100 rounded-lg animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
          {isConfirmed ? (
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition flex items-center gap-1.5"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {isCancelling ? 'Processing...' : 'Cancel Booking & Refund'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={() => setSelectedTicketForModal(null)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
