export interface FareBreakdown {
  baseRate: number;
  distanceKm: number;
  distanceRate: number;
  baseDistanceFare: number;
  passengerCount: number;
  subtotal: number;
  gstTax: number; // 5% GST
  safetyCess: number; // ₹2.00 per passenger
  discount: number;
  totalFare: number;
  busTypeLabel: string;
}

// Known coordinates or stop distances in Chandigarh Transit (km from ISBT 17)
const STOP_DISTANCES: Record<string, number> = {
  'ISBT 17': 0,
  'Sector 16 Cricket Stadium': 1.8,
  'Sector 15 Main Market': 3.5,
  'Sector 11 Chowk': 5.2,
  'PGI Gate No 1': 6.8,
  'PGI Hospital': 8.5,
  'Sector 17 Plaza': 1.2,
  'Sector 22 Market': 2.4,
  'Sector 34 Commercial Zone': 4.5,
  'Sector 43 ISBT': 7.0,
  'Tribune Chowk': 9.2,
  'Industrial Area Phase 1': 11.5,
  'Railway Station': 14.2,
  'IT Park': 11.0,
  'Aerocity Airport': 18.5,
};

// Rates calibrated so typical city rides cost standard fares:
// Standard Express: ₹50
// Premium AC: ₹80
// AC Electric Volvo: ₹100
export const BUS_TYPE_RATES = {
  'Standard Express': { baseRate: 34, perKmRate: 1.4 },
  'Premium AC': { baseRate: 55, perKmRate: 2.2 },
  'AC Electric Volvo': { baseRate: 68, perKmRate: 3.0 },
} as const;

export type SupportedBusType = keyof typeof BUS_TYPE_RATES;

export function calculateTransitFare(
  source: string,
  destination: string,
  busType: SupportedBusType | string = 'Standard Express',
  passengerCount: number = 1,
  hasActivePass: boolean = false
): FareBreakdown {
  // Compute distance in KM
  const srcDist = STOP_DISTANCES[source] ?? 0;
  const destDist = STOP_DISTANCES[destination] ?? 8.5;
  const calculatedDistance = Math.abs(destDist - srcDist);
  const distanceKm = Number((calculatedDistance === 0 ? 8.5 : calculatedDistance).toFixed(1));

  // Determine rate structure
  const rateConfig =
    BUS_TYPE_RATES[busType as SupportedBusType] || BUS_TYPE_RATES['Standard Express'];
  const baseRate = rateConfig.baseRate;
  const distanceRate = rateConfig.perKmRate;

  // Base distance fare
  const baseDistanceFare = Math.round(distanceKm * distanceRate);

  // Subtotal for passengers
  const count = Math.max(1, passengerCount);
  const subtotal = (baseRate + baseDistanceFare) * count;

  // 5% GST on passenger transport
  const gstTax = Number((subtotal * 0.05).toFixed(2));

  // Passenger Safety & Clean Fleet Cess (₹2 per passenger)
  const safetyCess = Number((2.0 * count).toFixed(2));

  // Full Fare (always a realistic money fare like ₹100 or ₹50)
  const fullFare = Number((subtotal + gstTax + safetyCess).toFixed(2));

  // Pass holders can receive a smart 10% discount, but tickets are NEVER free (₹0)
  const discount = hasActivePass ? Math.round(fullFare * 0.1) : 0;
  const totalFare = Math.max(35, Math.round(fullFare - discount));

  return {
    baseRate,
    distanceKm,
    distanceRate,
    baseDistanceFare,
    passengerCount: count,
    subtotal,
    gstTax,
    safetyCess,
    discount,
    totalFare,
    busTypeLabel: busType,
  };
}
