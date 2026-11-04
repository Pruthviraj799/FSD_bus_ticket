import React from 'react';
import {
  Home,
  Bus,
  MapPin,
  Ticket,
  CreditCard,
  FileText,
  Headphones,
  QrCode,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useTransit, NavigationTab } from '../../context/TransitContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, user, switchRole, setIsScanToPayOpen } = useTransit();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'book', label: 'Book a Ride', icon: Bus },
    { id: 'tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'tickets', label: 'My Tickets', icon: Ticket },
    { id: 'passes', label: 'Digital Passes', icon: CreditCard },
    { id: 'receipts', label: 'Receipts', icon: FileText },
    { id: 'help', label: 'Help & Support', icon: Headphones },
  ];

  return (
    <aside className="w-[260px] xl:w-[280px] shrink-0 bg-white border-r border-slate-100 min-h-screen flex flex-col justify-between p-5 select-none z-20">
      {/* Brand Header */}
      <div>
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-3 px-2 py-2 cursor-pointer group mb-7"
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[21px] font-bold tracking-tight text-slate-900 leading-none">
              SmartMove
            </h1>
            <p className="text-[12px] font-medium text-slate-400 mt-1">
              Bus Transit System
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#EBF3FC] text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-blue-600' : 'text-slate-500'
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Scan & Pay Button for Passengers */}
        <button
          onClick={() => setIsScanToPayOpen(true)}
          className="w-full mt-3 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[13px] font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4" />
            <span>Scan & Pay</span>
          </div>
          <span className="text-[9px] font-extrabold uppercase bg-white/20 px-1.5 py-0.5 rounded-md">
            Pay QR
          </span>
        </button>

        {/* Role Portal Shortcuts */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Operations Portal
          </p>
          
          <button
            onClick={() => {
              switchRole('staff');
              setActiveTab('staff');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              user.role === 'staff'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-600" />
              <span>Conductor Scanner</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <button
            onClick={() => {
              switchRole('admin');
              setActiveTab('admin');
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              user.role === 'admin'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Fleet Admin</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Bottom Scenic Transit Illustration matching the screenshot */}
      <div className="mt-6 pt-2">
        <div className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 group">
          <img
            src="/assets/sidebar-bus.jpg"
            alt="SmartMove City Transit"
            className="w-full h-32 object-cover object-bottom transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent flex items-end p-2.5">
            <span className="text-[10px] font-bold text-white tracking-wide bg-blue-600/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
              Clean • Electric • On-Time
            </span>
          </div>
        </div>
        <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
          SmartMove Transit v2.6
        </p>
      </div>
    </aside>
  );
};
