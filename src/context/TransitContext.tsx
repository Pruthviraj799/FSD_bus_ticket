import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_BUSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PASS,
  INITIAL_RECEIPTS,
  INITIAL_TICKETS,
  INITIAL_USER,
  TRANSIT_ROUTES,
} from '../data/mockTransitData';
import {
  BusRoute,
  DigitalPass,
  LiveBus,
  PaymentReceipt,
  Ticket,
  TransitNotification,
  UserProfile,
  UserRole,
} from '../types/transit';

export type NavigationTab =
  | 'dashboard'
  | 'book'
  | 'tracking'
  | 'tickets'
  | 'passes'
  | 'receipts'
  | 'help'
  | 'staff'
  | 'admin';

interface TransitContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switchRole: (role: UserRole) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  routes: BusRoute[];
  buses: LiveBus[];
  tickets: Ticket[];
  passes: DigitalPass[];
  activePass: DigitalPass | null;
  receipts: PaymentReceipt[];
  notifications: TransitNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  
  // Modals & Navigation triggers
  selectedTicketForModal: Ticket | null;
  setSelectedTicketForModal: (ticket: Ticket | null) => void;
  selectedReceiptForModal: PaymentReceipt | null;
  setSelectedReceiptForModal: (receipt: PaymentReceipt | null) => void;
  isScanToPayOpen: boolean;
  setIsScanToPayOpen: (open: boolean) => void;
  
  // Tracking controls
  selectedRouteId: string;
  setSelectedRouteId: (routeId: string) => void;
  selectedBusId: string | null;
  setSelectedBusId: (busId: string | null) => void;

  // Actions
  bookTicket: (ticketData: Omit<Ticket, 'id' | 'ticketId' | 'status' | 'bookingTime' | 'qrData'>) => Ticket;
  cancelTicket: (ticketId: string) => boolean;
  validateTicketByStaff: (ticketIdOrQr: string) => { success: boolean; message: string; ticket?: Ticket };
  purchasePass: (planName: string, planType: DigitalPass['planType'], price: number) => DigitalPass;
  rechargeWallet: (amount: number) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Calculated Stats
  stats: {
    totalTrips: number;
    monthlySavings: number;
    co2SavedKg: number;
    activePassCount: number;
  };
}

const TransitContext = createContext<TransitContextType | undefined>(undefined);

