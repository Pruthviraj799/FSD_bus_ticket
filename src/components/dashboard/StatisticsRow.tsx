import React from 'react';
import { Bus, Wallet, Leaf, Ticket } from 'lucide-react';
import { useTransit } from '../../context/TransitContext';

export const StatisticsRow: React.FC = () => {
  const { stats } = useTransit();

  const metrics = [
    {
      label: 'Total Trips',
      value: stats.totalTrips.toString(),
      icon: Bus,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Monthly Savings',
      value: `₹${stats.monthlySavings.toLocaleString('en-IN')}`,
      icon: Wallet,
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'CO₂ Saved',
      value: `${stats.co2SavedKg} kg`,
      icon: Leaf,
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Active Pass',
      value: stats.activePassCount.toString(),
      icon: Ticket,
      iconBg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="bg-white rounded-3xl border border-slate-100 shadow-card p-5 sm:p-6 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200"
          >
            <div
              className={`w-12 h-12 rounded-2xl ${item.iconBg} flex items-center justify-center shrink-0 shadow-sm`}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {item.value}
              </p>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-500 mt-0.5">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
