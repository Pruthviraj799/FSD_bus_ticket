import React from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { DashboardPage } from './pages/DashboardPage';
import { BookRidePage } from './pages/BookRidePage';
import { LiveTrackingPage } from './pages/LiveTrackingPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { DigitalPassesPage } from './pages/DigitalPassesPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { TicketModal } from './components/modals/TicketModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { ScanToPayModal } from './components/modals/ScanToPayModal';

const MainLayout: React.FC = () => {
  const { activeTab } = useTransit();

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'book':
        return <BookRidePage />;
      case 'tracking':
        return <LiveTrackingPage />;
      case 'tickets':
        return <MyTicketsPage />;
      case 'passes':
        return <DigitalPassesPage />;
      case 'receipts':
        return <ReceiptsPage />;
      case 'help':
        return <HelpSupportPage />;
      case 'staff':
        return <StaffDashboardPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar />

      {/* 2. Right Main Scrollable View */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Navbar */}
        <TopNavbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {renderCurrentPage()}
        </main>
      </div>

      {/* 3. Global Interactive Modals */}
      <TicketModal />
      <ReceiptModal />
      <ScanToPayModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TransitProvider>
      <MainLayout />
    </TransitProvider>
  );
};

export default App;
