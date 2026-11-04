import React from 'react';
import { HeroBanner } from '../components/dashboard/HeroBanner';
import { QuickAccessCards } from '../components/dashboard/QuickAccessCards';
import { LiveTrackingCard } from '../components/dashboard/LiveTrackingCard';
import { UpcomingJourneyCard } from '../components/dashboard/UpcomingJourneyCard';
import { StatisticsRow } from '../components/dashboard/StatisticsRow';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* 1. Welcoming Hero Banner */}
      <HeroBanner />

      {/* 2. Four Quick Access Pastel Cards */}
      <QuickAccessCards />

      {/* 3. Middle Core Row: Live Bus Tracking & Upcoming Journey */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 xl:col-span-7">
          <LiveTrackingCard />
        </div>
        <div className="lg:col-span-5 xl:col-span-5">
          <UpcomingJourneyCard />
        </div>
      </div>

      {/* 4. Four Compact Summary Statistic Cards */}
      <StatisticsRow />
    </div>
  );
};