export const TransitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage if available, else defaults
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('smartmove_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [routes] = useState<BusRoute[]>(TRANSIT_ROUTES);
  const [buses, setBuses] = useState<LiveBus[]>(INITIAL_BUSES);
  
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('smartmove_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [passes, setPasses] = useState<DigitalPass[]>(() => {
    const saved = localStorage.getItem('smartmove_passes');
    if (saved) {
      try {
        const parsed: DigitalPass[] = JSON.parse(saved);
        // Ensure default initial pass doesn't force zero fare tickets
        return parsed.map((p) => (p.id === 'pass-01' ? { ...p, status: 'Expired' } : p));
      } catch {
        return [INITIAL_PASS];
      }
    }
    return [INITIAL_PASS];
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    const saved = localStorage.getItem('smartmove_receipts');
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [notifications, setNotifications] = useState<TransitNotification[]>(() => {
    const saved = localStorage.getItem('smartmove_notifs');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-1a');
  const [selectedBusId, setSelectedBusId] = useState<string | null>('bus-101');
  const [selectedTicketForModal, setSelectedTicketForModal] = useState<Ticket | null>(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<PaymentReceipt | null>(null);
  const [isScanToPayOpen, setIsScanToPayOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist changes to localStorage
  useEffect(() => {
    localStorage.setItem('smartmove_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('smartmove_tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('smartmove_passes', JSON.stringify(passes));
  }, [passes]);

  useEffect(() => {
    localStorage.setItem('smartmove_receipts', JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem('smartmove_notifs', JSON.stringify(notifications));
  }, [notifications]);

  // Live bus movement simulation along route coordinates
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          // Subtle GPS nudge along coordinate space to simulate real live motion
          const latDelta = (Math.random() - 0.48) * 0.0003;
          const lngDelta = (Math.random() - 0.48) * 0.0003;
          return {
            ...bus,
            currentLat: Number((bus.currentLat + latDelta).toFixed(5)),
            currentLng: Number((bus.currentLng + lngDelta).toFixed(5)),
            speedKmH: Math.max(15, Math.min(55, Math.round(bus.speedKmH + (Math.random() * 4 - 2)))),
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const switchRole = (role: UserRole) => {
    setUser((prev) => ({ ...prev, role }));
    if (role === 'staff') {
      setActiveTab('staff');
    } else if (role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const activePass = passes.find((p) => p.status === 'Active') || null;

  // Book a new ticket
  const bookTicket = (ticketData: Omit<Ticket, 'id' | 'ticketId' | 'status' | 'bookingTime' | 'qrData'>) => {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const newTicketId = `CTU-TKT-2026-${randomSuffix}`;
    const newId = `tkt-${Date.now()}`;
    const nowStr = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const qrPayload = JSON.stringify({
      ticketId: newTicketId,
      route: `${ticketData.source} -> ${ticketData.destination}`,
      passenger: ticketData.passengerName,
      seat: ticketData.seatNumber,
      bus: ticketData.busNumber,
      date: ticketData.travelDate,
      time: ticketData.departureTime,
      status: 'Confirmed',
      validKey: `SMARTMOVE-${Date.now()}`,
    });

    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      ticketId: newTicketId,
      status: 'Confirmed',
      bookingTime: nowStr,
      qrData: qrPayload,
      paymentMethod: ticketData.paymentMethod || 'UPI / GPay',
      transactionId: ticketData.transactionId || `TXN-2026-${randomSuffix}`,
      fareBreakdown: ticketData.fareBreakdown,
    };

    setTickets((prev) => [newTicket, ...prev]);

    // If paid via wallet, deduct wallet balance
    if (ticketData.paymentMethod === 'SmartMove Wallet' && ticketData.fare > 0) {
      setUser((prev) => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - ticketData.fare),
      }));
    }

    // Create a receipt
    const newReceiptId = `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const baseAmount = ticketData.fareBreakdown
      ? ticketData.fareBreakdown.subtotal
      : Number((ticketData.fare * 0.95).toFixed(2));
    const taxAmount = ticketData.fareBreakdown
      ? ticketData.fareBreakdown.gstTax
      : Number((ticketData.fare * 0.05).toFixed(2));

    const methodLabel =
      (ticketData.paymentMethod as any) || (ticketData.fare === 0 ? 'Transit Pass' : 'UPI / GPay');

    const newReceipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: newReceiptId,
      ticketOrPassId: newTicketId,
      description: `Bus Ticket: ${ticketData.source} to ${ticketData.destination} (${ticketData.seatNumber})`,
      amount: ticketData.fare,
      baseAmount,
      taxAmount,
      paymentMethod: methodLabel,
      date: ticketData.travelDate,
      time: ticketData.departureTime,
      status: 'Paid',
      transactionId: ticketData.transactionId || `TXN-2026-${randomSuffix}`,
      fareBreakdown: ticketData.fareBreakdown,
    };
    setReceipts((prev) => [newReceipt, ...prev]);

    // Add notification
    const newNotif: TransitNotification = {
      id: `notif-${Date.now()}`,
      title: 'Booking & Payment Confirmed!',
      message: `Your ride ${newTicketId} from ${ticketData.source} to ${ticketData.destination} (Seat ${ticketData.seatNumber}) is confirmed. Total paid: ₹${ticketData.fare}.`,
      time: 'Just now',
      read: false,
      type: 'success',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newTicket;
  };

  // Cancel Ticket
  const cancelTicket = (ticketId: string): boolean => {
    const existing = tickets.find((t) => t.ticketId === ticketId);
    if (!existing || existing.status !== 'Confirmed') {
      return false;
    }

    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, status: 'Cancelled' } : t))
    );

    // Issue refund receipt record
    const refundReceipt: PaymentReceipt = {
      id: `rec-ref-${Date.now()}`,
      receiptNumber: `REF-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      ticketOrPassId: ticketId,
      description: `Refund for Ticket: ${existing.source} to ${existing.destination}`,
      amount: existing.fare,
      baseAmount: existing.fare,
      taxAmount: 0,
      paymentMethod: 'SmartMove Wallet',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Refunded',
    };
    setReceipts((prev) => [refundReceipt, ...prev]);

    // Refund wallet balance
    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + existing.fare,
    }));

    return true;
  };

  // Validate Ticket by Staff QR Scanner
  const validateTicketByStaff = (ticketIdOrQr: string): { success: boolean; message: string; ticket?: Ticket } => {
    let targetTicketId = ticketIdOrQr.trim();

    // Check if JSON QR was scanned
    try {
      const parsed = JSON.parse(ticketIdOrQr);
      if (parsed.ticketId) {
        targetTicketId = parsed.ticketId;
      }
    } catch {
      // not JSON, keep as raw string
    }

    const matched = tickets.find(
      (t) => t.ticketId.toLowerCase() === targetTicketId.toLowerCase()
    );

    if (!matched) {
      // Check pass
      const passMatched = passes.find(
        (p) => p.passId.toLowerCase() === targetTicketId.toLowerCase() || p.qrData.includes(targetTicketId)
      );
      if (passMatched && passMatched.status === 'Active') {
        return {
          success: true,
          message: `Digital Pass Verified: ${passMatched.planName} (Holder: ${user.name}) - Unlimited Transit Access Approved!`,
        };
      }

      return {
        success: false,
        message: `Ticket ID "${targetTicketId}" not found in SmartMove database.`,
      };
    }

    if (matched.status === 'Boarded') {
      return {
        success: false,
        message: `ALREADY BOARDED: Ticket ${matched.ticketId} was already scanned for Seat ${matched.seatNumber}.`,
        ticket: matched,
      };
    }

    if (matched.status === 'Cancelled') {
      return {
        success: false,
        message: `CANCELLED TICKET: Ticket ${matched.ticketId} has been cancelled and cannot be used.`,
        ticket: matched,
      };
    }

    // Mark as Boarded
    setTickets((prev) =>
      prev.map((t) => (t.id === matched.id ? { ...t, status: 'Boarded' } : t))
    );

    return {
      success: true,
      message: `VERIFIED & BOARDED: Passenger ${matched.passengerName} (Seat ${matched.seatNumber}, ${matched.source} → ${matched.destination}).`,
      ticket: { ...matched, status: 'Boarded' },
    };
  };

  // Purchase Digital Pass
  const purchasePass = (planName: string, planType: DigitalPass['planType'], price: number) => {
    const newPassId = `PASS-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + (planType === 'Green Annual' ? 365 : 30));

    const newPass: DigitalPass = {
      id: `pass-${Date.now()}`,
      passId: newPassId,
      planName,
      planType,
      validFrom: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validUntil: expiry.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
      price,
      monthlySavings: Math.round(price * 1.6),
      qrData: JSON.stringify({
        passId: newPassId,
        holder: user.name,
        plan: planName,
        validUntil: expiry.toISOString(),
      }),
      ridesTaken: 0,
    };

    // Mark previous active passes as expired
    setPasses((prev) => [newPass, ...prev.map((p) => ({ ...p, status: 'Expired' as const }))]);

    // Create receipt
    const receipt: PaymentReceipt = {
      id: `rec-${Date.now()}`,
      receiptNumber: `REC-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      ticketOrPassId: newPassId,
      description: `Subscription: ${planName}`,
      amount: price,
      baseAmount: Number((price * 0.95).toFixed(2)),
      taxAmount: Number((price * 0.05).toFixed(2)),
      paymentMethod: 'Credit/Debit Card',
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Paid',
    };
    setReceipts((prev) => [receipt, ...prev]);

    return newPass;
  };

  const rechargeWallet = (amount: number) => {
    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Calculated Stats
  // Match screenshot defaults: 24 total trips, ₹1,420 monthly savings, 38 kg CO2 saved, 1 active pass
  const totalTrips = 24 + tickets.filter((t) => t.id !== 'tkt-001' && t.status !== 'Cancelled').length - 3;
  const monthlySavings = activePass ? activePass.monthlySavings : 1420;
  const co2SavedKg = Math.round(38 + (totalTrips - 24) * 1.5);
  const activePassCount = passes.filter((p) => p.status === 'Active').length;

  return (
    <TransitContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        activeTab,
        setActiveTab,
        routes,
        buses,
        tickets,
        passes,
        activePass,
        receipts,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        selectedTicketForModal,
        setSelectedTicketForModal,
        selectedReceiptForModal,
        setSelectedReceiptForModal,
        isScanToPayOpen,
        setIsScanToPayOpen,
        selectedRouteId,
        setSelectedRouteId,
        selectedBusId,
        setSelectedBusId,
        bookTicket,
        cancelTicket,
        validateTicketByStaff,
        purchasePass,
        rechargeWallet,
        searchQuery,
        setSearchQuery,
        stats: {
          totalTrips: Math.max(1, totalTrips),
          monthlySavings,
          co2SavedKg: Math.max(1, co2SavedKg),
          activePassCount,
        },
      }}
    >
      {children}
    </TransitContext.Provider>
  );
};

export const useTransit = () => {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
};
