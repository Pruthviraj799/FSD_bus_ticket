export type UserRole = 'passenger' | 'staff' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatarUrl: string;
  walletBalance: number;
}

export interface TransitStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  code: string;
}

export interface BusRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  source: string;
  destination: string;
  distanceKm: number;
  estimatedMinutes: number;
  baseFare: number;
  stops: TransitStop[];
  polylineCoordinates: [number, number][];
}

export interface LiveBus {
  id: string;
  busNumber: string;
  routeId: string;
  routeNumber: string;
  routeName: string;
  busType: 'AC Electric Volvo' | 'Premium AC' | 'Standard Express';
  driverName: string;
  capacity: number;
  currentOccupancy: number;
  currentLat: number;
  currentLng: number;
  speedKmH: number;
  status: 'Live' | 'On-Time' | 'Delayed' | 'Maintenance';
  nextStop: string;
  etaMinutes: number;
  bearing: number;
}

export type TicketStatus = 'Confirmed' | 'Completed' | 'Boarded' | 'Cancelled';

export interface FareBreakdownData {
  baseRate: number;
  distanceKm: number;
  distanceRate: number;
  baseDistanceFare: number;
  passengerCount: number;
  subtotal: number;
  gstTax: number;
  safetyCess: number;
  discount: number;
  totalFare: number;
  busTypeLabel: string;
}

export interface Ticket {
  id: string;
  ticketId: string;
  routeId: string;
  routeNumber: string;
  source: string;
  destination: string;
  travelDate: string;
  departureTime: string;
  arrivalTime: string;
  status: TicketStatus;
  busNumber: string;
  busType: string;
  seatNumber: string;
  passengerName: string;
  fare: number;
  bookingTime: string;
  qrData: string;
  paymentMethod?: string;
  transactionId?: string;
  fareBreakdown?: FareBreakdownData;
}

export interface DigitalPass {
  id: string;
  passId: string;
  planName: string;
  planType: 'Student' | 'Daily Commuter' | 'SuperPass' | 'Green Annual';
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expired';
  price: number;
  monthlySavings: number;
  qrData: string;
  ridesTaken: number;
}

export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  ticketOrPassId: string;
  description: string;
  amount: number;
  paymentMethod: 'SmartMove Wallet' | 'UPI / GPay' | 'Credit/Debit Card' | 'Transit Pass' | 'Visa / RuPay Card';
  date: string;
  time: string;
  status: 'Paid' | 'Refunded';
  taxAmount: number;
  baseAmount: number;
  transactionId?: string;
  fareBreakdown?: FareBreakdownData;
}

export interface TransitNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'alert';
}
