import React, { useEffect, useState } from 'react';
import { Calendar, Bus, Ticket as TicketIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { useTransit } from '../../context/TransitContext';

export const UpcomingJourneyCard: React.FC = () => {
  const { tickets, setSelectedTicketForModal, setActiveTab } = useTransit();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Find upcoming confirmed ticket (e.g. CTU-TKT-2026-12552)
  const upcomingTicket = tickets.find((t) => t.status === 'Confirmed') || tickets[0];

  useEffect(() => {
    if (upcomingTicket) {
      QRCode.toDataURL(
        upcomingTicket.qrData,
        {
          width: 140,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF',
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [upcomingTicket]);

  if (!upcomingTicket) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col justify-between h-full">
        <div className="flex items-center gap-2.5 mb-4">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
            Upcoming Journey
          </h3>
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No active journey booked.</p>
          <button
            onClick={() => setActiveTab('book')}
            className="mt-3 text-xs font-bold text-blue-600 hover:underline"
          >
            Book a Ride now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 sm:p-6 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 tracking-tight">
          Upcoming Journey
        </h3>
      </div>

      {/* Journey Card Body matching screenshot */}
      <div className="space-y-4">
        {/* Route and Time Row */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-tight">
                {upcomingTicket.source} ➔ {upcomingTicket.destination}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {upcomingTicket.travelDate} <span className="text-slate-300">|</span> {upcomingTicket.departureTime}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
            {upcomingTicket.status}
          </span>
        </div>

        {/* Ticket ID & Scannable QR Code */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div>
            <span className="text-xs text-slate-400 block font-medium">
              Ticket ID
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-wide font-mono">
              {upcomingTicket.ticketId}
            </span>
            <div className="mt-2 text-[11px] text-slate-500 space-y-0.5">
              <p>Seat: <span className="font-bold text-slate-800">{upcomingTicket.seatNumber}</span></p>
              <p>Bus: <span className="font-bold text-slate-800">{upcomingTicket.busNumber}</span></p>
            </div>
          </div>

          {/* Real Scannable QR Code */}
          <div className="p-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="Ticket QR Code"
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* View Ticket Button */}
      <div className="pt-4 mt-2">
        <button
          onClick={() => setSelectedTicketForModal(upcomingTicket)}
          className="w-full py-2.5 sm:py-3 rounded-2xl border-2 border-blue-600/20 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm"
        >
          <TicketIcon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
          <span>View Ticket</span>
        </button>
      </div>
    </div>
  );
};
