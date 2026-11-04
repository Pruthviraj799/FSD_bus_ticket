import React, { useState } from 'react';
import { Ticket as TicketIcon, Calendar, Bus, MapPin, Eye, Navigation, Ban, CheckCircle2 } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import { Ticket } from '../types/transit';

export const MyTicketsPage: React.FC = () => {
  const { tickets, setSelectedTicketForModal, setSelectedRouteId, setSelectedBusId, setActiveTab, cancelTicket } = useTransit();
  const [activeTabFilter, setActiveTabFilter] = useState<'upcoming' | 'completed'>('upcoming');

  const upcomingTickets = tickets.filter((t) => t.status === 'Confirmed');
  const pastTickets = tickets.filter((t) => t.status !== 'Confirmed');

  const displayList = activeTabFilter === 'upcoming' ? upcomingTickets : pastTickets;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            My Bus Tickets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access your booked e-tickets, boarding passes, and journey history.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTabFilter('upcoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTabFilter === 'upcoming'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Upcoming Rides ({upcomingTickets.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('completed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTabFilter === 'completed'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            History & Past ({pastTickets.length})
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {displayList.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <TicketIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No {activeTabFilter} tickets found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any {activeTabFilter} transit bookings at this moment.
          </p>
          <button
            onClick={() => setActiveTab('book')}
            className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition"
          >
            Book a Ride Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayList.map((ticket) => {
            const isConfirmed = ticket.status === 'Confirmed';
            return (
              <div
                key={ticket.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all p-6 space-y-4 flex flex-col justify-between"
              >
                {/* Top Status & ID */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      {ticket.ticketId}
                    </span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      {ticket.routeNumber}
                    </span>
                  </div>

                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      ticket.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ticket.status === 'Boarded'
                        ? 'bg-blue-100 text-blue-800'
                        : ticket.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>

                {/* Route & Times */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {ticket.source} ➔ {ticket.destination}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {ticket.travelDate} at {ticket.departureTime}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-slate-900">
                        {ticket.fare === 0 ? 'Pass' : `₹${ticket.fare}`}
                      </span>
                      <span className="text-[10px] text-slate-400 block">Fare Paid</span>
                    </div>
                  </div>

                  {/* Seat & Bus Fleet Meta */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl text-xs text-center border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Seat</span>
                      <span className="font-extrabold text-blue-600 text-sm">{ticket.seatNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Bus Fleet</span>
                      <span className="font-bold text-slate-800 text-xs">{ticket.busNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Passenger</span>
                      <span className="font-bold text-slate-800 text-xs truncate block">{ticket.passengerName.split(' ')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedTicketForModal(ticket)}
                    className="flex-1 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View E-Ticket & QR</span>
                  </button>

                  {isConfirmed && (
                    <button
                      onClick={() => {
                        setSelectedRouteId(ticket.routeId);
                        setActiveTab('tracking');
                      }}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 text-slate-700 transition"
                      title="Track this bus live on map"
                    >
                      <Navigation className="w-4 h-4 text-blue-600" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
