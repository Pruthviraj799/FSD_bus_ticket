import React, { useState } from 'react';
import {
  ShieldCheck,
  Bus,
  MapPin,
  TrendingUp,
  Users,
  DollarSign,
  Leaf,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Settings,
  ArrowUpRight
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export const AdminDashboardPage: React.FC = () => {
  const { buses, routes, tickets, passes } = useTransit();
  const [activeAdminTab, setActiveAdminTab] = useState<'fleet' | 'routes' | 'bookings'>('fleet');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Transit Fleet & Operations Admin
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live fleet monitoring, route logistics, ticketing revenue, and dispatch operations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">System Status:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            All 4 Transit Hubs Online
          </span>
        </div>
      </div>

      {/* Top Operations KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Active Bus Fleet',
            value: '18 / 20',
            subtext: '90% operational',
            icon: Bus,
            color: 'bg-blue-50 text-blue-600',
          },
          {
            label: 'Passengers Today',
            value: '4,892',
            subtext: '+14% vs yesterday',
            icon: Users,
            color: 'bg-emerald-50 text-emerald-600',
          },
          {
            label: 'On-Time Performance',
            value: '96.4%',
            subtext: 'Standard SLA > 95%',
            icon: Clock,
            color: 'bg-purple-50 text-purple-600',
          },
          {
            label: 'Daily Fare Revenue',
            value: '₹1,42,850',
            subtext: '+8.2% growth',
            icon: DollarSign,
            color: 'bg-amber-50 text-amber-600',
          },
          {
            label: 'CO₂ Clean Offset',
            value: '1,240 kg',
            subtext: 'Electric transit fleet',
            icon: Leaf,
            color: 'bg-teal-50 text-teal-600',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 space-y-3 hover:shadow-card-hover transition"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-2xl ${kpi.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-900 leading-tight">
                  {kpi.value}
                </p>
                <p className="text-xs font-bold text-slate-700 mt-0.5">{kpi.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md">
        {[
          { id: 'fleet', label: `Bus Fleet (${buses.length})` },
          { id: 'routes', label: `Routes (${routes.length})` },
          { id: 'bookings', label: `Bookings (${tickets.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeAdminTab === tab.id
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Admin Tab Content */}
      {activeAdminTab === 'fleet' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Fleet Vehicle Master Register
            </h3>
            <span className="text-xs text-slate-400">
              Live telemetry connected via GPS OBD-II
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Bus ID</th>
                  <th className="py-4 px-6">Assigned Route</th>
                  <th className="py-4 px-6">Driver & Badge</th>
                  <th className="py-4 px-6">Model Type</th>
                  <th className="py-4 px-6">Capacity</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Telemetry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {buses.map((bus) => (
                  <tr key={bus.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-extrabold font-mono text-slate-900">
                      {bus.busNumber}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {bus.routeNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {bus.driverName}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{bus.busType}</td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {bus.currentOccupancy} / {bus.capacity} seats ({Math.round((bus.currentOccupancy / bus.capacity) * 100)}%)
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        ● {bus.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-slate-500">
                      {bus.speedKmH} km/h • GPS OK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'routes' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Active Transit Routes
            </h3>
            <span className="text-xs text-slate-400">Total 4 operational corridors</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Route Code</th>
                  <th className="py-4 px-6">Origin ➔ Destination</th>
                  <th className="py-4 px-6">Distance</th>
                  <th className="py-4 px-6">Stops Count</th>
                  <th className="py-4 px-6">Typical Duration</th>
                  <th className="py-4 px-6 text-right">Base Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-extrabold text-blue-600">
                      {r.routeNumber}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {r.routeName}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{r.distanceKm} km</td>
                    <td className="py-4 px-6 text-slate-600">{r.stops.length} designated stops</td>
                    <td className="py-4 px-6 text-slate-600">{r.estimatedMinutes} mins</td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                      ₹{r.baseFare}.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeAdminTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Recent Passenger Bookings Ledger
            </h3>
            <span className="text-xs text-slate-400">Real-time synchronized</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Ticket ID</th>
                  <th className="py-4 px-6">Passenger Name</th>
                  <th className="py-4 px-6">Route</th>
                  <th className="py-4 px-6">Seat</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {t.ticketId}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">
                      {t.passengerName}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{t.routeNumber}</td>
                    <td className="py-4 px-6 font-extrabold text-blue-600">{t.seatNumber}</td>
                    <td className="py-4 px-6 text-slate-500">{t.travelDate}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'Boarded'
                            ? 'bg-blue-100 text-blue-800'
                            : t.status === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-slate-900">
                      {t.fare === 0 ? 'Pass' : `₹${t.fare}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
