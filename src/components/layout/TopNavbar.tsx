import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  QrCode,
  Wallet,
  CheckCircle2,
  X,
  Bus,
  MapPin,
  Ticket as TicketIcon,
  RotateCcw
} from 'lucide-react';
import { useTransit } from '../../context/TransitContext';

export const TopNavbar: React.FC = () => {
  const {
    user,
    switchRole,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    searchQuery,
    setSearchQuery,
    routes,
    buses,
    tickets,
    setActiveTab,
    setSelectedRouteId,
    setSelectedBusId,
    setSelectedTicketForModal,
    rechargeWallet,
    setIsScanToPayOpen,
  } = useTransit();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAddAmount, setWalletAddAmount] = useState<number>(200);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Filter search results
  const trimmedSearch = searchQuery.trim().toLowerCase();
  const matchedRoutes = trimmedSearch
    ? routes.filter(
        (r) =>
          r.routeNumber.toLowerCase().includes(trimmedSearch) ||
          r.routeName.toLowerCase().includes(trimmedSearch) ||
          r.source.toLowerCase().includes(trimmedSearch) ||
          r.destination.toLowerCase().includes(trimmedSearch) ||
          r.stops.some((s) => s.name.toLowerCase().includes(trimmedSearch))
      )
    : [];

  const matchedBuses = trimmedSearch
    ? buses.filter(
        (b) =>
          b.busNumber.toLowerCase().includes(trimmedSearch) ||
          b.routeNumber.toLowerCase().includes(trimmedSearch) ||
          b.driverName.toLowerCase().includes(trimmedSearch)
      )
    : [];

  const matchedTickets = trimmedSearch
    ? tickets.filter(
        (t) =>
          t.ticketId.toLowerCase().includes(trimmedSearch) ||
          t.passengerName.toLowerCase().includes(trimmedSearch)
      )
    : [];

  const hasSearchResults =
    matchedRoutes.length > 0 || matchedBuses.length > 0 || matchedTickets.length > 0;

  return (
    <header className="h-[76px] bg-white border-b border-slate-100 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-subtle">
      {/* Global Search Bar - matches screenshot */}
      <div ref={searchRef} className="relative w-full max-w-md md:max-w-lg">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search route, bus, or stop..."
            className="w-full bg-[#F8FAFC] border border-slate-200/90 rounded-full pl-11 pr-9 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchOpen && trimmedSearch && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2">
            {!hasSearchResults ? (
              <div className="p-4 text-center text-sm text-slate-500">
                No matching transit routes, buses, or tickets found.
              </div>
            ) : (
              <div className="space-y-3">
                {matchedRoutes.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Routes & Stops
                    </span>
                    <div className="mt-1 space-y-1">
                      {matchedRoutes.map((route) => (
                        <button
                          key={route.id}
                          onClick={() => {
                            setSelectedRouteId(route.id);
                            setActiveTab('tracking');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 text-left transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                                {route.routeNumber}
                              </p>
                              <p className="text-[11px] text-slate-500">{route.routeName}</p>
                            </div>
                          </div>
                          <span className="text-[11px] font-medium text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-2 py-0.5 rounded-md">
                            Track Route
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchedBuses.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Live Buses
                    </span>
                    <div className="mt-1 space-y-1">
                      {matchedBuses.map((bus) => (
                        <button
                          key={bus.id}
                          onClick={() => {
                            setSelectedRouteId(bus.routeId);
                            setSelectedBusId(bus.id);
                            setActiveTab('tracking');
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 text-left transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                              <Bus className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                                {bus.busNumber} ({bus.routeNumber})
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Near {bus.nextStop} • ETA: {bus.etaMinutes}m
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            ● Live
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchedTickets.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      Tickets
                    </span>
                    <div className="mt-1 space-y-1">
                      {matchedTickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicketForModal(ticket);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 text-left transition group"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                              <TicketIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                {ticket.ticketId}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {ticket.source} ➔ {ticket.destination} ({ticket.status})
                              </p>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600">
                            View Ticket
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Scan & Pay Button */}
        <button
          onClick={() => setIsScanToPayOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          title="Scan Bus QR or Conductor Code to Pay"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Scan & Pay</span>
        </button>

        {/* Notification Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="mt-2 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    className={`p-2.5 rounded-xl text-left cursor-pointer transition ${
                      n.read ? 'bg-slate-50/60 opacity-80' : 'bg-blue-50/60 border border-blue-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Passenger Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pl-2 pr-2.5 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200/80 transition"
          >
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
            />
            <div className="text-left hidden md:block">
              <p className="text-[14px] font-bold text-slate-900 leading-tight">
                {user.name}
              </p>
              <p className="text-[12px] font-medium text-slate-400 capitalize">
                {user.role}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 ml-0.5" />
          </button>

          {/* Profile Menu Popover */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500/20 shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {user.role} Account
                  </span>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="my-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-xl border border-blue-100/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-medium text-slate-500">
                    SmartMove Wallet
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    ₹{user.walletBalance}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setIsProfileOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-white rounded-lg shadow-sm border border-blue-100 hover:bg-blue-600 hover:text-white transition"
                >
                  + Top Up
                </button>
              </div>

              {/* Switch Roles for Pair-Testing */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                  Switch Active Role
                </p>
                <button
                  onClick={() => {
                    switchRole('passenger');
                    setIsProfileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    user.role === 'passenger' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className="w-4 h-4 text-blue-600" />
                  <span>Passenger (Default User)</span>
                </button>

                <button
                  onClick={() => {
                    switchRole('staff');
                    setIsProfileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    user.role === 'staff' ? 'bg-amber-50 text-amber-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-amber-600" />
                  <span>Staff / Conductor (QR Terminal)</span>
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    setIsProfileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                    user.role === 'admin' ? 'bg-indigo-50 text-indigo-800 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <span>Admin (Fleet & Revenue)</span>
                </button>
              </div>

              {/* Reset to Clean Data */}
              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-600 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Storage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Wallet Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Recharge Wallet</h3>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Current balance: <span className="font-bold text-slate-800">₹{user.walletBalance}</span>
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setWalletAddAmount(amt)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    walletAddAmount === amt
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  +₹{amt}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                rechargeWallet(walletAddAmount);
                setIsWalletModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Add ₹{walletAddAmount} Instantly
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
