import React from 'react';
import { Bus, MapPin, Ticket, CreditCard, ChevronRight, QrCode } from 'lucide-react';
import { useTransit, NavigationTab } from '../../context/TransitContext';

interface QuickCardItem {
  title: string;
  tab?: NavigationTab;
  action?: () => void;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

export const QuickAccessCards: React.FC = () => {
  const { setActiveTab, setIsScanToPayOpen } = useTransit();

  const cards: QuickCardItem[] = [
    {
      title: 'Book a Ride',
      tab: 'book',
      bgColor: 'bg-[#EFF6FF]', // Soft pastel blue
      hoverColor: 'hover:bg-[#E3EFFF]',
      borderColor: 'border-blue-100/70',
      iconBg: 'bg-white',
      iconColor: 'text-blue-600',
      icon: Bus,
    },
    {
      title: 'Scan & Pay',
      action: () => setIsScanToPayOpen(true),
      bgColor: 'bg-[#EEF2FF]', // Soft pastel indigo
      hoverColor: 'hover:bg-[#E0E7FF]',
      borderColor: 'border-indigo-100/80',
      iconBg: 'bg-indigo-600',
      iconColor: 'text-white',
      icon: QrCode,
      badge: 'Fast',
    },
    {
      title: 'Live Tracking',
      tab: 'tracking',
      bgColor: 'bg-[#F5F3FF]', // Soft pastel purple
      hoverColor: 'hover:bg-[#ECE8FF]',
      borderColor: 'border-purple-100/70',
      iconBg: 'bg-white',
      iconColor: 'text-purple-600',
      icon: MapPin,
    },
    {
      title: 'My Tickets',
      tab: 'tickets',
      bgColor: 'bg-[#F0FDF4]', // Soft pastel green
      hoverColor: 'hover:bg-[#E2FBE9]',
      borderColor: 'border-emerald-100/70',
      iconBg: 'bg-white',
      iconColor: 'text-emerald-600',
      icon: Ticket,
    },
    {
      title: 'Digital Passes',
      tab: 'passes',
      bgColor: 'bg-[#FFF7ED]', // Soft pastel warm orange
      hoverColor: 'hover:bg-[#FFEFD9]',
      borderColor: 'border-amber-100/70',
      iconBg: 'bg-white',
      iconColor: 'text-amber-600',
      icon: CreditCard,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.title}
            onClick={() => {
              if (card.action) {
                card.action();
              } else if (card.tab) {
                setActiveTab(card.tab);
              }
            }}
            className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl ${card.bgColor} ${card.hoverColor} border ${card.borderColor} shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 text-left group`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl ${card.iconBg} ${card.iconColor} shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[14px] font-bold text-slate-800 tracking-tight block">
                  {card.title}
                </span>
                {card.badge && (
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-700 bg-indigo-100/80 px-1.5 py-0.2 rounded-md">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>
        );
      })}
    </div>
  );
};
